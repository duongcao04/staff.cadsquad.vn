import { INTERNAL_URLS, JobHelper, optimizeCloudinary } from '@/lib'
import {
    jobByNoOptions,
    updateAttachmentsMutationOptions,
    updateJobGeneralInfoOptions,
    useProfile,
} from '@/lib/queries'
import { currencyFormatter, EXTERNAL_URLS } from '@/lib/utils'
import JobAttachmentsField from '@/shared/components/form-fields/JobAttachmentsField'
import CountdownTimer from '@/shared/components/ui/countdown-timer'
import { JobStatusSystemTypeEnum } from '@/shared/enums'
import {
    Avatar,
    Button,
    Card,
    CardBody,
    Chip,
    Divider,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerHeader,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    Spinner,
    Tab,
    Tabs,
    useDisclosure,
} from '@heroui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import dayjs from 'dayjs'
import lodash from 'lodash'
import {
    AlertCircle,
    Building2Icon,
    ChevronRight,
    Clock,
    Cloud,
    DollarSignIcon,
    ExpandIcon,
    FileText,
    LinkIcon,
    MessageSquare,
    PinIcon,
    TagIcon,
    UsersIcon,
    Wallet,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import JobFinishChip from '../../../../shared/components/chips/JobFinishChip'
import { JobTimelineCard } from '../../../job-edit'
import { DeliverJobModal } from '../../../job-manage/components/modals/DeliverJobModal'
import UpdateCostModal from '../../../project-center/components/modals/UpdateCostModal'
import { JobActivityHistoryCard } from '../cards/job-activity-history-card'
import { JobCreatorCard } from '../cards/job-creator-card'
import { JobDescriptionCard } from '../cards/job-description-card'
import { JobProgressStatusCard } from '../cards/job-progress-status-card'
import { JobReferenceUrlCard } from '../cards/job-reference-url-card'
import { JobReviewersCard } from '../cards/job-reviewers-card'
import { JobSharepointDetailCard } from '../cards/job-sharepoint-detail-card'
import JobDescriptionModal from '../modals/JobDescriptionModal'
import JobCommentsView from '../views/JobCommentsView'

type JobDetailDrawerProps = {
    isOpen: boolean
    onClose: () => void
    jobNo: string
}

export function JobDetailDrawer({
    jobNo,
    isOpen,
    onClose,
}: JobDetailDrawerProps) {
    const router = useRouter()
    const { profile } = useProfile()

    // --- Mutations ---
    const updateJobGeneralInfoMutation = useMutation(
        updateJobGeneralInfoOptions
    )
    const updateAttachmentsMutation = useMutation(
        updateAttachmentsMutationOptions
    )

    // --- Disclosures ---
    const deliverJobDisclosure = useDisclosure()
    const financialModal = useDisclosure()
    const fullEditorDisclosure = useDisclosure()

    // --- Data Fetching ---
    const { data: job, isLoading: loadingJob } = useQuery({
        ...jobByNoOptions(jobNo),
        enabled: !!jobNo && isOpen,
    })

    const paymentDisplay = JobHelper.getJobPaymentStatusDisplay(
        job?.paymentStatus
    )
    const [descContent, setDescContent] = useState('')

    useEffect(() => {
        if (job?.description) setDescContent(job.description)
    }, [job?.description])

    // --- Derived Logic ---
    const isLoading = lodash.isEmpty(job) || loadingJob

    const isJobCompleted =
        job?.status?.systemType === JobStatusSystemTypeEnum.COMPLETED
    const isJobFinished =
        job?.status?.systemType === JobStatusSystemTypeEnum.TERMINATED
    const isPaused = isJobCompleted || isJobFinished

    const totalCalculatedStaffCost =
        job?.assignments.reduce(
            (sum, current) => sum + (Number(current.staffCost) || 0),
            0
        ) || 0

    const sharepointDisplay = job && JobHelper.getSharepointDisplay(job)

    // --- Handlers ---
    const handleSaveDescription = async (value: string) => {
        if (job) {
            await updateJobGeneralInfoMutation.mutateAsync({
                jobId: job.id,
                data: { description: value },
            })
        }
    }

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

    return (
        <>
            {/* --- MODALS --- */}
            {deliverJobDisclosure.isOpen && job && (
                <DeliverJobModal
                    isOpen={deliverJobDisclosure.isOpen}
                    onClose={deliverJobDisclosure.onClose}
                    defaultJob={job}
                    showSelect={false}
                />
            )}
            {financialModal.isOpen && job && (
                <UpdateCostModal
                    jobNo={job.no}
                    isOpen={financialModal.isOpen}
                    onClose={financialModal.onClose}
                />
            )}
            {fullEditorDisclosure.isOpen && job && (
                <JobDescriptionModal
                    isOpen={fullEditorDisclosure.isOpen}
                    onClose={fullEditorDisclosure.onClose}
                    defaultValue={descContent}
                    onSave={handleSaveDescription}
                    title={`Editor: #${job.no}`}
                />
            )}

            {/* --- MAIN DRAWER --- */}
            <Drawer
                isOpen={isOpen}
                onClose={onClose}
                classNames={{
                    base: 'min-w-[calc(100vw-16px)] md:min-w-0 md:max-w-300 bg-background',
                }}
            >
                <DrawerContent>
                    {isLoading || !job ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <Spinner
                                size="lg"
                                color="primary"
                                label="Syncing project data..."
                            />
                        </div>
                    ) : (
                        <>
                            {/* --- HEADER --- */}
                            <DrawerHeader
                                className="flex flex-col px-6 pt-6 pb-5 space-y-3"
                                style={{
                                    backgroundColor: job.status?.hexColor
                                        ? `${job.status.hexColor}15`
                                        : 'transparent',
                                    borderBottom: `1px solid ${job.status?.hexColor ? `${job.status.hexColor}30` : 'var(--nextui-colors-default-200)'}`,
                                }}
                            >
                                <div className="flex items-start justify-between w-full pr-5">
                                    <div className="flex flex-col gap-2">
                                        <span
                                            className="text-xs font-bold px-2.5 py-1 rounded-md tracking-wider w-fit border shadow-sm"
                                            style={{
                                                backgroundColor: job.status
                                                    ?.hexColor
                                                    ? `${job.status.hexColor}20`
                                                    : 'var(--nextui-colors-default-100)',
                                                color:
                                                    job.status?.hexColor ||
                                                    'inherit',
                                                borderColor: job.status
                                                    ?.hexColor
                                                    ? `${job.status.hexColor}40`
                                                    : 'transparent',
                                            }}
                                        >
                                            {job.no}
                                        </span>
                                        <h2 className="text-2xl font-bold leading-tight text-default-900">
                                            {job.displayName}
                                        </h2>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="bordered"
                                            className="font-medium border-1 bg-background"
                                            startContent={
                                                <ExpandIcon size={14} />
                                            }
                                            onPress={() =>
                                                router.navigate({
                                                    href: INTERNAL_URLS.jobDetail(
                                                        job.no
                                                    ),
                                                })
                                            }
                                        >
                                            Expand
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
                                                    className="font-medium border-1 bg-background"
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
                                                <DropdownSection
                                                    title="General"
                                                    showDivider
                                                >
                                                    <DropdownItem
                                                        key="pin"
                                                        startContent={
                                                            <PinIcon
                                                                size={16}
                                                            />
                                                        }
                                                    >
                                                        Pin to Dashboard
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        key="copy-link"
                                                        startContent={
                                                            <LinkIcon
                                                                size={16}
                                                            />
                                                        }
                                                    >
                                                        Copy Project Link
                                                    </DropdownItem>
                                                </DropdownSection>
                                                <DropdownSection
                                                    title="Data & Audit"
                                                    showDivider
                                                >
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
                                                        startContent={
                                                            <AlertCircle
                                                                size={16}
                                                            />
                                                        }
                                                    >
                                                        Archive Project
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        key="delete"
                                                        className="text-danger"
                                                        color="danger"
                                                        startContent={
                                                            <AlertCircle
                                                                size={16}
                                                            />
                                                        }
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
                                            status={
                                                isJobCompleted
                                                    ? 'completed'
                                                    : 'finish'
                                            }
                                        />
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-text-subdued">
                                            <Clock size={14} />
                                            <p className="pt-0.5 text-sm font-medium">
                                                Due on:
                                            </p>
                                            <CountdownTimer
                                                targetDate={dayjs(job?.dueAt)}
                                                hiddenUnits={['second', 'year']}
                                                paused={isPaused}
                                                className="text-right! text-sm font-semibold"
                                            />
                                        </div>
                                    )}
                                </div>
                            </DrawerHeader>

                            <DrawerBody className="p-4 bg-default-50/30">
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
                                                    <JobProgressStatusCard
                                                        job={job}
                                                    />

                                                    <div className="grid grid-cols-2 gap-4 px-1">
                                                        <div>
                                                            <p className="text-xs font-semibold text-default-500 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                                                                <Building2Icon
                                                                    size={14}
                                                                />{' '}
                                                                Client
                                                            </p>
                                                            <p
                                                                title={
                                                                    job.client
                                                                        ?.name ||
                                                                    'Internal'
                                                                }
                                                                className="text-sm font-medium text-default-900 bg-default-100/50 p-2.5 rounded-lg border border-default-100 truncate"
                                                            >
                                                                {job.client
                                                                    ?.name ||
                                                                    'Internal'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-default-500 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                                                                <TagIcon
                                                                    size={14}
                                                                />{' '}
                                                                Job Type
                                                            </p>
                                                            <p
                                                                title={
                                                                    job.type
                                                                        ?.displayName ||
                                                                    'Standard'
                                                                }
                                                                className="text-sm font-medium text-default-900 bg-default-100/50 p-2.5 rounded-lg border border-default-100 truncate"
                                                            >
                                                                {job.type
                                                                    ?.displayName ||
                                                                    'Standard'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-default-500 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                                                                <Cloud
                                                                    size={14}
                                                                />{' '}
                                                                SharePoint
                                                            </p>
                                                            <p
                                                                title={
                                                                    sharepointDisplay?.folderName
                                                                }
                                                                className="text-sm font-medium text-default-900 bg-default-100/50 p-2.5 rounded-lg border border-default-100 truncate"
                                                            >
                                                                {
                                                                    sharepointDisplay?.folderName
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* DESCRIPTION */}
                                                    {job?.description && (
                                                        <JobDescriptionCard
                                                            data={
                                                                job.description
                                                            }
                                                        />
                                                    )}

                                                    <JobActivityHistoryCard
                                                        jobId={job.id}
                                                    />
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
                                                                Has the client
                                                                paid for this
                                                                job?
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Chip
                                                                color={
                                                                    paymentDisplay.colorName
                                                                }
                                                            >
                                                                {
                                                                    paymentDisplay.title
                                                                }
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
                                                                            Total
                                                                            Income
                                                                        </label>
                                                                        <p className="text-xs text-emerald-600/80 mt-0.5">
                                                                            Amount
                                                                            billable
                                                                            to
                                                                            client
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-start gap-2">
                                                                    <div className="p-2 rounded-lg bg-emerald-100/50 dark:bg-emerald-500/20">
                                                                        <DollarSignIcon
                                                                            size={
                                                                                18
                                                                            }
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
                                                                            Total
                                                                            staff
                                                                            cost
                                                                        </label>
                                                                        <p className="text-xs text-orange-600/80 mt-0.5">
                                                                            Amount
                                                                            billable
                                                                            to
                                                                            client
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-start gap-2">
                                                                    <div className="p-2 rounded-lg bg-orange-100/50 dark:bg-orange-500/20">
                                                                        <DollarSignIcon
                                                                            size={
                                                                                18
                                                                            }
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
                                                    <Card
                                                        className="h-full"
                                                        shadow="none"
                                                    >
                                                        <CardBody className="flex flex-col p-0 overflow-hidden">
                                                            <div className="flex items-center gap-2 p-5 pb-3 border-b border-border-default">
                                                                <UsersIcon
                                                                    size={16}
                                                                />
                                                                <label className="text-xs font-bold tracking-wide uppercase">
                                                                    Cost per
                                                                    member
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
                                                                                Payout
                                                                                ($)
                                                                            </th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-border-muted">
                                                                        {job
                                                                            ?.assignments
                                                                            ?.length >
                                                                        0 ? (
                                                                            job.assignments.map(
                                                                                (
                                                                                    ass
                                                                                ) => {
                                                                                    const isMe =
                                                                                        ass
                                                                                            .user
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
                                                                                    colSpan={
                                                                                        2
                                                                                    }
                                                                                    className="py-6 text-center"
                                                                                >
                                                                                    <p className="text-sm italic text-orange-600/60">
                                                                                        No
                                                                                        staff
                                                                                        assigned
                                                                                        to
                                                                                        this
                                                                                        job
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
                                                            {job.assignments
                                                                .length || 0}
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
                                                            Manage collaborators
                                                            working on this
                                                            project.
                                                        </p>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                        {job?.assignments?.map(
                                                            (ass) => (
                                                                <div
                                                                    key={ass.id}
                                                                    className="flex items-center justify-between p-3 transition-colors border cursor-pointer border-border-default rounded-xl hover:border-primary group bg-background"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <Avatar
                                                                            src={optimizeCloudinary(
                                                                                ass
                                                                                    .user
                                                                                    .avatar
                                                                            )}
                                                                            className="border shadow-sm border-border-default"
                                                                        />
                                                                        <div>
                                                                            <p className="text-sm font-bold leading-tight text-text-default">
                                                                                {
                                                                                    ass
                                                                                        .user
                                                                                        .displayName
                                                                                }
                                                                            </p>
                                                                            <p className="text-xs text-text-subdued">
                                                                                @
                                                                                {
                                                                                    ass
                                                                                        .user
                                                                                        .username
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
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
                                                            {job.attachmentUrls
                                                                ?.length || 0}
                                                        </Chip>
                                                    </div>
                                                }
                                            >
                                                <div className="p-4 mt-4 bg-white border shadow-sm border-default-200 rounded-xl">
                                                    <JobAttachmentsField
                                                        defaultAttachments={
                                                            job.attachmentUrls
                                                        }
                                                        onAdd={
                                                            handleAddAttachment
                                                        }
                                                        onRemove={
                                                            handleRemoveAttachment
                                                        }
                                                    />
                                                </div>
                                            </Tab>

                                            {/* TAB: COMMENTS */}
                                            <Tab
                                                key="comments"
                                                title={
                                                    <div className="flex items-center gap-2">
                                                        <MessageSquare
                                                            size={16}
                                                        />
                                                        <span>Comments</span>
                                                        <Chip
                                                            size="sm"
                                                            variant="flat"
                                                            className="h-5 text-[10px] ml-1"
                                                        >
                                                            {job.comments
                                                                ?.length || 0}
                                                        </Chip>
                                                    </div>
                                                }
                                            >
                                                <div className="p-4 mt-4 bg-white border shadow-sm border-default-200 rounded-xl">
                                                    <JobCommentsView
                                                        job={job}
                                                    />
                                                </div>
                                            </Tab>
                                        </Tabs>
                                    </div>

                                    <div className="space-y-6">
                                        {(job.sharepointFolderId ||
                                            job.folderTemplateId) && (
                                            <JobSharepointDetailCard
                                                job={job}
                                            />
                                        )}

                                        {job.reviewers &&
                                            job.reviewers.length > 0 && (
                                                <JobReviewersCard
                                                    reviewers={job.reviewers}
                                                />
                                            )}

                                        {job.createdBy && (
                                            <JobCreatorCard
                                                createdAt={job.createdAt}
                                                creator={job.createdBy}
                                            />
                                        )}

                                        <JobReferenceUrlCard
                                            url={EXTERNAL_URLS.getJobDetailUrl(
                                                job.no
                                            )}
                                        />
                                    </div>
                                </div>
                            </DrawerBody>
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </>
    )
}
