import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_administrator/mgmt/clients/')({
    component: ClientManagementPage,
})

import {
    Button,
    Card,
    CardBody,
    Chip,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tooltip,
    useDisclosure,
} from '@heroui/react'
import { Link } from '@tanstack/react-router'
import { useFormik } from 'formik'
import {
    Building2,
    Edit3,
    ExternalLink,
    EyeIcon,
    Globe2,
    Mail,
    MapPin,
    Phone,
    Plus,
    Search,
    Trash2,
    UserCircle,
} from 'lucide-react'
import { useState } from 'react'
import { INTERNAL_URLS } from '../../../../lib'

// --- Mock Data ---
const MOCK_CLIENTS = [
    {
        id: '1',
        code: 'CUST-001',
        name: 'Global Real Estate Corp',
        type: 'COMPANY',
        region: 'North America',
        country: 'USA',
        email: 'contact@globalre.com',
        phoneNumber: '+1 555-0198',
        billingEmail: 'billing@globalre.com',
        taxId: 'US-987654321',
        currency: 'USD',
        paymentTerms: 30,
        activeJobs: 3,
    },
    {
        id: '2',
        code: 'CUST-002',
        name: 'Studio X',
        type: 'COMPANY',
        region: 'Europe',
        country: 'UK',
        email: 'hello@studiox.co.uk',
        phoneNumber: '+44 20 7123 4567',
        billingEmail: 'finance@studiox.co.uk',
        taxId: 'GB-123456789',
        currency: 'GBP',
        paymentTerms: 15,
        activeJobs: 1,
    },
    {
        id: '3',
        code: 'CUST-003',
        name: 'Tom Jain',
        type: 'INDIVIDUAL',
        region: 'Asia',
        country: 'Singapore',
        email: 'tom.jain@freelance.sg',
        phoneNumber: '+65 9876 5432',
        billingEmail: null,
        taxId: null,
        currency: 'SGD',
        paymentTerms: 0, // Pay upfront
        activeJobs: 2,
    },
]

