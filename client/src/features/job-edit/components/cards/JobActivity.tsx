import { Avatar, Button, Divider, Textarea } from '@heroui/react'
import {  Send } from 'lucide-react'
import { HeroTooltip } from '@/shared/components'
import { optimizeCloudinary } from '@/lib'
import { TUser } from '@/shared/types'
import { JobActivityHistory } from '@/features/job-details'

type JobActivityProps = {
    profile: TUser
    activityLogs: TJobActivityLog[]
    isLoadingActivityLogs: boolean
}

export function JobActivity({
    profile,
    activityLogs,
    isLoadingActivityLogs,
}: JobActivityProps) {
    return (
        <div className="space-y-6 animate-in fade-in">
            {/* --- HEADER & TOOLTIP --- */}
            <div className="flex flex-col gap-1 pb-4 border-b border-border-default">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-text-default">
                        Activity & Communication
                    </h1>
                    <HeroTooltip
                        placement="right"
                        content={
                            <div className="px-1 py-1 max-w-[250px] text-tiny text-default-600">
                                This feed tracks every change made to the job
                                and serves as a communication hub for the
                                assigned team.
                            </div>
                        }
                    >
                        <div className="flex items-center justify-center w-4 h-4 rounded-full bg-default-200 hover:bg-default-300 text-[10px] font-bold text-default-600 cursor-help transition-colors">
                            !
                        </div>
                    </HeroTooltip>
                </div>
                <p className="text-sm text-text-subdued">
                    View the full audit trail and discuss project updates with
                    your team.
                </p>
            </div>

            {/* --- COMMENT INPUT AREA --- */}
            <div className="flex gap-4 pt-2">
                <Avatar
                    src={optimizeCloudinary(profile.avatar, {
                        width: 256,
                        height: 256,
                    })}
                    className="w-10 h-10 shrink-0 border border-border-default shadow-sm"
                />
                <div className="flex-1">
                    <Textarea
                        placeholder="Add a comment or update for the team..."
                        minRows={2}
                        variant="faded"
                        className="mb-2"
                        classNames={{
                            inputWrapper:
                                'bg-background focus-within:ring-1 ring-primary/30',
                        }}
                    />
                    <div className="flex justify-end">
                        <Button
                            size="sm"
                            color="primary"
                            startContent={<Send size={14} />}
                            className="font-semibold shadow-sm"
                        >
                            Post Comment
                        </Button>
                    </div>
                </div>
            </div>

            <Divider className="my-4 opacity-60" />

            {/* --- ACTIVITY HISTORY LIST --- */}
            <div className="relative">
                <JobActivityHistory
                    logs={activityLogs}
                    isLoading={isLoadingActivityLogs}
                />
            </div>
        </div>
    )
}
