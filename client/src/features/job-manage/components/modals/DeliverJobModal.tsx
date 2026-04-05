import { sharepointApi, sharepointFolderItemsOptions } from '@/lib'
import { deliverJobOptions, jobsPendingDeliverOptions } from '@/lib/queries'
import {
    DeliverJobInputSchema,
    TDeliverJobInput,
} from '@/lib/validationSchemas/_job.schema'
import { HeroAutocomplete, HeroAutocompleteItem } from '@/shared/components'
import { JobStatusChip } from '@/shared/components/chips/JobStatusChip'
import { TJob } from '@/shared/types'
import {
    addToast,
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Progress,
    Skeleton,
    Textarea,
} from '@heroui/react'
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useFormik } from 'formik'
import lodash from 'lodash'
import { CheckCircle2, FileIcon, Send, UploadCloud, X } from 'lucide-react'
import { Suspense, useMemo, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { toFormikValidationSchema } from 'zod-formik-adapter'

interface DeliverJobModalProps {
    isOpen: boolean
    defaultJob?: TJob
    onClose: () => void
    onSuccess?: () => void
    showSelect?: boolean
    canUpload?: boolean
}

export const DeliverJobModal = ({
    isOpen,
    defaultJob,
    onClose,
    onSuccess,
    showSelect = true,
    canUpload = false,
}: DeliverJobModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalContent>
                <ErrorBoundary
                    fallback={
                        <div className="p-10 text-center text-danger flex flex-col gap-2">
                            <p className="font-bold">Could not load job data</p>
                            <p className="text-tiny text-default-500">
                                Please check your connection and try again.
                            </p>
                        </div>
                    }
                >
                    <Suspense fallback={<DeliverJobSkeleton />}>
                        {isOpen && (
                            <DeliverJobContent
                                defaultJob={defaultJob}
                                onClose={onClose}
                                onSuccess={onSuccess}
                                showSelect={showSelect}
                                canUpload={canUpload}
                            />
                        )}
                    </Suspense>
                </ErrorBoundary>
            </ModalContent>
        </Modal>
    )
}

// Helper type to manage upload state locally before pushing to formik
type UploadingFile = {
    file: File
    status: 'uploading' | 'success' | 'error'
    url?: string
    sharepointId?: string
    name: string
    progress: number
    errorMessage?: string
}

