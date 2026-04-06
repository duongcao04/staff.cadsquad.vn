import {
    currencyFormatter,
    EXCHANGE_RATE,
    getPageTitle,
    INTERNAL_URLS
} from '@/lib'
import {
    bulkRecordPayoutOptions,
    financialStatsOptions,
    payableJobsOptions,
    receivableJobsOptions,
} from '@/lib/queries'
import { AdminPageHeading, HeroTooltip } from '@/shared/components'
import { JobStatusChip } from '@/shared/components/chips/JobStatusChip'
import {
    addToast,
    Button,
    Card,
    CardBody,
    Chip,
    Selection,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tabs,
} from '@heroui/react'
import {
    useMutation,
    useQuery,
    useQueryClient,
    useSuspenseQuery,
} from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { CheckCircle, DollarSign, TrendingUp, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/_administrator/financial/payouts/')({
    head: () => ({
        meta: [{ title: getPageTitle('Accounting Desk') }],
    }),
    loader: async ({ context }) => {
        // Prefetch các dữ liệu tài chính cốt lõi
        await Promise.all([
            context.queryClient.ensureQueryData(payableJobsOptions()),
            context.queryClient.ensureQueryData(financialStatsOptions()),
        ])
    },
    component: () => (
        <>
            <AdminPageHeading
                title="Accounting Desk"
                description="Manage staff payouts, client receivables, and financial performance."
            />
            <PendingPayoutsPage />
        </>
    ),
})