export default function ClientManagementPage() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedClient, setSelectedClient] = useState<any>(null)

    // Filter Logic
    const filteredClients = MOCK_CLIENTS.filter(
        (client) =>
            client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.code.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Stats
    const totalClients = MOCK_CLIENTS.length
    const companyCount = MOCK_CLIENTS.filter((c) => c.type === 'COMPANY').length
    const indvCount = totalClients - companyCount

    const handleAdd = () => {
        setSelectedClient(null)
        onOpen()
    }

    const handleEdit = (client: any) => {
        setSelectedClient(client)
        onOpen()
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* 1. Header & Quick Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-default-900 flex items-center gap-2">
                        <Building2 className="text-primary" /> Client Directory
                    </h1>
                    <p className="text-sm text-default-500">
                        Manage corporate and individual clients, billing
                        details, and regional data.
                    </p>
                </div>
                <Button
                    color="primary"
                    startContent={<Plus size={16} />}
                    onPress={handleAdd}
                >
                    Add New Client
                </Button>
            </div>

            {/* 2. KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card shadow="sm" className="border border-default-200">
                    <CardBody className="p-5 flex flex-row items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-default-600">
                                Total Clients
                            </p>
                            <p className="text-2xl font-bold text-default-900 mt-1">
                                {totalClients}
                            </p>
                        </div>
                        <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
                            <Building2 size={24} />
                        </div>
                    </CardBody>
                </Card>

                <Card shadow="sm" className="border border-default-200">
                    <CardBody className="p-5 flex flex-row items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-default-600">
                                Client Breakdown
                            </p>
                            <p className="text-lg font-bold text-default-900 mt-1">
                                {companyCount} Corporate
                            </p>
                            <p className="text-xs text-default-500 mt-1">
                                {indvCount} Individual
                            </p>
                        </div>
                        <div className="p-3 bg-warning-50 rounded-xl text-warning-600">
                            <UserCircle size={24} />
                        </div>
                    </CardBody>
                </Card>

                <Card shadow="sm" className="border border-default-200">
                    <CardBody className="p-5 flex flex-row items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-default-600">
                                Global Reach
                            </p>
                            <p className="text-lg font-bold text-default-900 mt-1">
                                3 Regions
                            </p>
                            <p className="text-xs text-default-500 mt-1">
                                USA, UK, Singapore
                            </p>
                        </div>
                        <div className="p-3 bg-success-50 rounded-xl text-success-600">
                            <Globe2 size={24} />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* 3. Data Table */}
            <Card shadow="sm" className="border border-default-200">
                <div className="p-4 border-b border-divider flex items-center justify-between bg-default-50">
                    <Input
                        placeholder="Search by client name or code..."
                        startContent={
                            <Search size={16} className="text-default-400" />
                        }
                        className="max-w-md"
                        variant="bordered"
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                </div>

                <Table
                    aria-label="Clients Table"
                    removeWrapper
                    className="bg-transparent"
                >
                    <TableHeader>
                        <TableColumn>CLIENT DETAILS</TableColumn>
                        <TableColumn>CONTACT INFO</TableColumn>
                        <TableColumn>LOCATION</TableColumn>
                        <TableColumn>BILLING / TERMS</TableColumn>
                        <TableColumn align="end">ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="No clients found.">
                        {filteredClients.map((client) => (
                            <TableRow
                                key={client.id}
                                className="hover:bg-default-100/50 transition-colors"
                            >
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-default-900">
                                                {client.name}
                                            </span>
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                color={
                                                    client.type === 'COMPANY'
                                                        ? 'primary'
                                                        : 'default'
                                                }
                                                className="h-5 text-[10px]"
                                            >
                                                {client.type}
                                            </Chip>
                                        </div>
                                        <span className="text-xs text-default-500 font-mono">
                                            {client.code}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 text-sm text-default-700">
                                        <div className="flex items-center gap-2">
                                            <Mail
                                                size={14}
                                                className="text-default-400"
                                            />{' '}
                                            {client.email}
                                        </div>
                                        {client.phoneNumber && (
                                            <div className="flex items-center gap-2">
                                                <Phone
                                                    size={14}
                                                    className="text-default-400"
                                                />{' '}
                                                {client.phoneNumber}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-start gap-2 text-sm text-default-700">
                                        <MapPin
                                            size={16}
                                            className="text-danger-400 mt-0.5"
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {client.country}
                                            </span>
                                            <span className="text-xs text-default-400">
                                                {client.region}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-semibold text-default-800">
                                            NET {client.paymentTerms} Days
                                        </span>
                                        <span className="text-xs text-default-500">
                                            Curr: {client.currency}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-end gap-2">
                                        <Tooltip content="View Jobs">
                                            <Link
                                                to={INTERNAL_URLS.management.clientDetail(
                                                    client.code
                                                )}
                                            >
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    color="primary"
                                                >
                                                    <EyeIcon size={16} />
                                                </Button>
                                            </Link>
                                        </Tooltip>
                                        <Tooltip content="Edit Client">
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                color="default"
                                                onPress={() =>
                                                    handleEdit(client)
                                                }
                                            >
                                                <Edit3 size={16} />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip
                                            content="Delete Client"
                                            color="danger"
                                        >
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                color="danger"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* Form Modal */}
            <ClientFormModal
                isOpen={isOpen}
                onClose={onClose}
                client={selectedClient}
            />
        </div>
    )
}

// --- Inner Component: Modal Form ---
const ClientFormModal = ({
    isOpen,
    onClose,
    client,
}: {
    isOpen: boolean
    onClose: () => void
    client: any
}) => {
    const isEditing = !!client

    const formik = useFormik({
        initialValues: {
            code: client?.code || '',
            name: client?.name || '',
            type: client?.type || 'COMPANY',
            email: client?.email || '',
            phoneNumber: client?.phoneNumber || '',
            billingEmail: client?.billingEmail || '',
            country: client?.country || '',
            region: client?.region || '',
            currency: client?.currency || 'USD',
            paymentTerms: client?.paymentTerms || 30,
            taxId: client?.taxId || '',
        },
        enableReinitialize: true,
        onSubmit: async (values) => {
            console.log(
                isEditing ? 'Updating client:' : 'Creating client:',
                values
            )
            // Call API to save Client
            onClose()
            formik.resetForm()
        },
    })

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="3xl"
            scrollBehavior="inside"
        >
            <ModalContent>
                <form onSubmit={formik.handleSubmit}>
                    <ModalHeader className="flex flex-col gap-1 border-b border-divider pb-4">
                        <span className="text-xl font-bold">
                            {isEditing
                                ? 'Edit Client Details'
                                : 'Register New Client'}
                        </span>
                        <p className="text-sm text-default-500">
                            Fill in the client's operational and financial
                            profiles.
                        </p>
                    </ModalHeader>

                    <ModalBody className="py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column: General Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-default-900 border-b border-default-200 pb-2">
                                    General Profile
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        isRequired
                                        name="code"
                                        label="Client Code"
                                        placeholder="e.g. CUST-001"
                                        variant="bordered"
                                        labelPlacement="outside"
                                        value={formik.values.code}
                                        onChange={formik.handleChange}
                                    />
                                    <Select
                                        isRequired
                                        name="type"
                                        label="Client Type"
                                        variant="bordered"
                                        labelPlacement="outside"
                                        selectedKeys={[formik.values.type]}
                                        onChange={formik.handleChange}
                                    >
                                        <SelectItem
                                            key="COMPANY"
                                            textValue="Company"
                                        >
                                            Corporate / Company
                                        </SelectItem>
                                        <SelectItem
                                            key="INDIVIDUAL"
                                            textValue="Individual"
                                        >
                                            Individual / Freelancer
                                        </SelectItem>
                                    </Select>
                                </div>

                                <Input
                                    isRequired
                                    name="name"
                                    label="Company / Full Name"
                                    variant="bordered"
                                    labelPlacement="outside"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        name="country"
                                        label="Country"
                                        placeholder="e.g. USA"
                                        variant="bordered"
                                        labelPlacement="outside"
                                        value={formik.values.country}
                                        onChange={formik.handleChange}
                                    />
                                    <Input
                                        name="region"
                                        label="Region"
                                        placeholder="e.g. North America"
                                        variant="bordered"
                                        labelPlacement="outside"
                                        value={formik.values.region}
                                        onChange={formik.handleChange}
                                    />
                                </div>

                                <Input
                                    name="phoneNumber"
                                    label="Phone Number"
                                    variant="bordered"
                                    labelPlacement="outside"
                                    value={formik.values.phoneNumber}
                                    onChange={formik.handleChange}
                                    startContent={
                                        <Phone
                                            size={14}
                                            className="text-default-400"
                                        />
                                    }
                                />
                            </div>

                            {/* Right Column: Financial & Billing */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-default-900 border-b border-default-200 pb-2">
                                    Billing & Financials
                                </h3>

                                <Input
                                    isRequired
                                    name="email"
                                    label="Primary Email"
                                    type="email"
                                    variant="bordered"
                                    labelPlacement="outside"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    startContent={
                                        <Mail
                                            size={14}
                                            className="text-default-400"
                                        />
                                    }
                                />

                                <Input
                                    name="billingEmail"
                                    label="Billing / Accounts Email"
                                    type="email"
                                    description="Invoices will be CC'd here."
                                    variant="bordered"
                                    labelPlacement="outside"
                                    value={formik.values.billingEmail}
                                    onChange={formik.handleChange}
                                />

                                <Input
                                    name="taxId"
                                    label="Tax ID / VAT Number"
                                    variant="bordered"
                                    labelPlacement="outside"
                                    value={formik.values.taxId}
                                    onChange={formik.handleChange}
                                />

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <Select
                                        isRequired
                                        name="currency"
                                        label="Default Currency"
                                        variant="bordered"
                                        labelPlacement="outside"
                                        selectedKeys={[formik.values.currency]}
                                        onChange={formik.handleChange}
                                    >
                                        <SelectItem
                                            key="USD"
                                            textValue="USD ($)"
                                        >
                                            USD ($)
                                        </SelectItem>
                                        <SelectItem
                                            key="EUR"
                                            textValue="EUR (€)"
                                        >
                                            EUR (€)
                                        </SelectItem>
                                        <SelectItem
                                            key="GBP"
                                            textValue="GBP (£)"
                                        >
                                            GBP (£)
                                        </SelectItem>
                                        <SelectItem
                                            key="SGD"
                                            textValue="SGD ($)"
                                        >
                                            SGD ($)
                                        </SelectItem>
                                        <SelectItem
                                            key="VND"
                                            textValue="VND (₫)"
                                        >
                                            VND (₫)
                                        </SelectItem>
                                    </Select>

                                    <Input
                                        isRequired
                                        name="paymentTerms"
                                        label="Payment Terms (Days)"
                                        type="number"
                                        description="e.g. 30 for NET30"
                                        variant="bordered"
                                        labelPlacement="outside"
                                        value={formik.values.paymentTerms.toString()}
                                        onChange={formik.handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </ModalBody>

                    <ModalFooter className="border-t border-divider pt-4">
                        <Button variant="flat" onPress={onClose}>
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            type="submit"
                            className="font-bold"
                        >
                            {isEditing ? 'Save Changes' : 'Register Client'}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    )
}
