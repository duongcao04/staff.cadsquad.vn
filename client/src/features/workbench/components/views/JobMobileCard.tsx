import { Avatar, AvatarGroup, Button, Divider } from '@heroui/react'
import { CalendarIcon, EyeIcon, HashIcon, UserPlusIcon } from 'lucide-react'
import { optimizeCloudinary } from '../../../../lib'
import { TJob } from '../../../../shared/types'
import { JobStatusChip } from '../../../../shared/components/chips/JobStatusChip'
import CountdownTimer from '../../../../shared/components/ui/countdown-timer'
import {
    HeroCard,
    HeroCardBody,
    HeroCardFooter,
} from '../../../../shared/components/ui/hero-card'

type JobMobileCardProps = {
    job: TJob
    onViewDetail: (jobNo: string) => void
    onAssignMember: (jobNo: string) => void
}
export default function JobMobileCard({
    job,
    onViewDetail,
    onAssignMember,
}: JobMobileCardProps) {
    const isPauseDueAt =
        job.status.systemType === 'TERMINATED' ||
        job.status.systemType === 'COMPLETED'
    return (
        <HeroCard className="border border-border-default">
            <HeroCardBody className="gap-3 p-4">
                {/* Header: Job No & Status */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <HashIcon size={16} />
                        </div>
                        <span className="font-bold text-sm">{job.no}</span>
                    </div>
                    <JobStatusChip data={job.status} props={{ size: 'sm' }} />
                </div>

                {/* Job Title */}
                <div>
                    <h4 className="text-base font-bold leading-tight line-clamp-2">
                        {job.displayName}
                    </h4>
                    <p className="text-xs text-text-subdued mt-1">
                        {job.client?.name}
                    </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 py-2">
                    <div className="flex items-center gap-2 text-text-subdued">
                        <CalendarIcon size={14} />
                        <CountdownTimer
                            targetDate={job.dueAt}
                            paused={isPauseDueAt}
                            className="text-xs"
                            hiddenUnits={['second']}
                        />
                    </div>
                    <div className="flex justify-end">
                        <AvatarGroup isBordered size="sm" max={3}>
                            {job.assignments?.map((ass) => (
                                <Avatar
                                    key={ass.id}
                                    src={optimizeCloudinary(ass.user.avatar)}
                                />
                            ))}
                        </AvatarGroup>
                    </div>
                </div>
            </HeroCardBody>

            <Divider />

            <HeroCardFooter className="p-2 gap-2 bg-default-50/50">
                <Button
                    fullWidth
                    size="sm"
                    variant="flat"
                    startContent={<EyeIcon size={16} />}
                    onPress={() => onViewDetail(job.no)}
                    className="font-semibold"
                >
                    Details
                </Button>
                <Button
                    fullWidth
                    size="sm"
                    color="primary"
                    variant="flat"
                    startContent={<UserPlusIcon size={16} />}
                    onPress={() => onAssignMember(job.no)}
                    className="font-semibold"
                >
                    Assign
                </Button>
            </HeroCardFooter>
        </HeroCard>
    )
}
