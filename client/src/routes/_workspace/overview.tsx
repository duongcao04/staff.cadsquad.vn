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
    ListChecks,
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
        meta: [{ title: getPageTitle('Overview') }],
    }),
    component: OverviewPage,
})

const TIME_RANGES = [
    { key: '7d', label: 'Last 7 Days' },
    { key: '30d', label: 'Last 30 Days' },
    { key: '90d', label: 'Last 3 Months' },
    { key: 'ytd', label: 'Year to Date' },
]

function OverviewPage() {
    const { profile } = useProfile()
    const [selectedRange, setSelectedRange] = useState('30d')

    const { data: overview } = useSuspenseQuery(
        profileOverviewOptions(selectedRange as any)
    )

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* --- Header & Profile Context --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="flex items-center gap-4">
                    <Avatar
                        src={optimizeCloudinary(profile.avatar, {
                            width: 256,
                            height: 256,
                        })}
                        className="w-20 h-20 border-4 border-white shadow-xl"
                    />
                    <div>
                        <h1 className="text-3xl font-bold">
                            {profile.displayName}
                        </h1>
                        <div className="flex items-center gap-2 text-default-500 mt-1">
                            <Briefcase size={16} />
                            <span className="font-bold text-sm">
                                {profile.department?.displayName || 'Staff'}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-default-300"></span>
                            <span className="text-xs italic">
                                Joined {dateFormatter(profile.createdAt)}
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
                    >
                        {TIME_RANGES.map((range) => (
                            <Tab key={range.key} title={range.label} />
                        ))}
                    </Tabs>
                    <Button isIconOnly variant="flat">
                        <Download size={18} className="text-default-500" />
                    </Button>
                </div>
            </div>

            {/* --- KPI Grid --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Earnings"
                    value={overview.stats.totalEarnings}
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

            {/* --- Financial Performance Section --- */}
            <Card className="shadow-sm border border-divider">
                <CardHeader className="px-6 py-4 border-b border-divider flex justify-between items-center">
                    <div>
                        <h3 className="font-black text-lg uppercase tracking-tighter">
                            Financial Performance
                        </h3>
                        <p className="text-xs text-default-400">
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

            {/* --- Daily Activity & Efficiency Row --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Daily Task Activity (Bar Chart) */}
                <Card className="shadow-sm border border-divider">
                    <CardHeader className="px-6 py-4 flex justify-between items-center">
                        <h3 className="font-black text-lg uppercase tracking-tighter">
                            Daily Task Activity
                        </h3>
                        <Chip size="sm" variant="flat" color="primary">
                            Last 7 Days
                        </Chip>
                    </CardHeader>
                    <CardBody className="p-6 pt-0">
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

                {/* 2. Efficiency Metrics (Progress Bars) */}
                <Card className="shadow-sm border border-divider">
                    <CardHeader className="px-6 py-4">
                        <h3 className="font-black text-lg uppercase tracking-tighter">
                            Efficiency Metrics
                        </h3>
                    </CardHeader>
                    <CardBody className="p-6 space-y-8">
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

export default OverviewPage
