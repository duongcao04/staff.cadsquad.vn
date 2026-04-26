import {
    dateFormatter,
    INTERNAL_URLS,
    JobHelper,
    optimizeCloudinary,
    sharepointFolderItemsOptions,
} from '@/lib'
import {
    jobActivityLogsOptions,
    jobByNoOptions,
    jobStatusesListOptions,
    updateAttachmentsMutationOptions,
    updateJobGeneralInfoOptions,
    useProfile,
} from '@/lib/queries'
import { APP_PERMISSIONS, currencyFormatter, EXTERNAL_URLS } from '@/lib/utils'
import JobAttachmentsField from '@/shared/components/form-fields/JobAttachmentsField'
import CountdownTimer from '@/shared/components/ui/countdown-timer'
import HtmlReactParser from '@/shared/components/ui/html-react-parser'
import { JobStatusSystemTypeEnum } from '@/shared/enums'
import { Folder } from '@gravity-ui/icons'
import {
    Avatar,
    Button,
    Card,
    CardBody,
    CardHeader,
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
    Snippet,
    Spinner,
    Tab,
    Tabs,
    Tooltip,
    useDisclosure,
} from '@heroui/react'
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import dayjs from 'dayjs'
import lodash from 'lodash'
import {
    AlertCircle,
    Building2Icon,
    CheckCircle2,
    ChevronRight,
    CirclePlus,
    Clock,
    Cloud,
    DollarSignIcon,
    ExpandIcon,
    ExternalLink,
    FileText,
    LinkIcon,
    MessageSquare,
    PinIcon,
    RotateCcw,
    TagIcon,
    UsersIcon,
    Wallet,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import JobFinishChip from '../../../../shared/components/chips/JobFinishChip'
import { usePermission } from '../../../../shared/hooks'
import { JobTimelineCard } from '../../../job-edit'
import { DeliverJobModal } from '../../../job-manage/components/modals/DeliverJobModal'
import UpdateCostModal from '../../../project-center/components/modals/UpdateCostModal'
import JobDescriptionModal from '../modals/JobDescriptionModal'
import { JobActivityHistory } from '../views/JobActivityHistory'
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

    const { hasPermission } = usePermission()

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

    const { data } = useQuery({
        ...sharepointFolderItemsOptions(job?.sharepointFolder.itemId || '-1'),
        enabled: !!job?.sharepointFolderId,
    })
    const sharepointFolderChilds = data?.items || []
    const resultFolder =
        sharepointFolderChilds.filter((it) =>
            JobHelper.sharepointResultFolderRegex.test(it.name)
        )?.[0] || null

    const {
        data: { jobStatuses },
    } = useSuspenseQuery(jobStatusesListOptions())

    // 1. Find the active index
    const activeIndex = useMemo(() => {
        if (!jobStatuses.length) return 0
        const index = jobStatuses.findIndex((s) => s.id === job?.status.id)
        return index !== -1 ? index : 0
    }, [job?.status.id, jobStatuses])

    // 2. Safely get the active status object
    const activeStatus = useMemo(() => {
        return jobStatuses[activeIndex] || job?.status
    }, [activeIndex, jobStatuses, job?.status])

    const paymentDisplay = JobHelper.getJobPaymentStatusDisplay(
        job?.paymentStatus
    )
    const {
        data: activityLogs,
        refetch: refetchLogs,
        isFetching: isLogsLoading,
    } = useQuery({
        ...jobActivityLogsOptions(job?.id ?? ''),
        enabled: !!job?.id,
    })

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
                                                    <Card
                                                        shadow="none"
                                                        className="mb-6 overflow-hidden border border-border-default rounded-xl"
                                                    >
                                                        <CardBody className="p-4">
                                                            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                                                                {/* 1. Status Info & Date Info */}
                                                                <div className="flex flex-col gap-1 min-w-50 shrink-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] font-medium text-text-subdued tracking-widest">
                                                                            Current
                                                                            Status
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <div
                                                                            className="w-2 h-2 rounded-full animate-pulse"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    job
                                                                                        .status
                                                                                        ?.hexColor ||
                                                                                    'var(--nextui-colors-default-400)',
                                                                            }}
                                                                        />
                                                                        <h3
                                                                            className="text-lg font-black leading-none"
                                                                            style={{
                                                                                color:
                                                                                    job
                                                                                        .status
                                                                                        ?.hexColor ||
                                                                                    'inherit',
                                                                            }}
                                                                        >
                                                                            {job
                                                                                .status
                                                                                ?.displayName ||
                                                                                'Unknown Status'}
                                                                        </h3>
                                                                    </div>
                                                                </div>

                                                                {/* 2. Segmented Progress Bar */}
                                                                <div className="flex-1 w-full items-center gap-1.5 px-4 hidden sm:flex">
                                                                    {jobStatuses.map(
                                                                        (
                                                                            opt,
                                                                            index
                                                                        ) => {
                                                                            const isCompleted =
                                                                                index <
                                                                                activeIndex
                                                                            const isCurrent =
                                                                                index ===
                                                                                activeIndex
                                                                            const isPending =
                                                                                index >
                                                                                activeIndex

                                                                            if (
                                                                                isCurrent
                                                                            ) {
                                                                                return (
                                                                                    <div
                                                                                        key={
                                                                                            opt.id
                                                                                        }
                                                                                        className="z-10 flex items-center justify-center px-3 py-1 text-xs font-bold text-white rounded-full shadow-sm whitespace-nowrap"
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
                                                                                    key={
                                                                                        opt.id
                                                                                    }
                                                                                    placement="top"
                                                                                    content={
                                                                                        <div className="px-1 py-1.5 flex flex-col gap-1">
                                                                                            <div className="flex items-center gap-2 font-bold text-small">
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
                                                                                            <div className="font-medium text-tiny text-default-500">
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
                                                                <div className="flex items-center gap-3 shrink-0">
                                                                    {isPaused ? (
                                                                        <JobFinishChip
                                                                            status={
                                                                                isJobCompleted
                                                                                    ? 'completed'
                                                                                    : 'finish'
                                                                            }
                                                                        />
                                                                    ) : JobHelper.canDelivery(
                                                                          job,
                                                                          hasPermission(
                                                                              APP_PERMISSIONS
                                                                                  .JOB
                                                                                  .DELIVER
                                                                          )
                                                                      ) ? (
                                                                        <Tooltip
                                                                            placement="top-end"
                                                                            content={
                                                                                <div className="px-1 py-1.5 max-w-50">
                                                                                    <p className="mb-1 font-bold text-small">
                                                                                        Ready
                                                                                        to
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
                                                                                onPress={
                                                                                    deliverJobDisclosure.onOpen
                                                                                }
                                                                                className="font-bold shadow-sm"
                                                                            >
                                                                                Deliver
                                                                                Job
                                                                            </Button>
                                                                        </Tooltip>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        </CardBody>
                                                    </Card>

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
                                                    <Card
                                                        shadow="none"
                                                        className="border border-border-default rounded-xl"
                                                    >
                                                        <CardHeader className="flex items-center gap-2 px-3 py-3 text-sm bg-background-muted">
                                                            Description
                                                        </CardHeader>

                                                        <Divider className="bg-border-muted" />

                                                        <CardBody className="p-3">
                                                            <div className="p-4 text-sm leading-relaxed text-default-700 min-h-25">
                                                                {job.description ? (
                                                                    <HtmlReactParser
                                                                        htmlString={
                                                                            job.description
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <p className="py-6 italic text-center text-default-400">
                                                                        No
                                                                        description
                                                                        provided.
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </CardBody>
                                                    </Card>

                                                    {/* ACTIVITY LOGS */}
                                                    <div className="overflow-hidden bg-white border shadow-sm border-default-200 rounded-xl">
                                                        <div className="flex items-center justify-between px-4 py-3 border-b bg-default-50 border-default-200">
                                                            <span className="text-sm font-semibold tracking-wide text-default-900">
                                                                Activity History
                                                            </span>
                                                            <Button
                                                                size="sm"
                                                                variant="light"
                                                                isIconOnly
                                                                onPress={() =>
                                                                    refetchLogs()
                                                                }
                                                                isLoading={
                                                                    isLogsLoading
                                                                }
                                                            >
                                                                <RotateCcw
                                                                    size={14}
                                                                    className="text-default-500"
                                                                />
                                                            </Button>
                                                        </div>
                                                        <div className="p-4">
                                                            <JobActivityHistory
                                                                logs={
                                                                    activityLogs
                                                                }
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

                                    {/* --- SIDEBAR AREA (1/3) --- */}
                                    <div className="space-y-6">
                                        {/* 1. SHAREPOINT CARD */}
                                        <Card
                                            shadow="none"
                                            className="border border-border-default rounded-xl"
                                        >
                                            <CardHeader className="flex items-center justify-between px-3 py-3 text-sm bg-background-muted">
                                                <div className="flex items-center gap-2">
                                                    <Cloud size={14} />
                                                    SharePoint Directory
                                                </div>
                                            </CardHeader>

                                            <Divider className="bg-border-muted" />

                                            <CardBody className="p-3">
                                                <div className="flex flex-col gap-4">
                                                    {/* Main Folder Identity */}
                                                    <div className="flex items-start gap-3 p-3 border bg-default-50/50 rounded-xl border-default-100">
                                                        <div className="p-2 bg-primary/10 rounded-lg text-primary mt-0.5">
                                                            <Folder
                                                                fontSize={18}
                                                                fill="currentColor"
                                                                className="opacity-80"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col flex-1 min-w-0">
                                                            <span
                                                                className="text-sm font-bold truncate text-default-900"
                                                                title={
                                                                    sharepointDisplay?.folderName
                                                                }
                                                            >
                                                                {
                                                                    sharepointDisplay?.folderName
                                                                }
                                                            </span>
                                                            <span className="text-xs text-default-500 mt-0.5">
                                                                {job
                                                                    ?.sharepointFolder
                                                                    ?.isFolder
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
                                                            {job
                                                                ?.sharepointFolder
                                                                ?.size ||
                                                            job?.folderTemplate
                                                                ?.size ? (
                                                                <div>
                                                                    <p className="text-[10px] uppercase font-bold text-default-400 tracking-wider mb-1">
                                                                        Size
                                                                    </p>
                                                                    <p className="text-xs font-medium text-default-700">
                                                                        {(() => {
                                                                            const bytes =
                                                                                job
                                                                                    .sharepointFolder
                                                                                    ?.size ||
                                                                                job
                                                                                    .folderTemplate
                                                                                    ?.size ||
                                                                                0
                                                                            if (
                                                                                bytes ===
                                                                                0
                                                                            )
                                                                                return '0 B'
                                                                            const k = 1024
                                                                            const sizes =
                                                                                [
                                                                                    'B',
                                                                                    'KB',
                                                                                    'MB',
                                                                                    'GB',
                                                                                    'TB',
                                                                                ]
                                                                            const i =
                                                                                Math.floor(
                                                                                    Math.log(
                                                                                        bytes
                                                                                    ) /
                                                                                        Math.log(
                                                                                            k
                                                                                        )
                                                                                )
                                                                            return (
                                                                                parseFloat(
                                                                                    (
                                                                                        bytes /
                                                                                        Math.pow(
                                                                                            k,
                                                                                            i
                                                                                        )
                                                                                    ).toFixed(
                                                                                        2
                                                                                    )
                                                                                ) +
                                                                                ' ' +
                                                                                sizes[
                                                                                    i
                                                                                ]
                                                                            )
                                                                        })()}
                                                                    </p>
                                                                </div>
                                                            ) : null}

                                                            {/* Created By */}
                                                            {job
                                                                ?.sharepointFolder
                                                                ?.createdBy && (
                                                                <div>
                                                                    <p className="text-[10px] uppercase font-bold text-default-400 tracking-wider mb-1">
                                                                        Created
                                                                        By
                                                                    </p>
                                                                    <p
                                                                        className="text-xs font-medium truncate text-default-700"
                                                                        title={
                                                                            job
                                                                                .sharepointFolder
                                                                                ?.createdBy ||
                                                                            ''
                                                                        }
                                                                    >
                                                                        {
                                                                            job
                                                                                .sharepointFolder
                                                                                ?.createdBy
                                                                        }
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* Created Date */}
                                                            {job
                                                                ?.sharepointFolder
                                                                ?.createdDateTime && (
                                                                <div className="col-span-2">
                                                                    <p className="text-[10px] uppercase font-bold text-default-400 tracking-wider mb-1">
                                                                        Date
                                                                        Created
                                                                    </p>
                                                                    <p className="text-xs font-medium text-default-700">
                                                                        {dateFormatter(
                                                                            job
                                                                                .sharepointFolder
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

                                                    {/* Action Buttons Area */}
                                                    {sharepointDisplay?.publicWebUrl && (
                                                        <div className="flex flex-col gap-2 mt-1 px-1">
                                                            <p className="text-[10px] uppercase font-bold text-default-400 tracking-wider">
                                                                Actions
                                                            </p>
                                                            <div className="flex gap-2 w-full">
                                                                <Tooltip
                                                                    content="Open the source directory in SharePoint"
                                                                    placement="top"
                                                                    delay={500}
                                                                >
                                                                    <Button
                                                                        as="a"
                                                                        href={
                                                                            sharepointDisplay?.publicWebUrl
                                                                        }
                                                                        target="_blank"
                                                                        isDisabled={
                                                                            !sharepointDisplay?.publicWebUrl
                                                                        }
                                                                        color="primary"
                                                                        variant="flat"
                                                                        size="sm"
                                                                        className="flex-1 font-bold shadow-sm"
                                                                        endContent={
                                                                            <ExternalLink
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />
                                                                        }
                                                                    >
                                                                        Open
                                                                        SharePoint
                                                                    </Button>
                                                                </Tooltip>

                                                                {resultFolder && (
                                                                    <Tooltip
                                                                        content="Open the folder containing the processed results"
                                                                        placement="top"
                                                                        delay={
                                                                            500
                                                                        }
                                                                    >
                                                                        <Button
                                                                            as="a"
                                                                            href={
                                                                                resultFolder.webUrl
                                                                            }
                                                                            target="_blank"
                                                                            isDisabled={
                                                                                !resultFolder.webUrl
                                                                            }
                                                                            color="primary"
                                                                            variant="light"
                                                                            size="sm"
                                                                            className="flex-1 font-medium shadow-sm"
                                                                            endContent={
                                                                                <ExternalLink
                                                                                    size={
                                                                                        14
                                                                                    }
                                                                                />
                                                                            }
                                                                        >
                                                                            Open
                                                                            Result
                                                                            Folder
                                                                        </Button>
                                                                    </Tooltip>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardBody>
                                        </Card>

                                        <Card
                                            shadow="none"
                                            className="border border-border-default rounded-xl"
                                        >
                                            <CardHeader className="flex items-center gap-2 px-3 py-3 text-sm bg-background-muted">
                                                <CirclePlus size={16} />
                                                Created By
                                            </CardHeader>

                                            <Divider className="bg-border-muted" />

                                            <CardBody className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar
                                                        src={
                                                            job.createdBy.avatar
                                                        }
                                                        size="md"
                                                    />
                                                    <div className="flex flex-col">
                                                        <p className="text-sm font-bold text-default-900">
                                                            {
                                                                job.createdBy
                                                                    .displayName
                                                            }
                                                        </p>
                                                        <p className="text-xs text-default-500 mt-0.5 flex items-center gap-1">
                                                            {dateFormatter(
                                                                job.createdAt,
                                                                {
                                                                    format: 'fullShort',
                                                                }
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>

                                        <Card
                                            shadow="none"
                                            className="border border-border-default rounded-xl"
                                        >
                                            <CardHeader className="flex items-center gap-2 px-3 py-3 text-sm bg-background-muted">
                                                <LinkIcon size={14} />
                                                Public Link
                                            </CardHeader>

                                            <Divider className="bg-border-muted" />

                                            <CardBody className="p-3">
                                                <Snippet
                                                    symbol=""
                                                    size="sm"
                                                    variant="flat"
                                                    className="w-full border bg-default-50 text-default-900 border-default-200"
                                                >
                                                    {EXTERNAL_URLS.getJobDetailUrl(
                                                        job.no
                                                    )}
                                                </Snippet>
                                            </CardBody>
                                        </Card>
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
