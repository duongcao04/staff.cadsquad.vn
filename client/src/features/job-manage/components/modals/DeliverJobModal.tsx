import { jobsPendingDeliverOptions, useDeliverJobMutation } from '@/lib/queries'
import {
    DeliverJobInputSchema,
    TDeliverJobInput,
} from '@/lib/validationSchemas/_job.schema'
import {
    Button,
    Chip,
    Input,
    Select,
    SelectItem,
    Skeleton,
    Textarea,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useFormik } from 'formik'
import lodash from 'lodash'
import { CheckCircle2, Link as LinkIcon, Paperclip, Send } from 'lucide-react'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { JobStatusChip } from '../../../../shared/components/chips/JobStatusChip'
import {
    HeroModal,
    HeroModalBody,
    HeroModalContent,
    HeroModalFooter,
    HeroModalHeader,
} from '../../../../shared/components/ui/hero-modal'

interface DeliverJobModalProps {
    isOpen: boolean
    defaultJob?: string
    onClose: () => void
    onConfirm?: (data: any) => void
}

export const DeliverJobModal = (props: DeliverJobModalProps) => {
    return (
        <HeroModal isOpen={props.isOpen} onClose={props.onClose} size="lg">
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
                        {/* Chỉ render nội dung khi thực sự mở Modal */}
                        {props.isOpen && <DeliverJobContent {...props} />}
                    </Suspense>
                </ErrorBoundary>
            </HeroModalContent>
        </HeroModal>
    )
}

export const DeliverJobContent = ({
    defaultJob,
    onClose,
    onConfirm,
}: {
    defaultJob?: string
    onClose: () => void
    onConfirm?: (data: TDeliverJobInput) => void
}) => {
    const deliverJobMutation = useDeliverJobMutation()

    // ✅ Dữ liệu được đảm bảo đã load xong mới render tới đây
    const { data: pendingDeliverJobs } = useSuspenseQuery({
        ...jobsPendingDeliverOptions(),
    })

    const formik = useFormik<TDeliverJobInput>({
        initialValues: {
            jobId: defaultJob ?? '',
            note: '',
            link: '',
            files: [],
        },
        validationSchema: DeliverJobInputSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files).map((f) =>
                URL.createObjectURL(f)
            )
            formik.setFieldValue('files', [
                ...(formik.values.files || []),
                ...newFiles,
            ])
        }
    }

    return (
        <form onSubmit={formik.handleSubmit}>
            <HeroModalHeader className="flex flex-col gap-1 border-b border-divider">
                <div className="flex items-center gap-2 text-primary">
                    <Send size={20} />
                    <span className="text-lg font-bold">Deliver Job</span>
                </div>
                <p className="text-xs text-default-400 font-normal">
                    This will change status to <strong>DELIVERED</strong>.
                </p>
            </HeroModalHeader>

            <HeroModalBody className="py-6 space-y-5">
                {pendingDeliverJobs.length > 0 ? (
                    <>
                        <Select
                            label="Select Job"
                            placeholder="Which job is for delivery?"
                            labelPlacement="outside"
                            variant="bordered"
                            name="jobId"
                            selectedKeys={
                                formik.values.jobId ? [formik.values.jobId] : []
                            }
                            isDisabled={!lodash.isEmpty(defaultJob)}
                            onChange={formik.handleChange}
                            isInvalid={
                                !!(formik.touched.jobId && formik.errors.jobId)
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
                                            <p className="text-sm font-semibold">
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

                        <Textarea
                            label="Delivery Note"
                            placeholder="Describe what you are delivering..."
                            variant="bordered"
                            labelPlacement="outside"
                            minRows={3}
                            name="note"
                            value={formik.values.note}
                            onChange={formik.handleChange}
                        />

                        <Input
                            label="External Link"
                            placeholder="https://..."
                            variant="bordered"
                            labelPlacement="outside"
                            startContent={
                                <LinkIcon
                                    size={16}
                                    className="text-default-400"
                                />
                            }
                            name="link"
                            value={formik.values.link || ''}
                            onChange={formik.handleChange}
                        />

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    Attachments
                                </span>
                                <label className="cursor-pointer text-xs text-primary font-bold hover:opacity-70 flex items-center gap-1">
                                    <Paperclip size={14} /> Add Files
                                    <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formik.values.files?.map((_, index) => (
                                    <Chip
                                        key={index}
                                        variant="flat"
                                        color="primary"
                                        size="sm"
                                        onClose={() => {
                                            const newFiles = [
                                                ...formik.values.files!,
                                            ]
                                            newFiles.splice(index, 1)
                                            formik.setFieldValue(
                                                'files',
                                                newFiles
                                            )
                                        }}
                                    >
                                        File {index + 1}
                                    </Chip>
                                ))}
                            </div>
                        </div>

                        <div className="bg-default-50 p-3 rounded-xl border border-default-200 flex gap-3">
                            <CheckCircle2
                                size={18}
                                className="text-success mt-0.5"
                            />
                            <div className="text-xs text-default-600">
                                <strong>Delivery Checklist:</strong>
                                <ul className="list-disc pl-4 mt-1">
                                    <li>Assets uploaded?</li>
                                    <li>Client requirements met?</li>
                                </ul>
                            </div>
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
