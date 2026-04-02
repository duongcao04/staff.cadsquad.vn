import {
    GeneralDetailForm,
    JobFinancialForm,
    JobHistoryDelivery,
    JobStatusProgressCard,
    JobTeamAndFiles,
    JobTimelineCard,
} from '@/features/job-edit'
import { ConfirmCancelJobModal } from '@/features/job-manage/components/modals/ConfirmCancelJobModal'
import { ConfirmRemoveAssigneeModal } from '@/features/job-manage/components/modals/ConfirmRemoveAssigneeModal'
import AssignMemberModal from '@/features/project-center/components/modals/AssignMemberModal'
import {
    ApiResponse,
    dateFormatter,
    EXTERNAL_URLS,
    getPageTitle,
    INTERNAL_URLS,
    JobHelper,
    optimizeCloudinary,
    useProfile,
} from '@/lib'
import {
    adminReviewJobDeliverOptions,
    cancelJobOptions,
    jobActivityLogsOptions,
    jobByNoOptions,
    jobDeliveriesListOptions,
    unassignMemberToJobOptions,
} from '@/lib/queries'
import { AdminPageHeading, HeroTooltip } from '@/shared/components'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import { TJob, TUser } from '@/shared/types'
import {
    addToast,
    Avatar,
    AvatarGroup,
    BreadcrumbItem,
    Breadcrumbs,
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Divider,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Tab,
    Tabs,
    useDisclosure,
} from '@heroui/react'
import {
    useMutation,
    useQuery,
    useSuspenseQueries,
} from '@tanstack/react-query'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import {
    Briefcase,
    CalendarDays,
    ChevronLeft,
    CircleUserRound,
    Cloud,
    Copy,
    DollarSign,
    ExternalLink,
    FileText,
    Folder,
    MessageSquare,
    MoreVertical,
    Package,
    Pencil,
    Printer,
    Trash2,
    Users,
} from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { JobActivity } from '../../../../features/job-edit/components/cards/JobActivity'

export const manageJobDetailParamsSchema = z.object({
    tab: z
        .enum(['details', 'financials', 'deliveries', 'team', 'activity']) // 1. Restrict to valid tabs
        .catch('details'), // 2. If url is ?tab=garbage, fallback to 'details'
    // .default('details'), // 3. If ?tab is missing, default to 'details'
})

export type TManageJobDetailParams = z.infer<typeof manageJobDetailParamsSchema>
export const Route = createFileRoute('/_administrator/mgmt/jobs/$no')({
    head: (ctx) => {
        const loader = ctx.loaderData as unknown as ApiResponse<TJob>
        return {
            meta: [
                { title: getPageTitle(loader?.result?.displayName ?? 'Job') },
            ],
        }
    },
    validateSearch: (search) => manageJobDetailParamsSchema.parse(search),
    loaderDeps: ({ search }) => ({ search }),
    loader: ({ context, params }) => {
        const { no } = params
        return context.queryClient.ensureQueryData(jobByNoOptions(no))
    },
    component: JobEditPage,
})

