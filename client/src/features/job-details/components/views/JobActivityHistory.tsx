import { IMAGES, optimizeCloudinary } from '@/lib'
import { userOptions } from '@/lib/queries/options/user-queries'
import {
    Avatar,
    Card,
    CardBody,
    Chip,
    Code,
    Skeleton,
    Tooltip,
    User,
} from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import {
    ArrowRightLeft,
    CalendarClock,
    CheckCircle2,
    CreditCard,
    Edit3,
    EyeOff,
    FileText,
    History,
    Lock,
    PackageCheck,
    Paperclip,
    PlusCircle,
    ShieldAlert,
    Trash2,
    UserMinus,
    UserPlus,
    Users,
} from 'lucide-react'
import React from 'react'
// Import ActivityType from your generated client path
import type { TJobActivityLog } from '@/shared/types'
import { ActivityTypeEnum } from '../../../../shared/enums'

interface JobActivityHistoryProps {
    logs: TJobActivityLog[]
    isLoading?: boolean
}

export const JobActivityHistory: React.FC<JobActivityHistoryProps> = ({
    logs,
    isLoading = false,
}) => {
    if (!isLoading && (!logs || logs.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-text-subdued">
                <div className="p-4 rounded-full bg-default-50 mb-4 border border-default-100">
                    <History
                        size={32}
                        strokeWidth={1.5}
                        className="text-default-300"
                    />
                </div>
                <p className="text-medium font-semibold text-default-600">
                    No activity recorded
                </p>
                <p className="text-small text-text-subdued">
                    Chronological updates will appear here.
                </p>
            </div>
        )
    }

    const sortedLogs = [...(logs || [])].sort(
        (a, b) =>
            new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
    )

    return (
        <div className="relative pl-8 border-l-2 border-default-200 ml-6 my-6 space-y-8">
            {!isLoading
                ? sortedLogs.map((log) => (
                      <ActivityItem key={log.id} log={log} />
                  ))
                : [...Array(3)].map((_, i) => <ActivityItemSkeleton key={i} />)}
        </div>
    )
}

// --- Item Component ---

