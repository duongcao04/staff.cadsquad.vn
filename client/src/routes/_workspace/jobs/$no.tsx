import { JobActivityHistory } from '@/features/job-details'
import MobileJobDetailPage from '@/features/job-details/components/mobile/MobileJobDetailPage'
import JobDescriptionModal from '@/features/job-details/components/modals/JobDescriptionModal'
import JobAssigneesView from '@/features/job-details/components/views/JobAssigneesView'
import JobCommentsView from '@/features/job-details/components/views/JobCommentsView'
import { DeliverJobModal } from '@/features/job-manage'
import UpdateCostModal from '@/features/project-center/components/modals/UpdateCostModal'
import {
    ApiResponse,
    currencyFormatter,
    dateFormatter,
    EXTERNAL_URLS,
    getPageTitle,
    optimizeCloudinary,
    PAID_STATUS_COLOR,
    useProfile,
    useUpdateAttachmentsMutation,
    useUpdateJobGeneralInfoMutation,
} from '@/lib'
import { jobActivityLogsOptions, jobByNoOptions } from '@/lib/queries'
import {
    HeroButton,
    HeroCard,
    HeroCardBody,
    HeroCardHeader,
    JobStatusChip,
} from '@/shared/components'
import JobAttachmentsField from '@/shared/components/form-fields/JobAttachmentsField'
import Timmer from '@/shared/components/layouts/PageHeading/Timmer'
import CountdownTimer from '@/shared/components/ui/countdown-timer'
import HtmlReactParser from '@/shared/components/ui/html-react-parser'
import { JobStatusSystemTypeEnum } from '@/shared/enums'
import { useDevice, usePermission } from '@/shared/hooks'
import { TJob } from '@/shared/types'
import {
    Avatar,
    Button,
    Chip,
    Divider,
    Progress,
    Snippet,
    Spinner,
    Tab,
    Tabs,
    useDisclosure,
} from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import dayjs from 'dayjs'
import {
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    CirclePlus,
    Clock,
    FileText,
    LibraryBig,
    LinkIcon,
    Maximize2,
    MessageSquare,
    Pencil,
    RotateCcw,
    TrendingDown,
    TruckElectricIcon,
    UserRound,
    Users,
    Wallet,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { APP_PERMISSIONS } from '../../../lib/utils'

export enum JobDetailTabEnum {
    OVERVIEW = 'overview',
    ATTACHMENTS = 'attachments',
    ASSIGNMENTS = 'assignments',
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
        const { isSmallView } = useDevice()
        if (isSmallView) {
            return <MobileJobDetailPage />
        }
        return <JobDetailPage />
    },
})

