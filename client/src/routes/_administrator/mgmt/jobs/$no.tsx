import { JobActivityHistory } from '@/features/job-details'
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
    EXTERNAL_URLS,
    getPageTitle,
    INTERNAL_URLS,
    optimizeCloudinary,
    useAdminDeliverJobMutation,
    useProfile,
    useRemoveMemberMutation,
} from '@/lib'
import {
    jobActivityLogsOptions,
    jobByNoOptions,
    jobDeliveriesListOptions,
} from '@/lib/queries'
import {
    AdminPageHeading,
    HeroBreadcrumbItem,
    HeroBreadcrumbs,
    HeroCard,
    HeroCardBody,
    HeroCardHeader,
    HeroTooltip,
} from '@/shared/components'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import { HeroCopyButton } from '@/shared/components/ui/hero-copy-button'
import { TJob, TUser } from '@/shared/types'
import {
    Avatar,
    AvatarGroup,
    Button,
    Chip,
    Divider,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Switch,
    Tab,
    Tabs,
    Textarea,
    useDisclosure,
} from '@heroui/react'
import { useQuery, useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useFormik } from 'formik'
import {
    Briefcase,
    ChevronLeft,
    Copy,
    DollarSign,
    Download,
    ExternalLink,
    FileText,
    MessageSquare,
    MoreVertical,
    Package,
    Paperclip,
    Printer,
    Save,
    Send,
    Trash2,
    Users,
} from 'lucide-react'
import { useState } from 'react'
import * as Yup from 'yup'
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

// --- Mock Data ---
const JOB_DATA = {
    // ... (Your existing mock data structure, keeping it identical for brevity)
    id: '1',
    no: 'FV-2024',
    title: 'E-Commerce Website Redesign',
    description:
        'Complete overhaul of the main storefront. Includes new cart logic, payment gateway integration (Stripe), and mobile responsiveness improvements.',
    clientName: 'TechCorp Industries',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    type: 'Web Development',
    incomeCost: 4500.0,
    staffCost: 1200.0,
    isPaid: false,
    isPublished: true,
    createdAt: '2024-02-01',
    dueAt: '2024-03-15',
    deliveries: [
        {
            id: 'd1',
            submittedBy: {
                name: 'Sarah Wilson',
                avatar: 'https://i.pravatar.cc/150?u=sarah',
            },
            status: 'REJECTED',
            note: 'Initial layout for home page. Please review header font sizes.',
            link: 'https://figma.com/file/xyz...',
            submittedAt: '2024-02-10 14:00',
            adminFeedback:
                'Header is too large on mobile. Please fix responsive breakpoints.',
        },
        {
            id: 'd2',
            submittedBy: {
                name: 'Sarah Wilson',
                avatar: 'https://i.pravatar.cc/150?u=sarah',
            },
            status: 'PENDING',
            note: 'Fixed mobile header issues and updated cart icon. Ready for final review.',
            link: 'https://staging.techcorp.com/v2',
            submittedAt: '2024-02-12 09:30',
            files: ['Screenshot_Mobile.png', 'Source_Code.zip'],
        },
    ],
    assignees: [
        {
            id: 'u1',
            name: 'Sarah Wilson',
            role: 'Lead Dev',
            avatar: 'https://i.pravatar.cc/150?u=sarah',
        },
        {
            id: 'u2',
            name: 'David Chen',
            role: 'Designer',
            avatar: 'https://i.pravatar.cc/150?u=david',
        },
    ],
    files: [
        { name: 'Requirements_v2.pdf', size: '2.4 MB', date: 'Feb 02, 2024' },
        { name: 'Design_Mockups.fig', size: '12 MB', date: 'Feb 05, 2024' },
    ],
    activity: [
        {
            user: 'Sarah Wilson',
            action: 'changed status to',
            target: 'In Progress',
            time: '2 days ago',
        },
        {
            user: 'Admin',
            action: 'created job',
            target: 'FV-2024',
            time: '1 week ago',
        },
    ],
}

// --- VALIDATION SCHEMA ---
const JobValidationSchema = Yup.object().shape({
    title: Yup.string()
        .required('Job title is required')
        .min(3, 'Title must be at least 3 characters'),
    clientName: Yup.string().required('Client name is required'),
    priority: Yup.string().required('Priority is required'),
    status: Yup.string().required(),
    createdAt: Yup.date().required('Start date is required'),
    dueAt: Yup.date()
        .required('Due date is required')
        .min(Yup.ref('createdAt'), "Due date can't be before start date"),
    description: Yup.string().max(1000, 'Description too long'),
    incomeCost: Yup.number()
        .typeError('Must be a number')
        .min(0, 'Cannot be negative')
        .required('Required'),
    staffCost: Yup.number()
        .typeError('Must be a number')
        .min(0, 'Cannot be negative')
        .required('Required'),
    isPaid: Yup.boolean(),
})

