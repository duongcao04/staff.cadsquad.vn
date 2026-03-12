import { sharepointApi, sharepointFolderItemsOptions } from '@/lib'
import { jobsPendingDeliverOptions, useDeliverJobMutation } from '@/lib/queries'
import {
    DeliverJobInputSchema,
    TDeliverJobInput,
} from '@/lib/validationSchemas/_job.schema'
import { JobStatusChip } from '@/shared/components/chips/JobStatusChip'
import {
    HeroModal,
    HeroModalBody,
    HeroModalContent,
    HeroModalFooter,
    HeroModalHeader,
} from '@/shared/components/ui/hero-modal'
import { TJob } from '@/shared/types'
import {
    Button,
    Select,
    SelectItem,
    Skeleton,
    Spinner,
    Textarea,
    Progress,
} from '@heroui/react'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
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
    onConfirm?: (data: any) => void
    showSelect?: boolean
}

export const DeliverJobModal = ({
    isOpen,
    defaultJob,
    onClose,
    onConfirm,
    showSelect = true,
}: DeliverJobModalProps) => {
    return (
        <HeroModal isOpen={isOpen} onClose={onClose} size="lg">
            <HeroModalContent>
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
                                onConfirm={onConfirm}
                                showSelect={showSelect}
                            />
                        )}
                    </Suspense>
                </ErrorBoundary>
            </HeroModalContent>
        </HeroModal>
    )
}

// Helper type to manage upload state locally before pushing to formik
type UploadingFile = {
    file: File
    status: 'uploading' | 'success' | 'error'
    url?: string
    name: string
    progress: number
    errorMessage?: string // Thêm trường lưu chi tiết lỗi
}

