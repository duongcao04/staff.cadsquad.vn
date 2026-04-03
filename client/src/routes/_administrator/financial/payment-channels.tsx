import { AdminPageHeading } from '@/shared/components'
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Divider,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Switch,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tabs,
    Textarea,
    useDisclosure,
} from '@heroui/react'
import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useFormik } from 'formik'
import {
    Building2,
    CreditCard,
    Landmark,
    LayoutGrid,
    List,
    Plus,
    Receipt,
    TrendingUp
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
    currencyFormatter,
    PaymentChannelHelper,
    paymentChannelsListOptions,
} from '../../../lib'
import AdminContentContainer from '../../../shared/components/admin/AdminContentContainer'
import { TPaymentChannel } from '../../../shared/types'

export const Route = createFileRoute(
    '/_administrator/financial/payment-channels'
)({
    component: () => {
        const { isOpen, onOpen, onClose } = useDisclosure()
        const [selectedChannel, setSelectedChannel] = useState<TPaymentChannel | null>(null)

        const handleAdd = () => {
            setSelectedChannel(null)
            onOpen()
        }

        const handleEdit = (channel: any) => {
            setSelectedChannel(channel)
            onOpen()
        }

        return (
            <div>
                <AdminPageHeading
                    title="Payment Channels"
                    description="Manage bank accounts, wallets, and standard transaction fees."
                    actions={
                        <Button
                            color="primary"
                            startContent={<Plus size={16} />}
                            onPress={handleAdd}
                            className="font-bold shadow-sm"
                        >
                            Add New Channel
                        </Button>
                    }
                />
                <AdminContentContainer>
                    <PaymentChannelsPage onEdit={handleEdit} />
                </AdminContentContainer>

                {/* Create/Edit Modal */}
                <ChannelModal
                    isOpen={isOpen}
                    onClose={onClose}
                    channel={selectedChannel}
                />
            </div>
        )
    },
})

