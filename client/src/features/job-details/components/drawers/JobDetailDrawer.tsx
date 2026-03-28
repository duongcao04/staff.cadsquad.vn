import { optimizeCloudinary } from '@/lib'
import { dateFormatter } from '@/lib/dayjs'
import {
    jobActivityLogsOptions,
    jobByNoOptions,
    updateAttachmentsMutationOptions,
    updateJobGeneralInfoOptions,
    useProfile,
} from '@/lib/queries'
import {
    APP_PERMISSIONS,
    currencyFormatter,
    EXCHANGE_RATE,
    EXTERNAL_URLS,
    INTERNAL_URLS,
    PAID_STATUS_COLOR,
} from '@/lib/utils'
import { JobStatusChip } from '@/shared/components/chips/JobStatusChip'
import { PaidChip } from '@/shared/components/chips/PaidChip'
import JobAttachmentsField from '@/shared/components/form-fields/JobAttachmentsField'
import CountdownTimer from '@/shared/components/ui/countdown-timer'
import { HeroButton } from '@/shared/components/ui/hero-button'
import {
    HeroCard,
    HeroCardBody,
    HeroCardHeader,
} from '@/shared/components/ui/hero-card'
import { HeroCopyButton } from '@/shared/components/ui/hero-copy-button'
import {
    HeroDrawer,
    HeroDrawerBody,
    HeroDrawerContent,
    HeroDrawerHeader,
} from '@/shared/components/ui/hero-drawer'
import HtmlReactParser from '@/shared/components/ui/html-react-parser'
import { JobStatusSystemTypeEnum } from '@/shared/enums'
import { PermissionGuard } from '@/shared/guards/permission'
import { usePermission } from '@/shared/hooks'
import {
    Avatar,
    Button,
    Chip,
    Divider,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    Progress,
    Snippet,
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
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    CirclePlus,
    Clock,
    ExpandIcon,
    FileText,
    LibraryBig,
    LinkIcon,
    Maximize2,
    MessageSquare,
    Pencil,
    PinIcon,
    RotateCcw,
    TrendingDown,
    TruckElectricIcon,
    UserRound,
    Users,
    Wallet,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { DeliverJobModal } from '../../../job-manage/components/modals/DeliverJobModal'
import UpdateCostModal from '../../../project-center/components/modals/UpdateCostModal'
import JobDescriptionModal from '../modals/JobDescriptionModal'
import { JobActivityHistory } from '../views/JobActivityHistory'
import JobAssigneesView from '../views/JobAssigneesView'
import JobCommentsView from '../views/JobCommentsView'

type JobDetailDrawerProps = {
    isOpen: boolean
    onClose: () => void
    jobNo: string
}
export default function JobDetailDrawer({
    jobNo,
    isOpen,
    onClose,
}: JobDetailDrawerProps) {
    const router = useRouter()

    const { profile } = useProfile()
    const { hasPermission, hasSomePermissions } = usePermission()
    const updateJobGeneralInfoMutation = useMutation(
        updateJobGeneralInfoOptions
    )

    const deliverJobDisclosure = useDisclosure()
    const financialModal = useDisclosure()
    const fullEditorDisclosure = useDisclosure()

    const { data: job, isLoading: loadingJob } = useQuery({
        ...jobByNoOptions(jobNo),
        enabled: !!jobNo && isOpen,
    })

    const {
        data: activityLogs,
        refetch: refetchLogs,
        isFetching: isLogsLoading,
    } = useQuery({
        ...jobActivityLogsOptions(job?.id ?? ''),
        enabled: !!job?.id,
    })

    const updateAttachmentsMutation = useMutation(
        updateAttachmentsMutationOptions
    )

    const [descContent, setDescContent] = useState('')

    useEffect(() => {
        if (job?.description) setDescContent(job.description)
    }, [job?.description])

    // 2. DERIVED LOGIC
    const isLoading = lodash.isEmpty(job) || loadingJob

    const isAssigned = job?.assignments.find(
        (it) => it.user.username === profile.username
    )

    const isJobCompleted =
        job?.status?.systemType === JobStatusSystemTypeEnum.COMPLETED

    const isJobFinished =
        job?.status?.systemType === JobStatusSystemTypeEnum.TERMINATED

    const isJobWaitReview =
        job?.status?.systemType === JobStatusSystemTypeEnum.DELIVERED

    const budgetUsage = useMemo(() => {
        if (!job?.incomeCost || job.incomeCost === 0) return 0
        return Math.min(
            Math.round(
                ((job.totalStaffCost || 0) /
                    (job.incomeCost * EXCHANGE_RATE.USD)) *
                    100
            ),
            100
        )
    }, [job])

    const handleSaveDescription = async (value: string) => {
        if (job) {
            await updateJobGeneralInfoMutation.mutateAsync({
                jobId: job.id,
                data: {
                    description: value,
                },
            })
        }
    }

    const handleRemoveAttachment = (url: string) => {
        if (!job?.id) {
            return
        }
        updateAttachmentsMutation.mutateAsync({
            jobId: job.id,
            action: 'remove',
            files: [url],
        })
    }

    const handleAddAttachment = (url: string) => {
        if (!job?.id) {
            return
        }
        updateAttachmentsMutation.mutateAsync({
            jobId: job.id,
            action: 'add',
            files: [url],
        })
    }

    return (
        <>
            {/* MODALS */}
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

            {/* MAIN DRAWER */}
            <HeroDrawer
                isOpen={isOpen}
                onClose={onClose}
                classNames={{
                    base: 'min-w-[calc(100vw-16px)] md:min-w-0 md:max-w-270',
                }}
            >
                <HeroDrawerContent>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <Spinner
                                size="lg"
                                label="Syncing project data..."
                            />
                        </div>
                    ) : (
                        <>
                            {/* HEADER */}
                            <HeroDrawerHeader className="flex flex-col pb-2.5!">
                                <div className="flex items-center justify-between w-full pr-5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                            #{job.no}
                                        </span>
                                        <HeroCopyButton textValue={job.no} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <HeroButton
                                            size="sm"
                                            variant="light"
                                            className="border-1"
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
                                            Open Full View
                                        </HeroButton>
                                        <Dropdown
                                            placement="bottom-end"
                                            classNames={{
                                                content:
                                                    'border border-divider shadow-xl min-w-[220px] p-1',
                                            }}
                                        >
                                            <DropdownTrigger>
                                                <Button
                                                    variant="flat"
                                                    size="sm"
                                                    className="font-bold h-8 text-[11px] bg-default-100 hover:bg-default-200"
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
                                                disabledKeys={['payout-locked']}
                                            >
                                                {/* NHÓM QUẢN LÝ CHÍNH */}
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

                                                {/* NHÓM DỮ LIỆU & BÁO CÁO */}
                                                <DropdownSection
                                                    title="Data & Audit"
                                                    showDivider
                                                >
                                                    <DropdownItem
                                                        key="history"
                                                        startContent={
                                                            <Clock
                                                                size={16}
                                                                className="text-default-400"
                                                            />
                                                        }
                                                        description="View all activity logs"
                                                    >
                                                        Activity History
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        key="audit"
                                                        startContent={
                                                            <Wallet
                                                                size={16}
                                                                className="text-primary"
                                                            />
                                                        }
                                                        description="Review financial details"
                                                    >
                                                        Financial Audit
                                                    </DropdownItem>
                                                </DropdownSection>

                                                {/* NHÓM NGUY HIỂM */}
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
                                <h1 className="mt-2 mb-4 text-xl font-bold">
                                    {job.displayName}
                                </h1>
                                <div className="flex gap-3 text-xs text-text-subdued items-center">
                                    <div className="flex items-center gap-1.5 font-medium">
                                        <UserRound size={14} />
                                        {job.client?.name || 'Unknown client'}
                                    </div>
                                    <Divider
                                        orientation="vertical"
                                        className="h-3"
                                    />
                                    <div className="flex items-center gap-1.5 font-medium">
                                        <LibraryBig size={14} />
                                        {job.type?.displayName}
                                    </div>
                                    <Divider
                                        orientation="vertical"
                                        className="h-3"
                                    />
                                    <div className="flex items-center gap-1.5 font-medium">
                                        <CalendarDays size={14} />
                                        {isJobCompleted ? (
                                            `Completed`
                                        ) : isJobFinished ? (
                                            `Finish`
                                        ) : (
                                            <span className="flex items-center justify-start gap-1">
                                                Due on:
                                                <CountdownTimer
                                                    targetDate={dayjs(
                                                        job.dueAt
                                                    )}
                                                    mode="text"
                                                    hiddenUnits={['second']}
                                                    className="font-medium! text-text-7! dark:text-text-subdued!"
                                                />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </HeroDrawerHeader>

                            <Divider className="mb-2" />

                            <HeroDrawerBody className="py-6">
                                <div className="flex flex-col gap-6">
                                    {/* ACTION BAR */}
                                    <HeroCard className="bg-background dark:bg-background-hovered/50 border-border-default">
                                        <HeroCardBody className="w-full flex justify-between p-4">
                                            <div className="flex justify-between">
                                                {/* SECTION 1: CORE PROGRESS STATUS */}
                                                <div className="flex flex-col gap-1">
                                                    {/* Status Label & Dot */}
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-2 h-2 rounded-full animate-pulse"
                                                            style={{
                                                                backgroundColor:
                                                                    job.status
                                                                        .hexColor,
                                                            }}
                                                        />
                                                        <span className="text-[10px] font-black text-text-subdued uppercase tracking-widest leading-none">
                                                            Status
                                                        </span>
                                                    </div>

                                                    <div className="flex items-end gap-4">
                                                        <JobStatusChip
                                                            data={job.status}
                                                            classNames={{
                                                                base: 'min-w-30! text-center!',
                                                            }}
                                                        />

                                                        {/* DYNAMIC TIMELINE PROGRESS */}
                                                        <div className="h-full flex flex-col justify-center border-l-1 border-border-default pl-4 py-0.5">
                                                            {job.finishedAt ? (
                                                                <>
                                                                    <div
                                                                        className="flex items-center gap-1"
                                                                        style={{
                                                                            color: job
                                                                                .status
                                                                                .hexColor,
                                                                        }}
                                                                    >
                                                                        <Clock
                                                                            size={
                                                                                12
                                                                            }
                                                                            strokeWidth={
                                                                                2.3
                                                                            }
                                                                        />
                                                                        <span className="text-[11px] font-medium leading-4">
                                                                            Finished{' '}
                                                                            {dateFormatter(
                                                                                job.finishedAt,
                                                                                {
                                                                                    format: 'longDate',
                                                                                }
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-[10px] text-text-subdued italic">
                                                                        Approved
                                                                        at
                                                                        <span className="pl-1">
                                                                            {job.completedAt
                                                                                ? dateFormatter(
                                                                                      job.completedAt,
                                                                                      {
                                                                                          format: 'longDate',
                                                                                      }
                                                                                  )
                                                                                : 'Unknown date'}
                                                                        </span>
                                                                    </span>
                                                                </>
                                                            ) : job.completedAt ? (
                                                                <>
                                                                    <div
                                                                        className="flex items-center gap-1"
                                                                        style={{
                                                                            color: job
                                                                                .status
                                                                                .hexColor,
                                                                        }}
                                                                    >
                                                                        <Clock
                                                                            size={
                                                                                12
                                                                            }
                                                                            strokeWidth={
                                                                                2.3
                                                                            }
                                                                        />
                                                                        <span className="text-[10px] font-medium leading-4">
                                                                            Completed{' '}
                                                                            {dateFormatter(
                                                                                job.completedAt,
                                                                                {
                                                                                    format: 'longDate',
                                                                                }
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-[10px] text-text-subdued italic">
                                                                        Waiting
                                                                        for
                                                                        payouts
                                                                    </span>
                                                                </>
                                                            ) : isJobWaitReview ? (
                                                                <>
                                                                    <div
                                                                        className="flex items-center gap-1"
                                                                        style={{
                                                                            color: job
                                                                                .status
                                                                                .hexColor,
                                                                        }}
                                                                    >
                                                                        <TruckElectricIcon
                                                                            size={
                                                                                16
                                                                            }
                                                                            strokeWidth={
                                                                                2.3
                                                                            }
                                                                        />
                                                                        <span className="text-xs font-medium leading-4">
                                                                            Delivering{' '}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-[10px] text-text-subdued italic">
                                                                        Waiting
                                                                        for
                                                                        approve
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="text-[11px] font-bold text-default-600">
                                                                        Active
                                                                        Workflow
                                                                    </span>
                                                                    <span className="text-[10px] text-text-subdued italic">
                                                                        Started{' '}
                                                                        {dayjs(
                                                                            job.startedAt
                                                                        ).fromNow()}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* SECTION 2: ACTIONS */}
                                                <div className="flex items-center gap-2">
                                                    <PermissionGuard
                                                        permission={
                                                            APP_PERMISSIONS.JOB
                                                                .DELIVER
                                                        }
                                                    >
                                                        {isJobCompleted ||
                                                        isJobFinished ||
                                                        isJobWaitReview ? (
                                                            <></>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="solid"
                                                                color="primary"
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
                                                            >
                                                                Deliver Job
                                                            </Button>
                                                        )}
                                                    </PermissionGuard>
                                                    {/* TODO: Issue Report */}
                                                    {/* <Button
                                                        size="sm"
                                                        variant="light"
                                                        color="danger"
                                                        isIconOnly
                                                    >
                                                        <AlertCircle
                                                            size={16}
                                                        />
                                                    </Button> */}
                                                </div>
                                            </div>
                                        </HeroCardBody>
                                    </HeroCard>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="lg:col-span-2">
                                            <Tabs
                                                variant="underlined"
                                                color="primary"
                                            >
                                                {/* TAB 1: OVERVIEW */}
                                                <Tab
                                                    key="overview"
                                                    title={
                                                        <div className="flex items-center gap-2">
                                                            <FileText
                                                                size={16}
                                                            />
                                                            <span>
                                                                Overview
                                                            </span>
                                                        </div>
                                                    }
                                                >
                                                    <div className="space-y-6">
                                                        <JobAssigneesView
                                                            data={job}
                                                        />
                                                        <HeroCard className="p-0! overflow-hidden border-none shadow-none">
                                                            <HeroCardHeader className="justify-between py-1 text-text-8">
                                                                <span className="font-medium text-xs tracking-wide text-text-default">
                                                                    Description
                                                                </span>
                                                                {hasPermission(
                                                                    APP_PERMISSIONS
                                                                        .JOB
                                                                        .UPDATE
                                                                ) && (
                                                                    <div className="flex gap-1">
                                                                        <HeroButton
                                                                            isIconOnly
                                                                            size="sm"
                                                                            variant="light"
                                                                            onPress={
                                                                                fullEditorDisclosure.onOpen
                                                                            }
                                                                        >
                                                                            <Maximize2
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />
                                                                        </HeroButton>
                                                                    </div>
                                                                )}
                                                            </HeroCardHeader>
                                                            <HeroCardBody className="py-0! px-3 text-sm text-text-default">
                                                                {job.description ? (
                                                                    <HtmlReactParser
                                                                        htmlString={
                                                                            job.description
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <p className="text-default-400 italic text-center py-4">
                                                                        No
                                                                        description
                                                                        provided.
                                                                    </p>
                                                                )}
                                                            </HeroCardBody>
                                                        </HeroCard>

                                                        <HeroCard className="p-0! overflow-hidden border-none shadow-none">
                                                            <HeroCardHeader className="justify-between py-1 text-text-8">
                                                                <span className="font-medium text-xs tracking-wide text-text-default">
                                                                    Activity
                                                                    History
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
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                </Button>
                                                            </HeroCardHeader>

                                                            <HeroCardBody>
                                                                <JobActivityHistory
                                                                    logs={
                                                                        activityLogs
                                                                    }
                                                                />
                                                            </HeroCardBody>
                                                        </HeroCard>
                                                    </div>
                                                </Tab>

                                                {/* TAB 2: ATTACHMENTS */}
                                                <Tab
                                                    key="attachments"
                                                    title={
                                                        <div className="flex items-center gap-2">
                                                            <LinkIcon
                                                                size={16}
                                                            />
                                                            <span>
                                                                Attachments
                                                            </span>
                                                            <Chip
                                                                size="sm"
                                                                variant="flat"
                                                            >
                                                                {job
                                                                    .attachmentUrls
                                                                    ?.length ||
                                                                    0}
                                                            </Chip>
                                                        </div>
                                                    }
                                                >
                                                    <div className="pt-4">
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

                                                {/* TAB 3: ASSIGNMENTS (Beautiful Version) */}
                                                <Tab
                                                    key="assignments"
                                                    title={
                                                        <div className="flex items-center gap-2">
                                                            <Users size={16} />
                                                            <span>
                                                                Assignments
                                                            </span>
                                                        </div>
                                                    }
                                                >
                                                    <div className="flex flex-col gap-6 py-4">
                                                        {hasPermission(
                                                            APP_PERMISSIONS.JOB
                                                                .READ_SENSITIVE
                                                        ) && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <HeroCard className="bg-primary/5 border-primary/20 shadow-none">
                                                                    <HeroCardBody className="flex-row items-center gap-4 p-4">
                                                                        <div className="p-2.5 bg-primary rounded-xl text-white">
                                                                            <Wallet
                                                                                size={
                                                                                    20
                                                                                }
                                                                            />
                                                                        </div>
                                                                        <div className="flex flex-col flex-1">
                                                                            <span className="text-[10px] uppercase font-black text-primary/60">
                                                                                Total
                                                                                Staff
                                                                                Payout
                                                                            </span>
                                                                            <span className="text-xl font-black text-primary">
                                                                                {currencyFormatter(
                                                                                    job.totalStaffCost ||
                                                                                        0,
                                                                                    'Vietnamese'
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                        {hasSomePermissions(
                                                                            [
                                                                                APP_PERMISSIONS
                                                                                    .JOB
                                                                                    .PAID,
                                                                                APP_PERMISSIONS
                                                                                    .JOB
                                                                                    .READ_SENSITIVE,
                                                                                APP_PERMISSIONS
                                                                                    .JOB
                                                                                    .UPDATE,
                                                                            ]
                                                                        ) && (
                                                                            <Button
                                                                                size="sm"
                                                                                color="primary"
                                                                                variant="flat"
                                                                                onPress={
                                                                                    financialModal.onOpen
                                                                                }
                                                                            >
                                                                                <Pencil
                                                                                    size={
                                                                                        14
                                                                                    }
                                                                                />
                                                                            </Button>
                                                                        )}
                                                                    </HeroCardBody>
                                                                </HeroCard>
                                                                <HeroCard className="bg-default-50 border-divider shadow-none">
                                                                    <HeroCardBody className="p-4 gap-2">
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-[10px] uppercase font-black text-default-400">
                                                                                Budget
                                                                                Usage
                                                                            </span>
                                                                            <span className="text-xs font-bold">
                                                                                {
                                                                                    budgetUsage
                                                                                }

                                                                                %
                                                                            </span>
                                                                        </div>
                                                                        <Progress
                                                                            size="sm"
                                                                            value={
                                                                                budgetUsage
                                                                            }
                                                                            color={
                                                                                budgetUsage >
                                                                                80
                                                                                    ? 'danger'
                                                                                    : 'primary'
                                                                            }
                                                                        />
                                                                    </HeroCardBody>
                                                                </HeroCard>
                                                            </div>
                                                        )}

                                                        <div className="space-y-2">
                                                            {job.assignments?.map(
                                                                (asgn) => (
                                                                    <div
                                                                        key={
                                                                            asgn.id
                                                                        }
                                                                        className="group flex items-center justify-between p-3 bg-background hover:bg-default-50 rounded-2xl border border-divider transition-all"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <Avatar
                                                                                src={optimizeCloudinary(
                                                                                    asgn
                                                                                        .user
                                                                                        .avatar
                                                                                )}
                                                                                size="sm"
                                                                                isBordered
                                                                                color="primary"
                                                                            />
                                                                            <div className="flex flex-col space-y-2">
                                                                                <span className="text-sm font-bold">
                                                                                    {
                                                                                        asgn
                                                                                            .user
                                                                                            .displayName
                                                                                    }
                                                                                </span>
                                                                                {asgn
                                                                                    .user
                                                                                    .department ? (
                                                                                    <Chip
                                                                                        style={{
                                                                                            backgroundColor: `${asgn.user.department.hexColor}30`,
                                                                                            color: asgn
                                                                                                .user
                                                                                                .department
                                                                                                .hexColor,
                                                                                        }}
                                                                                        className="border-none"
                                                                                        size="sm"
                                                                                    >
                                                                                        <div className="flex items-center gap-1">
                                                                                            <div
                                                                                                className="size-2 rounded-full"
                                                                                                style={{
                                                                                                    backgroundColor:
                                                                                                        asgn
                                                                                                            .user
                                                                                                            .department
                                                                                                            .hexColor,
                                                                                                }}
                                                                                            />
                                                                                            <span className="font-medium">
                                                                                                {
                                                                                                    asgn
                                                                                                        .user
                                                                                                        .department
                                                                                                        .displayName
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                    </Chip>
                                                                                ) : (
                                                                                    <span className="text-[10px] uppercase text-default-400 font-bold">
                                                                                        Unknown
                                                                                        Department
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="text-right">
                                                                                <p className="text-[10px] uppercase font-bold text-default-400">
                                                                                    Payout
                                                                                </p>
                                                                                <p className="text-sm font-black text-primary">
                                                                                    {hasPermission(
                                                                                        APP_PERMISSIONS
                                                                                            .JOB
                                                                                            .READ_SENSITIVE
                                                                                    )
                                                                                        ? currencyFormatter(
                                                                                              asgn.staffCost ||
                                                                                                  0,
                                                                                              'Vietnamese'
                                                                                          )
                                                                                        : '••••••'}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                        <div className="p-4 rounded-2xl bg-warning-50 border border-warning-100 flex gap-3 items-start">
                                                            <TrendingDown
                                                                className="text-warning-500 shrink-0 mt-0.5"
                                                                size={16}
                                                            />
                                                            <p className="text-tiny text-warning-700">
                                                                Staff costs are
                                                                deducted from
                                                                income. Ensure
                                                                accuracy before
                                                                marking as paid.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Tab>

                                                {/* TAB 4: COMMENTS */}
                                                <Tab
                                                    key="comments"
                                                    title={
                                                        <div className="flex items-center gap-2">
                                                            <MessageSquare
                                                                size={16}
                                                            />
                                                            <span>
                                                                Comments
                                                            </span>
                                                            <Chip
                                                                size="sm"
                                                                variant="flat"
                                                            >
                                                                {job.comments
                                                                    ?.length ||
                                                                    0}
                                                            </Chip>
                                                        </div>
                                                    }
                                                >
                                                    <div className="pt-4">
                                                        <JobCommentsView
                                                            job={job}
                                                        />
                                                    </div>
                                                </Tab>
                                            </Tabs>
                                        </div>

                                        {/* --- SIDEBAR AREA --- */}
                                        <div className="space-y-4">
                                            {/* 1. STATUS & FINANCIAL CARD (Mới: Gộp Status vào đây) */}
                                            <HeroCard className="border-divider shadow-none overflow-hidden">
                                                {/* Dải màu trạng thái chạy dọc bên trái để nhấn mạnh */}
                                                <div
                                                    className="absolute left-0 top-0 bottom-0 w-1"
                                                    style={{
                                                        backgroundColor:
                                                            job.isPaid
                                                                ? PAID_STATUS_COLOR
                                                                      .paid
                                                                      .hexColor
                                                                : PAID_STATUS_COLOR
                                                                      .unpaid
                                                                      .hexColor,
                                                    }}
                                                />

                                                <HeroCardHeader className="justify-between py-3 border-b border-divider bg-default-50/30">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="flex items-center gap-2 text-xs font-medium text-text-subdued">
                                                            Payment status
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-2 h-2 rounded-full animate-pulse"
                                                                style={{
                                                                    backgroundColor:
                                                                        job.isPaid
                                                                            ? PAID_STATUS_COLOR
                                                                                  .paid
                                                                                  .hexColor
                                                                            : PAID_STATUS_COLOR
                                                                                  .unpaid
                                                                                  .hexColor,
                                                                }}
                                                            />
                                                            <span
                                                                className="text-sm font-bold"
                                                                style={{
                                                                    color: job.isPaid
                                                                        ? PAID_STATUS_COLOR
                                                                              .paid
                                                                              .hexColor
                                                                        : PAID_STATUS_COLOR
                                                                              .unpaid
                                                                              .hexColor,
                                                                }}
                                                            >
                                                                {job.isPaid
                                                                    ? 'Paid'
                                                                    : 'Unpaid'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <PaidChip
                                                        status={
                                                            job.isPaid
                                                                ? 'paid'
                                                                : 'unpaid'
                                                        }
                                                    />
                                                </HeroCardHeader>

                                                <HeroCardBody className="text-sm space-y-4 pt-4">
                                                    {/* Financial Info */}{' '}
                                                    <PermissionGuard
                                                        permission={
                                                            APP_PERMISSIONS.JOB
                                                                .READ_SENSITIVE
                                                        }
                                                    >
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-text-subdued text-xs">
                                                                    Income cost
                                                                </span>
                                                                <span className="font-medium text-text-default">
                                                                    {currencyFormatter(
                                                                        job.incomeCost
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-primary">
                                                                <span className="text-text-subdued text-xs">
                                                                    Total staff
                                                                    cost
                                                                </span>
                                                                <span className="font-medium text-text-default">
                                                                    {currencyFormatter(
                                                                        job.totalStaffCost,
                                                                        'Vietnamese'
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <Divider />
                                                    </PermissionGuard>
                                                    <div className="flex justify-between items-center text-primary">
                                                        <span className="text-text-subdued text-xs">
                                                            Staff cost
                                                        </span>
                                                        {isAssigned ? (
                                                            <span className="font-medium text-text-default">
                                                                {currencyFormatter(
                                                                    job.staffCost,
                                                                    'Vietnamese'
                                                                )}
                                                            </span>
                                                        ) : (
                                                            <Chip
                                                                size="sm"
                                                                variant="dot"
                                                                classNames={{
                                                                    base: 'border-none bg-default-100',
                                                                    content:
                                                                        'font-bold text-[10px]',
                                                                }}
                                                            >
                                                                {'Not assigned'}
                                                            </Chip>
                                                        )}
                                                    </div>
                                                    <Divider />
                                                    {/* Account Info */}
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-text-subdued text-xs">
                                                            Payment via
                                                        </span>
                                                        <Chip
                                                            size="sm"
                                                            variant="dot"
                                                            classNames={{
                                                                base: 'border-none bg-default-100',
                                                                content:
                                                                    'font-bold text-[10px]',
                                                            }}
                                                        >
                                                            {job.paymentChannel
                                                                ?.displayName ??
                                                                'Not set'}
                                                        </Chip>
                                                    </div>
                                                </HeroCardBody>
                                            </HeroCard>

                                            {/* 2. CREATOR & TIME METADATA CARD (Dark Version) */}
                                            <HeroCard className="bg-background-muted text-text-default p-5 shadow-none relative overflow-hidden">
                                                {/* Glow effect theo màu status ở góc card */}
                                                <div
                                                    className="absolute -top-10 -right-10 w-32 h-32 opacity-50 blur-3xl rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            job.status.hexColor,
                                                    }}
                                                />

                                                <div className="flex flex-col gap-4 relative z-10">
                                                    <div className="flex items-center gap-2 text-xs font-medium text-text-subdued">
                                                        <CirclePlus size={14} />
                                                        Created By
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <Avatar
                                                            src={optimizeCloudinary(
                                                                job.createdBy
                                                                    .avatar
                                                            )}
                                                            size="md"
                                                            className="ring-2 ring-white/10"
                                                            isBordered
                                                            color="primary"
                                                        />
                                                        <div className="flex flex-col">
                                                            <p className="text-sm font-medium">
                                                                {
                                                                    job
                                                                        .createdBy
                                                                        .displayName
                                                                }
                                                            </p>
                                                            <p className="text-xs flex items-center gap-1.5 mt-0.5 text-text-subdued">
                                                                <CalendarDays
                                                                    size={12}
                                                                />
                                                                {dateFormatter(
                                                                    job.createdAt,
                                                                    {
                                                                        format: 'fullShort',
                                                                    }
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </HeroCard>

                                            {/* 3. QUICK ACTIONS / SNIPPET */}
                                            <HeroCard className="bg-default-50 border-divider p-4 shadow-none space-y-3">
                                                <span className="flex items-center gap-2 text-xs font-medium text-text-subdued">
                                                    <LinkIcon size={14} />
                                                    External Link
                                                </span>
                                                <Snippet
                                                    symbol=""
                                                    size="sm"
                                                    variant="flat"
                                                    className="bg-background text-foreground w-full border border-divider shadow-sm"
                                                >
                                                    {EXTERNAL_URLS.getJobDetailUrl(
                                                        job.no
                                                    )}
                                                </Snippet>
                                            </HeroCard>
                                        </div>
                                    </div>
                                </div>
                            </HeroDrawerBody>
                        </>
                    )}
                </HeroDrawerContent>
            </HeroDrawer>
        </>
    )
}