function JobDetailPage() {
    const { no } = Route.useParams()
    const searchParams: TJobDetailSearch = Route.useSearch()
    const navigate = Route.useNavigate()
    // 1. TOP-LEVEL HOOKS
    const { isAdmin } = useProfile()

    const deliverJobDisclosure = useDisclosure()
    const financialModal = useDisclosure()
    const fullEditorDisclosure = useDisclosure()

    const { hasPermission, hasAnyPermission } = usePermission()

    const { data: job } = useQuery({
        ...jobByNoOptions(no),
        enabled: !!no,
    })

    const {
        data: activityLogs,
        refetch: refetchLogs,
        isFetching: isLogsLoading,
    } = useQuery({
        ...jobActivityLogsOptions(job?.id ?? ''),
        enabled: !!job?.id,
    })

    const handleTabChange = (key: React.Key) => {
        navigate({
            search: (prev: TJobDetailSearch) => ({
                ...prev,
                tab: key as JobDetailTabEnum,
            }),
            replace: true,
        })
    }

    const updateAttachmentsMutation = useUpdateAttachmentsMutation(
        job?.id ?? ''
    )

    const updateJobGeneralInfoMutation = useUpdateJobGeneralInfoMutation()

    const [descContent, setDescContent] = useState('')

    useEffect(() => {
        if (job?.description) setDescContent(job.description)
    }, [job?.description])

    const isJobCompleted =
        job?.status?.systemType === JobStatusSystemTypeEnum.COMPLETED

    const isJobFinished =
        job?.status?.systemType === JobStatusSystemTypeEnum.TERMINATED

    const isJobWaitReview =
        job?.status?.systemType === JobStatusSystemTypeEnum.DELIVERED

    const budgetUsage = useMemo(() => {
        if (!job?.incomeCost || job.incomeCost === 0) return 0
        return Math.min(
            Math.round(((job.totalStaffCost || 0) / job.incomeCost) * 100),
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
        // Directly pass the removed URL to the mutation
        updateAttachmentsMutation.mutateAsync({
            action: 'remove',
            files: [url],
        })
    }

    const handleAddAttachment = (url: string) => {
        updateAttachmentsMutation.mutateAsync({ action: 'add', files: [url] })
    }

    if (!job) {
        return <Spinner />
    }

    return (
        <div className="size-full">
            {/* MODALS */}
            {deliverJobDisclosure.isOpen && job && (
                <DeliverJobModal
                    isOpen={deliverJobDisclosure.isOpen}
                    onClose={deliverJobDisclosure.onClose}
                    defaultJob={job.id}
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

            {/* --- Header Area --- */}
            <div className="py-4 px-4 flex items-start justify-between bg-background/50 backdrop-blur-md sticky top-0 z-20 border-b border-divider">
                <div className="space-y-5">
                    <div className="flex items-center gap-4">
                        <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            onPress={() => navigate({ to: '..' })}
                        >
                            <ChevronLeft size={20} />
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {job.displayName}
                        </h1>
                    </div>
                    <div className="flex gap-3 text-xs text-text-subdued items-center">
                        <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                            #{job.no}
                        </span>
                        <Divider orientation="vertical" className="h-3" />
                        <div className="flex items-center gap-1.5 font-medium">
                            <UserRound size={14} />
                            {job.client?.name || 'Unknown client'}
                        </div>
                        <Divider orientation="vertical" className="h-3" />
                        <div className="flex items-center gap-1.5 font-medium">
                            <LibraryBig size={14} />
                            {job.type?.displayName}
                        </div>
                        <Divider orientation="vertical" className="h-3" />
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
                                        targetDate={dayjs(job.dueAt)}
                                        mode="text"
                                        hiddenUnits={['second']}
                                        className="font-semibold! text-text-7! dark:text-text-subdued!"
                                    />
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <Timmer />
            </div>

            {/* --- Main Content --- */}
            <div className="mt-6 max-w-7xl mx-auto h-[calc(100vh-120px)] space-y-6 px-4">
                {/* ACTION BAR */}
                <HeroCard className="bg-background dark:bg-background-hovered/50 border-border-default">
                    <HeroCardBody className="w-full flex justify-between px-8">
                        <div className="flex justify-between py-3">
                            {/* SECTION 1: CORE PROGRESS STATUS */}
                            <div className="flex flex-col gap-1">
                                {/* Status Label & Dot */}
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-2 h-2 rounded-full animate-pulse"
                                        style={{
                                            backgroundColor:
                                                job.status.hexColor,
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
                                                        color: job.status
                                                            .hexColor,
                                                    }}
                                                >
                                                    <Clock
                                                        size={12}
                                                        strokeWidth={2.3}
                                                    />
                                                    <span className="text-[11px] font-semibold leading-4">
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
                                                    Approved at
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
                                                        color: job.status
                                                            .hexColor,
                                                    }}
                                                >
                                                    <Clock
                                                        size={12}
                                                        strokeWidth={2.3}
                                                    />
                                                    <span className="text-[10px] font-semibold leading-4">
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
                                                    Waiting for payouts
                                                </span>
                                            </>
                                        ) : isJobWaitReview ? (
                                            <>
                                                <div
                                                    className="flex items-center gap-1"
                                                    style={{
                                                        color: job.status
                                                            .hexColor,
                                                    }}
                                                >
                                                    <TruckElectricIcon
                                                        size={16}
                                                        strokeWidth={2.3}
                                                    />
                                                    <span className="text-xs font-semibold leading-4">
                                                        Delivering{' '}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-text-subdued italic">
                                                    Waiting for approve
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-[11px] font-bold text-default-600">
                                                    Active Workflow
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
                                            <CheckCircle2 size={16} />
                                        }
                                        onPress={deliverJobDisclosure.onOpen}
                                    >
                                        Deliver Job
                                    </Button>
                                )}
                                {/* TODO: Issue Report */}
                                {/* <Button
                                    size="sm"
                                    variant="light"
                                    color="danger"
                                    isIconOnly
                                >
                                    <AlertCircle size={16} />
                                </Button> */}
                            </div>
                        </div>
                    </HeroCardBody>
                </HeroCard>

                <div className="my-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Tabs
                            variant="underlined"
                            color="primary"
                            selectedKey={searchParams.tab}
                            onSelectionChange={handleTabChange}
                        >
                            {/* TAB 1: OVERVIEW */}
                            <Tab
                                key={JobDetailTabEnum.OVERVIEW}
                                title={
                                    <div className="flex items-center gap-2">
                                        <FileText size={16} />
                                        <span>Overview</span>
                                    </div>
                                }
                            >
                                <div className="space-y-6">
                                    <JobAssigneesView data={job} />
                                    <HeroCard className="bg-background-muted px-0! overflow-hidden border-none shadow-none">
                                        <HeroCardHeader className="justify-between py-1 text-text-8">
                                            <span className="font-semibold text-xs tracking-wide text-text-default">
                                                Description
                                            </span>
                                            {hasPermission(
                                                APP_PERMISSIONS.JOB.UPDATE
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
                                                        <Maximize2 size={14} />
                                                    </HeroButton>
                                                </div>
                                            )}
                                        </HeroCardHeader>
                                        <HeroCardBody className="py-0! px-3 text-sm text-text-default">
                                            {job.description ? (
                                                <HtmlReactParser
                                                    htmlString={job.description}
                                                />
                                            ) : (
                                                <p className="text-default-400 italic text-center py-4">
                                                    No description provided.
                                                </p>
                                            )}
                                        </HeroCardBody>
                                    </HeroCard>

                                    <HeroCard className="bg-background-muted px-0! overflow-hidden border-none shadow-none">
                                        <HeroCardHeader className="justify-between py-1 text-text-8">
                                            <span className="font-semibold text-xs tracking-wide text-text-default">
                                                Activity History
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="light"
                                                isIconOnly
                                                onPress={() => refetchLogs()}
                                                isLoading={isLogsLoading}
                                            >
                                                <RotateCcw size={14} />
                                            </Button>
                                        </HeroCardHeader>

                                        <HeroCardBody>
                                            <JobActivityHistory
                                                logs={activityLogs}
                                            />
                                        </HeroCardBody>
                                    </HeroCard>
                                </div>
                            </Tab>

                            {/* TAB 2: ATTACHMENTS */}
                            <Tab
                                key={JobDetailTabEnum.ATTACHMENTS}
                                title={
                                    <div className="flex items-center gap-2">
                                        <LinkIcon size={16} />
                                        <span>Attachments</span>
                                        <Chip size="sm" variant="flat">
                                            {job.attachmentUrls?.length || 0}
                                        </Chip>
                                    </div>
                                }
                            >
                                <div className="pt-4">
                                    <JobAttachmentsField
                                        defaultAttachments={job.attachmentUrls}
                                        onAdd={handleAddAttachment}
                                        onRemove={handleRemoveAttachment}
                                    />
                                </div>
                            </Tab>

                            {/* TAB 3: ASSIGNMENTS (Beautiful Version) */}
                            <Tab
                                key={JobDetailTabEnum.ASSIGNMENTS}
                                title={
                                    <div className="flex items-center gap-2">
                                        <Users size={16} />
                                        <span>Assignments</span>
                                    </div>
                                }
                            >
                                <div className="flex flex-col gap-6 py-4">
                                    {hasPermission(
                                        APP_PERMISSIONS.JOB.READ_SENSITIVE
                                    ) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <HeroCard className="bg-primary/5 border-primary/20 shadow-none">
                                                <HeroCardBody className="flex-row items-center gap-4 p-4">
                                                    <div className="p-2.5 bg-primary rounded-xl text-white">
                                                        <Wallet size={20} />
                                                    </div>
                                                    <div className="flex flex-col flex-1">
                                                        <span className="text-[10px] uppercase font-black text-primary/60">
                                                            Total Staff Payout
                                                        </span>
                                                        <span className="text-xl font-black text-primary">
                                                            {currencyFormatter(
                                                                job.totalStaffCost ||
                                                                    0,
                                                                'Vietnamese'
                                                            )}
                                                        </span>
                                                    </div>
                                                    {hasAnyPermission([
                                                        APP_PERMISSIONS.JOB
                                                            .PAID,
                                                        APP_PERMISSIONS.JOB
                                                            .READ_SENSITIVE,
                                                        APP_PERMISSIONS.JOB
                                                            .UPDATE,
                                                    ]) && (
                                                        <Button
                                                            size="sm"
                                                            color="primary"
                                                            variant="flat"
                                                            onPress={
                                                                financialModal.onOpen
                                                            }
                                                        >
                                                            <Pencil size={14} />
                                                        </Button>
                                                    )}
                                                </HeroCardBody>
                                            </HeroCard>
                                            <HeroCard className="bg-default-50 border-divider shadow-none">
                                                <HeroCardBody className="p-4 gap-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] uppercase font-black text-default-400">
                                                            Budget Usage
                                                        </span>
                                                        <span className="text-xs font-bold">
                                                            {budgetUsage}%
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        size="sm"
                                                        value={budgetUsage}
                                                        color={
                                                            budgetUsage > 80
                                                                ? 'danger'
                                                                : 'primary'
                                                        }
                                                    />
                                                </HeroCardBody>
                                            </HeroCard>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        {job.assignments?.map((asgn) => (
                                            <div
                                                key={asgn.id}
                                                className="group flex items-center justify-between p-3 bg-background hover:bg-default-50 rounded-2xl border border-divider transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar
                                                        src={optimizeCloudinary(
                                                            asgn.user.avatar
                                                        )}
                                                        size="sm"
                                                        isBordered
                                                        color="primary"
                                                    />
                                                    <div className="flex flex-col space-y-2">
                                                        <span className="text-sm font-bold">
                                                            {
                                                                asgn.user
                                                                    .displayName
                                                            }
                                                        </span>
                                                        {asgn.user
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
                                                                    <span className="font-semibold">
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
                                        ))}
                                    </div>
                                    <div className="p-4 rounded-2xl bg-warning-50 border border-warning-100 flex gap-3 items-start">
                                        <TrendingDown
                                            className="text-warning-500 shrink-0 mt-0.5"
                                            size={16}
                                        />
                                        <p className="text-tiny text-warning-700">
                                            Staff costs are deducted from
                                            income. Ensure accuracy before
                                            marking as paid.
                                        </p>
                                    </div>
                                </div>
                            </Tab>

                            {/* TAB 4: COMMENTS */}
                            <Tab
                                key={JobDetailTabEnum.COMMENTS}
                                title={
                                    <div className="flex items-center gap-2">
                                        <MessageSquare size={16} />
                                        <span>Comments</span>
                                        <Chip size="sm" variant="flat">
                                            {job.comments?.length || 0}
                                        </Chip>
                                    </div>
                                }
                            >
                                <div className="pt-4 pb-20">
                                    <JobCommentsView job={job} />
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
                                    backgroundColor: job.isPaid
                                        ? PAID_STATUS_COLOR.paid.hexColor
                                        : PAID_STATUS_COLOR.unpaid.hexColor,
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
                                                backgroundColor: job.isPaid
                                                    ? PAID_STATUS_COLOR.paid
                                                          .hexColor
                                                    : PAID_STATUS_COLOR.unpaid
                                                          .hexColor,
                                            }}
                                        />
                                        <span
                                            className="text-sm font-bold"
                                            style={{
                                                color: job.isPaid
                                                    ? PAID_STATUS_COLOR.paid
                                                          .hexColor
                                                    : PAID_STATUS_COLOR.unpaid
                                                          .hexColor,
                                            }}
                                        >
                                            {job.isPaid ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </div>
                                </div>
                                <PaidChip
                                    status={job.isPaid ? 'paid' : 'unpaid'}
                                />
                            </HeroCardHeader>

                            <HeroCardBody className="text-sm space-y-4 pt-4">
                                {/* Financial Info */}
                                <div className="space-y-3">
                                    {isAdmin && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-text-subdued text-xs">
                                                Income cost
                                            </span>
                                            <span className="font-semibold text-text-default">
                                                {currencyFormatter(
                                                    job.incomeCost
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-primary">
                                        <span className="text-text-subdued text-xs">
                                            Staff cost
                                        </span>
                                        <span className="font-semibold text-text-default">
                                            {currencyFormatter(
                                                job.totalStaffCost ||
                                                    job.staffCost,
                                                'Vietnamese'
                                            )}
                                        </span>
                                    </div>
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
                                            content: 'font-bold text-[10px]',
                                        }}
                                    >
                                        {job.paymentChannel?.displayName}
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
                                    backgroundColor: job.status.hexColor,
                                }}
                            />

                            <div className="flex flex-col gap-4 relative z-10">
                                <div className="flex items-center gap-2 text-xs font-medium text-text-subdued">
                                    <CirclePlus size={14} />
                                    Created By
                                </div>

                                <div className="flex items-center gap-3">
                                    <Avatar
                                        src={job.createdBy.avatar}
                                        size="md"
                                        className="ring-2 ring-white/10"
                                        isBordered
                                        color="primary"
                                    />
                                    <div className="flex flex-col">
                                        <p className="text-sm font-semibold">
                                            {job.createdBy.displayName}
                                        </p>
                                        <p className="text-xs flex items-center gap-1.5 mt-0.5 text-text-subdued">
                                            <CalendarDays size={12} />
                                            {dateFormatter(job.createdAt, {
                                                format: 'fullShort',
                                            })}
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
                                {EXTERNAL_URLS.getJobDetailUrl(job.no)}
                            </Snippet>
                        </HeroCard>
                    </div>
                </div>
            </div>
        </div>
    )
}

const PaidChip = ({ status }: { status: 'paid' | 'unpaid' }) => (
    <Chip
        size="sm"
        variant="flat"
        classNames={{ content: 'flex items-center gap-2 font-bold' }}
    >
        <div
            className="size-2 rounded-full"
            style={{ backgroundColor: PAID_STATUS_COLOR[status].hexColor }}
        />
        <span style={{ color: PAID_STATUS_COLOR[status].hexColor }}>
            {status.toUpperCase()}
        </span>
    </Chip>
)
