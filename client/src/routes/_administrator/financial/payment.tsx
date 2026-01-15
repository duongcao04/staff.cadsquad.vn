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
import { createFileRoute } from '@tanstack/react-router'
import {
    ArrowDownLeft,
    ArrowUpRight,
    CreditCard,
    Download,
    Filter,
    Landmark,
    Plus,
    TrendingUp,
    Wallet,
} from 'lucide-react'
import { useState } from 'react'
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

export const Route = createFileRoute('/_administrator/financial/payment')({
    component: PaymentChannelFlowPage,
})

// --- Types ---
interface Channel {
    id: string
    name: string
    type: 'BANK' | 'E-WALLET' | 'CASH'
    accountNumber: string
    balance: number
    currency: string
    color: string
    icon: any
}

interface Transaction {
    id: string
    date: string
    description: string // e.g., "Job FV-2024 Payment" or "Server Cost"
    type: 'INCOME' | 'EXPENSE'
    amount: number
    status: 'COMPLETED' | 'PENDING'
    category: string
    refId?: string // Link to Job ID or Expense ID
}

// --- Mock Data ---
const CHANNELS: Channel[] = [
    {
        id: 'c1',
        name: 'Techcombank',
        type: 'BANK',
        accountNumber: '**** 4455',
        balance: 15400,
        currency: 'USD',
        color: 'primary',
        icon: Landmark,
    },
    {
        id: 'c2',
        name: 'Stripe',
        type: 'E-WALLET',
        accountNumber: 'merch_id_88',
        balance: 4200,
        currency: 'USD',
        color: 'secondary',
        icon: CreditCard,
    },
    {
        id: 'c3',
        name: 'Petty Cash',
        type: 'CASH',
        accountNumber: 'N/A',
        balance: 850,
        currency: 'USD',
        color: 'success',
        icon: Wallet,
    },
]

const TRANSACTIONS: Transaction[] = [
    {
        id: 't1',
        date: '2024-02-20',
        description: 'Payment for Job FV-2024',
        type: 'INCOME',
        amount: 4500,
        status: 'COMPLETED',
        category: 'Project',
        refId: 'FV-2024',
    },
    {
        id: 't2',
        date: '2024-02-19',
        description: 'AWS Server Bill',
        type: 'EXPENSE',
        amount: 120,
        status: 'COMPLETED',
        category: 'Infrastructure',
        refId: 'EXP-001',
    },
    {
        id: 't3',
        date: '2024-02-18',
        description: 'Payment for Job FV-2022',
        type: 'INCOME',
        amount: 2100,
        status: 'COMPLETED',
        category: 'Project',
        refId: 'FV-2022',
    },
    {
        id: 't4',
        date: '2024-02-15',
        description: 'Office Rent Feb',
        type: 'EXPENSE',
        amount: 1500,
        status: 'PENDING',
        category: 'Rent',
        refId: 'EXP-002',
    },
    {
        id: 't5',
        date: '2024-02-10',
        description: 'Withdrawal to Owner',
        type: 'EXPENSE',
        amount: 2000,
        status: 'COMPLETED',
        category: 'Withdrawal',
    },
]

const CHART_DATA = [
    { date: 'Feb 01', income: 0, expense: 1500, balance: 10000 },
    { date: 'Feb 05', income: 2000, expense: 200, balance: 11800 },
    { date: 'Feb 10', income: 500, expense: 2000, balance: 10300 },
    { date: 'Feb 15', income: 4500, expense: 0, balance: 14800 },
    { date: 'Feb 20', income: 1000, expense: 120, balance: 15680 },
]

