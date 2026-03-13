import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_administrator/financial/')({
    component: FinancialOverview,
})
import { JobStatusChip } from '@/shared/components/chips/JobStatusChip'
import {
    Button,
    Card,
    CardBody,
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
} from '@heroui/react'
import { Link } from '@tanstack/react-router' // Update if using Next.js Link
import {
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    Banknote,
    Briefcase,
    Building2,
    Download,
    FileSpreadsheet,
    Landmark,
    Settings2,
    TrendingUp,
    Wallet,
} from 'lucide-react'
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { AdminPageHeading } from '../../../shared/components'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
    currencyFormatter,
    INTERNAL_URLS,
    jobsPendingPayoutsOptions,
} from '../../../lib'

// --- Mock Data ---
const CHART_DATA = [
    { month: 'Oct', income: 12000, cost: 4500 },
    { month: 'Nov', income: 15000, cost: 5200 },
    { month: 'Dec', income: 18000, cost: 6800 },
    { month: 'Jan', income: 14000, cost: 4100 },
    { month: 'Feb', income: 22000, cost: 7500 },
    { month: 'Mar', income: 19500, cost: 6200 },
]

const RECENT_LEDGER = [
    {
        id: '1',
        type: 'INCOME',
        amount: 2500,
        desc: 'Client: Global Real Estate',
        date: 'Today, 10:23 AM',
        status: 'COMPLETED',
    },
    {
        id: '2',
        type: 'PAYOUT',
        amount: 450,
        desc: 'Staff: Hai Duong',
        date: 'Yesterday, 4:00 PM',
        status: 'COMPLETED',
    },
    {
        id: '3',
        type: 'PAYOUT',
        amount: 150,
        desc: 'Staff: John Doe',
        date: 'Mar 11, 2026',
        status: 'COMPLETED',
    },
    {
        id: '4',
        type: 'INCOME',
        amount: 1200,
        desc: 'Client: Studio X',
        date: 'Mar 10, 2026',
        status: 'PENDING',
    },
]

