import { JobActivityHistory } from '@/features/job-details'
import MobileJobDetailPage from '@/features/job-details/components/mobile/MobileJobDetailPage'
import JobCommentsView from '@/features/job-details/components/views/JobCommentsView'
import {
    ApiResponse,
    currencyFormatter,
    dateFormatter,
    EXTERNAL_URLS,
    getPageTitle,
    optimizeCloudinary,
} from '@/lib'
import {
    jobActivityLogsOptions,
    jobByNoOptions,
    jobStatusesListOptions,
    updateAttachmentsMutationOptions,
    useProfile,
} from '@/lib/queries'
import {
    APP_PERMISSIONS,
    getJobPaymentStatusDisplay,
    INTERNAL_URLS,
    RouteUtil,
} from '@/lib/utils'
import JobAttachmentsField from '@/shared/components/form-fields/JobAttachmentsField'
import CountdownTimer from '@/shared/components/ui/countdown-timer'
import HtmlReactParser from '@/shared/components/ui/html-react-parser'
import { JobStatusSystemTypeEnum } from '@/shared/enums'
import { useDevice } from '@/shared/hooks'
import { TJob } from '@/shared/types'
import { PencilToLine } from '@gravity-ui/icons'
import {
    Avatar,
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Divider,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    Snippet,
    Spinner,
    Tab,
    Tabs,
    Tooltip,
} from '@heroui/react'
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import dayjs from 'dayjs'
import {
    AlertCircle,
    Building2Icon,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    CirclePlus,
    Clock,
    Cloud,
    DollarSignIcon,
    ExternalLink,
    FileText,
    Folder,
    LinkIcon,
    MessageSquare,
    PinIcon,
    RotateCcw,
    TagIcon,
    UsersIcon,
    Wallet,
} from 'lucide-react'
import { useMemo } from 'react'
import { z } from 'zod'
import { JobTimelineCard } from '../../../features/job-edit'
import JobFinishChip from '../../../shared/components/chips/JobFinishChip'
import { PermissionGuard } from '../../../shared/guards/permission'

export enum JobDetailTabEnum {
    OVERVIEW = 'overview',
    FINANCIALS = 'financials',
    team = 'team',
    ATTACHMENTS = 'attachments',
    COMMENTS = 'comments',
}
export const jobDetailSearchSchema = z.object({
    tab: z.nativeEnum(JobDetailTabEnum).catch(JobDetailTabEnum.OVERVIEW),
})
export type TJobDetailSearch = z.infer<typeof jobDetailSearchSchema>

export const Route = createFileRoute('/_workspace/jobs/$no')({
    head: (ctx) => {
        const response = ctx.loaderData as unknown as ApiResponse<TJob>
        return {
            meta: [
                { title: getPageTitle(response?.result?.displayName ?? 'Job') },
            ],
        }
    },
    validateSearch: (search): TJobDetailSearch =>
        jobDetailSearchSchema.parse(search),
    loader({ context, params }) {
        return context.queryClient.ensureQueryData({
            ...jobByNoOptions(params.no),
        })
    },
    component: () => {
        const { no } = Route.useParams()
        const { isSmallView } = useDevice()

        const { data: job } = useSuspenseQuery({
            ...jobByNoOptions(no),
        })

        if (isSmallView) {
            return <MobileJobDetailPage />
        }
        return (
            <div>
                <PageHeading job={job} />
                <JobDetailPage job={job} />
            </div>
        )
    },
})

