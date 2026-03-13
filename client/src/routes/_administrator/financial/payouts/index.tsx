import {
    Button,
    Card,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow
} from '@heroui/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { DollarSign } from 'lucide-react'
import { useState } from 'react'

import { JobStatusChip } from '@/shared/components/chips/JobStatusChip'
import {
    CardBody,
    Tab,
    Tabs
} from '@heroui/react'
import { ArrowUpRight, Wallet } from 'lucide-react'
import {
    getPageTitle
} from '../../../../lib'
import { jobsPendingPayoutsOptions } from '../../../../lib/queries'

export const Route = createFileRoute(
    '/_administrator/financial/payouts/'
)({
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
    component: PendingPayoutsPage,
})

// --- Mock Data ---
const MOCK_JOBS = [
    {
        id: '1',
        no: 'JOB-2026-001',
        displayName: '3D Character Model',
        clientName: 'Tom Jain',
        completedAt: '2026-03-10',
        income: 500,
        cost: 150,
        status: { code: 'wait_payout', displayName: 'Wait Payout', color: 'warning' },
    },
    {
        id: '2',
        no: 'JOB-2026-005',
        displayName: 'Environment Design',
        clientName: 'Sarah Connor',
        completedAt: '2026-03-12',
        income: 1200,
        cost: 400,
        status: { code: 'wait_payout', displayName: 'Wait Payout', color: 'warning' },
    },
]

export default function PendingPayoutsPage() {
    const [selectedTab, setSelectedTab] = useState('pending')

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-default-900">Accounting Desk</h1>
                <p className="text-sm text-default-500">Manage invoices, staff payouts, and financial health.</p>
            </div>

            {/* KPI Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border border-warning-200 bg-warning-50 shadow-none">
                    <CardBody className="flex flex-row items-center gap-4 p-5">
                        <div className="p-3 bg-warning-100 rounded-xl text-warning-600">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-warning-700">Pending Payouts</p>
                            <p className="text-2xl font-bold text-warning-900">$550.00</p>
                            <p className="text-xs text-warning-600 mt-1">Across 2 jobs</p>
                        </div>
                    </CardBody>
                </Card>
                <Card className="border border-success-200 bg-success-50 shadow-none">
                    <CardBody className="flex flex-row items-center gap-4 p-5">
                        <div className="p-3 bg-success-100 rounded-xl text-success-600">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-success-700">Pending Receivables</p>
                            <p className="text-2xl font-bold text-success-900">$1,700.00</p>
                            <p className="text-xs text-success-600 mt-1">Waiting for client payment</p>
                        </div>
                    </CardBody>
                </Card>
                <Card className="border border-default-200 shadow-none">
                    <CardBody className="flex flex-row items-center gap-4 p-5">
                        <div className="p-3 bg-default-100 rounded-xl text-default-600">
                            <ArrowUpRight size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-default-600">Expected Profit</p>
                            <p className="text-2xl font-bold text-default-900">$1,150.00</p>
                            <p className="text-xs text-default-500 mt-1">From pending jobs</p>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Tabs & Data Table */}
            <div className="space-y-4">
                <Tabs selectedKey={selectedTab} onSelectionChange={(k) => setSelectedTab(k as string)} color="primary" variant="underlined">
                    <Tab key="pending" title={<div className="flex items-center gap-2">Pending Payouts <Chip size="sm" color="danger" variant="flat">2</Chip></div>} />
                    <Tab key="receivables" title="Awaiting Client Payment" />
                    <Tab key="completed" title="Completed / Paid" />
                </Tabs>

                <Table aria-label="Pending Payouts Table" className="border border-divider rounded-xl">
                    <TableHeader>
                        <TableColumn>JOB NO</TableColumn>
                        <TableColumn>PROJECT & CLIENT</TableColumn>
                        <TableColumn>COMPLETED AT</TableColumn>
                        <TableColumn>INCOME</TableColumn>
                        <TableColumn>STAFF COST</TableColumn>
                        <TableColumn>MARGIN</TableColumn>
                        <TableColumn>STATUS</TableColumn>
                        <TableColumn align="end">ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {MOCK_JOBS.map((job) => (
                            <TableRow key={job.id}>
                                <TableCell>
                                    <span className="font-bold text-sm">#{job.no}</span>
                                </TableCell>
                                <TableCell>
                                    <p className="font-semibold text-sm">{job.displayName}</p>
                                    <p className="text-xs text-default-500">{job.clientName}</p>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-default-600">{job.completedAt}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm font-semibold text-success-600">{formatCurrency(job.income)}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm font-bold text-danger-600">{formatCurrency(job.cost)}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm font-semibold text-default-700">
                                        {formatCurrency(job.income - job.cost)}{' '}
                                        <span className="text-xs text-default-400">({Math.round(((job.income - job.cost) / job.income) * 100)}%)</span>
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <JobStatusChip data={job.status} props={{ size: 'sm' }} />
                                </TableCell>
                                <TableCell>
                                    {/* Link to the detail page */}
                                    <Link to={`/financial/pending-payouts/${job.no}`}>
                                        <Button size="sm" color="primary" variant="flat">
                                            Process Payout
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}