export default function FinancialOverview() {
    const {
        data: { pendingPayouts },
    } = useSuspenseQuery(jobsPendingPayoutsOptions())

    const totalPayouts = pendingPayouts.reduce(
        (accumulator, currentValue) =>
            accumulator + currentValue.totalStaffCost,
        0
    )

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(val)

    return (
        <>
            <AdminPageHeading
                title={
                    <div>
                        <h1 className="text-2xl font-bold text-text-default gap-2">
                            Financial Hub
                        </h1>
                        <p className="text-sm text-text-subdued font-normal">
                            Manage cash flow, staff payouts, receivables, and
                            company profitability.
                        </p>
                    </div>
                }
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="bordered"
                            startContent={<Download size={16} />}
                        >
                            Export Report
                        </Button>
                        <Link to="/financial/receivables">
                            <Button
                                color="success"
                                className="text-white"
                                startContent={<ArrowDownRight size={16} />}
                            >
                                Record Income
                            </Button>
                        </Link>
                    </div>
                }
            />

            <div className="pt-0 max-w-7xl mx-auto space-y-6">
                {/* 2. Primary KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Net Profit (Hero Card) */}
                    <Card
                        shadow="sm"
                        className="border border-primary-200 bg-primary-50"
                    >
                        <CardBody className="p-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-primary-700">
                                        Net Profit (YTD)
                                    </p>
                                    <p className="text-2xl font-bold text-primary-900 mt-1">
                                        {formatCurrency(66200)}
                                    </p>
                                </div>
                                <div className="p-2 bg-primary-100 text-primary-700 rounded-lg">
                                    <TrendingUp size={20} />
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-primary-700 font-medium">
                                        Avg. Profit Margin
                                    </span>
                                    <span className="text-primary-900 font-bold">
                                        65.8%
                                    </span>
                                </div>
                                <Progress
                                    value={65.8}
                                    size="sm"
                                    color="primary"
                                    aria-label="Profit Margin"
                                />
                            </div>
                        </CardBody>
                    </Card>

                    {/* Gross Revenue */}
                    <Card shadow="sm" className="border border-default-200">
                        <CardBody className="p-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-default-500">
                                        Gross Revenue (YTD)
                                    </p>
                                    <p className="text-2xl font-bold text-default-900 mt-1">
                                        {formatCurrency(100500)}
                                    </p>
                                </div>
                                <div className="p-2 bg-success-100 text-success-600 rounded-lg">
                                    <Banknote size={20} />
                                </div>
                            </div>
                            <div className="flex items-center gap-1 mt-4 text-xs">
                                <span className="flex items-center text-success-600 font-semibold">
                                    <ArrowUpRight size={14} /> +12.5%
                                </span>
                                <span className="text-default-400">
                                    vs last year
                                </span>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Receivables Alert */}
                    <Card shadow="sm" className="border border-warning-200">
                        <CardBody className="p-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-default-500">
                                        Awaiting Client Payment
                                    </p>
                                    <p className="text-2xl font-bold text-warning-600 mt-1">
                                        {formatCurrency(12450)}
                                    </p>
                                </div>
                                <div className="p-2 bg-warning-100 text-warning-600 rounded-lg">
                                    <AlertCircle size={20} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-xs text-default-500">
                                    3 Invoices Overdue
                                </p>
                                <Link
                                    to="/financial/receivables"
                                    className="text-xs font-bold text-warning-600 hover:underline"
                                >
                                    Review &rarr;
                                </Link>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Payouts Alert */}
                    <Card shadow="sm" className="border border-danger-200">
                        <CardBody className="p-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-default-500">
                                        Staff Payouts Pending
                                    </p>
                                    <p className="text-2xl font-bold text-danger-600 mt-1">
                                        {currencyFormatter(
                                            totalPayouts,
                                            'Vietnamese'
                                        )}
                                    </p>
                                </div>
                                <div className="p-2 bg-danger-100 text-danger-600 rounded-lg">
                                    <Wallet size={20} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-xs text-default-500">
                                    Ready for next payrun
                                </p>
                                <Link
                                    to={INTERNAL_URLS.financial.payouts}
                                    className="text-xs font-bold text-danger-600 hover:underline"
                                >
                                    Pay Staff &rarr;
                                </Link>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* 3. Middle Section: Chart & Quick Navigation */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT: Financial Trend Chart (2/3 width) */}
                    <Card
                        shadow="sm"
                        className="border border-default-200 lg:col-span-2"
                    >
                        <CardHeader className="px-6 py-4 border-b border-divider">
                            <h2 className="text-lg font-bold text-default-900">
                                Cash Flow Trend (6 Months)
                            </h2>
                        </CardHeader>
                        <CardBody className="p-6">
                            <div className="h-70 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={CHART_DATA}
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: -20,
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
                                                    stopColor="#10b981"
                                                    stopOpacity={0.3}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="#10b981"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                            <linearGradient
                                                id="colorCost"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="#f43f5e"
                                                    stopOpacity={0.3}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="#f43f5e"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="#e5e7eb"
                                        />
                                        <XAxis
                                            dataKey="month"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fontSize: 12,
                                                fill: '#6b7280',
                                            }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fontSize: 12,
                                                fill: '#6b7280',
                                            }}
                                            tickFormatter={(value) =>
                                                `$${value / 1000}k`
                                            }
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '8px',
                                                border: '1px solid #e5e7eb',
                                                boxShadow:
                                                    '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            }}
                                            formatter={(value: number) =>
                                                formatCurrency(value)
                                            }
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="income"
                                            name="Client Income"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorIncome)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="cost"
                                            name="Staff Cost"
                                            stroke="#f43f5e"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorCost)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardBody>
                    </Card>

                    {/* RIGHT: Module Navigation (1/3 width) */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-default-900 px-1">
                            Accounting Modules
                        </h2>

                        <Link to={INTERNAL_URLS.financial.receivables} className="block">
                            <Card
                                shadow="sm"
                                isPressable
                                className="w-full border border-default-200 hover:border-success-400 transition-colors"
                            >
                                <CardBody className="flex flex-row items-center gap-4 p-4">
                                    <div className="p-3 bg-success-50 text-success-600 rounded-lg">
                                        <ArrowDownRight size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-default-900">
                                            Accounts Receivable
                                        </p>
                                        <p className="text-xs text-default-500">
                                            Record client payments & invoices
                                        </p>
                                    </div>
                                </CardBody>
                            </Card>
                        </Link>

                        <Link
                            to={INTERNAL_URLS.financial.payouts}
                            className="block"
                        >
                            <Card
                                shadow="sm"
                                isPressable
                                className="w-full border border-default-200 hover:border-danger-400 transition-colors"
                            >
                                <CardBody className="flex flex-row items-center gap-4 p-4">
                                    <div className="p-3 bg-danger-50 text-danger-600 rounded-lg">
                                        <ArrowUpRight size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-default-900">
                                            Staff Payouts
                                        </p>
                                        <p className="text-xs text-default-500">
                                            Process bulk or single payouts
                                        </p>
                                    </div>
                                </CardBody>
                            </Card>
                        </Link>

                        <Link
                            to={INTERNAL_URLS.financial.ledger}
                            className="block"
                        >
                            <Card
                                shadow="sm"
                                isPressable
                                className="w-full border border-default-200 hover:border-primary-400 transition-colors"
                            >
                                <CardBody className="flex flex-row items-center gap-4 p-4">
                                    <div className="p-3 bg-primary-50 text-primary-600 rounded-lg">
                                        <FileSpreadsheet size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-default-900">
                                            Master Ledger
                                        </p>
                                        <p className="text-xs text-default-500">
                                            View all historical transactions
                                        </p>
                                    </div>
                                </CardBody>
                            </Card>
                        </Link>

                        <Link
                            to={INTERNAL_URLS.management.paymentChannels}
                            className="block"
                        >
                            <Card
                                shadow="sm"
                                isPressable
                                className="w-full border border-default-200 hover:border-default-400 transition-colors"
                            >
                                <CardBody className="flex flex-row items-center gap-4 p-4">
                                    <div className="p-3 bg-default-100 text-default-600 rounded-lg">
                                        <Settings2 size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-default-900">
                                            Payment Channels
                                        </p>
                                        <p className="text-xs text-default-500">
                                            Manage banks, Stripe, PayPal
                                        </p>
                                    </div>
                                </CardBody>
                            </Card>
                        </Link>
                    </div>
                </div>

                {/* 4. Bottom Section: Recent Transactions Snapshot */}
                <Card shadow="sm" className="border border-default-200">
                    <div className="px-6 py-4 border-b border-divider flex justify-between items-center bg-default-50">
                        <h2 className="text-lg font-bold text-default-900 flex items-center gap-2">
                            <Briefcase size={18} className="text-default-500" />{' '}
                            Recent Activity
                        </h2>
                        <Link to="/financial/ledger">
                            <Button size="sm" variant="light" color="primary">
                                View Full Ledger &rarr;
                            </Button>
                        </Link>
                    </div>
                    <Table
                        aria-label="Recent Transactions Table"
                        removeWrapper
                        className="bg-transparent"
                    >
                        <TableHeader>
                            <TableColumn>TYPE</TableColumn>
                            <TableColumn>DESCRIPTION</TableColumn>
                            <TableColumn>DATE</TableColumn>
                            <TableColumn>STATUS</TableColumn>
                            <TableColumn align="end">AMOUNT</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {RECENT_LEDGER.map((txn) => (
                                <TableRow key={txn.id}>
                                    <TableCell>
                                        {txn.type === 'INCOME' ? (
                                            <Chip
                                                size="sm"
                                                color="success"
                                                variant="flat"
                                            >
                                                INCOME
                                            </Chip>
                                        ) : (
                                            <Chip
                                                size="sm"
                                                color="danger"
                                                variant="flat"
                                            >
                                                PAYOUT
                                            </Chip>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-semibold text-default-800">
                                            {txn.desc}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-default-500">
                                            {txn.date}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            size="sm"
                                            variant="dot"
                                            color={
                                                txn.status === 'COMPLETED'
                                                    ? 'success'
                                                    : 'warning'
                                            }
                                        >
                                            {txn.status}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`text-base font-bold ${txn.type === 'INCOME' ? 'text-success-600' : 'text-danger-600'}`}
                                        >
                                            {txn.type === 'INCOME' ? '+' : '-'}
                                            {formatCurrency(txn.amount)}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </>
    )
}