export default function PendingPayoutsPage() {
    const queryClient = useQueryClient()
    const [selectedTab, setSelectedTab] = useState('pending')
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]))

    // --- 1. Data Fetching (Real Backend Data) ---
    const { data: payableJobs = [] } = useSuspenseQuery(payableJobsOptions())
    const { data: receivables = [] } = useQuery(receivableJobsOptions())
    const { data: stats } = useQuery(financialStatsOptions())

    // --- 2. Mutation for Bulk Payout ---
    const { mutate: bulkPay, isPending: isBulkPaying } = useMutation({
        ...bulkRecordPayoutOptions,
        onSuccess: () => {
            addToast({
                title: 'Bulk payout processed successfully!',
                color: 'success',
            })
            setSelectedKeys(new Set([]))
            queryClient.invalidateQueries({ queryKey: ['financials'] })
        },
    })

    // --- 3. Calculations & Selection Logic ---
    const selectedIds = useMemo(() => {
        if (selectedKeys === 'all') return payableJobs.map((j) => j.id)
        return Array.from(selectedKeys) as string[]
    }, [selectedKeys, payableJobs])

    const totalPayablesVnd = useMemo(
        () =>
            payableJobs.reduce(
                (sum, job) => sum + (job.financial?.totalDebt || 0),
                0
            ),
        [payableJobs]
    )

    const totalReceivablesUsd = useMemo(
        () =>
            receivables.reduce(
                (sum, job: any) => sum + (job.financial?.remainingAmount || 0),
                0
            ),
        [receivables]
    )

    const handleBulkPayout = () => {
        if (selectedIds.length === 0) return
        bulkPay({ jobIds: selectedIds })
    }

    return (
        <div className="p-6 mx-auto space-y-6 max-w-7xl">
            {/* KPI Widgets Section */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="border shadow-none border-warning-200 bg-warning-50">
                    <CardBody className="flex flex-row items-center gap-4 p-5">
                        <div className="p-3 bg-warning-100 rounded-xl text-warning-600">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-warning-700">
                                Staff Payables
                            </p>
                            <p className="text-2xl font-bold text-warning-900">
                                {currencyFormatter(
                                    totalPayablesVnd,
                                    'Vietnamese'
                                )}
                            </p>
                            <p className="mt-1 text-xs font-medium text-warning-600">
                                Across {payableJobs.length} jobs with debt
                            </p>
                        </div>
                    </CardBody>
                </Card>

                <Card className="border shadow-none border-primary-200 bg-primary-50">
                    <CardBody className="flex flex-row items-center gap-4 p-5">
                        <div className="p-3 bg-primary-100 rounded-xl text-primary-600">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-primary-700">
                                Client Receivables
                            </p>
                            <p className="text-2xl font-bold text-primary-900">
                                {currencyFormatter(
                                    totalReceivablesUsd * EXCHANGE_RATE.USD,
                                    'Vietnamese'
                                )}
                            </p>
                            <p className="mt-1 text-xs font-medium text-primary-600">
                                Waiting from {receivables.length} clients
                            </p>
                        </div>
                    </CardBody>
                </Card>

                <Card className="border shadow-none border-success-200 bg-success-50">
                    <CardBody className="flex flex-row items-center gap-4 p-5">
                        <div className="p-3 bg-success-100 rounded-xl text-success-600">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-success-700">
                                Net Profit (MTD)
                            </p>
                            <p className="text-2xl font-bold text-success-900">
                                {currencyFormatter(
                                    stats?.netProfit || 0,
                                    'Vietnamese'
                                )}
                            </p>
                            <p className="mt-1 text-xs font-medium text-success-600">
                                Confirmed transactions
                            </p>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Main Tabs and Actions */}
            <div className="space-y-4">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <Tabs
                        selectedKey={selectedTab}
                        onSelectionChange={(k) => {
                            setSelectedTab(k as string)
                            setSelectedKeys(new Set([]))
                        }}
                        color="primary"
                        variant="underlined"
                    >
                        <Tab
                            key="pending"
                            title={
                                <div className="flex items-center gap-2 font-bold">
                                    Pending Payouts
                                    <Chip
                                        size="sm"
                                        color="danger"
                                        variant="flat"
                                    >
                                        {payableJobs.length}
                                    </Chip>
                                </div>
                            }
                        />
                        <Tab
                            key="receivables"
                            title={
                                <div className="flex items-center gap-2 font-bold">
                                    Client Debts
                                    <Chip
                                        size="sm"
                                        color="primary"
                                        variant="flat"
                                    >
                                        {receivables.length}
                                    </Chip>
                                </div>
                            }
                        />
                    </Tabs>

                    {selectedTab === 'pending' && selectedIds.length > 0 && (
                        <Button
                            color="success"
                            variant="shadow"
                            className="px-6 font-bold text-white"
                            startContent={<CheckCircle size={18} />}
                            onPress={handleBulkPayout}
                            isLoading={isBulkPaying}
                        >
                            Mark Paid Selected ({selectedIds.length})
                        </Button>
                    )}
                </div>

                <Table
                    aria-label="Accounting Management Table"
                    className="border border-divider rounded-xl"
                    removeWrapper
                    selectionMode={
                        selectedTab === 'pending' ? 'multiple' : 'none'
                    }
                    selectedKeys={selectedKeys}
                    onSelectionChange={setSelectedKeys}
                >
                    <TableHeader>
                        <TableColumn>JOB INFO</TableColumn>
                        <TableColumn>CLIENT</TableColumn>
                        <TableColumn align="end">INCOME (USD)</TableColumn>
                        <TableColumn align="end">TOTAL COST (VND)</TableColumn>
                        <TableColumn align="end">
                            <div className="flex items-center justify-end gap-1">
                                DEBT / REMAINING
                                <HeroTooltip content="Remaining amount to pay staff or collect from client">
                                    <div className="w-3 h-3 rounded-full bg-default-200 text-[8px] flex items-center justify-center cursor-help">
                                        ?
                                    </div>
                                </HeroTooltip>
                            </div>
                        </TableColumn>
                        <TableColumn align="center">STATUS</TableColumn>
                        <TableColumn align="end">ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="No financial records found in this category.">
                        {(selectedTab === 'pending'
                            ? payableJobs
                            : receivables
                        ).map((job: any) => {
                            // Logic mapping field linh hoạt giữa 2 Query (Payable vs Receivable)
                            const debt =
                                selectedTab === 'pending'
                                    ? job.financial?.totalDebt
                                    : job.financial?.remainingAmount

                            const totalCost =
                                job.financial?.totalStaffCost ||
                                job.totalStaffCost ||
                                0

                            return (
                                <TableRow
                                    key={job.id}
                                    className="transition-colors hover:bg-default-50"
                                >
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">
                                                #{job.jobNo || job.no}
                                            </span>
                                            <span className="text-xs text-default-500 truncate max-w-[200px]">
                                                {job.displayName || job.jobName}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-xs font-semibold text-default-600">
                                            {job.clientName || job.client?.name}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm font-bold text-success-600">
                                            $
                                            {(
                                                job.incomeCost || 0
                                            ).toLocaleString()}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm font-bold text-right text-danger-600">
                                            {currencyFormatter(
                                                totalCost,
                                                'Vietnamese'
                                            )}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-right">
                                            <p
                                                className={`text-sm font-bold ${selectedTab === 'pending' ? 'text-danger-700' : 'text-primary-700'}`}
                                            >
                                                {currencyFormatter(
                                                    debt || 0,
                                                    'Vietnamese'
                                                )}
                                            </p>
                                        </div>
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
                                            color={
                                                selectedTab === 'pending'
                                                    ? 'warning'
                                                    : 'primary'
                                            }
                                            variant="flat"
                                            as={Link}
                                            href={
                                                selectedTab === 'pending'
                                                    ? INTERNAL_URLS.financial.payoutsDetail(
                                                          job.jobNo || job.no
                                                      )
                                                    : INTERNAL_URLS.financial
                                                          .receivables
                                            }
                                        >
                                            Details
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
