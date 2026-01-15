import {
    Button,
    Pagination,
    Card,
    CardBody,
    CardFooter,
    AvatarGroup,
    Avatar,
    Divider,
    Chip,
    Spinner,
} from '@heroui/react'
import {
    CalendarDays,
    Paperclip,
    UserPlus,
    Eye,
    SearchIcon,
    Filter,
    DownloadIcon,
    Hash,
} from 'lucide-react'
import { TJob } from '@/shared/types'
import { JobStatusChip, ScrollArea, ScrollBar } from '@/shared/components'
import { HeroInput } from '../../../../shared/components/ui/hero-input'
import { currencyFormatter, optimizeCloudinary } from '@/lib'
import dayjs from 'dayjs'

interface ProjectCenterMobileContentProps {
    data: TJob[]
    isFetching: boolean
    pagination: {
        page: number
        totalPages: number
    }
    onPageChange: (page: number) => void
    onSearchChange: (value?: string) => void
    onViewDetail: (no: string) => void
    onAssignMember: (no: string) => void
    onAddAttachments: (no: string) => void
    onExport: () => void
}

export const ProjectCenterMobileContent = ({
    data,
    isFetching,
    pagination,
    onPageChange,
    onSearchChange,
    onViewDetail,
    onAssignMember,
    onAddAttachments,
    onExport,
}: ProjectCenterMobileContentProps) => {
    return (
        <div className="flex flex-col h-full gap-4">
            {/* SEARCH & FILTERS AREA */}
            <div className="flex flex-col gap-3 px-1">
                <HeroInput
                    placeholder="Search ID or project name..."
                    startContent={
                        <SearchIcon size={18} className="text-default-400" />
                    }
                    onValueChange={onSearchChange}
                    isClearable
                />
                <div className="flex gap-2">
                    <Button
                        variant="bordered"
                        className="flex-1 font-bold text-xs"
                        startContent={<Filter size={14} />}
                    >
                        Filters
                    </Button>
                    <Button
                        color="primary"
                        variant="flat"
                        className="flex-1 font-bold text-xs"
                        startContent={<DownloadIcon size={14} />}
                        onPress={onExport}
                    >
                        Export
                    </Button>
                </div>
            </div>

            {/* CARDS LIST AREA */}
            <ScrollArea className="flex-1 noscrollbar">
                {isFetching && data.length === 0 ? (
                    <div className="flex justify-center py-20">
                        <Spinner />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 pb-24">
                        {data.map((job) => (
                            <JobMobileCard
                                key={job.id}
                                job={job}
                                onViewDetail={onViewDetail}
                                onAssignMember={onAssignMember}
                                onAddAttachments={onAddAttachments}
                            />
                        ))}
                    </div>
                )}

                {!isFetching && data.length === 0 && (
                    <div className="text-center py-20 text-default-400 text-sm">
                        No projects found.
                    </div>
                )}
                <ScrollBar orientation="vertical" />
            </ScrollArea>

            {/* STICKY PAGINATION */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-divider flex justify-center z-20">
                <Pagination
                    total={pagination.totalPages}
                    page={pagination.page}
                    onChange={onPageChange}
                    size="sm"
                    color="primary"
                    variant="flat"
                    showControls
                />
            </div>
        </div>
    )
}

// --- Sub-component: Job Card ---
const JobMobileCard = ({
    job,
    onViewDetail,
    onAssignMember,
    onAddAttachments,
}: any) => {
    return (
        <Card className="border border-divider shadow-sm mx-1">
            <CardBody className="p-4 gap-4">
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

                <div className="space-y-1">
                    <h4 className="text-sm font-bold leading-tight line-clamp-2">
                        {job.displayName}
                    </h4>
                    <p className="text-[11px] text-text-subdued italic">
                        Client: {job.clientName}
                    </p>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-text-subdued">
                        <CalendarDays size={14} />
                        {dayjs(job.dueAt).format('DD/MM/YYYY')}
                    </div>
                    <AvatarGroup isBordered size="sm" max={3}>
                        {job.assignments?.map((asgn: any) => (
                            <Avatar
                                key={asgn.id}
                                src={optimizeCloudinary(asgn.user.avatar)}
                            />
                        ))}
                    </AvatarGroup>
                </div>
            </CardBody>

            <Divider className="opacity-50" />

            <CardFooter className="p-2 gap-2">
                <Button
                    fullWidth
                    size="sm"
                    variant="flat"
                    className="font-bold text-xs"
                    startContent={<Eye size={16} />}
                    onPress={() => onViewDetail(job.no)}
                >
                    Details
                </Button>
                <Button
                    fullWidth
                    size="sm"
                    color="primary"
                    variant="flat"
                    className="font-bold text-xs"
                    startContent={<UserPlus size={16} />}
                    onPress={() => onAssignMember(job.no)}
                >
                    Assign
                </Button>
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => onAddAttachments(job.no)}
                >
                    <Paperclip size={16} className="text-text-subdued" />
                </Button>
            </CardFooter>
        </Card>
    )
}
