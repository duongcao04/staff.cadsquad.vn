import AddAttachmentsModal from '@/features/project-center/components/modals/AddAttachmentsModal'
import AssignMemberModal from '@/features/project-center/components/modals/AssignMemberModal'
import {
    handleCopy,
    INTERNAL_URLS,
    jobsListOptions,
    optimizeCloudinary,
    useDeleteJobMutation,
} from '@/lib'
import { queryClient } from '@/main'
import {
    ConfirmDeleteModal,
    HeroCard,
    HeroCardBody,
    HeroCardFooter,
    JobStatusChip,
} from '@/shared/components'
import CountdownTimer from '@/shared/components/ui/countdown-timer'
import { TJob } from '@/shared/types'
import {
    addToast,
    Avatar,
    AvatarGroup,
    Button,
    Divider,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    useDisclosure,
} from '@heroui/react'
import { useRouter } from '@tanstack/react-router'
import {
    CalendarIcon,
    CopyIcon,
    EditIcon,
    EyeIcon,
    HashIcon,
    MoreVerticalIcon,
    PaperclipIcon,
    TrashIcon,
    UserPlusIcon,
} from 'lucide-react'

type JobMobileCardProps = {
    job: TJob
}
export function JobMobileCard({ job }: JobMobileCardProps) {
    const router = useRouter()
    const deleteJobMutation = useDeleteJobMutation()

    const isPauseDueAt =
        job.status.systemType === 'TERMINATED' ||
        job.status.systemType === 'COMPLETED'

    const assignModal = useDisclosure({
        id: 'AssignMemberModal',
    })
    const attachmentsModal = useDisclosure({
        id: 'AddAttachmentsModal',
    })
    const deleteModal = useDisclosure({
        id: 'ConfirmDeleteJobModal',
    })

    const onViewDetail = () => {
        router.navigate({
            href: INTERNAL_URLS.jobDetail(job.no),
        })
    }
    const onCopyLink = () => {
        handleCopy(INTERNAL_URLS.jobDetail(job.no))
        addToast({
            title: 'Copy to clipboard successfully',
            color: 'success',
        })
    }
    const onAssignMember = () => {
        assignModal.onOpen()
    }
    const onAddAttachments = () => {
        attachmentsModal.onOpen()
    }
    const onDelete = () => {
        deleteModal.onOpen()
    }
    const onEdit = () => {
        router.navigate({
            href: INTERNAL_URLS.management.jobDetail(job.no),
        })
    }

    // --- Handlers ---
    const handleDeleteJob = async () => {
        await deleteJobMutation.mutateAsync(job.id, {
            onSuccess: () => {
                queryClient.refetchQueries({
                    queryKey: jobsListOptions().queryKey,
                })
                deleteModal.onClose()
            },
        })
    }

    return (
        <>
            {assignModal.isOpen && job.no && (
                <AssignMemberModal
                    isOpen={assignModal.isOpen}
                    onClose={assignModal.onClose}
                    jobNo={job.no}
                />
            )}
            {attachmentsModal.isOpen && job.no && (
                <AddAttachmentsModal
                    isOpen={attachmentsModal.isOpen}
                    onClose={attachmentsModal.onClose}
                    jobNo={job.no}
                />
            )}
            {deleteModal.isOpen && job.no && (
                <ConfirmDeleteModal
                    isOpen={deleteModal.isOpen}
                    onClose={deleteModal.onClose}
                    onConfirm={handleDeleteJob}
                    title="Delete Job"
                    description={`Are you sure you want to permanently delete job #${job.no}?`}
                    isLoading={deleteJobMutation.isPending}
                />
            )}
            <HeroCard className="border border-border-default shadow-sm bg-content1">
                <HeroCardBody className="gap-3 p-3.5">
                    {/* --- Header: Job No, Status & Context Menu --- */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                                <HashIcon size={14} />
                            </div>
                            <span className="font-bold text-sm text-text-default">
                                {job.no}
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <JobStatusChip
                                data={job.status}
                                props={{ size: 'sm', variant: 'flat' }}
                            />

                            {/* More Actions Dropdown */}
                            <Dropdown placement="bottom-end">
                                <DropdownTrigger>
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        className="h-6 w-6 min-w-6 text-text-subdued data-[hover=true]:bg-default/40"
                                    >
                                        <MoreVerticalIcon size={16} />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label="Job actions"
                                    variant="flat"
                                    onAction={(key) => {
                                        if (key === 'copy') onCopyLink()
                                        if (key === 'edit') onEdit()
                                        if (key === 'delete') onDelete()
                                    }}
                                >
                                    <DropdownItem
                                        key="copy"
                                        startContent={
                                            <CopyIcon
                                                size={16}
                                                className="text-text-subdued"
                                            />
                                        }
                                    >
                                        Copy Link
                                    </DropdownItem>
                                    <DropdownItem
                                        key="edit"
                                        startContent={
                                            <EditIcon
                                                size={16}
                                                className="text-text-subdued"
                                            />
                                        }
                                    >
                                        Edit Job
                                    </DropdownItem>
                                    <DropdownItem
                                        key="delete"
                                        className="text-danger"
                                        color="danger"
                                        startContent={<TrashIcon size={16} />}
                                    >
                                        Delete
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    </div>

                    {/* --- Content: Title & Client --- */}
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold leading-snug line-clamp-2 text-text-default">
                            {job.displayName}
                        </h4>
                        <p className="text-xs text-text-subdued line-clamp-1">
                            {job.client?.name || 'Unknown Client'}
                        </p>
                    </div>

                    {/* --- Details: Date & Assignees --- */}
                    <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1.5 bg-content2 px-2 py-1 rounded-md text-text-subdued border border-transparent">
                            <CalendarIcon size={12} />
                            <CountdownTimer
                                targetDate={job.dueAt}
                                paused={isPauseDueAt}
                                className="text-xs font-medium"
                                hiddenUnits={['second', 'minute']}
                            />
                        </div>

                        <AvatarGroup isBordered size="sm" max={3}>
                            {job.assignments?.map((ass) => (
                                <Avatar
                                    key={ass.id}
                                    src={optimizeCloudinary(ass.user.avatar)}
                                    className="w-6 h-6"
                                />
                            ))}
                        </AvatarGroup>
                    </div>
                </HeroCardBody>

                <Divider className="opacity-50" />

                {/* --- Footer Actions --- */}
                <HeroCardFooter className="p-2 gap-2 bg-content2/30">
                    <Button
                        fullWidth
                        size="sm"
                        variant="light"
                        startContent={<EyeIcon size={16} />}
                        onPress={onViewDetail}
                        className="font-medium text-xs h-8 data-[hover=true]:bg-default/40"
                    >
                        Details
                    </Button>

                    <div className="w-px h-4 bg-divider" />

                    <Button
                        fullWidth
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<UserPlusIcon size={16} />}
                        onPress={onAssignMember}
                        className="font-medium text-xs h-8"
                    >
                        Assign
                    </Button>

                    <div className="w-px h-4 bg-divider" />

                    {/* Quick Attachment Button */}
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="h-8 w-10 text-text-subdued data-[hover=true]:bg-default/40"
                        onPress={onAddAttachments}
                    >
                        <PaperclipIcon size={16} />
                    </Button>
                </HeroCardFooter>
            </HeroCard>
        </>
    )
}
