import {
    Avatar,
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Progress,
    Tab,
    Tabs,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
    Briefcase,
    CheckCircle2,
    Clock,
    DollarSign,
    Download,
    TrendingDown,
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
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import {
    currencyFormatter,
    dateFormatter,
    getPageTitle,
    optimizeCloudinary,
    useProfile,
} from '../../lib'
import { profileOverviewOptions } from '../../lib/queries'

export const Route = createFileRoute('/_workspace/overview')({
    head: () => ({
        meta: [
            {
                title: getPageTitle('Overview'),
            },
        ],
    }),
    component: OverviewPage,
})

const TIME_RANGES = [
    { key: '7d', label: 'Last 7 Days' },
    { key: '30d', label: 'Last 30 Days' },
    { key: '3m', label: 'Last 3 Months' },
    { key: '1y', label: 'Year to Date' },
]

// Data for Area Chart (Financials)
const FINANCIAL_DATA = [
    { date: 'Feb 01', earnings: 120, revenue: 450 },
    { date: 'Feb 05', earnings: 200, revenue: 800 },
    { date: 'Feb 10', earnings: 150, revenue: 600 },
    { date: 'Feb 15', earnings: 300, revenue: 1200 },
    { date: 'Feb 20', earnings: 250, revenue: 950 },
    { date: 'Feb 25', earnings: 400, revenue: 1600 },
]

// Data for Pie Chart (Status)
const STATUS_DATA = [
    { name: 'Completed', value: 45, color: '#10B981' }, // Emerald
    { name: 'In Progress', value: 25, color: '#3B82F6' }, // Blue
    { name: 'Review', value: 15, color: '#F59E0B' }, // Amber
    { name: 'Overdue', value: 5, color: '#EF4444' }, // Red
]

// Data for Bar Chart (Workload)
const WORKLOAD_DATA = [
    { day: 'Mon', tasks: 4 },
    { day: 'Tue', tasks: 7 },
    { day: 'Wed', tasks: 5 },
    { day: 'Thu', tasks: 8 },
    { day: 'Fri', tasks: 6 },
    { day: 'Sat', tasks: 2 },
    { day: 'Sun', tasks: 0 },
]

function OverviewPage() {
    const { profile } = useProfile()
    const [selectedRange, setSelectedRange] = useState('30d')

    const {
        data: {
            stats: { activeJobs, hoursLogged, jobsCompleted, totalEarnings },
        },
    } = useSuspenseQuery({
        ...profileOverviewOptions(),
    })

    // --- Components ---

    const KPICard = ({
        title,
        value,
        subtext,
        trend,
        icon: Icon,
        color,
    }: any) => (
        <Card className="shadow-sm border border-border-default">
            <CardBody className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-text-default uppercase tracking-wider">
                            {title}
                        </p>
                        <h3 className="text-2xl font-bold text-text-subdued mt-1">
                            {value}
                        </h3>
                    </div>
                    <div
                        className={`p-2 rounded-xl ${color} bg-opacity-10 text-opacity-100`}
                    >
                        <Icon
                            size={20}
                            className={color.replace('bg-', 'text-')}
                        />
                    </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                    {trend === 'up' ? (
                        <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            <TrendingUp size={12} className="mr-1" /> +12.5%
                        </span>
                    ) : (
                        <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                            <TrendingDown size={12} className="mr-1" /> -2.4%
                        </span>
                    )}
                    <span className="text-xs text-slate-400">{subtext}</span>
                </div>
            </CardBody>
        </Card>
    )

    return (
        <div className="p-8 space-y-8">
            {/* --- Header & Profile Context --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="flex items-center gap-4">
                    <Avatar
                        src={optimizeCloudinary(profile.avatar, {
                            width: 256,
                            height: 256,
                        })}
                        className="w-20 h-20 text-large border-4 border-border-default shadow-md"
                    />
                    <div>
                        <h1 className="text-3xl font-bold text-text-default">
                            {profile.displayName}
                        </h1>
                        <div className="flex items-center gap-2 text-text-subdued mt-1">
                            <Briefcase size={16} />
                            <span>{profile.department?.displayName}</span>
                            <span className="w-1 h-1 rounded-full bg-text-subdued"></span>
                            <span className="text-sm">
                                Joined{' '}
                                {dateFormatter(profile.createdAt, {
                                    format: 'longDate',
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Tabs
                        aria-label="Time Range"
                        selectedKey={selectedRange}
                        onSelectionChange={(k) => setSelectedRange(k as string)}
                        color="primary"
                        variant="solid"
                        classNames={{
                            tabList:
                                'bg-background-hovered border border-border-default shadow-sm',
                        }}
                    >
                        {TIME_RANGES.map((range) => (
                            <Tab key={range.key} title={range.label} />
                        ))}
                    </Tabs>
                    <Button isIconOnly variant="flat">
                        <Download size={18} className="text-text-subdued" />
                    </Button>
                </div>
            </div>

            {/* --- KPI Grid --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Earnings"
                    value={currencyFormatter(totalEarnings, 'Vietnamese')}
                    subtext="vs last period"
                    trend="up"
                    icon={DollarSign}
                    color="bg-emerald-500" // Class workaround for dynamic color
                />
                <KPICard
                    title="Jobs Completed"
                    value={jobsCompleted}
                    subtext="Tasks finished"
                    trend="up"
                    icon={CheckCircle2}
                    color="bg-blue-500"
                />
                <KPICard
                    title="Hours Logged"
                    value={hoursLogged}
                    subtext="Billable time"
                    trend="down"
                    icon={Clock}
                    color="bg-purple-500"
                />
                <KPICard
                    title="Active Jobs"
                    value={activeJobs}
                    subtext="Currently assigned"
                    trend="up"
                    icon={Briefcase}
                    color="bg-orange-500"
                />
            </div>

            {/* --- Main Charts Section --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Financial Trend (Area Chart) */}
                <Card className="lg:col-span-2 shadow-sm border border-border-default">
                    <CardHeader className="px-6 py-4 border-b border-border-default flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-text-default text-lg">
                                Financial Performance
                            </h3>
                            <p className="text-xs text-text-subdued">
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
                        <div className="h-87.5 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={FINANCIAL_DATA}
                                    margin={{
                                        top: 10,
                                        right: 30,
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >
                                    <defs>
                                        <linearGradient
                                            id="colorRevenue"
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
                                            id="colorEarnings"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="#3B82F6"
                                                stopOpacity={0.1}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#3B82F6"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#E2E8F0"
                                    />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 12 }}
                                        tickFormatter={(val) => `$${val}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow:
                                                '0 4px 12px rgba(0,0,0,0.1)',
                                        }}
                                        itemStyle={{
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#10B981"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="earnings"
                                        stroke="#3B82F6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorEarnings)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>

                {/* 2. Job Status Distribution (Pie Chart) */}
                <Card className="shadow-sm border border-border-default">
                    <CardHeader className="px-6 py-4 border-b border-border-default flex-col items-start gap-1">
                        <h3 className="font-bold text-text-default text-lg">
                            Job Status
                        </h3>
                        <p className="text-xs text-text-subdued">
                            Distribution of assigned tasks
                        </p>
                    </CardHeader>
                    <CardBody className="p-6 flex flex-col items-center justify-center">
                        <div className="h-62.5 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={STATUS_DATA}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {STATUS_DATA.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Custom Legend */}
                        <div className="grid grid-cols-2 gap-4 w-full mt-2">
                            {STATUS_DATA.map((status) => (
                                <div
                                    key={status.name}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{
                                                backgroundColor: status.color,
                                            }}
                                        ></div>
                                        <span className="text-xs text-text-subdued font-medium">
                                            {status.name}
                                        </span>
                                    </div>
                                    <span className="text-xs font-bold text-text-default">
                                        {status.value}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* --- Secondary Metrics Row --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 3. Daily Workload (Bar Chart) */}
                <Card className="shadow-sm border border-border-default">
                    <CardBody className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-text-default">
                                Daily Task Activity
                            </h3>
                            <Chip size="sm" variant="flat" color="default">
                                Last 7 Days
                            </Chip>
                        </div>
                        <div className="h-50 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={WORKLOAD_DATA}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#E2E8F0"
                                    />
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#F1F5F9' }}
                                        contentStyle={{ borderRadius: '8px' }}
                                    />
                                    <Bar
                                        dataKey="tasks"
                                        fill="#6366F1"
                                        radius={[4, 4, 0, 0]}
                                        barSize={32}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>

                {/* 4. Efficiency Stats */}
                <Card className="shadow-sm border border-border-default">
                    <CardBody className="p-6 space-y-6">
                        <h3 className="font-bold text-text-default mb-2">
                            Efficiency Metrics
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-text-subdued">
                                        On-Time Delivery
                                    </span>
                                    <span className="text-sm font-bold text-emerald-600">
                                        92%
                                    </span>
                                </div>
                                <Progress
                                    value={92}
                                    color="success"
                                    className="h-2"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-text-subdued">
                                        Profile Completion
                                    </span>
                                    <span className="text-sm font-bold text-blue-600">
                                        85%
                                    </span>
                                </div>
                                <Progress
                                    value={85}
                                    color="primary"
                                    className="h-2"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-text-subdued">
                                        Client Satisfaction (Avg)
                                    </span>
                                    <span className="text-sm font-bold text-amber-500">
                                        4.8 / 5.0
                                    </span>
                                </div>
                                <Progress
                                    value={96}
                                    color="warning"
                                    className="h-2"
                                />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}
