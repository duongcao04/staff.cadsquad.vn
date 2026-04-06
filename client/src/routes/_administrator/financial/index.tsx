import {
    financialStatsOptions,
    ledgerTransactionsOptions,
    receivableJobsOptions,
} from '@/lib/queries'
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Progress,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from '@heroui/react'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import {
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    Banknote,
    Briefcase,
    FileSpreadsheet,
    TrendingUp,
    Wallet,
} from 'lucide-react'
import { useMemo } from 'react'
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import {
    currencyFormatter,
    EXCHANGE_RATE,
    INTERNAL_URLS,
    jobsPendingPayoutsOptions,
} from '../../../lib'
import { AdminPageHeading } from '../../../shared/components'
import AdminContentContainer from '../../../shared/components/admin/AdminContentContainer'

export const Route = createFileRoute('/_administrator/financial/')({
    component: FinancialOverview,
})
export default function FinancialOverview() {
    // --- 1. Fetch Data ---
    const { data: stats } = useQuery(financialStatsOptions())
    const {
        data: { pendingPayouts },
    } = useSuspenseQuery(jobsPendingPayoutsOptions())
    const { data: receivableJobs = [] } = useQuery(receivableJobsOptions())
    const { data: ledgerData } = useQuery(
        ledgerTransactionsOptions({ page: 1, limit: 5 })
    )

    // --- 2. Calculations ---
    const totalPendingPayoutsVnd = useMemo(
        () =>
            pendingPayouts.reduce(
                (sum, job) => sum + (job.totalStaffCost || 0),
                0
            ),
        [pendingPayouts]
    )

    const totalReceivablesUsd = useMemo(
        () =>
            receivableJobs.reduce(
                (sum, job: any) => sum + (job.financial?.remainingAmount || 0),
                0
            ),
        [receivableJobs]
    )

    const recentTransactions = ledgerData?.transactions || []

    // Map CHART_DATA từ stats nếu Backend trả về mảng history (Giả định stats.history)
    // Nếu chưa có, ta dùng tạm logic tính toán từ stats hiện tại
    const currentChartData = [
        {
            month: 'Target',
            income: (stats?.totalRevenue || 0) / EXCHANGE_RATE.USD,
            cost: (stats?.totalExpenses || 0) / EXCHANGE_RATE.USD,
        },
        // Thêm các tháng khác từ API nếu có
    ]

    return (
        <>
            <AdminPageHeading
                title="Financial Hub"
                description="Real-time cash flow, staff payouts, and profitability tracking."
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            as={Link}
                            to={INTERNAL_URLS.financial.receivables}
                            color="success"
                            startContent={
                                <ArrowDownRight
                                    size={16}
                                    className="text-white"
                                />
                            }
                        >
                            <span className="font-bold text-white">
                                Record Income
                            </span>
                        </Button>
                    </div>
                }
            />
            <AdminContentContainer className="pt-0 mx-auto space-y-6 max-w-7xl">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Net Profit */}
                    <Card
                        shadow="none"
                        className="border border-primary-200 bg-primary-50"
                    >
                        <CardBody className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-primary-700">
                                        Net Profit (MTD)
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-primary-900">
                                        {currencyFormatter(
                                            stats?.netProfit || 0,
                                            'Vietnamese'
                                        )}
                                    </p>
                                </div>
                                <div className="p-2 rounded-lg bg-primary-100 text-primary-700">
                                    <TrendingUp size={20} />
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between mb-1 text-xs">
                                    <span className="font-medium text-primary-700">
                                        Margin Status
                                    </span>
                                    <span className="font-bold text-primary-900">
                                        {stats?.cashFlowStatus === 'POSITIVE'
                                            ? 'Healthy'
                                            : 'Warning'}
                                    </span>
                                </div>
                                <Progress
                                    value={
                                        stats?.cashFlowStatus === 'POSITIVE'
                                            ? 100
                                            : 30
                                    }
                                    size="sm"
                                    color={
                                        stats?.cashFlowStatus === 'POSITIVE'
                                            ? 'success'
                                            : 'danger'
                                    }
                                />
                            </div>
                        </CardBody>
                    </Card>

                    {/* Gross Revenue */}
                    <Card
                        shadow="none"
                        className="border border-border-default"
                    >
                        <CardBody className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-default-500">
                                        Gross Revenue
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-default-900">
                                        {currencyFormatter(
                                            stats?.totalRevenue || 0,
                                            'Vietnamese'
                                        )}
                                    </p>
                                </div>
                                <div className="p-2 rounded-lg bg-success-100 text-success-600">
                                    <Banknote size={20} />
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-default-400">
                                Total incoming transactions
                            </p>
                        </CardBody>
                    </Card>

                    {/* Receivables */}
                    <Card shadow="none" className="border border-warning-200">
                        <CardBody className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-default-500">
                                        Awaiting Income
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-warning-600">
                                        {currencyFormatter(
                                            totalReceivablesUsd *
                                                EXCHANGE_RATE.USD,
                                            'Vietnamese'
                                        )}
                                    </p>
                                </div>
                                <div className="p-2 rounded-lg bg-warning-100 text-warning-600">
                                    <AlertCircle size={20} />
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-xs text-default-500">
                                    {receivableJobs.length} Invoices Pending
                                </p>
                                <Link
                                    to={INTERNAL_URLS.financial.receivables}
                                    className="text-xs font-bold text-warning-600 hover:underline"
                                >
                                    Collect &rarr;
                                </Link>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Payouts Pending */}
                    <Card shadow="sm" className="border border-danger-200">
                        <CardBody className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-default-500">
                                        Staff Payouts Debt
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-danger-600">
                                        {currencyFormatter(
                                            totalPendingPayoutsVnd,
                                            'Vietnamese'
                                        )}
                                    </p>
                                </div>
                                <div className="p-2 rounded-lg bg-danger-100 text-danger-600">
                                    <Wallet size={20} />
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-xs text-default-500">
                                    {pendingPayouts.length} Jobs to pay
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

                {/* Chart & Modules Section */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card
                        shadow="sm"
                        className="border border-default-200 lg:col-span-2"
                    >
                        <CardHeader className="px-6 py-4 border-b border-divider">
                            <h2 className="text-lg font-bold">
                                Income vs Cost Performance
                            </h2>
                        </CardHeader>
                        <CardBody className="p-6">
                            <div className="w-full h-70">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={currentChartData}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="#e5e7eb"
                                        />
                                        <XAxis
                                            dataKey="month"
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(v) =>
                                                `$${v.toLocaleString()}`
                                            }
                                        />
                                        <Tooltip
                                            formatter={(value: number) =>
                                                `$${value.toLocaleString()}`
                                            }
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="income"
                                            name="Revenue (USD)"
                                            stroke="#10b981"
                                            fill="#10b98133"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="cost"
                                            name="Expense (USD)"
                                            stroke="#f43f5e"
                                            fill="#f43f5e33"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Quick Nav (Giữ nguyên cấu trúc Link cũ của bạn) */}
                    <div className="space-y-4">
                        <h2 className="px-1 text-lg font-bold">
                            Quick Actions
                        </h2>
                        <Link
                            to={INTERNAL_URLS.financial.receivables}
                            className="block"
                        >
                            <Card
                                isPressable
                                className="flex-row items-center w-full gap-4 p-4 border"
                            >
                                <div className="p-3 rounded-lg bg-success-50 text-success-600">
                                    <ArrowDownRight size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold">Receivables</p>
                                    <p className="text-xs text-default-500">
                                        Collect client payments
                                    </p>
                                </div>
                            </Card>
                        </Link>
                        <Link
                            to={INTERNAL_URLS.financial.payouts}
                            className="block"
                        >
                            <Card
                                isPressable
                                className="flex-row items-center w-full gap-4 p-4 border"
                            >
                                <div className="p-3 rounded-lg bg-danger-50 text-danger-600">
                                    <ArrowUpRight size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold">Staff Payouts</p>
                                    <p className="text-xs text-default-500">
                                        Pay members & freelancers
                                    </p>
                                </div>
                            </Card>
                        </Link>
                        <Link
                            to={INTERNAL_URLS.financial.ledger}
                            className="block"
                        >
                            <Card
                                isPressable
                                className="flex-row items-center w-full gap-4 p-4 border"
                            >
                                <div className="p-3 rounded-lg bg-primary-50 text-primary-600">
                                    <FileSpreadsheet size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold">Master Ledger</p>
                                    <p className="text-xs text-default-500">
                                        Full transaction history
                                    </p>
                                </div>
                            </Card>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <Card shadow="sm" className="border border-border-default">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-divider bg-default-50">
                        <h2 className="flex items-center gap-2 text-lg font-bold">
                            <Briefcase size={18} /> Recent Ledger Entries
                        </h2>
                        <Button
                            as={Link}
                            to={INTERNAL_URLS.financial.ledger}
                            size="sm"
                            variant="light"
                            color="primary"
                        >
                            Full Ledger &rarr;
                        </Button>
                    </div>
                    <Table aria-label="Recent Ledger" removeWrapper>
                        <TableHeader>
                            <TableColumn>TYPE</TableColumn>
                            <TableColumn>DESCRIPTION</TableColumn>
                            <TableColumn>DATE</TableColumn>
                            <TableColumn align="end">AMOUNT</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="No recent activity">
                            {recentTransactions.map((txn: any) => (
                                <TableRow key={txn.id}>
                                    <TableCell>
                                        <Chip
                                            size="sm"
                                            color={
                                                txn.type === 'INCOME'
                                                    ? 'success'
                                                    : 'danger'
                                            }
                                            variant="flat"
                                        >
                                            {txn.type}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold">
                                                {txn.job?.no || 'System'}
                                            </span>
                                            <span className="text-xs text-default-500">
                                                {txn.note ||
                                                    txn.client?.name ||
                                                    txn.assignment?.user
                                                        ?.displayName}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-default-500">
                                            {dayjs(txn.createdAt).format(
                                                'DD MMM, HH:mm'
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`text-base font-bold ${txn.type === 'INCOME' ? 'text-success-600' : 'text-danger-600'}`}
                                        >
                                            {txn.type === 'INCOME' ? '+' : '-'}
                                            {currencyFormatter(
                                                txn.amount,
                                                'Vietnamese'
                                            )}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </AdminContentContainer>
        </>
    )
}
