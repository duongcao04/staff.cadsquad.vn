import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_administrator/financial/ledger')({
    component: FinancialLedgerPage,
})

import {
    Button,
    Card,
    Chip,
    DateRangePicker,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Input,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    User,
} from '@heroui/react'
import {
    ArrowDownRight,
    ArrowUpRight,
    Download,
    FileSpreadsheet,
    Filter,
    Search,
} from 'lucide-react'
import { useState } from 'react'

// --- Mock Data ---
const MOCK_TRANSACTIONS = [
    {
        id: 'TXN-001',
        jobNo: 'JOB-2026-042',
        jobName: 'Architectural Rendering',
        type: 'INCOME',
        amount: 2500,
        entityName: 'Global Real Estate Corp', // Client
        channel: 'Stripe',
        referenceNo: 'ch_3Nl78Z2eZvKYlo2C1',
        date: '2026-03-12T10:30:00Z',
        recordedBy: 'Admin Sarah',
    },
    {
        id: 'TXN-002',
        jobNo: 'JOB-2026-039',
        jobName: 'Product Animation',
        type: 'PAYOUT',
        amount: 450,
        entityName: 'Cao Hai Duong', // Staff Member
        entityAvatar: 'https://i.pravatar.cc/150?u=1',
        channel: 'VPBank Transfer',
        referenceNo: 'VPB-99887766',
        date: '2026-03-11T15:45:00Z',
        recordedBy: 'Acct. Manager',
    },
    {
        id: 'TXN-003',
        jobNo: 'JOB-2026-039',
        jobName: 'Product Animation',
        type: 'PAYOUT',
        amount: 150,
        entityName: 'John Doe', // Staff Member
        entityAvatar: 'https://i.pravatar.cc/150?u=2',
        channel: 'PayPal',
        referenceNo: 'PAYID-123456789',
        date: '2026-03-11T15:48:00Z',
        recordedBy: 'Acct. Manager',
    },
    {
        id: 'TXN-004',
        jobNo: 'JOB-2026-045',
        jobName: 'Character Rigging',
        type: 'INCOME',
        amount: 1200,
        entityName: 'Studio X',
        channel: 'Wire Transfer',
        referenceNo: 'WT-2026-03-10',
        date: '2026-03-10T09:00:00Z',
        recordedBy: 'Admin Sarah',
    },
]

export default function FinancialLedgerPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [typeFilter, setTypeFilter] = useState<string>('ALL')

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(val)

    const formatDate = (isoString: string) => {
        const date = new Date(isoString)
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        }).format(date)
    }

    // Apply Filters
    const filteredTransactions = MOCK_TRANSACTIONS.filter((txn) => {
        const matchesSearch =
            txn.jobNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            txn.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            txn.referenceNo.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesType =
            typeFilter === 'ALL' ? true : txn.type === typeFilter

        return matchesSearch && matchesType
    })

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* 1. Header & Global Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-default-900 flex items-center gap-2">
                        <FileSpreadsheet className="text-primary" /> Master
                        Ledger
                    </h1>
                    <p className="text-sm text-default-500">
                        A historical record of all money moving in and out of
                        the company.
                    </p>
                </div>

                <Dropdown>
                    <DropdownTrigger>
                        <Button
                            color="primary"
                            startContent={<Download size={16} />}
                        >
                            Export Data
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Export Options">
                        <DropdownItem
                            key="csv"
                            description="Best for Excel/Google Sheets"
                        >
                            Export to CSV
                        </DropdownItem>
                        <DropdownItem
                            key="pdf"
                            description="Formatted for printing"
                        >
                            Export to PDF
                        </DropdownItem>
                        <DropdownItem
                            key="quickbooks"
                            description="IIF format for accounting tools"
                        >
                            Export to QuickBooks
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>

            {/* 2. Filters Toolbar */}
            <Card shadow="sm" className="border border-default-200">
                <div className="p-4 flex flex-col md:flex-row items-center gap-4 bg-default-50">
                    <Input
                        placeholder="Search Job No, Client, or TXN ID..."
                        startContent={
                            <Search size={16} className="text-default-400" />
                        }
                        className="max-w-md flex-1"
                        variant="bordered"
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />

                    <Select
                        className="max-w-[200px]"
                        variant="bordered"
                        aria-label="Filter by Type"
                        selectedKeys={[typeFilter]}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        startContent={
                            <Filter size={16} className="text-default-400" />
                        }
                    >
                        <SelectItem key="ALL" textValue="All Transactions">
                            All Transactions
                        </SelectItem>
                        <SelectItem
                            key="INCOME"
                            textValue="Income Only (Money In)"
                        >
                            Income Only
                        </SelectItem>
                        <SelectItem
                            key="PAYOUT"
                            textValue="Payouts Only (Money Out)"
                        >
                            Payouts Only
                        </SelectItem>
                    </Select>

                    <div className="max-w-[300px]">
                        <DateRangePicker
                            variant="bordered"
                            aria-label="Filter by Date"
                            visibleMonths={2}
                        />
                    </div>
                </div>

                {/* 3. The Ledger Table */}
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
                    <TableBody emptyContent="No transactions match your filters.">
                        {filteredTransactions.map((txn) => (
                            <TableRow
                                key={txn.id}
                                className="hover:bg-default-100/50 transition-colors"
                            >
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">
                                            {formatDate(txn.date).split(',')[0]}
                                        </span>
                                        <span className="text-xs text-default-400">
                                            {formatDate(txn.date).split(',')[1]}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    {txn.type === 'INCOME' ? (
                                        <Chip
                                            size="sm"
                                            color="success"
                                            variant="flat"
                                            startContent={
                                                <ArrowDownRight
                                                    size={14}
                                                    className="ml-1"
                                                />
                                            }
                                        >
                                            INCOME
                                        </Chip>
                                    ) : (
                                        <Chip
                                            size="sm"
                                            color="danger"
                                            variant="flat"
                                            startContent={
                                                <ArrowUpRight
                                                    size={14}
                                                    className="ml-1"
                                                />
                                            }
                                        >
                                            PAYOUT
                                        </Chip>
                                    )}
                                </TableCell>

                                <TableCell>
                                    <span
                                        className={`text-base font-bold ${txn.type === 'INCOME' ? 'text-success-600' : 'text-danger-600'}`}
                                    >
                                        {txn.type === 'INCOME' ? '+' : '-'}
                                        {formatCurrency(txn.amount)}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-default-800">
                                            {txn.jobNo}
                                        </span>
                                        <span className="text-xs text-default-500 truncate max-w-[150px]">
                                            {txn.jobName}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    {txn.type === 'PAYOUT' &&
                                    txn.entityAvatar ? (
                                        <User
                                            name={
                                                <span className="text-sm font-semibold">
                                                    {txn.entityName}
                                                </span>
                                            }
                                            description="Staff / Freelancer"
                                            avatarProps={{
                                                src: txn.entityAvatar,
                                                size: 'sm',
                                            }}
                                        />
                                    ) : (
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold">
                                                {txn.entityName}
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
                                            {txn.channel}
                                        </span>
                                        <span className="text-xs text-default-400 font-mono">
                                            Ref: {txn.referenceNo}
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
