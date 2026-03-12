import { createFileRoute } from '@tanstack/react-router'
import {
    Button,
    Card,
    CardBody,
    Chip,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from '@heroui/react'
import {
    Calendar as CalendarIcon,
    CreditCard,
    DollarSign,
    Download,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react'
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

export const Route = createFileRoute('/_administrator/admin/mgmt/revenue')({
    component: RevenueReports,
})

// --- Mock Data ---
const MONTHLY_DATA = [
    { month: 'Jan', income: 12500, expense: 8400 },
    { month: 'Feb', income: 15000, expense: 9100 },
    { month: 'Mar', income: 18200, expense: 10500 },
    { month: 'Apr', income: 14800, expense: 9800 },
    { month: 'May', income: 21000, expense: 12000 },
    { month: 'Jun', income: 24500, expense: 13500 },
    { month: 'Jul', income: 22100, expense: 11200 },
]

const REVENUE_BY_TYPE = [
    { name: 'Web Dev', value: 45, color: '#3B82F6' },
    { name: 'Mobile App', value: 30, color: '#8B5CF6' },
    { name: 'SEO / Marketing', value: 15, color: '#F59E0B' },
    { name: 'Maintenance', value: 10, color: '#10B981' },
]

const RECENT_TRANSACTIONS = [
    {
        id: 1,
        job: 'FV-2024',
        client: 'TechCorp',
        date: '2024-07-15',
        amount: 4500,
        status: 'Paid',
    },
    {
        id: 2,
        job: 'FV-2025',
        client: 'Amoovo',
        date: '2024-07-14',
        amount: 2800,
        status: 'Paid',
    },
    {
        id: 3,
        job: 'FV-2026',
        client: 'StartUp Inc',
        date: '2024-07-12',
        amount: 1200,
        status: 'Pending',
    },
    {
        id: 4,
        job: 'FV-2027',
        client: 'Retail Chain',
        date: '2024-07-10',
        amount: 8500,
        status: 'Paid',
    },
    {
        id: 5,
        job: 'FV-2028',
        client: 'Logistics Co',
        date: '2024-07-08',
        amount: 3100,
        status: 'Overdue',
    },
]

// --- Sub-Component: KPI Card ---
const KpiCard = ({ title, value, subValue, trend, icon: Icon, color }: any) => (
    <Card className="w-full" shadow="sm">
        <CardBody className="flex flex-row items-center justify-between p-6">
            <div>
                <p className="text-default-500 text-sm font-medium uppercase tracking-wide">
                    {title}
                </p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">
                    {value}
                </h3>
                <div
                    className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend === `up` ? `text-success` : `text-danger`}`}
                >
                    {trend === 'up' ? (
                        <TrendingUp size={14} />
                    ) : (
                        <TrendingDown size={14} />
                    )}
                    <span>{subValue} vs last month</span>
                </div>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
        </CardBody>
    </Card>
)
function RevenueReports() {
    return (
        <div className="p-8 max-w-400 mx-auto space-y-8 bg-slate-50 min-h-screen">
            {/* --- Header & Controls --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Revenue Reports
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Financial analytics overview for income, staff costs,
                        and expenses.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Mock Date Picker (HeroUI usually requires specific setup, using Select for simplicity) */}
                    <Select
                        className="w-40"
                        defaultSelectedKeys={['this_year']}
                        aria-label="Date Filter"
                        size="sm"
                    >
                        <SelectItem key="this_month">This Month</SelectItem>
                        <SelectItem key="last_quarter">Last Quarter</SelectItem>
                        <SelectItem key="this_year">This Year</SelectItem>
                    </Select>

                    <Button
                        color="primary"
                        variant="flat"
                        startContent={<Download size={16} />}
                        className="font-medium"
                        size="md"
                    >
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* --- KPI Stats Row --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard
                    title="Total Revenue"
                    value="$128,450"
                    subValue="+12.5%"
                    trend="up"
                    icon={DollarSign}
                    color="bg-blue-500"
                />
                <KpiCard
                    title="Net Profit"
                    value="$42,800"
                    subValue="+8.2%"
                    trend="up"
                    icon={Wallet}
                    color="bg-emerald-500"
                />
                <KpiCard
                    title="Staff Costs"
                    value="$65,200"
                    subValue="+2.4%"
                    trend="down"
                    icon={CreditCard}
                    color="bg-orange-500" // "down" here means costs increased (bad)
                />
                <KpiCard
                    title="Op. Expenses"
                    value="$12,300"
                    subValue="-5.0%"
                    trend="up"
                    icon={TrendingDown}
                    color="bg-purple-500" // "up" here means costs decreased (good)
                />
            </div>

            {/* --- Main Charts Row --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Income vs Expenses Chart */}
                <Card className="lg:col-span-2 p-4" shadow="sm">
                    <div className="flex justify-between items-center mb-6 px-2">
                        <h3 className="text-lg font-bold text-slate-800">
                            Financial Overview
                        </h3>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-2 text-xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>{' '}
                                Income
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="w-2 h-2 rounded-full bg-red-400"></span>{' '}
                                Expenses
                            </div>
                        </div>
                    </div>
                    <div className="h-75 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={MONTHLY_DATA}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="colorIncome"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#10B981"
                                            stopOpacity={0.2}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#10B981"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                    <linearGradient
                                        id="colorExpense"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#F87171"
                                            stopOpacity={0.2}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#F87171"
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
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                                    tickFormatter={() => '$${value/1000}k'}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow:
                                            '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    }}
                                    // formatter={(value: number) => [
                                    //     `$${value.toLocaleString()}`,
                                    //     ``,
                                    // ]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="income"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorIncome)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expense"
                                    stroke="#F87171"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorExpense)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Revenue by Type (Donut) */}
                <Card className="p-4" shadow="sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-2 px-2">
                        Revenue by Service
                    </h3>
                    <div className="h-75 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={REVENUE_BY_TYPE}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {REVENUE_BY_TYPE.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                            <span className="text-3xl font-bold text-slate-800">
                                100%
                            </span>
                            <span className="text-xs text-slate-400">
                                DISTRIBUTION
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* --- Detailed Transactions Table --- */}
            <Card className="w-full" shadow="sm">
                <CardBody className="p-0 overflow-hidden">
                    <div className="p-4 border-b border-border-default flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-800">
                            Recent Completed Jobs
                        </h3>
                        <Button size="sm" variant="light" color="primary">
                            View All
                        </Button>
                    </div>

                    <Table
                        aria-label="Recent transactions"
                        shadow="none"
                        removeWrapper
                    >
                        <TableHeader>
                            <TableColumn>JOB ID</TableColumn>
                            <TableColumn>CLIENT</TableColumn>
                            <TableColumn>DATE</TableColumn>
                            <TableColumn>STATUS</TableColumn>
                            <TableColumn align="end">AMOUNT</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {RECENT_TRANSACTIONS.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="border-b border-slate-50 hover:bg-slate-50/50"
                                >
                                    <TableCell className="font-medium text-slate-700">
                                        {row.job}
                                    </TableCell>
                                    <TableCell className="text-slate-500">
                                        {row.client}
                                    </TableCell>
                                    <TableCell className="text-slate-500 flex items-center gap-2">
                                        <CalendarIcon
                                            size={14}
                                            className="text-slate-400"
                                        />{' '}
                                        {row.date}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            size="sm"
                                            variant="flat"
                                            color={
                                                row.status === 'Paid'
                                                    ? 'success'
                                                    : row.status === 'Pending'
                                                      ? 'warning'
                                                      : 'danger'
                                            }
                                        >
                                            {row.status}
                                        </Chip>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-slate-700">
                                        ${row.amount.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        </div>
    )
}