export const DeliverJobContent = ({
    defaultJob,
    onClose,
    onConfirm,
    showSelect,
}: {
    defaultJob?: TJob
    onClose: () => void
    onConfirm?: (data: TDeliverJobInput) => void
    showSelect: boolean
}) => {
    const deliverJobMutation = useDeliverJobMutation()

    // State to manage files actively being uploaded or already uploaded in UI
    const [uploadStates, setUploadStates] = useState<UploadingFile[]>([])

    const { data: pendingDeliverJobs } = useSuspenseQuery({
        ...jobsPendingDeliverOptions(),
    })

    const { data } = useQuery({
        ...sharepointFolderItemsOptions(defaultJob?.sharepointFolderId ?? '-1'),
        enabled: !!Boolean(defaultJob?.sharepointFolderId),
    })

    const folderItems = data?.items ?? []

    const formik = useFormik<TDeliverJobInput>({
        initialValues: {
            jobId: defaultJob?.id ?? '',
            note: '',
            link: '',
            files: [],
        },
        validationSchema: toFormikValidationSchema(DeliverJobInputSchema),
        enableReinitialize: true,
        onSubmit: async (values) => {
            // Ensure any files currently uploading are blocked from submit if needed,
            // but assuming formik.values.files only has successful URLs
            if (onConfirm) {
                onConfirm(values)
                onClose()
                formik.resetForm()
            } else {
                await deliverJobMutation.mutateAsync({
                    jobId: values.jobId,
                    data: {
                        files: values.files,
                        link: lodash.isEmpty(values.link)
                            ? undefined
                            : values.link,
                        note: lodash.isEmpty(values.note)
                            ? undefined
                            : values.note,
                    },
                })
                onClose()
                formik.resetForm()
            }
        },
    })

    const destinationUploadFolderId = useMemo(() => {
        const existingWorkingFolder = folderItems.findIndex(
            (it) => it.name === 'Working' && it.isFolder
        )
        if (existingWorkingFolder === -1) {
            return defaultJob?.sharepointFolderId
        }
        return folderItems[existingWorkingFolder]?.id
    }, [folderItems])

    const handleSharepointUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (!e.target.files) return

        // 1. Convert to array and limit to max 5 files total (including existing)
        let selectedFiles = Array.from(e.target.files)
        const totalAllowed = 5
        const currentCount = uploadStates.length

        if (currentCount + selectedFiles.length > totalAllowed) {
            alert(`You can only upload a maximum of ${totalAllowed} files.`)
            selectedFiles = selectedFiles.slice(0, totalAllowed - currentCount)
        }

        if (selectedFiles.length === 0) return

        // 2. Initialize UI state for these files
        const newUploads: UploadingFile[] = selectedFiles.map((file) => ({
            file,
            name: file.name,
            status: 'uploading',
            progress: 0,
        }))

        setUploadStates((prev) => [...prev, ...newUploads])

        // 3. Upload files sequentially or in parallel
        for (const uploadItem of newUploads) {
            try {
                // Upload with progress callback
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

                let finalUrl = ''
                if (res.result) {
                    const item = res.result as any
                    finalUrl = item.webUrl || item.url || ''
                } else {
                    const item = res as any
                    finalUrl = item.webUrl || item.url || ''
                }

                if (finalUrl) {
                    // Update Local State to Success
                    setUploadStates((prev) =>
                        prev.map((item) =>
                            item.name === uploadItem.name
                                ? {
                                      ...item,
                                      status: 'success',
                                      url: finalUrl,
                                      progress: 100,
                                  }
                                : item
                        )
                    )

                    // Add URL to Formik
                    formik.setFieldValue('files', [
                        ...formik.values.files,
                        finalUrl,
                    ])
                } else {
                    throw new Error('No URL returned from API')
                }
            } catch (err: any) {
                console.error(`Upload failed for ${uploadItem.name}:`, err)
                
                // Lấy thông báo lỗi chi tiết từ Axios hoặc Error object
                const errorMessage = 
                    err?.response?.data?.message || 
                    err?.response?.data?.error || 
                    err?.message || 
                    'Upload failed due to unknown error'

                // Update Local State to Error kèm message
                setUploadStates((prev) =>
                    prev.map((item) =>
                        item.name === uploadItem.name
                            ? { ...item, status: 'error', errorMessage }
                            : item
                    )
                )
            }
        }

        // Reset input
        e.target.value = ''
    }

    const removeFile = (fileToRemove: UploadingFile) => {
        // Remove from local UI state
        setUploadStates((prev) =>
            prev.filter((f) => f.name !== fileToRemove.name)
        )

        // If it was successful, remove its URL from formik
        if (fileToRemove.url) {
            formik.setFieldValue(
                'files',
                formik.values.files.filter((url) => url !== fileToRemove.url)
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
    }, [formik.values.jobId])

    // Check if any files are currently uploading to disable submit button
    const isUploadingFiles = uploadStates.some((f) => f.status === 'uploading')

    return (
        <form onSubmit={formik.handleSubmit}>
            <HeroModalHeader className="flex flex-col gap-1 border-b border-divider">
                <div className="flex items-center gap-2 text-primary">
                    <Send size={20} />
                    <span className="text-lg font-bold truncate">
                        Deliver Job {jobDeliverName}
                    </span>
                </div>
                <p className="text-xs text-default-400 font-normal">
                    This will change status to <strong>DELIVERED</strong>.
                </p>
            </HeroModalHeader>

            <HeroModalBody className="py-6 space-y-5">
                {pendingDeliverJobs.length > 0 ? (
                    <>
                        {showSelect && (
                            <Select
                                isRequired
                                label="Select Job"
                                placeholder="Which job is for delivery?"
                                labelPlacement="outside"
                                variant="bordered"
                                name="jobId"
                                selectedKeys={
                                    formik.values.jobId
                                        ? [formik.values.jobId]
                                        : []
                                }
                                disallowEmptySelection
                                isDisabled={!lodash.isEmpty(defaultJob)}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={
                                    formik.touched.jobId &&
                                    !!formik.errors.jobId
                                }
                                errorMessage={
                                    formik.touched.jobId && formik.errors.jobId
                                }
                            >
                                {pendingDeliverJobs.map((job) => (
                                    <SelectItem
                                        key={job.id}
                                        textValue={job.displayName}
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
                                    </SelectItem>
                                ))}
                            </Select>
                        )}

                        <Textarea
                            isRequired
                            id="note"
                            name="note"
                            label="Delivery Note"
                            placeholder="Describe what you are delivering..."
                            variant="bordered"
                            labelPlacement="outside"
                            minRows={3}
                            value={formik.values.note}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            isInvalid={
                                formik.touched.note && !!formik.errors.note
                            }
                            errorMessage={
                                formik.touched.note && formik.errors.note
                            }
                        />

                        {/* FILE UPLOAD SECTION */}
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
                                                            href={fileState.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-[10px] text-primary hover:underline truncate"
                                                        >
                                                            View in SharePoint
                                                        </a>
                                                    ) : fileState.status ===
                                                      'error' ? (
                                                        <span 
                                                            className="text-[10px] text-danger truncate"
                                                            title={fileState.errorMessage}
                                                        >
                                                            {fileState.errorMessage || 'Upload failed'}
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
                                                        removeFile(fileState)
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
                    </>
                ) : (
                    <div className="py-10 text-center text-default-400 italic">
                        No jobs pending delivery.
                    </div>
                )}
            </HeroModalBody>

            <HeroModalFooter className="border-t border-divider">
                <Button variant="flat" onPress={onClose}>
                    Cancel
                </Button>
                <Button
                    color="primary"
                    type="submit"
                    isLoading={deliverJobMutation.isPending}
                    isDisabled={
                        !formik.isValid ||
                        !formik.dirty ||
                        deliverJobMutation.isPending ||
                        isUploadingFiles
                    }
                    className="font-bold px-8"
                >
                    Submit Delivery
                </Button>
            </HeroModalFooter>
        </form>
    )
}

export const DeliverJobSkeleton = () => {
    return (
        <div className="animate-pulse">
            <HeroModalHeader className="flex flex-col gap-2">
                <Skeleton className="w-1/3 h-6 rounded-lg" />
                <Skeleton className="w-1/2 h-3 rounded-lg" />
            </HeroModalHeader>
            <HeroModalBody className="py-6 space-y-6">
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
            </HeroModalBody>
            <HeroModalFooter>
                <Skeleton className="w-24 h-10 rounded-xl" />
                <Skeleton className="w-32 h-10 rounded-xl" />
            </HeroModalFooter>
        </div>
    )
}