function PageHeading({ job }: { job: TJob }) {
    const router = useRouter()
    const isJobCompleted =
        job?.status?.systemType === JobStatusSystemTypeEnum.COMPLETED
    const isJobFinished =
        job?.status?.systemType === JobStatusSystemTypeEnum.TERMINATED
    const isPaused = isJobCompleted || isJobFinished

    return (
        <div
            className="flex flex-col pb-5 pt-6 px-6 space-y-3"
            style={{
                backgroundColor: job.status?.hexColor
                    ? `${job.status.hexColor}15`
                    : 'transparent',
                borderBottom: `1px solid ${job.status?.hexColor ? `${job.status.hexColor}30` : 'var(--nextui-colors-default-200)'}`,
            }}
        >
            <div className="flex items-start justify-between w-full pr-5">
                <div className="flex items-center gap-4">
                    <Button
                        as={Link}
                        isIconOnly
                        variant="bordered"
                        className="border-1 border-border-default bg-background"
                        href={INTERNAL_URLS.projectCenter}
                    >
                        <ChevronLeft />
                    </Button>
                    <h2 className="text-2xl font-bold text-text-default leading-tight tracking-wider">
                        {job.no}- {job.client?.name.toUpperCase()}_
                        {job.displayName.toUpperCase()}
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="bordered"
                        className="border-1 font-medium bg-background"
                        startContent={<PencilToLine fontSize={14} />}
                        onPress={() =>
                            router.navigate({
                                href: INTERNAL_URLS.management.jobDetail(
                                    job.no
                                ),
                            })
                        }
                    >
                        Edit
                    </Button>

                    <Dropdown
                        placement="bottom-end"
                        classNames={{
                            content:
                                'border border-default-200 shadow-lg min-w-[220px]',
                        }}
                    >
                        <DropdownTrigger>
                            <Button
                                size="sm"
                                variant="bordered"
                                className="border-1 font-medium bg-background"
                                endContent={
                                    <ChevronRight
                                        size={14}
                                        className="rotate-90"
                                    />
                                }
                            >
                                Actions
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="Project Actions"
                            variant="flat"
                        >
                            <DropdownSection title="General" showDivider>
                                <DropdownItem
                                    key="pin"
                                    startContent={<PinIcon size={16} />}
                                >
                                    Pin to Dashboard
                                </DropdownItem>
                                <DropdownItem
                                    key="copy-link"
                                    startContent={<LinkIcon size={16} />}
                                >
                                    Copy Project Link
                                </DropdownItem>
                            </DropdownSection>
                            <DropdownSection title="Data & Audit" showDivider>
                                <DropdownItem
                                    key="history"
                                    description="View all activity logs"
                                    startContent={
                                        <Clock
                                            size={16}
                                            className="text-default-400"
                                        />
                                    }
                                >
                                    Activity History
                                </DropdownItem>
                                <DropdownItem
                                    key="audit"
                                    description="Review financial details"
                                    startContent={
                                        <Wallet
                                            size={16}
                                            className="text-primary"
                                        />
                                    }
                                >
                                    Financial Audit
                                </DropdownItem>
                            </DropdownSection>
                            <DropdownSection title="Danger Zone">
                                <DropdownItem
                                    key="archive"
                                    startContent={<AlertCircle size={16} />}
                                >
                                    Archive Project
                                </DropdownItem>
                                <DropdownItem
                                    key="delete"
                                    className="text-danger"
                                    color="danger"
                                    startContent={<AlertCircle size={16} />}
                                >
                                    Delete Permanently
                                </DropdownItem>
                            </DropdownSection>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>
            <div className="w-fit pl-3 pr-5 py-1.5 bg-background rounded-full">
                {isPaused ? (
                    <JobFinishChip
                        status={isJobCompleted ? 'completed' : 'finish'}
                    />
                ) : (
                    <div className="flex items-center gap-1.5 text-text-subdued">
                        <Clock size={14} />
                        <p className="pt-0.5 text-sm font-medium">Due on:</p>
                        <CountdownTimer
                            targetDate={dayjs(job?.dueAt)}
                            hiddenUnits={['second', 'year']}
                            paused={isPaused}
                            className="text-right! text-sm font-semibold"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
function JobDetailPage({ job }: { job: TJob }) {
    const updateAttachmentsMutation = useMutation(
        updateAttachmentsMutationOptions
    )
    const { data: profile } = useProfile()
    const {
        data: { jobStatuses },
    } = useSuspenseQuery(jobStatusesListOptions())

    const activeIndex = useMemo(() => {
        if (!jobStatuses.length) return 0
        const index = jobStatuses.findIndex((s) => s.id === job?.status.id)
        return index !== -1 ? index : 0
    }, [job?.status.id, jobStatuses])

    const activeStatus = useMemo(() => {
        return jobStatuses[activeIndex] || job?.status
    }, [activeIndex, jobStatuses, job?.status])

    const paymentDisplay = getJobPaymentStatusDisplay(job?.paymentStatus)

    const sharepointDisplay = (() => {
        if (!job?.sharepointFolder && !job?.folderTemplate) {
            return 'Unlinked'
        }
        if (job?.sharepointFolder) {
            return (
                job?.sharepointFolder.displayName ||
                job?.sharepointFolder.itemId
            )
        } else {
            return (
                job?.folderTemplate?.folderName || job?.folderTemplate?.folderId
            )
        }
    })()

    const sharepointUrl =
        job?.sharepointFolder?.webUrl || job?.folderTemplate?.webUrl || null

    const totalCalculatedStaffCost =
        job?.assignments.reduce(
            (sum, current) => sum + (Number(current.staffCost) || 0),
            0
        ) || 0

    const {
        data: activityLogs,
        refetch: refetchLogs,
        isFetching: isLogsLoading,
    } = useQuery({
        ...jobActivityLogsOptions(job?.id ?? ''),
        enabled: !!job?.id,
    })

    const isJobCompleted =
        job?.status?.systemType === JobStatusSystemTypeEnum.COMPLETED

    const isJobFinished =
        job?.status?.systemType === JobStatusSystemTypeEnum.TERMINATED

    const isPaused = isJobFinished || isJobCompleted

    const handleRemoveAttachment = (url: string) => {
        if (!job?.id) return
        updateAttachmentsMutation.mutateAsync({
            jobId: job.id,
            action: 'remove',
            files: [url],
        })
    }

    const handleAddAttachment = (url: string) => {
        if (!job?.id) return
        updateAttachmentsMutation.mutateAsync({
            jobId: job.id,
            action: 'add',
            files: [url],
        })
    }

    if (!job) {
        return <Spinner />
    }

    return (
        <div className="p-4 bg-background-muted space-y-6 max-w-7xl mx-auto">
            <div>
                <JobTimelineCard job={job} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* --- MAIN TABS AREA (2/3) --- */}
                <div className="lg:col-span-2">
                    <Tabs
                        variant="underlined"
                        color="primary"
                        classNames={{ tabList: 'gap-6' }}
                        onSelectionChange={(value) =>
                            RouteUtil.updateParams({ tab: value })
                        }
                    >
                        {/* TAB: OVERVIEW */}
                        <Tab
                            key="overview"
                            title={
                                <div className="flex items-center gap-2">
                                    <FileText size={16} />
                                    <span>Overview</span>
                                </div>
                            }
                        >
                            <div className="space-y-6 mt-4">
                                <Card
                                    shadow="none"
                                    className="border border-border-default rounded-xl overflow-hidden mb-6"
                                >
                                    <CardBody className="p-4">
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                            {/* 1. Status Info & Date Info */}
                                            <div className="flex flex-col gap-1 min-w-50 shrink-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-medium text-text-subdued tracking-widest">
                                                        Current Status
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-2 h-2 rounded-full animate-pulse"
                                                        style={{
                                                            backgroundColor:
                                                                job.status
                                                                    ?.hexColor ||
                                                                'var(--nextui-colors-default-400)',
                                                        }}
                                                    />
                                                    <h3
                                                        className="text-lg font-black leading-none"
                                                        style={{
                                                            color:
                                                                job.status
                                                                    ?.hexColor ||
                                                                'inherit',
                                                        }}
                                                    >
                                                        {job.status
                                                            ?.displayName ||
                                                            'Unknown Status'}
                                                    </h3>
                                                </div>
                                            </div>

                                            {/* 2. Segmented Progress Bar */}
                                            <div className="flex-1 w-full items-center gap-1.5 px-4 hidden sm:flex">
                                                {jobStatuses.map(
                                                    (opt, index) => {
                                                        const isCompleted =
                                                            index < activeIndex
                                                        const isCurrent =
                                                            index ===
                                                            activeIndex
                                                        const isPending =
                                                            index > activeIndex

                                                        if (isCurrent) {
                                                            return (
                                                                <div
                                                                    key={opt.id}
                                                                    className="flex items-center justify-center px-3 py-1 rounded-full text-white font-bold text-xs whitespace-nowrap z-10 shadow-sm"
                                                                    style={{
                                                                        backgroundColor:
                                                                            opt.hexColor,
                                                                    }}
                                                                >
                                                                    {
                                                                        opt.displayName
                                                                    }
                                                                </div>
                                                            )
                                                        }

                                                        return (
                                                            <Tooltip
                                                                key={opt.id}
                                                                placement="top"
                                                                content={
                                                                    <div className="px-1 py-1.5 flex flex-col gap-1">
                                                                        <div className="text-small font-bold flex items-center gap-2">
                                                                            <span
                                                                                className="w-2 h-2 rounded-full"
                                                                                style={{
                                                                                    backgroundColor:
                                                                                        opt.hexColor,
                                                                                }}
                                                                            />
                                                                            {
                                                                                opt.displayName
                                                                            }
                                                                        </div>
                                                                        <div className="text-tiny text-default-500 font-medium">
                                                                            {isCompleted
                                                                                ? '✓ Stage Completed'
                                                                                : '⏳ Pending Stage'}
                                                                        </div>
                                                                    </div>
                                                                }
                                                            >
                                                                <div
                                                                    className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                                                                        isPending
                                                                            ? 'bg-default-100 hover:bg-default-200'
                                                                            : 'opacity-50 hover:opacity-100'
                                                                    }`}
                                                                    style={
                                                                        isCompleted
                                                                            ? {
                                                                                  backgroundColor:
                                                                                      activeStatus?.hexColor,
                                                                              }
                                                                            : {}
                                                                    }
                                                                />
                                                            </Tooltip>
                                                        )
                                                    }
                                                )}
                                            </div>

                                            {/* 3. Deliver Action Button */}
                                            <div className="shrink-0 flex items-center gap-3">
                                                {isPaused ? (
                                                    <JobFinishChip
                                                        status={
                                                            isJobCompleted
                                                                ? 'completed'
                                                                : 'finish'
                                                        }
                                                    />
                                                ) : (
                                                    <PermissionGuard
                                                        permission={
                                                            APP_PERMISSIONS.JOB
                                                                .DELIVER
                                                        }
                                                    >
                                                        <Tooltip
                                                            placement="top-end"
                                                            content={
                                                                <div className="px-1 py-1.5 max-w-50">
                                                                    <p className="text-small font-bold mb-1">
                                                                        Ready to
                                                                        Deliver?
                                                                    </p>
                                                                    <p className="text-tiny text-default-500">
                                                                        Ensure
                                                                        all
                                                                        required
                                                                        assets
                                                                        and
                                                                        documents
                                                                        are
                                                                        uploaded
                                                                        to
                                                                        SharePoint
                                                                        before
                                                                        submitting.
                                                                    </p>
                                                                </div>
                                                            }
                                                        >
                                                            <Button
                                                                size="sm"
                                                                color="primary"
                                                                variant="solid"
                                                                startContent={
                                                                    <CheckCircle2
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                }
                                                                className="font-bold shadow-sm"
                                                            >
                                                                Deliver Job
                                                            </Button>
                                                        </Tooltip>
                                                    </PermissionGuard>
                                                )}
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>

                                <div className="grid grid-cols-2 gap-4 px-1">
                                    <div>
                                        <p className="text-xs font-semibold text-default-500 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                                            <Building2Icon size={14} /> Client
                                        </p>
                                        <p
                                            title={
                                                job.client?.name || 'Internal'
                                            }
                                            className="text-sm font-medium text-default-900 bg-background p-2.5 rounded-lg border border-default-100 truncate"
                                        >
                                            {job.client?.name || 'Internal'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-default-500 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                                            <TagIcon size={14} /> Job Type
                                        </p>
                                        <p
                                            title={
                                                job.type?.displayName ||
                                                'Standard'
                                            }
                                            className="text-sm font-medium text-default-900 bg-background p-2.5 rounded-lg border border-default-100 truncate"
                                        >
                                            {job.type?.displayName ||
                                                'Standard'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-default-500 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                                            <Cloud size={14} /> SharePoint
                                        </p>
                                        <p
                                            title={sharepointDisplay}
                                            className="text-sm font-medium text-default-900 bg-background p-2.5 rounded-lg border border-default-100 truncate"
                                        >
                                            {sharepointDisplay}
                                        </p>
                                    </div>
                                </div>

                                {/* DESCRIPTION */}
                                <Card
                                    shadow="none"
                                    className="border border-border-default rounded-xl"
                                >
                                    <CardHeader className="text-sm px-3 py-3 bg-background-muted flex items-center gap-2">
                                        Description
                                    </CardHeader>

                                    <Divider className="bg-border-muted" />

                                    <CardBody className="p-3">
                                        <div className="p-4 text-sm text-default-700 leading-relaxed min-h-25">
                                            {job.description ? (
                                                <HtmlReactParser
                                                    htmlString={job.description}
                                                />
                                            ) : (
                                                <p className="text-default-400 italic text-center py-6">
                                                    No description provided.
                                                </p>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>

                                {/* ACTIVITY LOGS */}
                                <div className="bg-white border border-default-200 rounded-xl overflow-hidden shadow-sm">
                                    <div className="flex justify-between items-center bg-default-50 border-b border-default-200 px-4 py-3">
                                        <span className="font-semibold text-sm text-default-900 tracking-wide">
                                            Activity History
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="light"
                                            isIconOnly
                                            onPress={() => refetchLogs()}
                                            isLoading={isLogsLoading}
                                        >
                                            <RotateCcw
                                                size={14}
                                                className="text-default-500"
                                            />
                                        </Button>
                                    </div>
                                    <div className="p-4">
                                        <JobActivityHistory
                                            logs={activityLogs}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Tab>

                        <Tab
                            key="financials"
                            title={
                                <div className="flex items-center gap-2">
                                    <FileText size={16} />
                                    <span>Financials</span>
                                </div>
                            }
                        >
                            <div className="space-y-6 mt-4">
                                <div className="flex items-center justify-between p-4 border border-border-default rounded-xl">
                                    <div>
                                        <h4 className="font-bold text-text-default">
                                            Payment Status
                                        </h4>
                                        <p className="text-sm text-text-subdued">
                                            Has the client paid for this job?
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Chip color={paymentDisplay.colorName}>
                                            {paymentDisplay.title}
                                        </Chip>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mt-2">
                                    {/* --- Total Income Card --- */}
                                    <Card
                                        className="bg-emerald-50 dark:bg-emerald-50/10 border border-emerald-100 dark:border-emerald-100/50"
                                        shadow="none"
                                    >
                                        <CardBody className="p-5 flex flex-col gap-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <label className="text-xs font-bold text-emerald-700 uppercase">
                                                        Total Income
                                                    </label>
                                                    <p className="text-xs text-emerald-600/80 mt-0.5">
                                                        Amount billable to
                                                        client
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-start gap-2">
                                                <div className="p-2 bg-emerald-100/50 dark:bg-emerald-500/20 rounded-lg">
                                                    <DollarSignIcon
                                                        size={18}
                                                        className="text-emerald-600"
                                                    />
                                                </div>
                                                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400text-right">
                                                    {job.incomeCost?.toLocaleString()}
                                                </p>
                                            </div>
                                        </CardBody>
                                    </Card>

                                    <Card className="bg-orange-50 dark:bg-orange-50/10 border border-orange-100 dark:border-orange-100/50 shadow-none">
                                        <CardBody className="p-5 flex flex-col gap-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <label className="text-xs font-bold text-orange-700 uppercase">
                                                        Total staff cost
                                                    </label>
                                                    <p className="text-xs text-orange-600/80 mt-0.5">
                                                        Amount billable to
                                                        client
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-start gap-2">
                                                <div className="p-2 bg-orange-100/50 dark:bg-orange-500/20 rounded-lg">
                                                    <DollarSignIcon
                                                        size={18}
                                                        className="text-orange-600"
                                                    />
                                                </div>
                                                <p className="text-2xl font-black text-orange-700 dark:text-orange-400text-right">
                                                    {currencyFormatter(
                                                        totalCalculatedStaffCost,
                                                        'Vietnamese'
                                                    )}
                                                </p>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </div>

                                <Divider />

                                {/* --- Staff Cost Table Card --- */}
                                <Card className="h-full" shadow="none">
                                    <CardBody className="p-0 flex flex-col overflow-hidden">
                                        <div className="p-5 pb-3 flex items-center gap-2 border-b border-border-default">
                                            <UsersIcon size={16} />
                                            <label className="text-xs font-bold uppercase tracking-wide">
                                                Cost per member
                                            </label>
                                        </div>

                                        <div className="p-5 flex-1 overflow-x-auto">
                                            <table className="w-full text-left border-collapse min-w-75">
                                                <thead>
                                                    <tr className="border-b border-border-muted">
                                                        <th className="pb-3 text-xs font-bold uppercase tracking-wider">
                                                            Assignee
                                                        </th>
                                                        <th className="pb-3 text-xs font-bold uppercase tracking-wider text-right w-35">
                                                            Payout ($)
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border-muted">
                                                    {job?.assignments?.length >
                                                    0 ? (
                                                        job.assignments.map(
                                                            (ass) => {
                                                                const isMe =
                                                                    ass.user
                                                                        .id ===
                                                                    profile?.id

                                                                return (
                                                                    <tr
                                                                        key={
                                                                            ass.id
                                                                        }
                                                                        className="group"
                                                                    >
                                                                        <td className="py-3 pr-2 align-middle">
                                                                            <div className="flex items-center gap-3">
                                                                                <Avatar
                                                                                    src={
                                                                                        ass
                                                                                            .user
                                                                                            .avatar
                                                                                    }
                                                                                    size="sm"
                                                                                    className="shrink-0 border border-orange-200/50"
                                                                                />
                                                                                <div className="flex flex-col truncate">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="text-sm font-semibold text-default-800 truncate">
                                                                                            {
                                                                                                ass
                                                                                                    .user
                                                                                                    .displayName
                                                                                            }
                                                                                        </span>
                                                                                        {isMe && (
                                                                                            <Chip
                                                                                                size="sm"
                                                                                                color="primary"
                                                                                                variant="flat"
                                                                                                className="h-4 px-1 text-[9px] font-bold tracking-wider uppercase border-none"
                                                                                            >
                                                                                                You
                                                                                            </Chip>
                                                                                        )}
                                                                                    </div>
                                                                                    {ass
                                                                                        .user
                                                                                        .department
                                                                                        ?.displayName && (
                                                                                        <span className="text-[10px] text-default-500 truncate">
                                                                                            {
                                                                                                ass
                                                                                                    .user
                                                                                                    .department
                                                                                                    .displayName
                                                                                            }
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-3 pl-2 align-middle font-semibold text-right text-text-default">
                                                                            $
                                                                            {/* {
                                                                                                    formik.getFieldProps(
                                                                                                        `assignments.${index}.staffCost`
                                                                                                    )
                                                                                                        .value
                                                                                                } */}
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            }
                                                        )
                                                    ) : (
                                                        <tr>
                                                            <td
                                                                colSpan={2}
                                                                className="py-6 text-center"
                                                            >
                                                                <p className="text-sm text-orange-600/60 italic">
                                                                    No staff
                                                                    assigned to
                                                                    this job
                                                                    yet.
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>
                        </Tab>

                        <Tab
                            key="team"
                            title={
                                <div className="flex items-center gap-2">
                                    <UsersIcon size={16} />
                                    <span>Assignee</span>
                                    <Chip
                                        size="sm"
                                        variant="flat"
                                        className="h-5 text-[10px] ml-1"
                                    >
                                        {job.assignments.length || 0}
                                    </Chip>
                                </div>
                            }
                        >
                            <div className="space-y-6 px-2">
                                <div className="flex flex-col gap-1 pb-4 border-b border-border-default">
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-lg font-bold text-text-default">
                                            Assigned Team
                                        </h1>
                                    </div>
                                    <p className="text-sm text-text-subdued">
                                        Manage collaborators working on this
                                        project.
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
                                                    src={optimizeCloudinary(
                                                        ass.user.avatar
                                                    )}
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
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Tab>

                        {/* TAB: ATTACHMENTS */}
                        <Tab
                            key="attachments"
                            title={
                                <div className="flex items-center gap-2">
                                    <LinkIcon size={16} />
                                    <span>Attachments</span>
                                    <Chip
                                        size="sm"
                                        variant="flat"
                                        className="h-5 text-[10px] ml-1"
                                    >
                                        {job.attachmentUrls?.length || 0}
                                    </Chip>
                                </div>
                            }
                        >
                            <div className="mt-4 p-4 bg-white border border-default-200 rounded-xl shadow-sm">
                                <JobAttachmentsField
                                    defaultAttachments={job.attachmentUrls}
                                    onAdd={handleAddAttachment}
                                    onRemove={handleRemoveAttachment}
                                />
                            </div>
                        </Tab>

                        {/* TAB: COMMENTS */}
                        <Tab
                            key="comments"
                            title={
                                <div className="flex items-center gap-2">
                                    <MessageSquare size={16} />
                                    <span>Comments</span>
                                    <Chip
                                        size="sm"
                                        variant="flat"
                                        className="h-5 text-[10px] ml-1"
                                    >
                                        {job.comments?.length || 0}
                                    </Chip>
                                </div>
                            }
                        >
                            <div className="mt-4 p-4 bg-white border border-default-200 rounded-xl shadow-sm">
                                <JobCommentsView job={job} />
                            </div>
                        </Tab>
                    </Tabs>
                </div>

                {/* --- SIDEBAR AREA (1/3) --- */}
                <div className="space-y-6">
                    {/* 1. SHAREPOINT CARD */}
                    <Card
                        shadow="none"
                        className="border border-border-default rounded-xl"
                    >
                        <CardHeader className="text-sm px-3 py-3 bg-background-muted flex items-center gap-2">
                            <Cloud size={14} />
                            SharePoint Directory
                        </CardHeader>

                        <Divider className="bg-border-muted" />

                        <CardBody className="p-3">
                            <div className="flex flex-col gap-4">
                                {/* Main Folder Identity */}
                                <div className="flex items-start gap-3 bg-default-50/50 p-3 rounded-xl border border-default-100">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary mt-0.5">
                                        <Folder
                                            fontSize={18}
                                            fill="currentColor"
                                            className="opacity-80"
                                        />
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span
                                            className="text-sm font-bold text-default-900 truncate"
                                            title={sharepointDisplay}
                                        >
                                            {sharepointDisplay}
                                        </span>
                                        <span className="text-xs text-default-500 mt-0.5">
                                            {job?.sharepointFolder?.isFolder
                                                ? 'Folder'
                                                : 'File Link'}
                                        </span>
                                    </div>
                                </div>

                                {/* Extended Metadata Grid */}
                                {(job?.sharepointFolder ||
                                    job?.folderTemplate) && (
                                    <div className="grid grid-cols-2 gap-3 px-1">
                                        {/* Size (If available) */}
                                        {job?.sharepointFolder?.size ||
                                        job?.folderTemplate?.size ? (
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-default-400 tracking-wider mb-1">
                                                    Size
                                                </p>
                                                <p className="text-xs font-medium text-default-700">
                                                    {(() => {
                                                        const bytes =
                                                            job.sharepointFolder
                                                                ?.size ||
                                                            job.folderTemplate
                                                                ?.size ||
                                                            0
                                                        if (bytes === 0)
                                                            return '0 B'
                                                        const k = 1024
                                                        const sizes = [
                                                            'B',
                                                            'KB',
                                                            'MB',
                                                            'GB',
                                                            'TB',
                                                        ]
                                                        const i = Math.floor(
                                                            Math.log(bytes) /
                                                                Math.log(k)
                                                        )
                                                        return (
                                                            parseFloat(
                                                                (
                                                                    bytes /
                                                                    Math.pow(
                                                                        k,
                                                                        i
                                                                    )
                                                                ).toFixed(2)
                                                            ) +
                                                            ' ' +
                                                            sizes[i]
                                                        )
                                                    })()}
                                                </p>
                                            </div>
                                        ) : null}

                                        {/* Created By */}
                                        {job?.sharepointFolder?.createdBy && (
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-default-400 tracking-wider mb-1">
                                                    Created By
                                                </p>
                                                <p
                                                    className="text-xs font-medium text-default-700 truncate"
                                                    title={
                                                        job.sharepointFolder
                                                            ?.createdBy || ''
                                                    }
                                                >
                                                    {
                                                        job.sharepointFolder
                                                            ?.createdBy
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        {/* Created Date */}
                                        {job?.sharepointFolder
                                            ?.createdDateTime && (
                                            <div className="col-span-2">
                                                <p className="text-[10px] uppercase font-bold text-default-400 tracking-wider mb-1">
                                                    Date Created
                                                </p>
                                                <p className="text-xs font-medium text-default-700">
                                                    {dateFormatter(
                                                        job.sharepointFolder
                                                            ?.createdDateTime ||
                                                            '',
                                                        {
                                                            format: 'longDateTime',
                                                        }
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <Button
                                    as="a"
                                    href={sharepointUrl || '#'}
                                    target="_blank"
                                    isDisabled={!sharepointUrl}
                                    color="primary"
                                    variant="flat"
                                    size="sm"
                                    className="w-full font-bold shadow-sm mt-1"
                                    endContent={<ExternalLink size={14} />}
                                >
                                    Open Directory
                                </Button>
                            </div>
                        </CardBody>
                    </Card>

                    <Card
                        shadow="none"
                        className="border border-border-default rounded-xl"
                    >
                        <CardHeader className="text-sm px-3 py-3 bg-background-muted flex items-center gap-2">
                            <CirclePlus size={16} />
                            Created By
                        </CardHeader>

                        <Divider className="bg-border-muted" />

                        <CardBody className="p-3">
                            <div className="flex items-center gap-3">
                                <Avatar src={job.createdBy.avatar} size="md" />
                                <div className="flex flex-col">
                                    <p className="text-sm font-bold text-default-900">
                                        {job.createdBy.displayName}
                                    </p>
                                    <p className="text-xs text-default-500 mt-0.5 flex items-center gap-1">
                                        {dateFormatter(job.createdAt, {
                                            format: 'fullShort',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card
                        shadow="none"
                        className="border border-border-default rounded-xl"
                    >
                        <CardHeader className="text-sm px-3 py-3 bg-background-muted flex items-center gap-2">
                            <LinkIcon size={14} />
                            Public Link
                        </CardHeader>

                        <Divider className="bg-border-muted" />

                        <CardBody className="p-3">
                            <Snippet
                                symbol=""
                                size="sm"
                                variant="flat"
                                className="bg-default-50 text-default-900 w-full border border-default-200"
                            >
                                {EXTERNAL_URLS.getJobDetailUrl(job.no)}
                            </Snippet>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    )
}
