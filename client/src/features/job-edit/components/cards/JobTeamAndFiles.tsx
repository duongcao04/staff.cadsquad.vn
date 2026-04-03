import AssignMemberModal from '@/features/project-center/components/modals/AssignMemberModal'
import { optimizeCloudinary, unassignMemberToJobOptions } from '@/lib'
import { TJob, TUser } from '@/shared/types'
import { Xmark } from '@gravity-ui/icons'
import { addToast, Avatar, Button, Tooltip, useDisclosure } from '@heroui/react'
import { useMutation } from '@tanstack/react-query'
import { Download, FileText, Paperclip, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { HeroTooltip } from '../../../../shared/components'
import { ConfirmRemoveAssigneeModal } from '../../../job-manage'

type JobTeamAndFilesProps = {
    job: TJob
    onRefresh: ()=>void
}

export function JobTeamAndFiles({ job,onRefresh }: JobTeamAndFilesProps) {
    const [selectedMember, setSelectedMember] = useState<TUser | null>(null)
    const removeMemberAction = useMutation(unassignMemberToJobOptions)

    console.log(selectedMember);
    

    const confirmRemoveAssigneeState = useDisclosure()

    const handleRemoveMember = () => {
        if (job?.id && selectedMember) {
            removeMemberAction.mutateAsync(
                {
                    jobId: job.id,
                    memberId: selectedMember.id,
                },
                {
                    onSuccess() {
                        confirmRemoveAssigneeState.onClose()
                        onRefresh()
                        setSelectedMember(null)
                        addToast({
                            title: 'Successfully',
                            description: `Unassign @${selectedMember.displayName} from this job successfully`,
                            color: 'success',
                        })
                    },
                }
            )
        }
    }
    const {
        isOpen: isAssignOpen,
        onOpen: onOpenAssignModal,
        onClose: onCloseAssignModal,
    } = useDisclosure()

    return (
        <div className="space-y-10 animate-in fade-in">
            {confirmRemoveAssigneeState.isOpen && selectedMember && (
                <ConfirmRemoveAssigneeModal
                    isOpen={confirmRemoveAssigneeState.isOpen}
                    onOpenChange={confirmRemoveAssigneeState.onOpenChange}
                    onConfirm={handleRemoveMember}
                    isLoading={removeMemberAction.isPending}
                    assignee={selectedMember}
                />
            )}

            {isAssignOpen && (
                <AssignMemberModal
                    isOpen={isAssignOpen}
                    onClose={onCloseAssignModal}
                    jobNo={job.no}
                />
            )}

            {/* --- TEAM SECTION --- */}
            <section className="space-y-6">
                <div className="flex flex-col gap-1 pb-4 border-b border-border-default">
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-bold text-text-default">
                            Assigned Team
                        </h1>
                        <Tooltip
                            placement="right"
                            content={
                                <div className="px-1 py-1 max-w-62.5 text-tiny text-default-600">
                                    Members assigned here can view job details,
                                    submit deliverables, and communicate in the
                                    activity feed.
                                </div>
                            }
                        >
                            <div className="flex items-center justify-center w-4 h-4 rounded-full bg-default-200 hover:bg-default-300 text-[10px] font-bold text-default-600 cursor-help transition-colors">
                                !
                            </div>
                        </Tooltip>
                    </div>
                    <p className="text-sm text-text-subdued">
                        Manage experts and collaborators working on this
                        specific project.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {job?.assignments?.map((ass) => (
                        <div
                            key={ass.id}
                            className="flex items-center justify-between p-3 transition-colors border cursor-pointer border-border-default rounded-xl hover:border-primary group bg-background"
                        >
                            <div className="flex items-center gap-3">
                                <Avatar
                                    src={optimizeCloudinary(ass.user.avatar, {
                                        width: 120,
                                        height: 120,
                                    })}
                                    className="border shadow-sm border-border-default"
                                />
                                <div>
                                    <p className="text-sm font-bold leading-tight text-text-default">
                                        {ass.user.displayName}
                                    </p>
                                    <p className="text-xs text-text-subdued">
                                        @{ass.user.username}
                                    </p>
                                </div>
                            </div>
                            <HeroTooltip content={`Unassign member from job`}>
                                <Button
                                    size="sm"
                                    variant="light"
                                    color="danger"
                                    className="transition-opacity opacity-0 group-hover:opacity-100"
                                    onPress={()=>{
                                        setSelectedMember(ass.user)
                                        confirmRemoveAssigneeState.onOpen()
                                    }}
                                    startContent={<Xmark fontSize={16} />}
                                >
                                    Remove
                                </Button>
                            </HeroTooltip>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={onOpenAssignModal}
                        className="border border-dashed border-default-300 rounded-xl flex items-center justify-center gap-2 h-16.5 text-text-subdued hover:text-primary hover:border-primary hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all group cursor-pointer"
                    >
                        <Plus
                            size={18}
                            className="transition-transform group-hover:scale-110"
                        />
                        <span className="text-sm font-medium">
                            Add Team Member
                        </span>
                    </button>
                </div>
            </section>

            {/* --- FILES SECTION --- */}
            <section className="space-y-6">
                <div className="flex flex-col gap-1 pb-4 border-b border-border-default">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold text-text-default">
                                Project Files
                            </h1>
                            <Tooltip
                                placement="right"
                                content={
                                    <div className="px-1 py-1 max-w-62.5 text-tiny text-default-600">
                                        Centralized repository for requirements,
                                        design assets, and relevant
                                        documentation.
                                    </div>
                                }
                            >
                                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-default-200 hover:bg-default-300 text-[10px] font-bold text-default-600 cursor-help transition-colors">
                                    !
                                </div>
                            </Tooltip>
                        </div>
                        <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            startContent={<Plus size={16} />}
                        >
                            Upload File
                        </Button>
                    </div>
                    <p className="text-sm text-text-subdued">
                        Upload and manage all supporting documents and assets
                        for this job.
                    </p>
                </div>

                <div className="space-y-2">
                    {/* Mocking file check logic - replace with actual job.files check */}
                    {job?.files && job.files.length > 0 ? (
                        job.files.map((file: any) => (
                            <div
                                key={file.id}
                                className="flex items-center justify-between p-3 transition-colors border bg-default-50 border-border-default rounded-xl hover:bg-default-100 group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white border rounded-lg shadow-sm dark:bg-default-200 border-border-default text-danger-500">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold transition-colors cursor-pointer text-text-default hover:text-primary line-clamp-1">
                                            {file.name}
                                        </p>
                                        <p className="text-[10px] text-text-subdued uppercase tracking-tighter font-semibold">
                                            {file.size} •{' '}
                                            {new Date(
                                                file.createdAt
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Tooltip content="Download">
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            className="text-text-subdued hover:text-primary"
                                        >
                                            <Download size={18} />
                                        </Button>
                                    </Tooltip>
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        color="danger"
                                        className="transition-opacity opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center px-4 py-12 border-2 border-dashed border-default-200 rounded-2xl bg-default-50/50">
                            <Paperclip
                                size={32}
                                className="mb-2 text-default-300"
                            />
                            <p className="text-sm font-medium text-default-400">
                                No attachments found
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