export const DeliverJobContent = ({
    defaultJob,
    onClose,
    onSuccess,
    showSelect,
    canUpload,
}: {
    defaultJob?: TJob
    onClose: () => void
    onSuccess?: () => void
    showSelect: boolean
    canUpload: boolean
}) => {
    const deliverAction = useMutation(deliverJobOptions)

    // State to manage files actively being uploaded or already uploaded in UI
    const [uploadStates, setUploadStates] = useState<UploadingFile[]>([])
    const [selectedJob, setSelectedJob] = useState<TJob | undefined>(defaultJob)

    const { data: pendingDeliverJobs } = useSuspenseQuery({
        ...jobsPendingDeliverOptions(),
    })

    const formik = useFormik<TDeliverJobInput>({
        initialValues: {
            jobId: defaultJob?.id ?? '',
            note: '',
            files: [],
        },
        validationSchema: toFormikValidationSchema(DeliverJobInputSchema),
        enableReinitialize: true,
        onSubmit: async (values) => {
            await deliverAction.mutateAsync(
                {
                    jobId: values.jobId,
                    data: {
                        files: values.files,
                        note: values.note,
                    },
                },
                {
                    onSuccess() {
                        onSuccess?.()
                        addToast({
                            title: 'Delivery Successful',
                            description:
                                'Congratulations! Your job has been delivered. Please wait for admin review.',
                            color: 'success',
                        })
                    },
                }
            )
            onClose()
            formik.resetForm()
        },
    })

    const { data } = useQuery({
        ...sharepointFolderItemsOptions(
            selectedJob?.sharepointFolderId ?? '-1'
        ),
        enabled: !!Boolean(selectedJob?.sharepointFolderId),
    })

    const folderItems = data?.items ?? []

    const destinationUploadFolderId = useMemo(() => {
        const existingWorkingFolder = folderItems.findIndex(
            (it) => it.name === 'Working' && it.isFolder
        )
        if (existingWorkingFolder === -1) {
            return selectedJob?.sharepointFolderId
        }
        return folderItems[existingWorkingFolder]?.id
    }, [folderItems, selectedJob])

    const handleSharepointUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (!e.target.files) return

        let selectedFiles = Array.from(e.target.files)
        const totalAllowed = 5
        const currentCount = uploadStates.length

        if (currentCount + selectedFiles.length > totalAllowed) {
            alert(`You can only upload a maximum of ${totalAllowed} files.`)
            selectedFiles = selectedFiles.slice(0, totalAllowed - currentCount)
        }

        if (selectedFiles.length === 0) return

        const newUploads: UploadingFile[] = selectedFiles.map((file) => ({
            file,
            name: file.name,
            status: 'uploading',
            progress: 0,
        }))

        setUploadStates((prev) => [...prev, ...newUploads])

        for (const uploadItem of newUploads) {
            try {
                const res = await sharepointApi.uploadFile(
                    destinationUploadFolderId,
                    uploadItem.file,
                    (percentCompleted: number) => {
                        setUploadStates((prev) =>
                            prev.map((item) =>
                                item.name === uploadItem.name
                                    ? { ...item, progress: percentCompleted }
                                    : item
                            )
                        )
                    }
                )

                const item = res.result ? (res.result as any) : (res as any)
                const finalUrl = item.webUrl || item.url || ''
                const finalId = item.id || ''
                const finalName = item.name || uploadItem.name

                if (finalUrl && finalId) {
                    setUploadStates((prev) =>
                        prev.map((stateItem) =>
                            stateItem.name === uploadItem.name
                                ? {
                                      ...stateItem,
                                      status: 'success',
                                      url: finalUrl,
                                      sharepointId: finalId,
                                      progress: 100,
                                  }
                                : stateItem
                        )
                    )

                    // Store as an object matching your Zod schema
                    formik.setFieldValue('files', [
                        ...formik.values.files,
                        {
                            webUrl: finalUrl,
                            fileName: finalName,
                            sharepointId: finalId,
                        },
                    ])
                } else {
                    throw new Error('Incomplete data returned from API')
                }
            } catch (err: any) {
                console.error(`Upload failed for ${uploadItem.name}:`, err)

                const errorMessage =
                    err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    err?.message ||
                    'Upload failed due to unknown error'

                setUploadStates((prev) =>
                    prev.map((item) =>
                        item.name === uploadItem.name
                            ? { ...item, status: 'error', errorMessage }
                            : item
                    )
                )
            }
        }

        e.target.value = ''
    }

    const removeFile = (fileToRemove: UploadingFile) => {
        setUploadStates((prev) =>
            prev.filter((f) => f.name !== fileToRemove.name)
        )

        // Filter out the object matching the removed URL
        if (fileToRemove.url) {
            formik.setFieldValue(
                'files',
                formik.values.files.filter(
                    (file) => file.webUrl !== fileToRemove.url
                )
            )
        }
    }

    const jobDeliverName = useMemo(() => {
        if (lodash.isEmpty(formik.values.jobId)) {
            return ''
        }
        const jobDeliver = pendingDeliverJobs.find(
            (it) => it.id === formik.values.jobId
        )
        return '#' + jobDeliver?.no + '_' + jobDeliver?.displayName
    }, [formik.values.jobId, pendingDeliverJobs])

    const isUploadingFiles = uploadStates.some((f) => f.status === 'uploading')

    return (
        <form onSubmit={formik.handleSubmit}>
            <ModalHeader className="flex flex-col gap-1 border-b border-divider">
                <div className="flex items-center gap-2 text-primary">
                    <Send size={20} />
                    <span className="text-lg font-bold truncate">
                        Deliver Job {jobDeliverName}
                    </span>
                </div>
                <p className="text-xs text-default-400 font-normal">
                    This will change status to <strong>DELIVERED</strong>.
                </p>
            </ModalHeader>

            <ModalBody className="p-4 space-y-5">
                {pendingDeliverJobs.length > 0 ? (
                    <>
                        {showSelect && (
                            <HeroAutocomplete
                                isRequired
                                label="Select Job"
                                placeholder="Which job is for delivery?"
                                labelPlacement="outside"
                                variant="bordered"
                                name="jobId"
                                selectedKey={formik.values.jobId || null}
                                isDisabled={!lodash.isEmpty(defaultJob)}
                                onSelectionChange={(key) => {
                                    formik.setFieldValue('jobId', key)
                                    setSelectedJob(
                                        pendingDeliverJobs.find(
                                            (it) => it.id === key
                                        )
                                    )
                                }}
                                onBlur={() =>
                                    formik.setFieldTouched('jobId', true)
                                }
                                isInvalid={
                                    formik.touched.jobId &&
                                    !!formik.errors.jobId
                                }
                                errorMessage={
                                    formik.touched.jobId &&
                                    (formik.errors.jobId as string)
                                }
                                defaultItems={pendingDeliverJobs}
                            >
                                {pendingDeliverJobs.map((job) => (
                                    <HeroAutocompleteItem
                                        key={job.id}
                                        textValue={`#${job.no} ${job.displayName}`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div>
                                                <p className="text-[10px] text-default-400 font-bold">
                                                    #{job.no}
                                                </p>
                                                <p className="text-sm font-medium">
                                                    {job.displayName}
                                                </p>
                                            </div>
                                            <JobStatusChip
                                                data={job.status}
                                                props={{ size: 'sm' }}
                                            />
                                        </div>
                                    </HeroAutocompleteItem>
                                ))}
                            </HeroAutocomplete>
                        )}

                        <Textarea
                            isRequired
                            id="note"
                            name="note"
                            label="Delivery Note"
                            placeholder="Describe what you are delivering..."
                            variant="bordered"
                            labelPlacement="outside"
                            classNames={{
                                label: 'font-semibold',
                                inputWrapper: 'border-1',
                            }}
                            minRows={3}
                            value={formik.values.note}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            isInvalid={
                                formik.touched.note && !!formik.errors.note
                            }
                            errorMessage={
                                formik.touched.note &&
                                (formik.errors.note as string)
                            }
                        />

                        {/* FILE UPLOAD SECTION */}
                        {canUpload && selectedJob && (
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">
                                    Upload Delivery Files
                                    <span className="text-xs text-default-400 ml-2 font-normal">
                                        (Max 5 files)
                                    </span>
                                </label>

                                {/* Upload Dropzone / Button Area */}
                                <label className="cursor-pointer border-2 border-dashed border-default-200 hover:border-primary/50 hover:bg-primary/5 transition-all rounded-xl p-4 flex flex-col items-center justify-center gap-2 group">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleSharepointUpload}
                                        className="hidden"
                                        disabled={uploadStates.length >= 5}
                                    />
                                    <div className="p-2 bg-default-100 rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <UploadCloud
                                            size={20}
                                            className="text-default-500 group-hover:text-primary"
                                        />
                                    </div>
                                    <p className="text-sm text-default-600 font-medium">
                                        Click to select files
                                    </p>
                                </label>

                                {/* Uploaded / Uploading List */}
                                {uploadStates.length > 0 && (
                                    <div className="flex flex-col gap-2 mt-2">
                                        {uploadStates.map((fileState, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-3 bg-default-50 border border-default-200 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden w-full">
                                                    <div className="p-1.5 bg-default-100 rounded-md shrink-0">
                                                        <FileIcon
                                                            size={16}
                                                            className="text-default-500"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col truncate w-full pr-2">
                                                        <span className="text-sm font-medium truncate">
                                                            {fileState.name}
                                                        </span>

                                                        {fileState.status ===
                                                            'success' &&
                                                        fileState.url ? (
                                                            <a
                                                                href={
                                                                    fileState.url
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-[10px] text-primary hover:underline truncate"
                                                            >
                                                                View in
                                                                SharePoint
                                                            </a>
                                                        ) : fileState.status ===
                                                          'error' ? (
                                                            <span
                                                                className="text-[10px] text-danger truncate"
                                                                title={
                                                                    fileState.errorMessage
                                                                }
                                                            >
                                                                {fileState.errorMessage ||
                                                                    'Upload failed'}
                                                            </span>
                                                        ) : (
                                                            <div className="flex flex-col gap-1 mt-1 w-full pr-4">
                                                                <div className="flex justify-between items-center text-[10px] text-default-400">
                                                                    <span>
                                                                        Uploading...
                                                                    </span>
                                                                    <span>
                                                                        {
                                                                            fileState.progress
                                                                        }
                                                                        %
                                                                    </span>
                                                                </div>
                                                                <Progress
                                                                    aria-label="Uploading..."
                                                                    size="sm"
                                                                    value={
                                                                        fileState.progress
                                                                    }
                                                                    color="primary"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0 pl-2">
                                                    {fileState.status ===
                                                        'success' && (
                                                        <CheckCircle2
                                                            size={18}
                                                            className="text-success"
                                                        />
                                                    )}
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="light"
                                                        color="danger"
                                                        onPress={() =>
                                                            removeFile(
                                                                fileState
                                                            )
                                                        }
                                                        className="opacity-50 hover:opacity-100 min-w-8 w-8 h-8"
                                                    >
                                                        <X size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-10 text-center text-default-400 italic">
                        No jobs pending delivery.
                    </div>
                )}
            </ModalBody>

            <ModalFooter className="border-t border-divider">
                <Button variant="flat" onPress={onClose}>
                    Cancel
                </Button>
                <Button
                    color="primary"
                    type="submit"
                    variant="shadow"
                    isLoading={deliverAction.isPending}
                    isDisabled={
                        !formik.isValid ||
                        !formik.dirty ||
                        deliverAction.isPending ||
                        isUploadingFiles
                    }
                    className="font-bold px-8"
                >
                    Submit Delivery
                </Button>
            </ModalFooter>
        </form>
    )
}

export const DeliverJobSkeleton = () => {
    return (
        <div className="animate-pulse">
            <ModalHeader className="flex flex-col gap-2">
                <Skeleton className="w-1/3 h-6 rounded-lg" />
                <Skeleton className="w-1/2 h-3 rounded-lg" />
            </ModalHeader>
            <ModalBody className="py-6 space-y-6">
                <div className="space-y-2">
                    <Skeleton className="w-20 h-4 rounded-md" />
                    <Skeleton className="w-full h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="w-24 h-4 rounded-md" />
                    <Skeleton className="w-full h-24 rounded-xl" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="w-28 h-4 rounded-md" />
                    <Skeleton className="w-full h-10 rounded-xl" />
                </div>
                <Skeleton className="w-full h-20 rounded-xl" />
            </ModalBody>
            <ModalFooter>
                <Skeleton className="w-24 h-10 rounded-xl" />
                <Skeleton className="w-32 h-10 rounded-xl" />
            </ModalFooter>
        </div>
    )
}
