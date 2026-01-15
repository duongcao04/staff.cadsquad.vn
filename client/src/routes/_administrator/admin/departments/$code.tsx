import {
    Avatar,
    Button,
    Card,
    CardBody,
    Chip,
    Progress,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tabs,
    User,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
    Briefcase,
    Calendar,
    Clock,
    DollarSign,
    MoreHorizontal,
    Plus,
    Users,
} from 'lucide-react'
import { useState } from 'react'

import { INTERNAL_URLS, optimizeCloudinary } from '@/lib'
import { departmentOptions } from '@/lib/queries'
import { HeroBreadcrumbItem, HeroBreadcrumbs } from '@/shared/components'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'

// --- Mock Data (Replace with API calls) ---
const DEPT_INFO = {
    id: 'd1',
    displayName: 'Design Team',
    hexColor: '#8B5CF6', // Violet
    manager: {
        name: 'Sarah Wilson',
        avatar: 'https://i.pravatar.cc/150?u=sarah',
    },
    description: 'Responsible for UI/UX, branding, and graphic design assets.',
    stats: {
        members: 8,
        activeJobs: 12,
        revenueThisMonth: 15400,
        capacity: 75, // 75% busy
    },
}

const TEAM_JOBS = [
    {
        id: 101,
        title: 'Website Redesign',
        client: 'TechCorp',
        due: '2 Days',
        status: 'In Progress',
        progress: 60,
    },
    {
        id: 102,
        title: 'Mobile App Assets',
        client: 'Startup Inc',
        due: 'Today',
        status: 'Urgent',
        progress: 90,
    },
    {
        id: 103,
        title: 'Branding Kit',
        client: 'Coffee Shop',
        due: '1 Week',
        status: 'Pending',
        progress: 0,
    },
]

// --- Sub-Component: Stat Card ---
const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <Card shadow="sm" className="w-full">
        <CardBody className="flex items-center gap-4 p-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
            <div>
                <p className="text-small text-text-subdued">{label}</p>
                <h4 className="text-xl font-bold text-text-center text-center">
                    {value}
                </h4>
            </div>
        </CardBody>
    </Card>
)

export const Route = createFileRoute('/_administrator/admin/departments/$code')(
    {
        loader: ({ context, params }) => {
            const { code } = params
            return context.queryClient.ensureQueryData(departmentOptions(code))
        },
        component: DepartmentDetailPage,
    }
)