const ActivityItem = ({ log }: { log: TJobActivityLog }) => {
    // Cast strict type to ensure coverage
    const type = log.activityType as ActivityTypeEnum
    const config = getActivityConfig(type)
    const Icon = config.icon
    const date = new Date(log.modifiedAt)

    // PERMISSION CHECK:
    // If backend returns null for value but required a permission, it's restricted.
    const isRestricted =
        log.currentValue === null &&
        log.previousValue === null &&
        log.requiredPermissionCode !== null

    return (
        <div className="relative group animate-in fade-in slide-in-from-left-2 duration-500">
            {/* Timeline Dot */}
            <div
                className={`absolute -left-10.75 top-0 flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shadow-sm z-10 transition-transform group-hover:scale-110 ${config.bgClass} ${config.textClass}`}
            >
                <Icon size={18} />
            </div>

            <div className="flex flex-col gap-2">
                {/* Header */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Avatar
                            src={optimizeCloudinary(log.modifiedBy?.avatar)}
                            name={log.modifiedBy?.displayName}
                            className="w-6 h-6 text-[10px] ring-2 ring-background"
                        />
                        <span className="text-sm font-bold text-default-900">
                            {log.modifiedBy?.displayName}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-default-300 mx-1" />
                        <span className="text-tiny font-semibold uppercase tracking-wider text-default-500">
                            {config.label}
                        </span>
                    </div>

                    <Tooltip content={date.toLocaleString()}>
                        <time className="text-[10px] font-medium text-text-subdued bg-default-100/50 px-2 py-1 rounded-md cursor-default">
                            {new Intl.DateTimeFormat('en-GB', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            }).format(date)}
                        </time>
                    </Tooltip>
                </div>

                {/* Content Card */}
                <Card
                    shadow="none"
                    className={`border transition-all ${
                        isRestricted
                            ? 'bg-default-50/50 border-dashed border-default-300'
                            : 'bg-background border-default-200 group-hover:border-default-300'
                    }`}
                >
                    <CardBody className="py-2.5 px-4">
                        {isRestricted ? (
                            <div className="flex items-center gap-2.5 text-text-subdued">
                                <div className="p-1.5 bg-default-200/50 rounded-md">
                                    <Lock size={14} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-default-600">
                                        Restricted Access
                                    </span>
                                    {/* Backend usually provides a safe generic note for restricted views */}
                                    <span className="text-[10px] italic text-text-subdued">
                                        {log.notes}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {/* The Diff Logic */}
                                <div className="text-small text-default-700">
                                    {renderDiff(log)}
                                </div>

                                {/* The Note */}
                                {log.notes && (
                                    <div
                                        className={`relative ${type === ActivityTypeEnum.PRIVATE ? 'pl-0' : 'pl-3 border-l-2 border-primary-100'}`}
                                    >
                                        <p className="text-xs text-default-500 italic leading-relaxed">
                                            {log.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}

// --- Dynamic Content Renderer ---

const renderDiff = (log: TJobActivityLog) => {
    switch (log.activityType as ActivityTypeEnum) {
        // --- 1. CORE LIFECYCLE ---
        case ActivityTypeEnum.CREATE_JOB:
            return (
                <div className="flex items-center gap-2">
                    <span className="text-default-500">Job initialized:</span>
                    <Code size="sm" color="primary">
                        {log.currentValue}
                    </Code>
                </div>
            )

        case ActivityTypeEnum.DELETE:
            return (
                <span className="text-danger font-bold flex items-center gap-1">
                    <Trash2 size={14} /> Job Deleted
                </span>
            )

        // --- 2. WORKFLOW ---
        case ActivityTypeEnum.FORCE_CHANGE_STATUS:
        case ActivityTypeEnum.DELIVER:
        case ActivityTypeEnum.APPROVE:
        case ActivityTypeEnum.REJECT:
            return (
                <div className="flex items-center gap-2 flex-wrap">
                    {log.previousValue && (
                        <>
                            <Chip
                                size="sm"
                                variant="flat"
                                className="bg-default-100 text-default-500 border-none h-6"
                            >
                                {log.previousValue}
                            </Chip>
                            <ArrowRightLeft
                                size={12}
                                className="text-default-300"
                            />
                        </>
                    )}
                    <Chip
                        size="sm"
                        color={getStatusColor(
                            log.activityType as ActivityTypeEnum
                        )}
                        variant="flat"
                        className="font-bold border-none h-6"
                    >
                        {log.currentValue}
                    </Chip>
                </div>
            )

        // --- 3. FINANCIAL ---
        case ActivityTypeEnum.PAID:
            return (
                <div className="flex items-center gap-2">
                    <span className="text-default-600">Job finished</span>
                    <Chip
                        size="sm"
                        color="success"
                        variant="flat"
                        startContent={<CalendarClock size={12} />}
                    >
                        {formatValue(log.currentValue)}
                    </Chip>
                </div>
            )

        case ActivityTypeEnum.UPDATE_MEMBER_COST:
            return (
                <div className="flex items-center gap-2">
                    <span className="text-default-500">Target:</span>
                    <span className="font-semibold text-default-800">
                        {log.fieldName}
                    </span>
                    <span className="text-default-300">|</span>
                    <span className="text-success-600 font-medium">
                        {log.currentValue}
                    </span>
                </div>
            )

        // --- 4. DATA & FILES ---
        case ActivityTypeEnum.UPDATE_CLIENT_INFORMATION:
            return (
                <div className="flex flex-wrap items-center gap-2 bg-default-50 px-2 py-1.5 rounded-md border border-default-100 w-fit">
                    <span className="text-[10px] font-bold uppercase text-text-subdued">
                        {log.fieldName}:
                    </span>
                    <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-text-subdued">
                            {formatValue(log.metadata?.oldClientName || 'None')}
                        </span>
                        <ArrowRightLeft
                            size={10}
                            className="text-default-300"
                        />
                        <span className="font-semibold text-default-900">
                            {formatValue(log.currentValue)}
                        </span>
                    </div>
                </div>
            )

        case ActivityTypeEnum.UPDATE_GENERAL_INFORMATION: {
            if (log.fieldName.toLowerCase() === 'description') {
                return (
                    <div className="flex flex-wrap items-center gap-2 bg-default-50 px-2 py-1.5 rounded-md border border-default-100 w-fit">
                        <span className="text-[10px] font-bold uppercase text-text-subdued">
                            {log.fieldName}
                        </span>
                    </div>
                )
            }
            return (
                <div className="flex flex-wrap items-center gap-2 bg-default-50 px-2 py-1.5 rounded-md border border-default-100 w-fit">
                    <span className="text-[10px] font-bold uppercase text-text-subdued">
                        {log.fieldName}:
                    </span>
                    <div className="flex items-center gap-1.5 text-xs">
                        <span className="line-through text-text-subdued">
                            {formatValue(log.previousValue)}
                        </span>
                        <ArrowRightLeft
                            size={10}
                            className="text-default-300"
                        />
                        <span className="font-semibold text-default-900">
                            {formatValue(log.currentValue)}
                        </span>
                    </div>
                </div>
            )
        }

        case ActivityTypeEnum.UPDATE_ATTACHMENTS:
            return (
                <div className="flex items-center gap-2">
                    <Paperclip size={14} className="text-text-subdued" />
                    <span className="text-default-600">
                        Attachments updated:
                    </span>
                    <span className="font-medium text-default-900">
                        {log.currentValue}
                    </span>
                </div>
            )

        // --- 5. SCHEDULE ---
        case ActivityTypeEnum.RESCHEDULE:
            return (
                <div className="flex items-center gap-2">
                    <span className="text-default-500">Deadline moved to:</span>
                    <Chip
                        size="sm"
                        color="warning"
                        variant="flat"
                        startContent={<CalendarClock size={12} />}
                    >
                        {formatValue(log.currentValue)}
                    </Chip>
                </div>
            )

        // --- 6. MEMBERS ---
        case ActivityTypeEnum.ASSIGN_MEMBER:
        case ActivityTypeEnum.UNASSIGN_MEMBER:
            return (
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-default-500 text-xs">
                        {log.activityType === ActivityTypeEnum.ASSIGN_MEMBER
                            ? 'Added:'
                            : 'Removed:'}
                    </span>
                    {/* Assuming currentValue holds userId or name */}
                    <UserDisplay userId={log.currentValue || ''} />
                </div>
            )

        // --- 7. PRIVATE / INTERNAL ---
        case ActivityTypeEnum.PRIVATE:
            return (
                <div className="flex items-center gap-2 text-default-500 italic">
                    <EyeOff size={14} />
                    <span>Internal Note</span>
                </div>
            )

        default:
            if (!log.currentValue) return null
            return <span className="text-default-700">{log.currentValue}</span>
    }
}

// --- Configuration & Styling ---

const getActivityConfig = (type: ActivityTypeEnum) => {
    const base = {
        icon: Edit3,
        bgClass: 'bg-default-100',
        textClass: 'text-default-600',
        label: 'Update',
    }

    const map: Record<ActivityTypeEnum, typeof base> = {
        // Lifecycle
        [ActivityTypeEnum.CREATE_JOB]: {
            icon: PlusCircle,
            bgClass: 'bg-blue-100',
            textClass: 'text-blue-700',
            label: 'Initialization',
        },
        [ActivityTypeEnum.DELETE]: {
            icon: Trash2,
            bgClass: 'bg-danger-100',
            textClass: 'text-danger-700',
            label: 'Deleted',
        },

        // Members
        [ActivityTypeEnum.ASSIGN_MEMBER]: {
            icon: UserPlus,
            bgClass: 'bg-indigo-100',
            textClass: 'text-indigo-700',
            label: 'Staffing',
        },
        [ActivityTypeEnum.UNASSIGN_MEMBER]: {
            icon: UserMinus,
            bgClass: 'bg-orange-100',
            textClass: 'text-orange-700',
            label: 'Staffing',
        },
        [ActivityTypeEnum.UPDATE_MEMBER_COST]: {
            icon: CreditCard,
            bgClass: 'bg-yellow-100',
            textClass: 'text-yellow-700',
            label: 'Financial',
        },

        // Workflow
        [ActivityTypeEnum.FORCE_CHANGE_STATUS]: {
            icon: ArrowRightLeft,
            bgClass: 'bg-primary-100',
            textClass: 'text-primary-700',
            label: 'Status',
        },
        [ActivityTypeEnum.DELIVER]: {
            icon: PackageCheck,
            bgClass: 'bg-secondary-100',
            textClass: 'text-secondary-700',
            label: 'Delivery',
        },
        [ActivityTypeEnum.APPROVE]: {
            icon: CheckCircle2,
            bgClass: 'bg-emerald-100',
            textClass: 'text-emerald-700',
            label: 'Approved',
        },
        [ActivityTypeEnum.REJECT]: {
            icon: ShieldAlert,
            bgClass: 'bg-danger-100',
            textClass: 'text-danger-700',
            label: 'Rejected',
        },

        // Financial
        [ActivityTypeEnum.PAID]: {
            icon: CheckCircle2,
            bgClass: 'bg-success-100',
            textClass: 'text-success-700',
            label: 'Paid',
        },

        // Info
        [ActivityTypeEnum.UPDATE_ATTACHMENTS]: {
            icon: Paperclip,
            bgClass: 'bg-default-100',
            textClass: 'text-default-600',
            label: 'Files',
        },
        [ActivityTypeEnum.UPDATE_GENERAL_INFORMATION]: {
            icon: FileText,
            bgClass: 'bg-violet-100',
            textClass: 'text-violet-700',
            label: 'Details',
        },
        [ActivityTypeEnum.UPDATE_CLIENT_INFORMATION]: {
            icon: Users,
            bgClass: 'bg-pink-100',
            textClass: 'text-pink-700',
            label: 'Client',
        },

        // Schedule
        [ActivityTypeEnum.RESCHEDULE]: {
            icon: CalendarClock,
            bgClass: 'bg-warning-100',
            textClass: 'text-warning-700',
            label: 'Schedule',
        },

        // Private
        [ActivityTypeEnum.PRIVATE]: {
            icon: EyeOff,
            bgClass: 'bg-default-200',
            textClass: 'text-default-600',
            label: 'Internal',
        },
    }
    return map[type] || base
}

const getStatusColor = (type: ActivityTypeEnum) => {
    if (type === ActivityTypeEnum.APPROVE) return 'success'
    if (type === ActivityTypeEnum.REJECT) return 'danger'
    if (type === ActivityTypeEnum.DELIVER) return 'secondary'
    return 'primary'
}

const formatValue = (val: any) => {
    if (!val) return 'None'
    // Detect ISO Date strings
    if (typeof val === 'string' && val.length > 20 && !isNaN(Date.parse(val))) {
        return new Date(val).toLocaleDateString('en-GB')
    }
    return String(val)
}

const UserDisplay = ({ userId }: { userId: string }) => {
    // Basic check if it looks like a UUID
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(userId)

    const { data: user, isLoading } = useQuery({
        ...userOptions(userId),
        enabled: !!userId && isUuid,
    })

    if (!isUuid)
        return (
            <Chip size="sm" variant="flat">
                {userId}
            </Chip>
        )

    if (isLoading) return <Skeleton className="h-6 w-20 rounded-full" />

    return (
        <User
            name={user?.displayName || 'Unknown User'}
            description={user?.username}
            avatarProps={{
                src: optimizeCloudinary(user?.avatar || IMAGES.emptyAvatar),
                size: 'sm',
                className: 'w-5 h-5 text-[9px]',
            }}
            classNames={{
                base: 'bg-default-100 pr-3 py-0.5 rounded-full border border-default-200',
                name: 'text-xs font-semibold',
                description: 'text-[10px]',
            }}
        />
    )
}

const ActivityItemSkeleton = () => (
    <div className="relative pl-2 space-y-3">
        <Skeleton className="absolute -left-10.75 top-0 w-10 h-10 rounded-full" />
        <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
                <Skeleton className="w-7 h-7 rounded-full" />
                <Skeleton className="w-32 h-4 rounded-md" />
            </div>
            <Skeleton className="w-16 h-5 rounded-md" />
        </div>
        <Skeleton className="w-full h-14 rounded-xl" />
    </div>
)