function JobEditPage() {
    const { tab } = Route.useSearch() as TManageJobDetailParams
    const { no } = Route.useParams()
    const navigate = Route.useNavigate()

    const { data: profile } = useProfile()

    const adminDeliverJobAction = useAdminDeliverJobMutation()
    const [selectedMember, setSelectedMember] = useState<TUser | null>(null)

    const [{ data: job }] = useSuspenseQueries({
        queries: [jobByNoOptions(no)],
    })

    const { data } = useQuery({
        ...jobDeliveriesListOptions(job?.id as string),
        enabled: !!job?.id && tab === 'deliveries',
    })
    const jobDeliveries = data?.jobDeliveries ?? []

    const { data: activityLogs, isFetching: isLoadingActivityLogs } = useQuery({
        ...jobActivityLogsOptions(job?.id as string),
        enabled: !!job?.id && tab === 'activity',
    })

    const removeMemberMutation = useRemoveMemberMutation()

    const {
        isOpen: isAssignOpen,
        onOpen: onOpenAssignModal,
        onClose: onCloseAssignModal,
    } = useDisclosure({ id: 'AssigneeMembersModal' })
    const {
        isOpen: isOpenConfirmCancelJobModal,
        onOpen: onOpenConfirmCancelJobModal,
        onOpenChange: onConfirmCancelModalChange,
    } = useDisclosure({ id: 'ConfirmCancelJobModal' })
    const {
        isOpen: isOpenConfirmRemoveAssigneeModal,
        onOpen: onOpenConfirmRemoveAssigneeModal,
        onOpenChange: onConfirmRemoveAssigneeModalChange,
        onClose: onCloseConfirmRemoveAssigneeModal,
    } = useDisclosure({ id: 'ConfirmRemoveAssigneeModal' })

    // --- FORMIK SETUP ---
    const formik = useFormik({
        initialValues: {
            // Using fetched data or defaults (ensure JOB_DATA properties exist on data)
            ...job,
            displayName: job?.displayName || '',
            clientName: job?.client?.name || '',
            incomeCost: job?.incomeCost || 0,
            staffCost: job?.staffCost || 0,
            dueAt: job?.dueAt || '',
            createdAt: job?.createdAt || '',
            description: job?.description || '',
            isPaid: job?.isPaid || false,
        },
        validationSchema: JobValidationSchema,
        onSubmit: (values) => {
            // API Call would go here
            console.log('Submitting Form:', values)
            alert('Job Saved Successfully!')
        },
    })

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
            // Bây giờ 'old' sẽ có kiểu dữ liệu chính xác thay vì 'never'
            search: (old: TManageJobDetailParams) => {
                return {
                    ...old,
                    tab: newTab,
                } as never
            },
            replace: true,
        })
    }

    // --- Action Handlers (Integrated with Formik) ---
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

    return (
        <div>
            {isOpenConfirmCancelJobModal && (
                <ConfirmCancelJobModal
                    isOpen={isOpenConfirmCancelJobModal}
                    onOpenChange={onConfirmCancelModalChange}
                    onConfirm={() => {}}
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
                            {job?.isPaid && (
                                <Chip
                                    classNames={{
                                        content:
                                            'flex items-center justify-start gap-2',
                                        base: 'bg-success-100 text-success-800',
                                    }}
                                    color="success"
                                >
                                    Payout completed
                                </Chip>
                            )}
                        </div>
                    </div>
                }
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <HeroTooltip content="View Public Page">
                            <Button
                                isIconOnly
                                variant="flat"
                                size="sm"
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
                                <ExternalLink
                                    size={18}
                                    className="text-text-subdued"
                                />
                            </Button>
                        </HeroTooltip>

                        <Dropdown>
                            <DropdownTrigger>
                                <Button
                                    variant="flat"
                                    color="primary"
                                    endContent={<MoreVertical size={16} />}
                                >
                                    Actions
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

                        <Button
                            color="primary"
                            startContent={<Save size={18} />}
                            // Trigger Formik Submit
                            onPress={() => formik.handleSubmit()}
                            isLoading={formik.isSubmitting}
                        >
                            Save Changes
                        </Button>
                    </div>
                }
            />

            <AdminContentContainer className="pt-0 space-y-4">
                <HeroBreadcrumbs className="text-xs">
                    <HeroBreadcrumbItem>
                        <Link
                            to={INTERNAL_URLS.admin.overview}
                            className="text-text-subdued!"
                        >
                            Admin
                        </Link>
                    </HeroBreadcrumbItem>
                    <HeroBreadcrumbItem>
                        <Link
                            to={INTERNAL_URLS.management.jobs}
                            className="text-text-subdued!"
                        >
                            Jobs
                        </Link>
                    </HeroBreadcrumbItem>
                    <HeroBreadcrumbItem>{job?.no}</HeroBreadcrumbItem>
                </HeroBreadcrumbs>

                <form onSubmit={formik.handleSubmit}>
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* --- LEFT COLUMN: MAIN CONTENT --- */}
                        <div className="xl:col-span-2 space-y-6">
                            <JobStatusProgressCard job={job} />

                            <JobTimelineCard job={job} />
                            {/* Main Tabs Form */}
                            <HeroCard
                                className="w-full border border-border-muted"
                                shadow="none"
                            >
                                <HeroCardHeader className="py-0 px-4 border-b border-border-default">
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
                                                    <Briefcase size={16} />{' '}
                                                    Details
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
                                                    <Package size={16} />{' '}
                                                    Deliveries
                                                </div>
                                            }
                                        />
                                        <Tab
                                            key="team"
                                            title={
                                                <div className="flex items-center gap-2">
                                                    <Users size={16} /> Team &
                                                    Files
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
                                </HeroCardHeader>

                                <HeroCardBody className="p-6 pb-8">
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
                                </HeroCardBody>
                            </HeroCard>
                        </div>

                        {/* --- RIGHT COLUMN: SIDEBAR --- */}
                        <div className="space-y-6">
                            {/* Meta Info HeroCard */}
                            <HeroCard
                                className="w-full border border-border-muted"
                                shadow="none"
                            >
                                <HeroCardHeader className="bg-background-muted border-b border-border-default px-4 py-3">
                                    <h3 className="text-sm font-bold text-text-subdued">
                                        Job Information
                                    </h3>
                                </HeroCardHeader>
                                <HeroCardBody className="p-4 space-y-4">
                                    {job?.no && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-text-subdued">
                                                Job No.
                                            </span>
                                            <div className="flex items-center justify-end gap-1">
                                                <span className="text-sm font-mono font-bold bg-background-hovered px-2 py-0.5 rounded">
                                                    {job.no}
                                                </span>
                                                <HeroCopyButton
                                                    textValue={job.no}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-text-subdued">
                                            Created
                                        </span>
                                        <span className="text-sm font-medium">
                                            {job?.createdBy.displayName}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-text-subdued">
                                            Job Type
                                        </span>
                                        <Chip
                                            size="sm"
                                            variant="flat"
                                            style={{
                                                backgroundColor: job?.type
                                                    ?.hexColor
                                                    ? job?.type?.hexColor
                                                    : 'var(--background-hovered)',
                                            }}
                                            className="text-white!"
                                        >
                                            {job?.type?.displayName}
                                        </Chip>
                                    </div>
                                    <Divider />
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-text-subdued">
                                            Published
                                        </span>
                                        <Switch
                                            size="sm"
                                            isSelected={
                                                formik.values.isPublished
                                            }
                                            onValueChange={(val) =>
                                                formik.setFieldValue(
                                                    'isPublished',
                                                    val
                                                )
                                            }
                                        />
                                    </div>
                                </HeroCardBody>
                            </HeroCard>

                            {/* Quick Assign HeroCard */}
                            <HeroCard
                                className="w-full bg-primary-50 dark:bg-primary-50/80"
                                shadow="none"
                            >
                                <HeroCardBody className="p-4">
                                    <h4 className="font-bold text-primary mb-2 text-sm">
                                        Need help?
                                    </h4>
                                    <p className="text-xs text-primary-700 mb-3">
                                        Assign more team members to speed up
                                        this job.
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
                                </HeroCardBody>
                            </HeroCard>

                            {/* Danger Zone */}
                            <HeroCard className="w-full shadow-none border border-danger/10 bg-danger/10">
                                <HeroCardBody className="p-4">
                                    <h4 className="font-bold text-danger mb-2 text-sm">
                                        Danger Zone
                                    </h4>
                                    <Button
                                        size="sm"
                                        variant="light"
                                        color="danger"
                                        className="w-full justify-start"
                                        startContent={<Trash2 size={16} />}
                                        onPress={onOpenConfirmCancelJobModal}
                                    >
                                        Delete this Job
                                    </Button>
                                </HeroCardBody>
                            </HeroCard>
                        </div>
                    </div>
                </form>
            </AdminContentContainer>
        </div>
    )
}