function DepartmentDetailPage() {
    const { code } = Route.useParams()
    const {
        data: { department, totalMember },
    } = useSuspenseQuery({
        ...departmentOptions(code),
    })
    const [selectedTab, setSelectedTab] = useState<string>('overview')

    return (
        <>
            <HeroBreadcrumbs className="pt-5 px-7 text-xs">
                <HeroBreadcrumbItem>
                    <Link
                        to={INTERNAL_URLS.departmentsManage}
                        className="text-text-subdued!"
                    >
                        Departments
                    </Link>
                </HeroBreadcrumbItem>
                <HeroBreadcrumbItem>
                    {department.displayName}
                </HeroBreadcrumbItem>
            </HeroBreadcrumbs>

            <AdminContentContainer className="mt-4">
                {/* --- Header --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        {/* Department Icon/Logo */}
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                            style={{ backgroundColor: department.hexColor }}
                        >
                            {department.displayName.split('')[0]}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-text-default">
                                {department.displayName}
                            </h1>
                            <p className="text-text-subdued text-sm mt-1 max-w-md line-clamp-1">
                                {department.notes}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="text-right mr-4 hidden md:block">
                            <p className="text-xs text-text-default font-bold uppercase">
                                Team Lead
                            </p>
                            <p className="text-sm font-semibold text-text-subdued">
                                {DEPT_INFO.manager.name}
                            </p>
                        </div>
                        <Avatar
                            src={DEPT_INFO.manager.avatar}
                            isBordered
                            color="primary"
                        />
                        <Button
                            color="primary"
                            className="ml-4 font-semibold"
                            endContent={<Plus size={16} />}
                        >
                            Assign Job
                        </Button>
                    </div>
                </div>

                {/* --- Main Content Tabs --- */}
                <Tabs
                    aria-label="Department Sections"
                    color="primary"
                    variant="underlined"
                    classNames={{
                        tabList:
                            'gap-6 w-full relative rounded-none p-0 border-b border-divider',
                        cursor: 'w-full bg-primary',
                        tab: 'max-w-fit px-0 h-12',
                        tabContent:
                            'group-data-[selected=true]:text-primary font-medium',
                    }}
                    selectedKey={selectedTab}
                    onSelectionChange={(key) => setSelectedTab(key.toString())}
                >
                    {/* === TAB 1: OVERVIEW === */}
                    <Tab key="overview" title="Overview">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                            <StatCard
                                icon={Users}
                                label="Total Members"
                                value={totalMember}
                                color="bg-blue-500 text-blue-500"
                            />
                            <StatCard
                                icon={Briefcase}
                                label="Active Jobs"
                                value={DEPT_INFO.stats.activeJobs}
                                color="bg-purple-500 text-purple-500"
                            />
                            <StatCard
                                icon={DollarSign}
                                label="Monthly Revenue"
                                value={
                                    '$${DEPT_INFO.stats.revenueThisMonth.toLocaleString()}'
                                }
                                color="bg-emerald-500 text-emerald-500"
                            />

                            {/* Capacity Card */}
                            <Card shadow="sm" className="w-full">
                                <CardBody className="p-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-small text-text-default">
                                            Team Capacity
                                        </span>
                                        <span className="text-small font-bold">
                                            {DEPT_INFO.stats.capacity}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={DEPT_INFO.stats.capacity}
                                        color={
                                            DEPT_INFO.stats.capacity > 80
                                                ? 'danger'
                                                : 'success'
                                        }
                                        className="max-w-md"
                                    />
                                    <p className="text-[10px] text-default-400 mt-2">
                                        High load. Consider delaying new tasks.
                                    </p>
                                </CardBody>
                            </Card>
                        </div>

                        {/* Recent Activity / Jobs */}
                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-text-default mb-4">
                                Active Projects
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {TEAM_JOBS.map((job) => (
                                    <Card
                                        key={job.id}
                                        shadow="sm"
                                        className="hover:shadow-md transition-shadow cursor-pointer"
                                    >
                                        <CardBody className="p-5">
                                            <div className="flex justify-between items-start mb-4">
                                                <Chip
                                                    size="sm"
                                                    variant="flat"
                                                    color={
                                                        job.status === 'Urgent'
                                                            ? 'danger'
                                                            : 'primary'
                                                    }
                                                >
                                                    {job.status}
                                                </Chip>
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                >
                                                    <MoreHorizontal size={16} />
                                                </Button>
                                            </div>
                                            <h4 className="text-lg font-bold text-text-default">
                                                {job.title}
                                            </h4>
                                            <p className="text-sm text-text-subdued mb-4">
                                                {job.client}
                                            </p>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-slate-400">
                                                        Progress
                                                    </span>
                                                    <span className="font-bold text-text-subdued">
                                                        {job.progress}%
                                                    </span>
                                                </div>
                                                <Progress
                                                    size="sm"
                                                    value={job.progress}
                                                    color="primary"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2 mt-4 text-xs text-text-subdued font-medium bg-background-hovered p-2 rounded-lg">
                                                <Clock size={14} /> Due:{' '}
                                                {job.due}
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </Tab>

                    {/* === TAB 2: MEMBERS === */}
                    <Tab key="members" title="Members">
                        <Card className="mt-6">
                            <CardBody>
                                <Table
                                    aria-label="Department Members"
                                    shadow="none"
                                    removeWrapper
                                >
                                    <TableHeader>
                                        <TableColumn>MEMBER</TableColumn>
                                        <TableColumn>ROLE</TableColumn>
                                        <TableColumn>STATUS</TableColumn>
                                        <TableColumn>ACTIONS</TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {department?.users?.map((member) => (
                                            <TableRow key={member.id}>
                                                <TableCell>
                                                    <User
                                                        name={
                                                            member.displayName
                                                        }
                                                        description={`@${member.username}`}
                                                        avatarProps={{
                                                            src: optimizeCloudinary(
                                                                member.avatar,
                                                                {
                                                                    width: 256,
                                                                    height: 256,
                                                                }
                                                            ),
                                                            radius: 'lg',
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-text-subdued text-sm">
                                                        {
                                                            member.role
                                                                .displayName
                                                        }
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="sm"
                                                        variant="dot"
                                                        color={
                                                            member.isActive
                                                                ? 'success'
                                                                : 'danger'
                                                        }
                                                    >
                                                        {member.isActive
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                    >
                                                        Details
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Tab>

                    {/* === TAB 3: SCHEDULE === */}
                    <Tab key="schedule" title="Schedule">
                        <div className="mt-6 flex flex-col items-center justify-center p-12 bg-background dark:bg-background-muted rounded-2xl border border-dashed border-border-default">
                            <Calendar
                                size={48}
                                className="text-text-default mb-4"
                            />
                            <h3 className="text-lg font-bold text-text-subdued">
                                Team Calendar
                            </h3>
                            <p className="text-slate-400 text-sm">
                                View deadlines and time-off requests for the{' '}
                                {DEPT_INFO.displayName}.
                            </p>
                            <Button
                                variant="flat"
                                color="primary"
                                className="mt-4"
                            >
                                View Full Calendar
                            </Button>
                        </div>
                    </Tab>
                </Tabs>
            </AdminContentContainer>
        </>
    )
}
