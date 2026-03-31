import { KPICard } from '@/features/analysis/components/cards/KPICard'
import {
    dateFormatter,
    getPageTitle,
    optimizeCloudinary,
    useProfile,
} from '@/lib'
import { profileOverviewOptions } from '@/lib/queries'
import {
    Avatar,
    Button,
    Card,
    CardBody,
    CardHeader,
    Checkbox,
    Chip,
    Progress,
    Tab,
    Tabs,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
    AlertCircle,
    Briefcase,
    CheckCircle2,
    Clock,
    DollarSign,
    Download,
    ListChecks,
    Play,
    TrendingUp,
} from 'lucide-react'
import { useState } from 'react'
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

export const Route = createFileRoute('/_workspace/overview')({
    head: () => ({
        meta: [{ title: getPageTitle('Workspace Overview') }],
    }),
    component: OverviewPage,
})

// --- Mock Data ---
const TIME_RANGES = [
    { key: '7d', label: 'Last 7 Days' },
    { key: '30d', label: 'Last 30 Days' },
    { key: '90d', label: 'Last 3 Months' },
    { key: 'ytd', label: 'Year to Date' },
]

const TODAY_TASKS = [
    {
        id: 1,
        title: 'Fix Mobile Navigation',
        job: 'FV-2024',
        due: '2:00 PM',
        priority: 'HIGH',
    },
    {
        id: 2,
        title: 'Export Assets for Dev',
        job: 'FV-2029',
        due: '5:00 PM',
        priority: 'MEDIUM',
    },
]