interface PaymentChannelsPageProps {
    onEdit: (channel: TPaymentChannel) => void
}
export default function PaymentChannelsPage({
    onEdit,
}: PaymentChannelsPageProps) {
    const {
        data: { paymentChannels },
    } = useSuspenseQuery(paymentChannelsListOptions())
    const [viewMode, setViewMode] = useState<string>('table')
    const [dateRange, setDateRange] = useState<string>('this_month')

    // --- Derived Stats ---
    const stats = useMemo(() => {
        const activeCount = paymentChannels.filter((c) => c.isActive).length
        const totalVol = paymentChannels.reduce(
            (acc, c) => acc + (c.totalVolume || 0),
            0
        )
        const totalFee = paymentChannels.reduce(
            (acc, c) => acc + (c.totalFees || 0),
            0
        )
        return { activeCount, totalVol, totalFee }
    }, [])

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(val)

    return (
        <div>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-start gap-2">
                    <p>The stats are displayed for</p>
                    <Select
                        size="sm"
                        variant="bordered"
                        selectedKeys={[dateRange]}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="w-40"
                        classNames={{
                            trigger: 'border-1 bg-background cursor-pointer',
                        }}
                    >
                        <SelectItem key="this_month">This Month</SelectItem>
                        <SelectItem key="last_month">Last Month</SelectItem>
                        <SelectItem key="this_year">This Year</SelectItem>
                        <SelectItem key="all_time">All Time</SelectItem>
                    </Select>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* 1. Total Volume */}
                    <Card
                        shadow="none"
                        className="bg-white border border-border-default"
                    >
                        <CardBody className="flex flex-row items-center justify-between p-5">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold tracking-wider uppercase text-default-500">
                                    Total Volume
                                </span>
                                <span className="text-2xl font-black text-default-900">
                                    {formatCurrency(stats.totalVol)}
                                </span>
                            </div>
                            <div className="p-3 bg-primary-50 rounded-xl text-primary">
                                <TrendingUp size={24} />
                            </div>
                        </CardBody>
                    </Card>

                    {/* 2. Total Fees Paid */}
                    <Card
                        shadow="none"
                        className="bg-white border border-border-default"
                    >
                        <CardBody className="flex flex-row items-center justify-between p-5">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold tracking-wider uppercase text-default-500">
                                    Total Fees Paid
                                </span>
                                <span className="text-2xl font-black">
                                    {formatCurrency(stats.totalFee)}
                                </span>
                            </div>
                            <div className="p-3 bg-danger-50 rounded-xl text-danger-500">
                                <CreditCard size={24} />
                            </div>
                        </CardBody>
                    </Card>

                    {/* 3. Total Transactions */}
                    <Card
                        shadow="none"
                        className="bg-white border border-border-default"
                    >
                        <CardBody className="flex flex-row items-center justify-between p-5">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold tracking-wider uppercase text-default-500">
                                    Total Transactions
                                </span>
                                <span className="text-2xl font-black text-default-900">
                                    {142}
                                </span>
                            </div>
                            <div className="p-3 bg-warning-50 rounded-xl text-warning-500">
                                <Receipt size={24} />
                            </div>
                        </CardBody>
                    </Card>

                    {/* 4. Active Channels */}
                    <Card
                        shadow="none"
                        className="bg-white border border-border-default"
                    >
                        <CardBody className="flex flex-row items-center justify-between p-5">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold tracking-wider uppercase text-default-500">
                                    Active Channels
                                </span>
                                <span className="text-2xl font-black text-default-900">
                                    {stats.activeCount}{' '}
                                    <span className="text-sm font-medium text-default-400">
                                        / {paymentChannels.length}
                                    </span>
                                </span>
                            </div>
                            <div className="p-3 bg-success-50 rounded-xl text-success-500">
                                <Building2 size={24} />
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
            <div className="p-6 mx-auto space-y-6 max-w-7xl animate-in fade-in">
                {/* --- CHANNEL LISTING CONTROLS --- */}
                <div className="flex items-center justify-end">
                    <Tabs
                        selectedKey={viewMode}
                        onSelectionChange={(key) => setViewMode(key.toString())}
                        color="primary"
                        variant="solid"
                        size="sm"
                        classNames={{ cursor: 'bg-white shadow-sm' }}
                        className="p-1 rounded-lg bg-default-100"
                    >
                        <Tab
                            key="table"
                            title={
                                <div className="flex items-center gap-2">
                                    <List size={16} />{' '}
                                    <span className="hidden sm:inline">
                                        Table
                                    </span>
                                </div>
                            }
                        />
                        <Tab
                            key="grid"
                            title={
                                <div className="flex items-center gap-2">
                                    <LayoutGrid size={16} />{' '}
                                    <span className="hidden sm:inline">
                                        Grid
                                    </span>
                                </div>
                            }
                        />
                    </Tabs>
                </div>

                {/* --- GRID VIEW --- */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {paymentChannels.map((channel) => (
                            <Card
                                key={channel.id}
                                shadow="sm"
                                className={`border transition-all ${channel.isActive ? 'border-default-200 bg-white' : 'border-default-100 opacity-75 bg-default-50'}`}
                            >
                                <CardHeader className="flex items-start justify-between p-5 pb-0">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`p-3 rounded-xl ${channel.isActive ? 'bg-primary-50' : 'bg-default-200'}`}
                                        >
                                            <Icon
                                                icon={
                                                    PaymentChannelHelper.getIcon(
                                                        channel.type
                                                    ).icon
                                                }
                                                width={16}
                                                height={16}
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <h3
                                                className="font-bold text-default-900 line-clamp-1"
                                                title={channel.displayName}
                                            >
                                                {channel.displayName}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Chip
                                                    size="sm"
                                                    variant="flat"
                                                    color={
                                                        channel.isActive
                                                            ? 'success'
                                                            : 'default'
                                                    }
                                                    className="h-5 text-[10px] font-bold"
                                                >
                                                    {channel.isActive
                                                        ? 'ACTIVE'
                                                        : 'INACTIVE'}
                                                </Chip>
                                                <span className="text-xs font-medium text-default-500">
                                                    {channel.type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardBody className="p-5 space-y-4">
                                    <div className="p-3 border rounded-lg bg-default-50 border-default-100">
                                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-default-500">
                                            Account Details
                                        </p>
                                        <p className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-default-700 line-clamp-3">
                                            {channel.accountDetails}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between p-3 border rounded-lg bg-default-50 border-default-100">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-default-500">
                                                Volume
                                            </span>
                                            <span className="text-sm font-bold text-default-900">
                                                {currencyFormatter(
                                                    channel.totalVolume || 0
                                                )}
                                            </span>
                                        </div>
                                        <Divider
                                            orientation="vertical"
                                            className="h-6"
                                        />
                                        <div className="flex flex-col gap-0.5 text-right">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-default-500">
                                                Fee Rule
                                            </span>
                                            <span className="text-sm font-bold text-default-900">
                                                {channel.feeRate > 0
                                                    ? `${channel.feeRate}% `
                                                    : ''}
                                                {channel.feeRate > 0 &&
                                                channel.fixedFee > 0
                                                    ? '+ '
                                                    : ''}
                                                {channel.fixedFee > 0
                                                    ? `$${channel.fixedFee}`
                                                    : ''}
                                                {channel.feeRate === 0 &&
                                                channel.fixedFee === 0
                                                    ? 'None'
                                                    : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        color="primary"
                                        variant={
                                            channel.isActive
                                                ? 'flat'
                                                : 'bordered'
                                        }
                                        className="w-full mt-2 font-bold"
                                        onPress={() => onEdit(channel)}
                                    >
                                        Edit Details
                                    </Button>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}

                {/* --- TABLE VIEW --- */}
                {viewMode === 'table' && (
                    <Card shadow="sm" className="border border-default-200">
                        <Table
                            aria-label="Payment Channels Table"
                            shadow="none"
                            classNames={{
                                wrapper: 'p-0 rounded-none border-none',
                            }}
                        >
                            <TableHeader>
                                <TableColumn>Display name</TableColumn>
                                <TableColumn>Status</TableColumn>
                                <TableColumn>Fee Structure</TableColumn>
                                <TableColumn>Vol. Processed</TableColumn>
                                <TableColumn align="end">Actions</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {paymentChannels.map((channel) => (
                                    <TableRow key={channel.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-default-100">
                                                    <Icon
                                                        icon={
                                                            PaymentChannelHelper.getIcon(
                                                                channel.type
                                                            ).icon
                                                        }
                                                        width={18}
                                                        height={18}
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-default-900">
                                                        {channel.displayName}
                                                    </span>
                                                    <span className="text-xs text-default-500">
                                                        {channel.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                color={
                                                    channel.isActive
                                                        ? 'success'
                                                        : 'default'
                                                }
                                                className="font-bold text-[10px]"
                                            >
                                                {channel.isActive
                                                    ? 'ACTIVE'
                                                    : 'INACTIVE'}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium">
                                                {channel.feeRate > 0
                                                    ? `${channel.feeRate}% `
                                                    : ''}
                                                {channel.feeRate > 0 &&
                                                channel.fixedFee > 0
                                                    ? '+ '
                                                    : ''}
                                                {channel.fixedFee > 0
                                                    ? `$${channel.fixedFee}`
                                                    : ''}
                                                {channel.feeRate === 0 &&
                                                channel.fixedFee === 0
                                                    ? 'None'
                                                    : ''}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-default-900">
                                                    {formatCurrency(
                                                        channel.totalVolume
                                                    )}
                                                </span>
                                                <span className="text-xs text-default-400">
                                                    Fees:{' '}
                                                    {currencyFormatter(
                                                        channel.totalFees || 0
                                                    )}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                variant="light"
                                                color="primary"
                                                onPress={() => onEdit(channel)}
                                                className="font-medium"
                                            >
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                )}
            </div>
        </div>
    )
}

// --- Inner Component: Create/Edit Modal ---
const ChannelModal = ({
    isOpen,
    onClose,
    channel,
}: {
    isOpen: boolean
    onClose: () => void
    channel: any
}) => {
    const isEditing = !!channel

    const formik = useFormik({
        initialValues: {
            name: channel?.name || '',
            type: channel?.type || 'BANK',
            accountDetails: channel?.accountDetails || '',
            feeRate: channel?.feeRate || 0,
            fixedFee: channel?.fixedFee || 0,
            isActive: channel !== undefined ? channel?.isActive : true,
        },
        enableReinitialize: true,
        onSubmit: async (values) => {
            console.log(isEditing ? 'Updating:' : 'Creating:', values)
            // Call API to Create/Update PaymentChannel here
            onClose()
            formik.resetForm()
        },
    })

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
            <ModalContent>
                <form onSubmit={formik.handleSubmit}>
                    <ModalHeader className="flex flex-col gap-1 px-6 pt-6 pb-4 border-b border-divider">
                        <span className="text-xl font-bold">
                            {isEditing
                                ? 'Edit Payment Channel'
                                : 'Add New Payment Channel'}
                        </span>
                        <p className="text-sm font-normal text-default-500">
                            Configure bank accounts or digital wallets for
                            invoices and payouts.
                        </p>
                    </ModalHeader>

                    <ModalBody className="grid grid-cols-1 gap-6 px-6 py-6 md:grid-cols-2">
                        <Input
                            isRequired
                            name="name"
                            label="Channel Name"
                            placeholder="e.g., Vietcombank, PayPal"
                            variant="bordered"
                            labelPlacement="outside"
                            classNames={{
                                label: 'font-semibold text-default-700',
                            }}
                            value={formik.values.name}
                            onChange={formik.handleChange}
                        />

                        <Select
                            isRequired
                            name="type"
                            label="Channel Type"
                            variant="bordered"
                            labelPlacement="outside"
                            classNames={{
                                label: 'font-semibold text-default-700',
                            }}
                            selectedKeys={[formik.values.type]}
                            onChange={formik.handleChange}
                        >
                            <SelectItem
                                key="BANK"
                                textValue="Bank Account"
                                startContent={
                                    <Building2
                                        size={16}
                                        className="text-default-400"
                                    />
                                }
                            >
                                Bank Account
                            </SelectItem>
                            <SelectItem
                                key="E_WALLET"
                                textValue="E-Wallet"
                                startContent={
                                    <CreditCard
                                        size={16}
                                        className="text-default-400"
                                    />
                                }
                            >
                                E-Wallet
                            </SelectItem>
                            <SelectItem
                                key="CRYPTO"
                                textValue="Cryptocurrency"
                                startContent={
                                    <Landmark
                                        size={16}
                                        className="text-default-400"
                                    />
                                }
                            >
                                Cryptocurrency
                            </SelectItem>
                        </Select>

                        <div className="md:col-span-2">
                            <Textarea
                                name="accountDetails"
                                label="Account Details / Instructions"
                                placeholder="Enter routing numbers, account numbers, or payment links. This will be shown to clients."
                                variant="bordered"
                                labelPlacement="outside"
                                classNames={{
                                    label: 'font-semibold text-default-700',
                                }}
                                minRows={3}
                                value={formik.values.accountDetails}
                                onChange={formik.handleChange}
                            />
                        </div>

                        <Divider className="md:col-span-2" />

                        <Input
                            name="feeRate"
                            label="Percentage Fee (%)"
                            type="number"
                            step="0.01"
                            variant="bordered"
                            labelPlacement="outside"
                            classNames={{
                                label: 'font-semibold text-default-700',
                            }}
                            description="e.g., 2.9 for Stripe"
                            endContent={
                                <span className="text-sm text-default-400">
                                    %
                                </span>
                            }
                            value={formik.values.feeRate.toString()}
                            onChange={formik.handleChange}
                        />

                        <Input
                            name="fixedFee"
                            label="Fixed Fee Amount"
                            type="number"
                            step="0.01"
                            variant="bordered"
                            labelPlacement="outside"
                            classNames={{
                                label: 'font-semibold text-default-700',
                            }}
                            description="e.g., 0.30 cents or $15 wire fee"
                            startContent={
                                <span className="text-sm text-default-400">
                                    $
                                </span>
                            }
                            value={formik.values.fixedFee.toString()}
                            onChange={formik.handleChange}
                        />

                        <div className="flex items-center justify-between p-4 mt-2 border md:col-span-2 bg-default-50 rounded-xl border-default-200">
                            <div className="flex flex-col gap-0.5">
                                <p className="text-sm font-bold text-default-900">
                                    Active Status
                                </p>
                                <p className="text-xs text-default-500">
                                    Allow this channel to be selected for
                                    transactions.
                                </p>
                            </div>
                            <Switch
                                name="isActive"
                                color="success"
                                isSelected={formik.values.isActive}
                                onValueChange={(val) =>
                                    formik.setFieldValue('isActive', val)
                                }
                            />
                        </div>
                    </ModalBody>

                    <ModalFooter className="px-6 py-4 border-t border-divider">
                        <Button
                            variant="flat"
                            onPress={onClose}
                            className="font-medium"
                        >
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            type="submit"
                            className="font-bold shadow-sm"
                        >
                            {isEditing ? 'Save Changes' : 'Create Channel'}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    )
}
