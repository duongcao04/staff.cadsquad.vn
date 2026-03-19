import {
    Card,
    CardBody,
    CardFooter,
    Chip,
    Button,
    AvatarGroup,
    Avatar,
    Divider,
} from '@heroui/react'
import {
    CalendarDays,
    MoreVertical,
    Paperclip,
    UserPlus,
    Eye,
    ExternalLink,
    Hash,
} from 'lucide-react'
import { TJob } from '@/shared/types'
import { JobStatusChip } from '@/shared/components'
import { currencyFormatter, optimizeCloudinary } from '@/lib'
import dayjs from 'dayjs'

interface ProjectCenterCardProps {
    job: TJob
    onViewDetail: (no: string) => void
    onAssignMember: (no: string) => void
    onAddAttachments: (no: string) => void
}

export const ProjectCenterCard = ({
    job,
    onViewDetail,
    onAssignMember,
    onAddAttachments,
}: ProjectCenterCardProps) => {
    return (
        <Card className="border border-divider shadow-sm hover:shadow-md transition-shadow">
            <CardBody className="p-4 gap-4">
                {/* Header: ID & Status */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                            <Hash size={14} />
                        </div>
                        <span className="font-mono font-bold text-sm text-primary">
                            {job.no}
                        </span>
                    </div>
                    <JobStatusChip data={job.status} props={{ size: 'sm' }} />
                </div>

                {/* Job Info */}
                <div>
                    <h4 className="text-base font-bold leading-tight line-clamp-2 min-h-12">
                        {job.displayName}
                    </h4>
                    <div className="flex items-center gap-2 mt-2 text-text-subdued">
                        <span className="text-xs font-medium bg-default-100 px-2 py-0.5 rounded">
                            {job.type?.displayName}
                        </span>
                        <Divider orientation="vertical" className="h-3" />
                        <span className="text-xs">{job.client?.name}</span>
                    </div>
                </div>

                {/* Timeline & Members */}
                <div className="flex justify-between items-end pt-2">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-black text-default-400">
                            Deadline
                        </p>
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                            <CalendarDays
                                size={14}
                                className="text-text-subdued"
                            />
                            {dayjs(job.dueAt).format('DD MMM, YYYY')}
                        </div>
                    </div>
                    <AvatarGroup isBordered size="sm" max={3}>
                        {job.assignments?.map((asgn) => (
                            <Avatar
                                key={asgn.id}
                                src={optimizeCloudinary(asgn.user.avatar, {
                                    width: 50,
                                    height: 50,
                                })}
                            />
                        ))}
                    </AvatarGroup>
                </div>

                {/* Financial (Optional for Admin) */}
                <div className="bg-default-50 p-2 rounded-xl flex justify-between items-center mt-2">
                    <p className="text-[10px] uppercase font-bold text-default-400">
                        Staff Cost
                    </p>
                    <p className="text-sm font-black text-primary">
                        {currencyFormatter(job.totalStaffCost || 0)}
                    </p>
                </div>
            </CardBody>

            <Divider />

            <CardFooter className="p-2 gap-2 overflow-x-auto noscrollbar">
                <Button
                    fullWidth
                    size="sm"
                    variant="flat"
                    className="font-bold"
                    startContent={<Eye size={16} />}
                    onPress={() => onViewDetail(job.no)}
                >
                    View
                </Button>
                <Button
                    fullWidth
                    size="sm"
                    variant="flat"
                    color="primary"
                    className="font-bold"
                    startContent={<UserPlus size={16} />}
                    onPress={() => onAssignMember(job.no)}
                >
                    Assign
                </Button>
                <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    onPress={() => onAddAttachments(job.no)}
                >
                    <Paperclip size={16} />
                </Button>
            </CardFooter>
        </Card>
    )
}