function JobEditPage() {
    const router = useRouter()
    const { tab } = Route.useSearch() as TManageJobDetailParams
    const { no } = Route.useParams()
    const navigate = Route.useNavigate()

    const { data: profile } = useProfile()

    const adminDeliverJobAction = useMutation(adminReviewJobDeliverOptions)
    const cancelJobAction = useMutation(cancelJobOptions)

    const [selectedMember, setSelectedMember] = useState<TUser | null>(null)

    const [{ data: job }] = useSuspenseQueries({
        queries: [jobByNoOptions(no)],
    })

    const paymentDisplay = JobHelper.getJobPaymentStatusDisplay(
        job.paymentStatus
    )

    const { data } = useQuery({
        ...jobDeliveriesListOptions(job?.id as string),
        enabled: !!job?.id && tab === 'deliveries',
    })
    const jobDeliveries = data?.jobDeliveries ?? []

    const { data: activityLogs, isFetching: isLoadingActivityLogs } = useQuery({
        ...jobActivityLogsOptions(job?.id as string),
        enabled: !!job?.id && tab === 'activity',
    })

    const removeMemberMutation = useMutation(unassignMemberToJobOptions)

    const {
        isOpen: isAssignOpen,
        onOpen: onOpenAssignModal,
        onClose: onCloseAssignModal,
    } = useDisclosure({ id: 'AssigneeMembersModal' })
    const cancelJobModalState = useDisclosure({ id: 'ConfirmCancelJobModal' })
    const {
        isOpen: isOpenConfirmRemoveAssigneeModal,
        onOpen: onOpenConfirmRemoveAssigneeModal,
        onOpenChange: onConfirmRemoveAssigneeModalChange,
        onClose: onCloseConfirmRemoveAssigneeModal,
    } = useDisclosure({ id: 'ConfirmRemoveAssigneeModal' })

    // Default to 'deliveries' if status is REVIEW for better UX
    const [activeTab, setActiveTab] = useState(tab)

    const handleChangeTab = (newTab: string) => {
        setActiveTab(
            newTab as
                | 'details'
                | 'financials'
                | 'deliveries'
                | 'team'
                | 'activity'
        )
        navigate({
            search: (old: TManageJobDetailParams) => {
                return {
                    ...old,
                    tab: newTab,
                } as never
            },
            replace: true,
        })
    }

    const handleApprove = (deliveryId: string) => {
        adminDeliverJobAction.mutateAsync({
            deliveryId: deliveryId,
            action: 'approve',
        })
    }

    const handleReject = (deliveryId: string, feedback: string) => {
        adminDeliverJobAction.mutateAsync({
            deliveryId: deliveryId,
            action: 'reject',
            feedback,
        })
    }

    const handleRemoveMember = () => {
        if (job?.id && selectedMember) {
            removeMemberMutation.mutateAsync(
                {
                    jobId: job.id,
                    memberId: selectedMember.id,
                },
                {
                    onSuccess() {
                        onCloseConfirmRemoveAssigneeModal()
                        setSelectedMember(null)
                    },
                }
            )
        }
    }

    const handleCancelJob = () => {
        if (job.id) {
            cancelJobAction.mutateAsync(job.id, {
                onSuccess() {
                    router.navigate({
                        href: INTERNAL_URLS.management.jobs,
                    })
                    addToast({
                        title: 'Successfully',
                        description: `${job.no}- ${job.displayName} has been successfully canceled.`,
                        color: 'success',
                    })
                },
            })
        }
    }

    return (
        <div>
            {cancelJobModalState.isOpen && (
                <ConfirmCancelJobModal
                    isOpen={cancelJobModalState.isOpen}
                    onOpenChange={cancelJobModalState.onOpenChange}
                    onConfirm={handleCancelJob}
                />
            )}
            {isAssignOpen && job?.id && (
                <AssignMemberModal
                    isOpen={isAssignOpen}
                    onClose={onCloseAssignModal}
                    jobNo={job.no}
                />
            )}

            {isOpenConfirmRemoveAssigneeModal && (
                <ConfirmRemoveAssigneeModal
                    isOpen={isOpenConfirmRemoveAssigneeModal}
                    onOpenChange={onConfirmRemoveAssigneeModalChange}
                    onConfirm={handleRemoveMember}
                    isLoading={removeMemberMutation.isPending}
                    assignee={selectedMember ?? undefined}
                />
            )}

            <AdminPageHeading
                title={
                    <div className="flex items-center gap-3">
                        <Link to={INTERNAL_URLS.management.jobs}>
                            <Button
                                isIconOnly
                                variant="light"
                                className="text-text-subdued"
                            >
                                <ChevronLeft size={20} />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-medium text-text-default">
                                {job.displayName}
                            </h1>
                            <Chip color={paymentDisplay.colorName}>
                                {paymentDisplay.title}
                            </Chip>
                        </div>
                    </div>
                }
                actions={
                    <div className="flex flex-wrap items-center gap-1">
                        <HeroTooltip content="View Public Page">
                            <Button
                                variant="light"
                                isIconOnly
                                onPress={() => {
                                    if (job?.no) {
                                        window.open(
                                            EXTERNAL_URLS.getJobDetailUrl(
                                                job.no
                                            ),
                                            '_blank'
                                        )
                                    }
                                }}
                            >
                                <ExternalLink size={18} />
                            </Button>
                        </HeroTooltip>

                        <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                                <Button isIconOnly variant="light">
                                    <MoreVertical size={18} />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Quick Actions">
                                <DropdownItem
                                    key="invoice"
                                    startContent={<FileText size={16} />}
                                >
                                    Generate Invoice
                                </DropdownItem>
                                <DropdownItem
                                    key="duplicate"
                                    startContent={<Copy size={16} />}
                                >
                                    Duplicate Job
                                </DropdownItem>
                                <DropdownItem
                                    key="print"
                                    startContent={<Printer size={16} />}
                                >
                                    Print Job Sheet
                                </DropdownItem>
                                <DropdownItem
                                    key="delete"
                                    className="text-danger"
                                    color="danger"
                                    startContent={<Trash2 size={16} />}
                                >
                                    Delete Job
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                }
            />

            <AdminContentContainer className="pt-0 space-y-4">
                <Breadcrumbs className="text-xs">
                    <BreadcrumbItem>
                        <Link
                            to={INTERNAL_URLS.admin.overview}
                            className="text-text-subdued!"
                        >
                            Management
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link
                            to={INTERNAL_URLS.management.jobs}
                            className="text-text-subdued!"
                        >
                            Jobs
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>{job.no}</BreadcrumbItem>
                </Breadcrumbs>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* --- LEFT COLUMN: MAIN CONTENT --- */}
                    <div className="xl:col-span-2 space-y-6">
                        <JobStatusProgressCard job={job} />

                        <JobTimelineCard job={job} />
                        <Card
                            shadow="none"
                            className="border border-border-default rounded-xl"
                        >
                            <CardHeader className="py-0 px-4 border-b border-border-default">
                                <Tabs
                                    aria-label="Job Edit Sections"
                                    variant="underlined"
                                    color="primary"
                                    classNames={{
                                        tabList: 'p-4 gap-6',
                                        cursor: 'w-full bg-primary',
                                        tab: 'max-w-fit px-0 h-10',
                                        tabContent:
                                            'group-data-[selected=true]:text-primary text-text-subdued',
                                    }}
                                    selectedKey={activeTab}
                                    onSelectionChange={(k) =>
                                        handleChangeTab(k as string)
                                    }
                                >
                                    <Tab
                                        key="details"
                                        title={
                                            <div className="flex items-center gap-2">
                                                <Briefcase size={16} /> Details
                                            </div>
                                        }
                                    />
                                    <Tab
                                        key="financials"
                                        title={
                                            <div className="flex items-center gap-2">
                                                <DollarSign size={16} />{' '}
                                                Financials
                                            </div>
                                        }
                                    />
                                    <Tab
                                        key="deliveries"
                                        title={
                                            <div className="flex items-center gap-2">
                                                <Package size={16} /> Deliveries
                                            </div>
                                        }
                                    />
                                    <Tab
                                        key="team"
                                        title={
                                            <div className="flex items-center gap-2">
                                                <Users size={16} /> Team & Files
                                            </div>
                                        }
                                    />
                                    <Tab
                                        key="activity"
                                        title={
                                            <div className="flex items-center gap-2">
                                                <MessageSquare size={16} />{' '}
                                                Activity
                                            </div>
                                        }
                                    />
                                </Tabs>
                            </CardHeader>

                            <CardBody className="p-6 pb-8">
                                {/* --- TAB: DETAILS --- */}
                                {activeTab === 'details' && (
                                    <GeneralDetailForm job={job} />
                                )}

                                {/* --- TAB: DELIVERIES --- */}
                                {activeTab === 'deliveries' && (
                                    <JobHistoryDelivery
                                        jobDeliveries={jobDeliveries}
                                        onApprove={handleApprove}
                                        onReject={handleReject}
                                        isLoading={
                                            adminDeliverJobAction.isPending
                                        }
                                    />
                                )}

                                {/* --- TAB: FINANCIALS --- */}
                                {activeTab === 'financials' && (
                                    <JobFinancialForm job={job} />
                                )}

                                {/* --- TAB: TEAM & FILES --- */}
                                {activeTab === 'team' && (
                                    <JobTeamAndFiles
                                        job={job}
                                        onRemoveMember={() => {}}
                                    />
                                )}

                                {/* --- TAB: ACTIVITY --- */}
                                {activeTab === 'activity' && (
                                    <JobActivity
                                        profile={profile}
                                        activityLogs={activityLogs}
                                        isLoadingActivityLogs={
                                            isLoadingActivityLogs
                                        }
                                    />
                                )}
                            </CardBody>
                        </Card>
                    </div>

                    {/* --- RIGHT COLUMN: SIDEBAR --- */}
                    <div className="space-y-6">
                        <Card
                            shadow="none"
                            className="border border-border-default rounded-xl"
                        >
                            <CardHeader className="px-3 py-3 bg-background-muted flex items-center gap-2">
                                <Cloud size={16} />
                                <span className="text-sm font-bold text-text-subdued">
                                    SharePoint Directory
                                </span>
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
                                                title={
                                                    JobHelper.getSharepointDisplay(
                                                        job
                                                    ).folderName
                                                }
                                            >
                                                {
                                                    JobHelper.getSharepointDisplay(
                                                        job
                                                    ).folderName
                                                }
                                            </span>
                                            <span className="text-xs text-default-500 mt-0.5">
                                                {job?.sharepointFolder?.isFolder
                                                    ? 'Folder'
                                                    : 'File Link'}
                                            </span>
                                        </div>
                                        <HeroTooltip content="Open directory">
                                            <Button
                                                isIconOnly
                                                as="a"
                                                href={
                                                    JobHelper.getSharepointDisplay(
                                                        job
                                                    ).url
                                                }
                                                target="_blank"
                                                isDisabled={
                                                    !JobHelper.getSharepointDisplay(
                                                        job
                                                    ).url
                                                }
                                                color="primary"
                                                variant="light"
                                            >
                                                <ExternalLink size={14} />
                                            </Button>
                                        </HeroTooltip>
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
                                                                job
                                                                    .sharepointFolder
                                                                    ?.size ||
                                                                job
                                                                    .folderTemplate
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
                                            {job?.sharepointFolder
                                                ?.createdBy && (
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-default-400 tracking-wider mb-1">
                                                        Created By
                                                    </p>
                                                    <p
                                                        className="text-xs font-medium text-default-700 truncate"
                                                        title={
                                                            job.sharepointFolder
                                                                ?.createdBy ||
                                                            ''
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
                                </div>
                            </CardBody>
                        </Card>

                        {/* Metadata Grid (Creator & Modifier) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Created By Card */}
                            <Card
                                shadow="none"
                                className="border border-default-200 rounded-xl bg-white relative overflow-hidden"
                            >
                                <CardBody className="p-4 z-10 flex flex-col gap-4">
                                    {/* Header Row */}
                                    <div className="flex justify-between items-center w-full">
                                        <div className="flex items-center gap-1.5 text-default-500">
                                            <CircleUserRound size={14} />
                                            <span className="text-[11px] font-bold uppercase tracking-widest mt-0.5">
                                                Created By
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-default-400">
                                            <CalendarDays size={14} />
                                            <span className="text-xs font-medium mt-0.5">
                                                {dateFormatter(job.createdAt, {
                                                    format: 'shortDate',
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* User Row */}
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            src={optimizeCloudinary(
                                                job.createdBy?.avatar
                                            )}
                                            icon={<CircleUserRound size={20} />}
                                            className="w-10 h-10 border border-default-200 shadow-sm"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-default-900 leading-tight">
                                                {job.createdBy?.displayName ||
                                                    'System'}
                                            </span>
                                            <span className="text-xs text-default-500 mt-0.5">
                                                Creator
                                            </span>
                                        </div>
                                    </div>
                                </CardBody>
                                {/* Background Watermark */}
                                <CircleUserRound
                                    size={100}
                                    strokeWidth={1}
                                    className="absolute -right-6 -bottom-6 text-default-100 z-0 pointer-events-none"
                                />
                            </Card>

                            {/* Last Modified Card */}
                            {job.updatedAt && (
                                <Card
                                    shadow="none"
                                    className="border border-default-200 rounded-xl bg-white relative overflow-hidden"
                                >
                                    <CardBody className="p-4 z-10 flex flex-col gap-4">
                                        {/* Header Row */}
                                        <div className="flex justify-between items-center w-full">
                                            <div className="flex items-center gap-1.5 text-default-500">
                                                <Pencil size={14} />
                                                <span className="text-[11px] font-bold uppercase tracking-widest mt-0.5">
                                                    Last Modified
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-default-400">
                                                <CalendarDays size={14} />
                                                <span className="text-xs font-medium mt-0.5">
                                                    {dateFormatter(
                                                        job.updatedAt,
                                                        {
                                                            format: 'shortDate',
                                                        }
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* User Row */}
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                icon={
                                                    <Pencil
                                                        size={18}
                                                        className="text-default-400"
                                                    />
                                                }
                                                className="w-10 h-10 border border-default-200 shadow-sm bg-default-100"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-default-900 leading-tight">
                                                    {/* Thay bằng job.updatedBy?.displayName nếu có */}
                                                    System / User
                                                </span>
                                                <span className="text-xs text-default-500 mt-0.5">
                                                    System Action
                                                </span>
                                            </div>
                                        </div>
                                    </CardBody>
                                    {/* Background Watermark */}
                                    <Pencil
                                        size={85}
                                        strokeWidth={1}
                                        className="absolute -right-4 -bottom-6 text-default-100 z-0 pointer-events-none"
                                    />
                                </Card>
                            )}
                        </div>

                        {/* Quick Assign Card */}
                        <Card
                            className="w-full bg-primary-50 dark:bg-primary-50/80"
                            shadow="none"
                        >
                            <CardBody className="p-4">
                                <h4 className="font-bold text-primary mb-2 text-sm">
                                    Need help?
                                </h4>
                                <p className="text-xs text-primary-700 mb-3">
                                    Assign more team members to speed up this
                                    job.
                                </p>
                                {job?.assignments.length ? (
                                    <AvatarGroup
                                        isBordered
                                        max={4}
                                        size="sm"
                                        className="justify-start mb-3"
                                        isDisabled
                                    >
                                        {job?.assignments.map((ass) => {
                                            return (
                                                <Avatar
                                                    src={optimizeCloudinary(
                                                        ass.user.avatar
                                                    )}
                                                    classNames={{
                                                        base: 'opacity-100!',
                                                    }}
                                                />
                                            )
                                        })}
                                    </AvatarGroup>
                                ) : (
                                    <></>
                                )}
                                <Button
                                    size="sm"
                                    variant="solid"
                                    color="primary"
                                    className="w-full"
                                    onPress={onOpenAssignModal}
                                >
                                    Assign Members
                                </Button>
                            </CardBody>
                        </Card>

                        {/* Danger Zone */}
                        <Card className="w-full shadow-none border border-danger/10 bg-danger/10">
                            <CardBody className="py-4 px-0">
                                <h4 className="font-bold text-danger mb-2 text-sm px-5">
                                    Danger Zone
                                </h4>
                                <div className="px-1.5">
                                    <Button
                                        size="sm"
                                        variant="light"
                                        color="danger"
                                        className="w-full justify-start font-medium"
                                        startContent={<Trash2 size={16} />}
                                        onPress={cancelJobModalState.onOpen}
                                    >
                                        Cancel this Job
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </AdminContentContainer>
        </div>
    )
}
