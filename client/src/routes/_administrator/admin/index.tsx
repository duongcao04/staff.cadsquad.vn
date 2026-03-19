import {
    currencyFormatter,
    getDueInLabel,
    getPageTitle,
    IAdminDashboardKpis,
    IAdminDbStats,
    INTERNAL_URLS,
} from '@/lib'
import {
    Avatar,
    AvatarGroup,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Chip,
    Divider,
    Progress,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure,
    User,
} from '@heroui/react'
import { useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import {
    Activity,
    AlertOctagon,
    ArrowUpRight,
    Banknote,
    Briefcase,
    Building2,
    CheckCircle2,
    ChevronRightIcon,
    Clock,
    Cloud,
    CreditCard,
    Crown,
    Database,
    FileCheck,
    Files,
    Flame,
    HardDrive,
    Hash,
    Key,
    KeySquare,
    Landmark,
    ListTree,
    Mail,
    MessageCircle,
    MessageSquare,
    MoveRightIcon,
    Network,
    Plus,
    Server,
    Settings,
    ShieldAlert,
    ShieldCheck,
    Target,
    TrendingUp,
    UserPlus,
    Users,
    UserSquare,
    XCircle,
    Zap,
} from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { CreateJobModal } from '../../../features/job-manage'
import {
    adminDashboardDbStatsOptions,
    adminDashboardKpisOptions,
} from '../../../lib/queries/options/administrator-queries'
import {
    AdminPageHeading,
    HeroButton,
    ScrollArea,
    ScrollBar,
} from '../../../shared/components'
import AdminContentContainer from '../../../shared/components/admin/AdminContentContainer'

export const Route = createFileRoute('/_administrator/admin/')({
    head: () => ({
        meta: [
            {
                title: getPageTitle('Admin Dashboard'),
            },
        ],
    }),
    loader: ({ context }) => {
        context.queryClient.ensureQueryData(adminDashboardKpisOptions())
        context.queryClient.ensureQueryData(adminDashboardDbStatsOptions())
    },
    component: () => {
        const { isOpen, onOpen, onClose } = useDisclosure()

        const [{ data: dbStats }, { data: dbKpis }] = useSuspenseQueries({
            queries: [
                adminDashboardDbStatsOptions(),
                adminDashboardKpisOptions(),
            ],
        })

        console.log(dbStats)

        return (
            <>
                <CreateJobModal isOpen={isOpen} onClose={onClose} />
                <AdminPageHeading
                    title={
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-default-900 flex items-center gap-2">
                                    Admin Control Center
                                </h1>
                                <p className="text-sm text-default-500">
                                    System overview, business intelligence,
                                    operations, and quick administrative
                                    actions.
                                </p>
                            </div>
                        </div>
                    }
                    actions={
                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                to={INTERNAL_URLS.admin.settings}
                                className="block"
                            >
                                <HeroButton
                                    variant="flat"
                                    color="default"
                                    startContent={<Settings size={16} />}
                                >
                                    Settings
                                </HeroButton>
                            </Link>
                            <HeroButton
                                color="primary"
                                startContent={<Plus size={16} />}
                                onPress={onOpen}
                            >
                                Create Job
                            </HeroButton>
                        </div>
                    }
                />
                <AdminOverviewPage dbStats={dbStats} dbKpis={dbKpis} />
            </>
        )
    },
})

// --- Mock Data ---
const JOB_STATUS_DATA = [
    { name: 'To Do', value: 12, color: '#a1a1aa' },
    { name: 'In Progress', value: 28, color: '#006fee' },
    { name: 'Under Review', value: 8, color: '#f5a524' },
    { name: 'Completed', value: 45, color: '#17c964' },
]

const TOP_CLIENTS = [
    {
        id: 'c1',
        name: 'Global Real Estate Corp',
        revenue: 45200,
        activeJobs: 3,
        avatar: 'GR',
    },
    { id: 'c2', name: 'Studio X', revenue: 28500, activeJobs: 1, avatar: 'SX' },
    {
        id: 'c3',
        name: 'TechGadgets Inc.',
        revenue: 15400,
        activeJobs: 2,
        avatar: 'TG',
    },
]

const URGENT_JOBS = [
    {
        no: 'JOB-2026-092',
        name: 'VR Architectural Tour',
        client: 'Global Real Estate',
        dueIn: '4 hours',
        priority: 'URGENT',
    },
    {
        no: 'JOB-2026-088',
        name: 'Character Rigging v2',
        client: 'Studio X',
        dueIn: 'Tomorrow',
        priority: 'HIGH',
    },
    {
        no: 'JOB-2026-085',
        name: 'Product Explainer',
        client: 'TechGadgets Inc.',
        dueIn: '2 days',
        priority: 'HIGH',
    },
]

const RECENT_ACTIVITY_LOGS = [
    {
        id: '1',
        user: 'Admin Sarah',
        avatar: 'https://i.pravatar.cc/150?u=a',
        action: 'Created new Job',
        target: '#JOB-2026-088',
        time: '10 mins ago',
        type: 'JOB',
    },
    {
        id: '2',
        user: 'Cao Hai Duong',
        avatar: 'https://i.pravatar.cc/150?u=b',
        action: 'Delivered files for',
        target: '#JOB-2026-042',
        time: '1 hour ago',
        type: 'DELIVERY',
    },
    {
        id: '3',
        user: 'System',
        avatar: '',
        action: 'SharePoint Sync Completed',
        target: 'Folder Templates',
        time: '2 hours ago',
        type: 'SYSTEM',
    },
    {
        id: '4',
        user: 'Acct. Manager',
        avatar: 'https://i.pravatar.cc/150?u=c',
        action: 'Processed Bulk Payout',
        target: '$4,320.00',
        time: '5 hours ago',
        type: 'FINANCIAL',
    },
]

const DATABASE_STATS = [
    {
        category: 'Auth & Organization',
        items: [
            { name: 'Users', count: '24', icon: <UserSquare size={16} /> },
            {
                name: 'Roles & Permissions',
                count: '128',
                icon: <Key size={16} />,
            },
            { name: 'Departments', count: '6', icon: <Network size={16} /> },
            { name: 'Job Titles', count: '14', icon: <Users size={16} /> },
        ],
    },
    {
        category: 'Core Operations',
        items: [
            { name: 'Jobs', count: '1,245', icon: <Briefcase size={16} /> },
            { name: 'Clients', count: '112', icon: <Building2 size={16} /> },
            {
                name: 'Job Deliveries',
                count: '3,402',
                icon: <FileCheck size={16} />,
            },
            {
                name: 'Activity Logs',
                count: '45.2k',
                icon: <Activity size={16} />,
            },
        ],
    },
    {
        category: 'Community & Social',
        items: [
            { name: 'Communities', count: '3', icon: <Users size={16} /> },
            { name: 'Topics', count: '18', icon: <Hash size={16} /> },
            { name: 'Posts', count: '845', icon: <MessageSquare size={16} /> },
            {
                name: 'Comments',
                count: '2,104',
                icon: <MessageCircle size={16} />,
            },
        ],
    },
    {
        category: 'Assets & Finance',
        items: [
            { name: 'File Systems', count: '12.4k', icon: <Files size={16} /> },
            {
                name: 'Folder Templates',
                count: '5',
                icon: <ListTree size={16} />,
            },
            {
                name: 'Payment Channels',
                count: '4',
                icon: <CreditCard size={16} />,
            },
            {
                name: 'Financial Txns',
                count: '890',
                icon: <Landmark size={16} />,
            },
        ],
    },
]

export default function AdminOverviewPage({
    dbStats,
    dbKpis,
}: {
    dbStats: IAdminDbStats
    dbKpis: IAdminDashboardKpis
}) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(val)

    return (
        <AdminContentContainer className="space-y-6">
            {/* 2. Top KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card
                    shadow="sm"
                    className="border border-primary-200 bg-primary-50"
                >
                    <CardBody className="p-4 flex flex-row items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-primary-700">
                                Active Jobs
                            </p>
                            <p className="text-2xl font-bold text-primary-900 mt-1">
                                {dbStats.jobs.actives}
                            </p>
                        </div>
                        <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                            <Briefcase size={20} />
                        </div>
                    </CardBody>
                    <CardFooter>
                        <div className="w-full flex justify-end">
                            <Link
                                to={INTERNAL_URLS.management.jobs}
                                className="text-right text-tiny font-semibold text-warning-700 hover:underline"
                            >
                                View all
                            </Link>
                        </div>
                    </CardFooter>
                </Card>

                <Card
                    shadow="sm"
                    className="border border-warning-200 bg-warning-50"
                >
                    <CardBody className="p-4 flex flex-row items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-warning-700">
                                Pending Review
                            </p>
                            <p className="text-2xl font-bold text-warning-900 mt-1">
                                {dbStats.jobs.pendingReviews}
                            </p>
                        </div>
                        <div className="p-2 bg-warning-100 rounded-lg text-warning-600">
                            <FileCheck size={20} />
                        </div>
                    </CardBody>
                    <CardFooter>
                        <div className="w-full flex justify-end">
                            <Link
                                to={INTERNAL_URLS.management.jobs}
                                className="text-right text-tiny font-semibold text-warning-700 hover:underline"
                            >
                                View all
                            </Link>
                        </div>
                    </CardFooter>
                </Card>

                <Card
                    shadow="sm"
                    className="border border-danger-200 bg-danger-50"
                >
                    <CardBody className="p-4 flex flex-row items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-danger-700">
                                Unpaid Invoices
                            </p>
                            <p className="text-2xl font-bold text-danger-900 mt-1">
                                {dbStats.jobs.pendingPayouts}
                            </p>
                        </div>
                        <div className="p-2 bg-danger-100 rounded-lg text-danger-600">
                            <Landmark size={20} />
                        </div>
                    </CardBody>
                    <CardFooter>
                        <div className="w-full flex justify-end">
                            <Link
                                to={INTERNAL_URLS.management.jobs}
                                className="text-right text-tiny font-semibold text-warning-700 hover:underline"
                            >
                                View all
                            </Link>
                        </div>
                    </CardFooter>
                </Card>

                <Card shadow="sm" className="border border-default-200">
                    <CardBody className="p-4 flex flex-row items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-default-600">
                                Total Clients
                            </p>
                            <p className="text-2xl font-bold text-default-900 mt-1">
                                {dbStats.clients.total}
                            </p>
                        </div>
                        <div className="p-2 bg-default-100 rounded-lg text-default-600">
                            <Building2 size={20} />
                        </div>
                    </CardBody>
                    <CardFooter>
                        <div className="w-full flex justify-end">
                            <Link
                                to={INTERNAL_URLS.management.clients}
                                className="text-right text-tiny font-semibold text-warning-700 hover:underline"
                            >
                                View all
                            </Link>
                        </div>
                    </CardFooter>
                </Card>

                <Card shadow="sm" className="border border-default-200">
                    <CardBody className="p-4 flex flex-row items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-default-600">
                                Active Staff
                            </p>
                            <p className="text-2xl font-bold text-default-900 mt-1">
                                24
                            </p>
                        </div>
                        <div className="p-2 bg-default-100 rounded-lg text-default-600">
                            <Users size={20} />
                        </div>
                    </CardBody>
                    <CardFooter>
                        <div className="w-full flex justify-end">
                            <Link
                                to={INTERNAL_URLS.management.team}
                                className="text-right text-tiny font-semibold text-warning-700 hover:underline"
                            >
                                View all
                            </Link>
                        </div>
                    </CardFooter>
                </Card>

                <Card
                    shadow="sm"
                    className="border border-success-200 bg-success-50"
                >
                    <CardBody className="p-4 flex flex-row items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-success-700">
                                Sys Health
                            </p>
                            <p className="text-sm font-bold text-success-900 mt-2">
                                100%
                            </p>
                        </div>
                        <div className="p-2 bg-success-100 rounded-lg text-success-600">
                            <Cloud size={20} />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* 3. Business Intelligence Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: Top Clients by Revenue */}
                <Card
                    shadow="sm"
                    className="border border-default-200 lg:col-span-1"
                >
                    <CardHeader className="px-6 py-4 border-b border-divider flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Crown size={18} className="text-warning-500" />
                            <h2 className="text-lg font-bold text-default-900">
                                Top Clients (YTD)
                            </h2>
                        </div>
                        <Link
                            to={INTERNAL_URLS.management.clients}
                            className="text-xs font-bold text-primary hover:underline"
                        >
                            View All
                        </Link>
                    </CardHeader>
                    <CardBody className="p-0">
                        <div className="flex flex-col">
                            {dbKpis.kpis.topClients.map((client, idx) => {
                                const totalRevenue = client.jobs.reduce(
                                    (accumulator, currentValue) => {
                                        return (
                                            accumulator +
                                            currentValue.incomeCost
                                        )
                                    },
                                    0
                                )
                                return (
                                    <div
                                        key={client.id}
                                        className={`p-4 flex items-center justify-between ${idx !== TOP_CLIENTS.length - 1 ? 'border-b border-divider' : ''} hover:bg-default-50 transition-colors`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                name={client.name}
                                                className="bg-primary-100 text-primary-700 font-bold"
                                            />
                                            <div>
                                                <p className="text-sm font-bold text-default-900">
                                                    {client?.name}
                                                </p>
                                                <p className="text-xs text-default-500">
                                                    {client?.jobs?.length}{' '}
                                                    active jobs
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-success-600">
                                                {currencyFormatter(
                                                    totalRevenue
                                                )}
                                            </p>
                                            <div className="flex items-center justify-end gap-1 text-[10px] text-success-600 mt-0.5">
                                                <TrendingUp size={10} /> +5%
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardBody>
                </Card>

                {/* MIDDLE: Monthly Target Pacing */}
                <Card
                    shadow="sm"
                    className="border border-default-200 lg:col-span-1 bg-default-50"
                >
                    <CardHeader className="px-6 py-4 border-b border-divider">
                        <div className="flex items-center gap-2">
                            <Target size={18} className="text-primary" />
                            <h2 className="text-lg font-bold text-default-900">
                                March Revenue Target
                            </h2>
                        </div>
                    </CardHeader>
                    <CardBody className="p-6 flex flex-col justify-center">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <p className="text-sm font-medium text-default-600">
                                    Current Pacing
                                </p>
                                <p className="text-3xl font-bold text-default-900">
                                    {formatCurrency(38500)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-default-500">Goal</p>
                                <p className="text-sm font-bold text-default-400">
                                    {formatCurrency(50000)}
                                </p>
                            </div>
                        </div>

                        <Progress
                            value={77}
                            color="success"
                            className="h-3"
                            showValueLabel={true}
                            aria-label="Revenue Goal"
                        />

                        <div className="mt-6 p-3 bg-white rounded-lg border border-default-200 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-2 text-sm text-default-700">
                                <Banknote size={16} className="text-success" />
                                <span>Pending Invoices</span>
                            </div>
                            <span className="font-bold text-default-900">
                                {formatCurrency(12450)}
                            </span>
                        </div>
                        <p className="text-xs text-center text-default-500 mt-3">
                            Collecting pending invoices will hit{' '}
                            <strong>101%</strong> of goal.
                        </p>
                    </CardBody>
                </Card>

                {/* RIGHT: Urgent Operations Watchlist */}
                <Card
                    shadow="sm"
                    className="border border-danger-200 lg:col-span-1"
                >
                    <CardHeader className="px-6 py-4 border-b border-danger-100 flex justify-between items-center bg-danger-50">
                        <div className="flex items-center gap-2">
                            <Flame size={18} className="text-danger" />
                            <h2 className="text-lg font-bold text-danger-900">
                                Urgent Watchlist
                            </h2>
                        </div>
                        <Chip size="sm" color="danger" variant="flat">
                            Action Required
                        </Chip>
                    </CardHeader>
                    <CardBody className="p-0">
                        <ScrollArea>
                            <ScrollBar orientation="vertical" />
                            {dbKpis.kpis.urgentJobs.map((job, idx) => {
                                const jobDueIn = getDueInLabel(
                                    job.dueAt.toString()
                                )
                                const deadline = dayjs(job.dueAt)
                                const now = dayjs()
                                // Tính chênh lệch theo giờ
                                const diffInDays = deadline.diff(
                                    now,
                                    'day',
                                    true
                                )
                                const isUgent = diffInDays > 0 && diffInDays < 2
                                return (
                                    <div
                                        key={job.no}
                                        className={`p-4 flex items-center justify-between ${idx !== URGENT_JOBS.length - 1 ? 'border-b border-divider' : ''} hover:bg-danger-50/50 transition-colors`}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-default-800">
                                                    {job.no}
                                                </span>
                                                <Chip
                                                    size="sm"
                                                    color={
                                                        isUgent
                                                            ? 'danger'
                                                            : 'warning'
                                                    }
                                                    className="h-4 text-[10px] px-1"
                                                >
                                                    {isUgent
                                                        ? 'Urgent'
                                                        : 'High'}
                                                </Chip>
                                            </div>
                                            <p className="text-sm font-semibold text-default-900 truncate max-w-45">
                                                {job.displayName}
                                            </p>
                                            <p className="text-xs text-default-500 truncate max-w-45">
                                                {job.client?.name}
                                            </p>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <div className="flex items-center gap-1 text-danger-600 bg-danger-100 px-2 py-1 rounded text-xs font-bold">
                                                <Clock size={12} />
                                                {jobDueIn}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </ScrollArea>
                    </CardBody>
                </Card>
            </div>

            {/* 4. Charts, Infrastructure & QUICK JUMP Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: Job Status Distribution */}
                <Card
                    shadow="sm"
                    className="border border-default-200 lg:col-span-1"
                >
                    <CardHeader className="px-6 py-4 border-b border-divider">
                        <h2 className="text-lg font-bold text-default-900">
                            Operations Pipeline
                        </h2>
                    </CardHeader>
                    <CardBody className="p-6 flex flex-col items-center justify-center">
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={JOB_STATUS_DATA}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {JOB_STATUS_DATA.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow:
                                                '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full mt-4">
                            {JOB_STATUS_DATA.map((item) => (
                                <div
                                    key={item.name}
                                    className="flex items-center gap-2"
                                >
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-xs font-medium text-default-600">
                                        {item.name}
                                    </span>
                                    <span className="text-xs font-bold ml-auto">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                {/* MIDDLE: Infrastructure & Storage */}
                <Card
                    shadow="sm"
                    className="border border-default-200 lg:col-span-1"
                >
                    <CardHeader className="px-6 py-4 border-b border-divider">
                        <h2 className="text-lg font-bold text-default-900">
                            Infrastructure
                        </h2>
                    </CardHeader>
                    <CardBody className="p-6 space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <HardDrive
                                        size={16}
                                        className="text-default-500"
                                    />
                                    <span className="text-sm font-semibold text-default-700">
                                        SharePoint Storage
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-default-900">
                                    45%
                                </span>
                            </div>
                            <Progress value={45} size="md" color="primary" />
                            <p className="text-xs text-default-400 mt-2">
                                450 GB used of 1 TB total
                            </p>
                        </div>
                        <Divider />
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <Activity
                                        size={16}
                                        className="text-success-500"
                                    />
                                    <span className="text-sm font-semibold text-default-700">
                                        Background Workers
                                    </span>
                                </div>
                                <Chip size="sm" color="success" variant="dot">
                                    Online
                                </Chip>
                            </div>
                            <div className="flex justify-between text-xs mt-3">
                                <span className="text-default-500">
                                    Active Jobs in Queue:
                                </span>
                                <span className="font-bold text-default-900">
                                    0
                                </span>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* RIGHT: Quick Jump / Navigation (MOVED UP FOR BETTER VISIBILITY) */}
                <Card
                    shadow="sm"
                    className="border border-primary-200 bg-primary-50 lg:col-span-1"
                >
                    <CardHeader className="px-6 py-4 border-b border-primary-100 flex justify-between items-center bg-primary-100/50">
                        <div className="flex items-center gap-2">
                            <Zap size={18} className="text-primary-600" />
                            <h2 className="text-lg font-bold text-primary-900">
                                Quick Jump
                            </h2>
                        </div>
                    </CardHeader>
                    <CardBody className="p-4 space-y-3">
                        <Link to="/mgmt/users" className="block">
                            <div className="p-3 bg-white border border-primary-100 rounded-lg hover:border-primary transition-colors flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <Users size={18} className="text-primary" />
                                    <span className="text-sm font-semibold text-default-700">
                                        User & Role Management
                                    </span>
                                </div>
                                <ArrowUpRight
                                    size={16}
                                    className="text-primary-400"
                                />
                            </div>
                        </Link>
                        <Link
                            to="/mgmt/jobs/folder-templates"
                            className="block"
                        >
                            <div className="p-3 bg-white border border-primary-100 rounded-lg hover:border-primary transition-colors flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <ListTree
                                        size={18}
                                        className="text-success"
                                    />
                                    <span className="text-sm font-semibold text-default-700">
                                        Folder Templates
                                    </span>
                                </div>
                                <ArrowUpRight
                                    size={16}
                                    className="text-primary-400"
                                />
                            </div>
                        </Link>
                        <Link to="/financial/dashboard" className="block">
                            <div className="p-3 bg-white border border-primary-100 rounded-lg hover:border-primary transition-colors flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <Landmark
                                        size={18}
                                        className="text-warning"
                                    />
                                    <span className="text-sm font-semibold text-default-700">
                                        Financial Hub
                                    </span>
                                </div>
                                <ArrowUpRight
                                    size={16}
                                    className="text-primary-400"
                                />
                            </div>
                        </Link>
                        <Link to="/settings/system" className="block">
                            <div className="p-3 bg-white border border-primary-100 rounded-lg hover:border-primary transition-colors flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <Settings
                                        size={18}
                                        className="text-default-500"
                                    />
                                    <span className="text-sm font-semibold text-default-700">
                                        System Settings
                                    </span>
                                </div>
                                <ArrowUpRight
                                    size={16}
                                    className="text-primary-400"
                                />
                            </div>
                        </Link>
                    </CardBody>
                </Card>
            </div>

            {/* 5. Community Pulse & Activity Log Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: Internal Community Pulse */}
                <Card
                    shadow="sm"
                    className="border border-default-200 lg:col-span-1"
                >
                    <CardHeader className="px-6 py-4 border-b border-divider flex justify-between items-center">
                        <h2 className="text-lg font-bold text-default-900">
                            Community Pulse
                        </h2>
                        <MessageSquare size={18} className="text-primary" />
                    </CardHeader>
                    <CardBody className="p-5 space-y-4">
                        <p className="text-sm text-default-600 mb-2">
                            Most active topics this week:
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-primary-100 text-primary rounded-md text-xs font-bold">
                                        #
                                    </div>
                                    <span className="text-sm font-medium">
                                        Design Feedback
                                    </span>
                                </div>
                                <span className="text-xs text-default-500">
                                    24 posts
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-warning-100 text-warning-700 rounded-md text-xs font-bold">
                                        #
                                    </div>
                                    <span className="text-sm font-medium">
                                        Announcements
                                    </span>
                                </div>
                                <span className="text-xs text-default-500">
                                    5 posts
                                </span>
                            </div>
                        </div>
                        <Divider />
                        <div>
                            <p className="text-xs text-default-500 mb-2">
                                Recently Active Members
                            </p>
                            <AvatarGroup isBordered max={5} size="sm">
                                <Avatar src="https://i.pravatar.cc/150?u=a" />
                                <Avatar src="https://i.pravatar.cc/150?u=b" />
                                <Avatar src="https://i.pravatar.cc/150?u=c" />
                                <Avatar src="https://i.pravatar.cc/150?u=d" />
                                <Avatar src="https://i.pravatar.cc/150?u=e" />
                                <Avatar src="https://i.pravatar.cc/150?u=f" />
                            </AvatarGroup>
                        </div>
                    </CardBody>
                </Card>

                {/* RIGHT: System Activity Log */}
                <Card
                    shadow="sm"
                    className="border border-default-200 lg:col-span-2"
                >
                    <div className="px-6 py-4 border-b border-divider flex justify-between items-center bg-default-50">
                        <h2 className="text-lg font-bold text-default-900 flex items-center gap-2">
                            <Activity size={18} className="text-default-500" />{' '}
                            System Activity Log
                        </h2>
                        <Button size="sm" variant="light" color="primary">
                            View Full Audit Log &rarr;
                        </Button>
                    </div>
                    <Table
                        aria-label="Recent Activity Table"
                        removeWrapper
                        className="bg-transparent"
                    >
                        <TableHeader>
                            <TableColumn>USER / SYSTEM</TableColumn>
                            <TableColumn>ACTION</TableColumn>
                            <TableColumn>TARGET</TableColumn>
                            <TableColumn>MODULE</TableColumn>
                            <TableColumn align="end">TIME</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {RECENT_ACTIVITY_LOGS.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        {log.avatar ? (
                                            <User
                                                name={
                                                    <span className="text-sm font-medium">
                                                        {log.user}
                                                    </span>
                                                }
                                                avatarProps={{
                                                    src: log.avatar,
                                                    size: 'sm',
                                                }}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 pl-1">
                                                <Cloud
                                                    size={16}
                                                    className="text-primary"
                                                />
                                                <span className="text-sm font-bold text-primary">
                                                    {log.user}
                                                </span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-default-600">
                                            {log.action}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-semibold text-default-900">
                                            {log.target}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            size="sm"
                                            variant="flat"
                                            color={
                                                log.type === 'SECURITY'
                                                    ? 'danger'
                                                    : log.type === 'FINANCIAL'
                                                      ? 'success'
                                                      : log.type === 'SYSTEM'
                                                        ? 'primary'
                                                        : 'default'
                                            }
                                        >
                                            {log.type}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs text-default-500 whitespace-nowrap">
                                            {log.time}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            {/* 6. Database Entities Overview */}
            <Card shadow="sm" className="border border-default-200">
                <CardHeader className="px-6 py-4 border-b border-divider bg-default-50">
                    <div className="flex items-center gap-2">
                        <Database size={18} className="text-primary" />
                        <h2 className="text-lg font-bold text-default-900">
                            System Database Overview
                        </h2>
                    </div>
                    <p className="text-sm text-default-500 ml-auto">
                        Total records across all system modules
                    </p>
                </CardHeader>
                <CardBody className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-4">
                        {DATABASE_STATS.map((group, idx) => (
                            <div key={idx} className="space-y-3">
                                <h3 className="text-xs font-bold text-default-400 uppercase tracking-wider mb-2">
                                    {group.category}
                                </h3>
                                <div className="flex flex-col gap-2">
                                    {group.items.map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between p-2.5 rounded-lg border border-transparent hover:border-default-200 hover:bg-default-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 text-default-600">
                                                <div className="text-default-400">
                                                    {item.icon}
                                                </div>
                                                <span className="text-sm font-medium">
                                                    {item.name}
                                                </span>
                                            </div>
                                            <span className="text-sm font-bold text-default-900 bg-default-100 px-2 py-0.5 rounded-md">
                                                {item.count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </AdminContentContainer>
    )
}
