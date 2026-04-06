import { ledgerTransactionsOptions } from '@/lib/queries'
import {
    Card,
    CardBody,
    CardHeader,
    Chip,
    Input,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    User as UserProfile
} from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import dayjs from 'dayjs'
import {
    ArrowDownRight,
    ArrowUpRight,
    Filter,
    Search
} from 'lucide-react'
import { useState } from 'react'
import { currencyFormatter } from '@/lib'
import { AdminPageHeading, AppLoading } from '@/shared/components'

export const Route = createFileRoute('/_administrator/financial/ledger')({
    head: () => ({ meta: [{ title: 'Master Ledger' }] }),
    pendingComponent: AppLoading,
    component: () => {
        return (
            <>
                <AdminPageHeading
                    title="Master Ledger"
                    description="A historical record of all money moving in and out of the company."
                />
                <FinancialLedgerPage />
            </>
        )
    },
})

export default function FinancialLedgerPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [typeFilter, setTypeFilter] = useState<string>('ALL')
    const [page] = useState(1)

    // --- 1. Fetch Data ---
    // Dương có thể mở rộng logic DateRangePicker vào đây bằng cách parse value sang ISO
    const { data, isLoading } = useQuery(
        ledgerTransactionsOptions({
            page,
            limit: 20,
            search: searchQuery || undefined,
            type: typeFilter === 'ALL' ? undefined : typeFilter,
        })
    )

    const transactions = data?.transactions || []

    return (
        <div className="p-6 mx-auto space-y-6 max-w-7xl">
            {/* Filters */}
            <Card shadow="sm" className="border border-default-200">
                <CardHeader className="flex flex-col items-center justify-between gap-4 p-4 md:flex-row bg-background-muted">
                    <Input
                        placeholder="Search Job No, Client, or TXN ID..."
                        startContent={
                            <Search size={16} className="text-default-400" />
                        }
                        className="flex-1 max-w-md"
                        variant="bordered"
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />

                    <Select
                        className="max-w-50"
                        variant="bordered"
                        selectedKeys={[typeFilter]}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        startContent={
                            <Filter size={16} className="text-default-400" />
                        }
                    >
                        <SelectItem key="ALL" textValue="All Transactions">
                            All Transactions
                        </SelectItem>
                        <SelectItem key="INCOME" textValue="Income Only">
                            Income Only
                        </SelectItem>
                        <SelectItem key="PAYOUT" textValue="Payouts Only">
                            Payouts Only
                        </SelectItem>
                    </Select>
                </CardHeader>

                {/* Table */}
                <CardBody>
                    <Table
                        aria-label="Financial Ledger Table"
                        removeWrapper
                        className="bg-transparent"
                        isHeaderSticky
                    >
                        <TableHeader>
                            <TableColumn>DATE & TIME</TableColumn>
                            <TableColumn>TYPE</TableColumn>
                            <TableColumn>AMOUNT</TableColumn>
                            <TableColumn>JOB REF.</TableColumn>
                            <TableColumn>ENTITY (FROM / TO)</TableColumn>
                            <TableColumn>PAYMENT DETAILS</TableColumn>
                        </TableHeader>
                        <TableBody
                            emptyContent={
                                isLoading
                                    ? 'Loading data...'
                                    : 'No transactions match your filters.'
                            }
                            items={transactions}
                        >
                            {(txn: any) => (
                                <TableRow
                                    key={txn.id}
                                    className="transition-colors hover:bg-default-100/50"
                                >
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">
                                                {dayjs(txn.createdAt).format(
                                                    'DD MMM YYYY'
                                                )}
                                            </span>
                                            <span className="text-xs text-default-400">
                                                {dayjs(txn.createdAt).format(
                                                    'HH:mm'
                                                )}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            size="sm"
                                            color={
                                                txn.type === 'INCOME'
                                                    ? 'success'
                                                    : 'danger'
                                            }
                                            variant="flat"
                                            startContent={
                                                txn.type === 'INCOME' ? (
                                                    <ArrowDownRight size={14} />
                                                ) : (
                                                    <ArrowUpRight size={14} />
                                                )
                                            }
                                        >
                                            {txn.type}
                                        </Chip>
                                    </TableCell>

                                    <TableCell>
                                        <span
                                            className={`text-base font-bold ${txn.type === 'INCOME' ? 'text-success-600' : 'text-danger-600'}`}
                                        >
                                            {txn.type === 'INCOME' ? '+' : '-'}
                                            {currencyFormatter(txn.amount)}
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-default-800">
                                                {txn.job?.no}
                                            </span>
                                            <span className="text-xs text-default-500 truncate max-w-37.5">
                                                {txn.job?.displayName}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        {txn.type === 'PAYOUT' ? (
                                            <UserProfile
                                                name={
                                                    txn.assignment?.user
                                                        ?.displayName || 'N/A'
                                                }
                                                description="Staff Member"
                                                avatarProps={{
                                                    src: txn.assignment?.user
                                                        ?.avatar,
                                                    size: 'sm',
                                                }}
                                            />
                                        ) : (
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold">
                                                    {txn.client?.name || 'N/A'}
                                                </span>
                                                <span className="text-xs text-default-500">
                                                    Client
                                                </span>
                                            </div>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-default-700">
                                                {txn.paymentChannel
                                                    ?.displayName || 'Unknown'}
                                            </span>
                                            <span className="font-mono text-xs text-default-400">
                                                Ref:{' '}
                                                {txn.referenceNo || 'No Ref'}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        </div>
    )
}
