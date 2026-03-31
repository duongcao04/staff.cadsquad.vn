import AssignMemberModal from '@/features/project-center/components/modals/AssignMemberModal'
import { optimizeCloudinary } from '@/lib'
import { TJob } from '@/shared/types'
import { Avatar, Button, useDisclosure, Tooltip } from '@heroui/react'
import { Download, FileText, Paperclip, Plus, Trash2 } from 'lucide-react'

type JobTeamAndFilesProps = {
    job: TJob
    onRemoveMember: (member: any) => void
}

export function JobTeamAndFiles({ job, onRemoveMember }: JobTeamAndFilesProps) {
    const {
        isOpen: isAssignOpen,
        onOpen: onOpenAssignModal,
        onClose: onCloseAssignModal,
    } = useDisclosure()

    return (
        <div className="space-y-10 animate-in fade-in">
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
                                <div className="px-1 py-1 max-w-[250px] text-tiny text-default-600">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {job?.assignments?.map((ass) => (
                        <div
                            key={ass.id}
                            className="flex items-center justify-between p-3 border border-border-default rounded-xl hover:border-primary transition-colors cursor-pointer group bg-background"
                        >
                            <div className="flex items-center gap-3">
                                <Avatar
                                    src={optimizeCloudinary(ass.user.avatar, {
                                        width: 120,
                                        height: 120,
                                    })}
                                    className="border border-border-default shadow-sm"
                                />
                                <div>
                                    <p className="font-bold text-sm text-text-default leading-tight">
                                        {ass.user.displayName}
                                    </p>
                                    <p className="text-xs text-text-subdued">
                                        @{ass.user.username}
                                    </p>
                                </div>
                            </div>
                            <Tooltip content={`Remove @${ass.user.username}`}>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    color="danger"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    onPress={() => onRemoveMember(ass.user)}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </Tooltip>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={onOpenAssignModal}
                        className="border border-dashed border-default-300 rounded-xl flex items-center justify-center gap-2 h-[66px] text-text-subdued hover:text-primary hover:border-primary hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all group"
                    >
                        <Plus
                            size={18}
                            className="group-hover:scale-110 transition-transform"
                        />
                        <span className="font-medium text-sm">
                            Add Team Member
                        </span>
                    </button>
                </div>
            </section>

            {/* --- FILES SECTION --- */}
            <section className="space-y-6">
                <div className="flex flex-col gap-1 pb-4 border-b border-border-default">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold text-text-default">
                                Project Files
                            </h1>
                            <Tooltip
                                placement="right"
                                content={
                                    <div className="px-1 py-1 max-w-[250px] text-tiny text-default-600">
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
                                className="flex items-center justify-between p-3 bg-default-50 border border-border-default rounded-xl hover:bg-default-100 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-default-200 rounded-lg border border-border-default text-danger-500 shadow-sm">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-text-default hover:text-primary cursor-pointer transition-colors line-clamp-1">
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
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-default-200 rounded-2xl bg-default-50/50">
                            <Paperclip
                                size={32}
                                className="text-default-300 mb-2"
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