function PaymentChannelFlowPage() {
    const [selectedChannelId, setSelectedChannelId] = useState<string>('c1')

    const currentChannel =
        CHANNELS.find((c) => c.id === selectedChannelId) || CHANNELS[0]

    return (
        <div className="p-8 max-w-400 mx-auto min-h-screen bg-slate-50 space-y-8">
            {/* --- Header --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Money Flow & Reconciliation
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Track cash inflows and outflows per payment channel.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="flat"
                        startContent={<Download size={18} />}
                    >
                        Statement
                    </Button>
                    <Button color="primary" startContent={<Plus size={18} />}>
                        Record Transaction
                    </Button>
                </div>
            </div>

            {/* --- Channel Selector & KPI Cards --- */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left: Channel Selector Card */}
                <Card className="lg:col-span-1 bg-white border border-slate-200 shadow-sm h-full">
                    <CardBody className="p-6 flex flex-col justify-between">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                                Select Channel
                            </label>
                            <Select
                                aria-label="Select Channel"
                                defaultSelectedKeys={['c1']}
                                onChange={(e) =>
                                    setSelectedChannelId(e.target.value)
                                }
                                className="mb-6"
                                size="lg"
                                startContent={
                                    <currentChannel.icon
                                        className="text-slate-500"
                                        size={20}
                                    />
                                }
                            >
                                {CHANNELS.map((c) => (
                                    <SelectItem key={c.id} textValue={c.name}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        <div
                            className={`p-6 rounded-2xl bg-linear-to-br ${currentChannel.id === 'c1' ? 'from-blue-600 to-blue-800' : currentChannel.id === 'c2' ? 'from-purple-600 to-purple-800' : 'from-emerald-600 to-emerald-800'} text-white shadow-lg`}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <currentChannel.icon
                                    size={32}
                                    className="opacity-80"
                                />
                                <span className="font-mono text-xs opacity-60 uppercase">
                                    {currentChannel.type}
                                </span>
                            </div>
                            <div className="mb-2">
                                <p className="text-xs opacity-70">
                                    Current Balance
                                </p>
                                <h2 className="text-3xl font-bold">
                                    ${currentChannel.balance.toLocaleString()}
                                </h2>
                            </div>
                            <p className="font-mono text-sm opacity-60">
                                {currentChannel.accountNumber}
                            </p>
                        </div>
                    </CardBody>
                </Card>

                {/* Right: Flow Stats & Chart */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="shadow-sm border border-border-default">
                            <CardBody className="flex items-center gap-4 p-4">
                                <div className="p-3 rounded-full bg-emerald-50 text-emerald-600">
                                    <ArrowDownLeft size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase">
                                        Total In (Feb)
                                    </p>
                                    <h3 className="text-2xl font-bold text-emerald-600">
                                        +$8,000
                                    </h3>
                                </div>
                            </CardBody>
                        </Card>
                        <Card className="shadow-sm border border-border-default">
                            <CardBody className="flex items-center gap-4 p-4">
                                <div className="p-3 rounded-full bg-red-50 text-red-600">
                                    <ArrowUpRight size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase">
                                        Total Out (Feb)
                                    </p>
                                    <h3 className="text-2xl font-bold text-red-600">
                                        -$3,620
                                    </h3>
                                </div>
                            </CardBody>
                        </Card>
                        <Card className="shadow-sm border border-border-default">
                            <CardBody className="flex items-center gap-4 p-4">
                                <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase">
                                        Net Flow
                                    </p>
                                    <h3 className="text-2xl font-bold text-blue-600">
                                        +$4,380
                                    </h3>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Flow Chart */}
                    <Card className="shadow-sm border border-border-default">
                        <CardBody className="p-6">
                            <h3 className="font-bold text-slate-800 mb-4">
                                Cash Flow History
                            </h3>
                            <div className="h-62.5 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={CHART_DATA}>
                                        <defs>
                                            <linearGradient
                                                id="colorBalance"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="#3B82F6"
                                                    stopOpacity={0.2}
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
                                            tick={{
                                                fontSize: 12,
                                                fill: '#94A3B8',
                                            }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fontSize: 12,
                                                fill: '#94A3B8',
                                            }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '8px',
                                                border: 'none',
                                                boxShadow:
                                                    '0 4px 12px rgba(0,0,0,0.1)',
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="balance"
                                            stroke="#3B82F6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorBalance)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* --- Detailed Transaction Table --- */}
            <Card className="w-full shadow-sm border border-slate-200">
                <div className="p-6 border-b border-border-default flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800">
                        Transaction Ledger
                    </h3>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="bordered"
                            startContent={<Filter size={14} />}
                        >
                            Filter Date
                        </Button>
                    </div>
                </div>
                <Table
                    aria-label="Transaction History"
                    shadow="none"
                    removeWrapper
                >
                    <TableHeader>
                        <TableColumn>DATE</TableColumn>
                        <TableColumn>DESCRIPTION</TableColumn>
                        <TableColumn>CATEGORY</TableColumn>
                        <TableColumn>TYPE</TableColumn>
                        <TableColumn>STATUS</TableColumn>
                        <TableColumn align="end">AMOUNT</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {TRANSACTIONS.map((tx) => (
                            <TableRow key={tx.id} className="hover:bg-slate-50">
                                <TableCell>
                                    <span className="text-slate-500 font-mono text-xs">
                                        {tx.date}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <p className="font-semibold text-slate-700">
                                            {tx.description}
                                        </p>
                                        {tx.refId && (
                                            <p className="text-[10px] text-slate-400">
                                                Ref: {tx.refId}
                                            </p>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        size="sm"
                                        variant="flat"
                                        className="text-slate-500 bg-slate-100"
                                    >
                                        {tx.category}
                                    </Chip>
                                </TableCell>
                                <TableCell>
                                    <div
                                        className={`flex items-center gap-1 font-bold text-xs ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-500'}`}
                                    >
                                        {tx.type === 'INCOME' ? (
                                            <ArrowDownLeft size={14} />
                                        ) : (
                                            <ArrowUpRight size={14} />
                                        )}
                                        {tx.type}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        size="sm"
                                        variant="dot"
                                        color={
                                            tx.status === 'COMPLETED'
                                                ? 'success'
                                                : 'warning'
                                        }
                                    >
                                        {tx.status}
                                    </Chip>
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={`font-bold text-base ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-800'}`}
                                    >
                                        {tx.type === 'INCOME' ? '+' : '-'}$
                                        {tx.amount.toLocaleString()}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