export function OverviewPage() {
    const { profile } = useProfile()
    const [selectedRange, setSelectedRange] = useState('30d')

    const { data: overview } = useSuspenseQuery(
        profileOverviewOptions(selectedRange as any)
    )

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* --- 1. Combined Header & Status --- */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-background-muted p-6 rounded-2xl border border-border-default shadow-sm gap-6">
                <div className="flex items-center gap-4">
                    <Avatar
                        src={optimizeCloudinary(profile.avatar, {
                            width: 256,
                            height: 256,
                        })}
                        className="w-16 h-16 border-2 border-white shadow-md"
                    />
                    <div>
                        <h1 className="text-2xl font-bold text-text-default">
                            Welcome back, {profile.displayName}!
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 text-text-subdued mt-1">
                            <Briefcase size={16} />
                            <span className="font-semibold text-sm">
                                {profile.department?.displayName || 'Staff'}
                            </span>
                            <span className="hidden sm:inline w-1.5 h-1.5 rounded-full bg-default-300"></span>
                            <span className="text-xs">
                                Joined{' '}
                                {dateFormatter(profile.createdAt, {
                                    format: 'shortDate',
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full xl:w-auto">
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-slate-400 uppercase">
                                Current Status
                            </p>
                            <p className="text-sm font-medium text-emerald-600 flex items-center gap-1 justify-end">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Available for Work
                            </p>
                        </div>
                        <Button
                            color="primary"
                            variant="shadow"
                            startContent={
                                <Play size={16} fill="currentColor" />
                            }
                        >
                            Resume Timer (01:20:45)
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- 2. Controls & KPI Grid --- */}
            <div className="space-y-4">
                <div className="flex justify-end gap-3">
                    <Tabs
                        aria-label="Time Range"
                        selectedKey={selectedRange}
                        onSelectionChange={(k) => setSelectedRange(k as string)}
                        color="primary"
                        variant="solid"
                        size="sm"
                    >
                        {TIME_RANGES.map((range) => (
                            <Tab key={range.key} title={range.label} />
                        ))}
                    </Tabs>
                    <Button
                        isIconOnly
                        variant="flat"
                        size="sm"
                        className="h-8 w-8"
                    >
                        <Download size={16} className="text-default-500" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard
                        title="Total Earnings"
                        value={`$${overview.stats.totalEarnings}`}
                        trend="+12.5%"
                        subtext="vs last period"
                        icon={DollarSign}
                        colorClass="bg-emerald-500"
                        textColor="text-emerald-600"
                    />
                    <KPICard
                        title="Jobs Completed"
                        value={overview.stats.jobsCompleted}
                        trend="+5.2%"
                        subtext="Tasks finished"
                        icon={CheckCircle2}
                        colorClass="bg-blue-500"
                        textColor="text-blue-600"
                    />
                    <KPICard
                        title="Hours Logged"
                        value={overview.stats.hoursLogged}
                        trend="-2.4%"
                        subtext="Billable time"
                        icon={Clock}
                        colorClass="bg-purple-500"
                        textColor="text-purple-600"
                    />
                    <KPICard
                        title="Active Jobs"
                        value={overview.stats.activeJobs}
                        trend="+12.5%"
                        subtext="Currently assigned"
                        icon={Briefcase}
                        colorClass="bg-orange-500"
                        textColor="text-orange-600"
                    />
                </div>
            </div>

            {/* --- 3. Operational Split: Active Tasks & Notifications --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Work Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Priority Card */}
                    <Card className="bg-linear-to-r from-blue-600 to-indigo-700 text-white shadow-lg border-none">
                        <CardBody className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <Chip
                                        size="sm"
                                        variant="solid"
                                        className="bg-white/20 text-white mb-2 border-none"
                                    >
                                        Top Priority
                                    </Chip>
                                    <h2 className="text-2xl font-bold">
                                        E-Commerce Website Redesign
                                    </h2>
                                    <p className="opacity-80 text-sm">
                                        Client: TechCorp • Due Tomorrow
                                    </p>
                                </div>
                                <div className="text-center bg-white/10 p-3 rounded-xl backdrop-blur-md">
                                    <p className="text-xs opacity-70 uppercase font-bold">
                                        Income
                                    </p>
                                    <p className="text-xl font-bold">$400</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs opacity-80">
                                    <span>Progress</span>
                                    <span>65%</span>
                                </div>
                                <Progress
                                    value={65}
                                    size="sm"
                                    classNames={{
                                        indicator: 'bg-white',
                                        track: 'bg-white/20',
                                    }}
                                />
                            </div>
                            <div className="mt-6 flex gap-3">
                                <Button className="bg-white text-blue-700 font-bold">
                                    Continue Work
                                </Button>
                                <Button
                                    variant="bordered"
                                    className="text-white border-white/40"
                                >
                                    View Details
                                </Button>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Today's Checklist */}
                    <Card className="border border-border-default shadow-sm">
                        <CardBody className="p-6">
                            <h3 className="font-bold text-text-default mb-4 flex items-center gap-2">
                                <CheckCircle2 className="text-emerald-500" />{' '}
                                Today's Focus
                            </h3>
                            <div className="space-y-3">
                                {TODAY_TASKS.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center justify-between p-3 bg-background-muted rounded-xl border border-border-default hover:border-blue-200 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Checkbox size="lg" radius="full" />
                                            <div>
                                                <p className="font-medium text-text-default group-hover:text-blue-600 transition-colors">
                                                    {task.title}
                                                </p>
                                                <p className="text-xs text-text-subdued flex items-center gap-1">
                                                    <span className="font-mono bg-white px-1 border border-slate-200 rounded">
                                                        {task.job}
                                                    </span>{' '}
                                                    • Due {task.due}
                                                </p>
                                            </div>
                                        </div>
                                        {task.priority === 'HIGH' && (
                                            <Chip
                                                size="sm"
                                                color="danger"
                                                variant="flat"
                                                className="h-6"
                                            >
                                                High
                                            </Chip>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    variant="light"
                                    className="w-full text-slate-400 mt-2"
                                    startContent={
                                        <div className="text-xl">+</div>
                                    }
                                >
                                    Add Personal Task
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Notifications */}
                    <Card className="border border-border-default shadow-sm h-full">
                        <CardBody className="p-0 flex flex-col h-full">
                            <div className="p-4 border-b border-border-default font-bold text-text-default text-sm bg-default-50/50">
                                Recent Updates
                            </div>
                            <div className="divide-y divide-border-default flex-1 overflow-y-auto">
                                <div className="p-4 flex gap-3 hover:bg-background-hovered transition-colors cursor-pointer">
                                    <div className="mt-1">
                                        <AlertCircle
                                            size={16}
                                            className="text-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-default">
                                            <strong>Admin</strong> assigned you
                                            to{' '}
                                            <span className="text-blue-600 font-semibold">
                                                FV-2030
                                            </span>
                                            .
                                        </p>
                                        <p className="text-[10px] text-text-subdued mt-1">
                                            2 hours ago
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4 flex gap-3 hover:bg-background-hovered transition-colors cursor-pointer">
                                    <div className="mt-1">
                                        <CheckCircle2
                                            size={16}
                                            className="text-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-default">
                                            Job <strong>FV-2028</strong> was
                                            marked Paid.
                                        </p>
                                        <p className="text-[10px] text-text-subdued mt-1">
                                            Yesterday
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* --- 4. Financial Performance Chart --- */}
            <Card className="shadow-sm border border-divider">
                <CardHeader className="px-6 py-4 border-b border-divider flex justify-between items-center bg-default-50/50">
                    <div>
                        <h3 className="font-black text-lg uppercase tracking-tighter text-default-900">
                            Financial Performance
                        </h3>
                        <p className="text-xs text-default-400 mt-0.5">
                            Staff Cost (Earnings) vs Project Revenue
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>{' '}
                            Revenue
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>{' '}
                            Earnings
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="p-6">
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={overview.charts.financialPerformance}
                            >
                                <defs>
                                    <linearGradient
                                        id="colorRev"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#10B981"
                                            stopOpacity={0.1}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#10B981"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                    <linearGradient
                                        id="colorEarn"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#006FEE"
                                            stopOpacity={0.1}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#006FEE"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#f1f5f9"
                                />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    tickFormatter={(val) => `$${val}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow:
                                            '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRev)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="earnings"
                                    stroke="#006FEE"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorEarn)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardBody>
            </Card>

            {/* --- 5. Activity & Efficiency Row --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Task Activity */}
                <Card className="shadow-sm border border-divider">
                    <CardHeader className="px-6 py-4 flex justify-between items-center bg-default-50/50 border-b border-divider">
                        <h3 className="font-black text-lg uppercase tracking-tighter text-default-900">
                            Daily Task Activity
                        </h3>
                        <Chip size="sm" variant="flat" color="primary">
                            Last 7 Days
                        </Chip>
                    </CardHeader>
                    <CardBody className="p-6">
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={overview.charts.dailyActivity}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#f1f5f9"
                                    />
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: 'none',
                                        }}
                                    />
                                    <Bar
                                        dataKey="value"
                                        fill="#6366F1"
                                        radius={[6, 6, 0, 0]}
                                        barSize={30}
                                    >
                                        {overview.charts.dailyActivity.map(
                                            (entry: any, index: number) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        entry.value > 5
                                                            ? '#4F46E5'
                                                            : '#818CF8'
                                                    }
                                                />
                                            )
                                        )}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>

                {/* Efficiency Metrics */}
                <Card className="shadow-sm border border-divider">
                    <CardHeader className="px-6 py-4 bg-default-50/50 border-b border-divider">
                        <h3 className="font-black text-lg uppercase tracking-tighter text-default-900">
                            Efficiency Metrics
                        </h3>
                    </CardHeader>
                    <CardBody className="p-6 space-y-8 flex flex-col justify-center">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2
                                        size={16}
                                        className="text-success"
                                    />
                                    <span className="text-sm font-bold text-default-600">
                                        On-Time Delivery
                                    </span>
                                </div>
                                <span className="text-sm font-black text-success">
                                    {overview.efficiency.onTimeDelivery}%
                                </span>
                            </div>
                            <Progress
                                color="success"
                                size="sm"
                                value={overview.efficiency.onTimeDelivery}
                                className="h-2"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <ListChecks
                                        size={16}
                                        className="text-primary"
                                    />
                                    <span className="text-sm font-bold text-default-600">
                                        Profile Completion
                                    </span>
                                </div>
                                <span className="text-sm font-black text-primary">
                                    {overview.efficiency.profileCompletion}%
                                </span>
                            </div>
                            <Progress
                                color="primary"
                                size="sm"
                                value={overview.efficiency.profileCompletion}
                                className="h-2"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <TrendingUp
                                        size={16}
                                        className="text-warning"
                                    />
                                    <span className="text-sm font-bold text-default-600">
                                        Client Satisfaction
                                    </span>
                                </div>
                                <span className="text-sm font-black text-warning">
                                    {overview.efficiency.clientSatisfaction} /
                                    5.0
                                </span>
                            </div>
                            <Progress
                                color="warning"
                                size="sm"
                                value={
                                    (overview.efficiency.clientSatisfaction /
                                        5) *
                                    100
                                }
                                className="h-2"
                            />
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}
