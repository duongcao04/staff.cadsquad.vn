import {
    JobActivityHistoryCard,
    JobCreatorCard,
    JobDescriptionCard,
    JobProgressStatusCard,
    JobReferenceUrlCard,
    JobReviewersCard,
    JobSharepointDetailCard,
} from '@/presentation/features/job-details'
import JobCommentsView from '@/presentation/features/job-details/components/views/JobCommentsView'
import { JobTimelineCard } from '@/presentation/features/job-edit'
import {
    currencyFormatter,
    EXTERNAL_URLS,
    JobHelper,
    optimizeCloudinary,
} from '@/presentation/lib'
import {
    updateAttachmentsMutationOptions,
    useProfile,
} from '@/presentation/lib/queries'
import { RouteUtil } from '@/presentation/lib/utils'
import { TJob } from '@/presentation/types'
import {
    Avatar,
    Card,
    CardBody,
    Chip,
    Divider,
    Spinner,
    Tab,
    Tabs,
} from '@heroui/react'
import JobAttachmentsField from '@presentation/components/form-fields/JobAttachmentsField'
import { useMutation } from '@tanstack/react-query'
import {
    Building2Icon,
    DollarSignIcon,
    FileText,
    LinkIcon,
    MessageSquare,
    TagIcon,
    UsersIcon,
} from 'lucide-react'
import { PageHeading } from './_components/page-heading'

export function JobDetailPage({ job }: { job: TJob }) {
    const updateAttachmentsMutation = useMutation(
        updateAttachmentsMutationOptions
    )
    const { data: profile } = useProfile()

    const paymentDisplay = JobHelper.getJobPaymentStatusDisplay(
        job?.paymentStatus
    )

    const totalCalculatedStaffCost =
        job?.assignments.reduce(
            (sum, current) => sum + (Number(current.staffCost) || 0),
            0
        ) || 0

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
        <div>
            <PageHeading job={job} />
            <div className="p-4 mx-auto space-y-6 bg-background-muted max-w-7xl">
                <div>
                    <JobTimelineCard job={job} />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                                <div className="mt-4 space-y-6">
                                    <JobProgressStatusCard job={job} />

                                    <div className="grid grid-cols-2 gap-4 px-1">
                                        <div>
                                            <p className="text-xs font-semibold text-default-500 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                                                <Building2Icon size={14} />{' '}
                                                Client
                                            </p>
                                            <p
                                                title={
                                                    job.client?.name ||
                                                    'Internal'
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
                                        {/* <div>
                                            <p className="text-xs font-semibold text-default-500 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                                                <Cloud size={14} /> SharePoint
                                            </p>
                                            <p
                                                title={sharepointDisplay.folderName}
                                                className="text-sm font-medium text-default-900 bg-background p-2.5 rounded-lg border border-default-100 truncate"
                                            >
                                                {sharepointDisplay.folderName}
                                            </p>
                                        </div> */}
                                    </div>

                                    {/* DESCRIPTION */}
                                    {job?.description && (
                                        <JobDescriptionCard
                                            data={job.description}
                                        />
                                    )}

                                    {/* ACTIVITY LOGS */}
                                    <JobActivityHistoryCard jobId={job.id} />
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
                                <div className="mt-4 space-y-6">
                                    <div className="flex items-center justify-between p-4 border border-border-default rounded-xl">
                                        <div>
                                            <h4 className="font-bold text-text-default">
                                                Payment Status
                                            </h4>
                                            <p className="text-sm text-text-subdued">
                                                Has the client paid for this
                                                job?
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Chip
                                                color={paymentDisplay.colorName}
                                            >
                                                {paymentDisplay.title}
                                            </Chip>
                                        </div>
                                    </div>

                                    <div className="grid items-start grid-cols-1 gap-6 mt-2 lg:grid-cols-2">
                                        {/* --- Total Income Card --- */}
                                        <Card
                                            className="border bg-emerald-50 dark:bg-emerald-50/10 border-emerald-100 dark:border-emerald-100/50"
                                            shadow="none"
                                        >
                                            <CardBody className="flex flex-col gap-4 p-5">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <label className="text-xs font-bold uppercase text-emerald-700">
                                                            Total Income
                                                        </label>
                                                        <p className="text-xs text-emerald-600/80 mt-0.5">
                                                            Amount billable to
                                                            client
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-start gap-2">
                                                    <div className="p-2 rounded-lg bg-emerald-100/50 dark:bg-emerald-500/20">
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

                                        <Card className="border border-orange-100 shadow-none bg-orange-50 dark:bg-orange-50/10 dark:border-orange-100/50">
                                            <CardBody className="flex flex-col gap-4 p-5">
                                                <div className="flex items-center justify-between">
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
                                                    <div className="p-2 rounded-lg bg-orange-100/50 dark:bg-orange-500/20">
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
                                        <CardBody className="flex flex-col p-0 overflow-hidden">
                                            <div className="flex items-center gap-2 p-5 pb-3 border-b border-border-default">
                                                <UsersIcon size={16} />
                                                <label className="text-xs font-bold tracking-wide uppercase">
                                                    Cost per member
                                                </label>
                                            </div>

                                            <div className="flex-1 p-5 overflow-x-auto">
                                                <table className="w-full text-left border-collapse min-w-75">
                                                    <thead>
                                                        <tr className="border-b border-border-muted">
                                                            <th className="pb-3 text-xs font-bold tracking-wider uppercase">
                                                                Assignee
                                                            </th>
                                                            <th className="pb-3 text-xs font-bold tracking-wider text-right uppercase w-35">
                                                                Payout ($)
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border-muted">
                                                        {job?.assignments
                                                            ?.length > 0 ? (
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
                                                                                        className="border shrink-0 border-orange-200/50"
                                                                                    />
                                                                                    <div className="flex flex-col truncate">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className="text-sm font-semibold truncate text-default-800">
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
                                                                            <td className="py-3 pl-2 font-semibold text-right align-middle text-text-default">
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
                                                                    <p className="text-sm italic text-orange-600/60">
                                                                        No staff
                                                                        assigned
                                                                        to this
                                                                        job yet.
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
                                <div className="px-2 space-y-6">
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
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {job?.assignments?.map((ass) => (
                                            <div
                                                key={ass.id}
                                                className="flex items-center justify-between p-3 transition-colors border cursor-pointer border-border-default rounded-xl hover:border-primary group bg-background"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar
                                                        src={optimizeCloudinary(
                                                            ass.user.avatar
                                                        )}
                                                        className="border shadow-sm border-border-default"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-bold leading-tight text-text-default">
                                                            {
                                                                ass.user
                                                                    .displayName
                                                            }
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
                                <div className="p-4 mt-4 bg-white border shadow-sm border-default-200 rounded-xl">
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
                                <div className="p-4 mt-4 bg-white border shadow-sm border-default-200 rounded-xl">
                                    <JobCommentsView job={job} />
                                </div>
                            </Tab>
                        </Tabs>
                    </div>

                    <div className="space-y-6">
                        {(job.sharepointFolderId || job.folderTemplateId) && (
                            <JobSharepointDetailCard job={job} />
                        )}

                        {job.reviewers && job.reviewers.length > 0 && (
                            <JobReviewersCard reviewers={job.reviewers} />
                        )}

                        {job.createdBy && (
                            <JobCreatorCard
                                createdAt={job.createdAt}
                                creator={job.createdBy}
                            />
                        )}

                        <JobReferenceUrlCard
                            url={EXTERNAL_URLS.getJobDetailUrl(job.no)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
