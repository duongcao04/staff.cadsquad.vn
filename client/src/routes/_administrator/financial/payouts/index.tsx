import {
    currencyFormatter,
    dateFormatter,
    EXCHANGE_RATE,
    getPageTitle,
    INTERNAL_URLS,
} from '@/lib'
import { jobsPendingPayoutsOptions } from '@/lib/queries'
import { AdminPageHeading, HeroTooltip } from '@/shared/components'
import { JobStatusChip } from '@/shared/components/chips/JobStatusChip'
import {
    Button,
    Card,
    CardBody,
    Chip,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tabs,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowUpRight, DollarSign, Wallet } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_administrator/financial/payouts/')({
    head: () => ({
        meta: [
            {
                title: getPageTitle('Pending Payouts'),
            },
        ],
    }),
    loader: ({ context }) => {
        return context.queryClient.ensureQueryData({
            ...jobsPendingPayoutsOptions(),
        })
    },
    component: () => {
        return (
            <>
                <AdminPageHeading
                    title="Accounting Desk"
                    description="Manage invoices, staff payouts, and financial health."
                />
                <PendingPayoutsPage />
            </>
        )
    },
})

export default function PendingPayoutsPage() {
    const {
        data: { pendingPayouts },
    } = useSuspenseQuery(jobsPendingPayoutsOptions())
    const [selectedTab, setSelectedTab] = useState('pending')

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(val)

    const totalPayouts = pendingPayouts.reduce(
        (accumulator, currentValue) =>
            accumulator + currentValue.totalStaffCost,
        0
    )

    const totalMargin = pendingPayouts.reduce((accumulator, currentValue) => {
        // 1. Quy đổi thu nhập về VND
        const incomeVnd = (currentValue.incomeCost || 0) * EXCHANGE_RATE.USD

        // 2. Tính Margin của từng item (Income - Cost)
        const itemMargin = incomeVnd - (currentValue.totalStaffCost || 0)

        // 3. Cộng dồn vào tổng
        return accumulator + itemMargin
    }, 0)

    return (
        <div className="p-6 mx-auto space-y-6 max-w-7xl">
            {/* KPI Widgets */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="border shadow-none border-warning-200 bg-warning-50">
                    <CardBody className="flex flex-row items-center gap-4 p-5">
                        <div className="p-3 bg-warning-100 rounded-xl text-warning-600">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-warning-700">
                                Pending Payouts
                            </p>
                            <p className="text-2xl font-bold text-warning-900">
                                {currencyFormatter(totalPayouts, 'Vietnamese')}
                            </p>
                            <p className="mt-1 text-xs text-warning-600">
                                Across {pendingPayouts.length} jobs
                            </p>
                        </div>
                    </CardBody>
                </Card>
                <Card className="border shadow-none border-success-200 bg-success-50">
                    <CardBody className="flex flex-row items-center gap-4 p-5">
                        <div className="p-3 bg-success-100 rounded-xl text-success-600">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-success-700">
                                Pending Receivables
                            </p>
                            <p className="text-2xl font-bold text-success-900">
                                $0
                            </p>
                            <p className="mt-1 text-xs text-success-600">
                                Waiting for client payment
                            </p>
                        </div>
                    </CardBody>
                </Card>
                <Card className="border shadow-none border-default-200">
                    <CardBody className="flex flex-row items-center gap-4 p-5">
                        <div className="p-3 bg-default-100 rounded-xl text-default-600">
                            <ArrowUpRight size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-default-600">
                                Expected Profit
                            </p>
                            <p className="text-2xl font-bold text-default-900">
                                {currencyFormatter(totalMargin, 'Vietnamese')}
                            </p>
                            <p className="mt-1 text-xs text-default-500">
                                From pending jobs
                            </p>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Tabs & Data Table */}
            <div className="space-y-4">
                <Tabs
                    selectedKey={selectedTab}
                    onSelectionChange={(k) => setSelectedTab(k as string)}
                    color="primary"
                    variant="underlined"
                >
                    <Tab
                        key="pending"
                        title={
                            <div className="flex items-center gap-2">
                                Pending Payouts{' '}
                                <Chip size="sm" color="danger" variant="flat">
                                    2
                                </Chip>
                            </div>
                        }
                    />
                    <Tab key="receivables" title="Awaiting Client Payment" />
                    <Tab key="completed" title="Completed / Paid" />
                </Tabs>

                <Table
                    aria-label="Pending Payouts Table"
                    className="border border-divider rounded-xl"
                >
                    <TableHeader>
                        <TableColumn>No</TableColumn>
                        <TableColumn>Display name</TableColumn>
                        <TableColumn>Client</TableColumn>
                        <TableColumn>Completed At</TableColumn>
                        <TableColumn>
                            <p className="text-right">Income</p>
                        </TableColumn>
                        <TableColumn>
                            <p className="text-right">Total Staff Cost</p>
                        </TableColumn>
                        <TableColumn>
                            <div className="flex items-center gap-2">
                                Profit
                                <HeroTooltip
                                    placement="right"
                                    content={
                                        <div className="px-1 py-1 max-w-62.5 text-tiny text-text-subdued">
                                            Gross Margin & Profit %: The
                                            absolute profit after deducting
                                            staff costs and the profitability
                                            ratio relative to those costs.
                                        </div>
                                    }
                                >
                                    <div className="flex items-center justify-center w-3 h-3 rounded-full border-2 border-border-default hover:bg-default-300 text-[8px] font-bold text-default-600 cursor-help transition-colors">
                                        !
                                    </div>
                                </HeroTooltip>
                            </div>
                        </TableColumn>
                        <TableColumn>Status</TableColumn>
                        <TableColumn align="end">Actions</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {pendingPayouts.map((job) => {
                            const incomeInVnd =
                                job.incomeCost * EXCHANGE_RATE.USD
                            const marginCost = incomeInVnd - job.totalStaffCost

                            // Tính % lợi nhuận (Markup)
                            let profitPercent = 0

                            if (job.totalStaffCost > 0) {
                                // Công thức: (Lợi nhuận / Chi phí) * 100
                                profitPercent = Math.round(
                                    (marginCost / job.totalStaffCost) * 100
                                )
                            } else if (incomeInVnd > 0) {
                                // Trường hợp chi phí bằng 0 nhưng có doanh thu (Lợi nhuận vô cực hoặc 100% tùy quy ước)
                                profitPercent = 100
                            } else {
                                profitPercent = 0
                            }

                            return (
                                <TableRow key={job.id}>
                                    <TableCell>
                                        <span className="text-sm font-bold">
                                            #{job.no}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm font-semibold">
                                            {job.displayName}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-xs text-default-500">
                                            {job.client?.name}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        {job.completedAt && (
                                            <span className="text-sm text-default-600">
                                                {dateFormatter(job.completedAt)}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm font-semibold text-right text-success-600">
                                            {formatCurrency(job.incomeCost)}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm font-bold text-right text-danger-600">
                                            {currencyFormatter(
                                                job.totalStaffCost,
                                                'Vietnamese'
                                            )}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        {job.incomeCost && (
                                            <span className="text-sm font-semibold text-default-700">
                                                {currencyFormatter(
                                                    marginCost,
                                                    'Vietnamese'
                                                )}{' '}
                                                <span className="text-xs text-default-400">
                                                    ({profitPercent}%)
                                                </span>
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <JobStatusChip
                                            data={job.status}
                                            props={{ size: 'sm' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            color="warning"
                                            variant="light"
                                            as={Link}
                                            href={INTERNAL_URLS.financial.payoutsDetail(
                                                job.no
                                            )}
                                        >
                                            <span className="font-semibold text-warning-600">
                                                Process Payout
                                            </span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
