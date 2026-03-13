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
    Textarea,
    useDisclosure,
} from '@heroui/react'
import { createFileRoute } from '@tanstack/react-router'
import { useFormik } from 'formik'
import { Building2, CreditCard, Landmark, Plus, Settings2 } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute(
    '/_administrator/financial/payment-channels'
)({
    component: PaymentChannelsPage,
})

// --- Mock Data ---
const MOCK_CHANNELS = [
    {
        id: '1',
        name: 'Vietcombank (VCB)',
        type: 'BANK',
        accountDetails:
            'Acc: 0987654321\nName: CAD SQUAD CO., LTD\nBranch: Ho Chi Minh City',
        feeRate: 0,
        fixedFee: 0,
        isActive: true,
    },
    {
        id: '2',
        name: 'Stripe International',
        type: 'E_WALLET',
        accountDetails: 'Main Stripe Account connected to CAD SQUAD website.',
        feeRate: 2.9,
        fixedFee: 0.3,
        isActive: true,
    },
    {
        id: '3',
        name: 'Wise (TransferWise)',
        type: 'BANK',
        accountDetails: 'USD Routing: 122105155\nAcc: 100200300',
        feeRate: 0,
        fixedFee: 4.14,
        isActive: false, // Inactive example
    },
]

export default function PaymentChannelsPage() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [selectedChannel, setSelectedChannel] = useState<any>(null)

    const handleAdd = () => {
        setSelectedChannel(null)
        onOpen()
    }

    const handleEdit = (channel: any) => {
        setSelectedChannel(channel)
        onOpen()
    }

    // Helper to pick the right icon
    const getIcon = (type: string) => {
        switch (type) {
            case 'BANK':
                return <Building2 size={24} className="text-primary" />
            case 'E_WALLET':
                return <CreditCard size={24} className="text-success" />
            case 'CRYPTO':
                return <Landmark size={24} className="text-warning" />
            default:
                return <Landmark size={24} className="text-default-500" />
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-default-900 flex items-center gap-2">
                        <Settings2 className="text-primary" /> Payment Channels
                    </h1>
                    <p className="text-sm text-default-500">
                        Manage bank accounts, wallets, and standard transaction
                        fees.
                    </p>
                </div>
                <Button
                    color="primary"
                    startContent={<Plus size={16} />}
                    onPress={handleAdd}
                >
                    Add New Channel
                </Button>
            </div>

            {/* Channels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_CHANNELS.map((channel) => (
                    <Card
                        key={channel.id}
                        shadow="sm"
                        className={`border transition-all ${channel?.isActive ? 'border-default-200' : 'border-default-100 opacity-70 bg-default-50'}`}
                    >
                        <CardHeader className="flex justify-between items-start p-5 pb-0">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`p-3 rounded-xl ${channel?.isActive ? 'bg-primary-50' : 'bg-default-100'}`}
                                >
                                    {getIcon(channel.type)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-default-900">
                                        {channel.name}
                                    </h3>
                                    <Chip
                                        size="sm"
                                        variant="flat"
                                        color={
                                            channel?.isActive
                                                ? 'success'
                                                : 'default'
                                        }
                                        className="mt-1"
                                    >
                                        {channel?.isActive
                                            ? 'Active'
                                            : 'Inactive'}
                                    </Chip>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody className="p-5 space-y-4">
                            {/* Account Details Block */}
                            <div className="bg-default-100 p-3 rounded-lg">
                                <p className="text-xs font-bold text-default-500 uppercase mb-1">
                                    Account Info
                                </p>
                                <p className="text-sm text-default-700 whitespace-pre-wrap font-mono">
                                    {channel.accountDetails}
                                </p>
                            </div>

                            {/* Fees Block */}
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-default-500">
                                    Standard Fee:
                                </span>
                                <span className="font-semibold text-default-800">
                                    {channel.feeRate > 0
                                        ? `${channel.feeRate}% `
                                        : ''}
                                    {channel.feeRate > 0 && channel.fixedFee > 0
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

                            <Divider />

                            {/* Actions */}
                            <div className="flex justify-between items-center pt-2">
                                <Switch
                                    size="sm"
                                    color="success"
                                    isSelected={channel?.isActive}
                                    aria-label="Toggle active status"
                                >
                                    <span className="text-xs text-default-500">
                                        Active
                                    </span>
                                </Switch>
                                <Button
                                    size="sm"
                                    variant="light"
                                    color="primary"
                                    onPress={() => handleEdit(channel)}
                                >
                                    Edit Details
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {/* Modal Form */}
            <ChannelModal
                isOpen={isOpen}
                onClose={onClose}
                channel={selectedChannel}
            />
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
            // 1. Call API to Create/Update PaymentChannel
            onClose()
            formik.resetForm()
        },
    })

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
            <ModalContent>
                <form onSubmit={formik.handleSubmit}>
                    <ModalHeader className="flex flex-col gap-1 border-b border-divider">
                        <span className="text-xl font-bold">
                            {isEditing
                                ? 'Edit Payment Channel'
                                : 'Add New Payment Channel'}
                        </span>
                        <p className="text-sm text-default-500">
                            Configure bank accounts or digital wallets for
                            invoices and payouts.
                        </p>
                    </ModalHeader>

                    <ModalBody className="py-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            isRequired
                            name="name"
                            label="Channel Name"
                            placeholder="e.g., Vietcombank, PayPal"
                            variant="bordered"
                            labelPlacement="outside"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                        />

                        <Select
                            isRequired
                            name="type"
                            label="Channel Type"
                            variant="bordered"
                            labelPlacement="outside"
                            selectedKeys={[formik.values.type]}
                            onChange={formik.handleChange}
                        >
                            <SelectItem
                                key="BANK"
                                textValue="Bank Account"
                                startContent={<Building2 size={16} />}
                            >
                                Bank Account
                            </SelectItem>
                            <SelectItem
                                key="E_WALLET"
                                textValue="E-Wallet (Stripe, PayPal)"
                                startContent={<CreditCard size={16} />}
                            >
                                E-Wallet
                            </SelectItem>
                            <SelectItem
                                key="CRYPTO"
                                textValue="Cryptocurrency"
                                startContent={<Landmark size={16} />}
                            >
                                Cryptocurrency
                            </SelectItem>
                        </Select>

                        <div className="md:col-span-2">
                            <Textarea
                                name="accountDetails"
                                label="Account Details / Instructions"
                                placeholder="Enter routing numbers, account numbers, or payment links. This can be shared with clients."
                                variant="bordered"
                                labelPlacement="outside"
                                minRows={3}
                                value={formik.values.accountDetails}
                                onChange={formik.handleChange}
                            />
                        </div>

                        <Input
                            name="feeRate"
                            label="Percentage Fee (%)"
                            type="number"
                            step="0.01"
                            variant="bordered"
                            labelPlacement="outside"
                            description="e.g., 2.9 for Stripe"
                            endContent={
                                <span className="text-default-400">%</span>
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
                            description="e.g., 0.30 cents or $15 wire fee"
                            startContent={
                                <span className="text-default-400">$</span>
                            }
                            value={formik.values.fixedFee.toString()}
                            onChange={formik.handleChange}
                        />

                        <div className="md:col-span-2 flex items-center justify-between p-4 bg-default-50 rounded-xl border border-default-200 mt-2">
                            <div>
                                <p className="text-sm font-bold text-default-900">
                                    Active Status
                                </p>
                                <p className="text-xs text-default-500">
                                    Allow this channel to be selected for
                                    payouts and invoices.
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

                    <ModalFooter className="border-t border-divider">
                        <Button variant="flat" onPress={onClose}>
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            type="submit"
                            className="font-bold"
                        >
                            {isEditing ? 'Save Changes' : 'Create Channel'}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    )
}
