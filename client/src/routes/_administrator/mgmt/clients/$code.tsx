import {
    currencyFormatter,
    dateFormatter,
    INTERNAL_URLS,
    JobHelper,
    RouteUtil,
} from '@/lib'
import { clientOptions } from '@/lib/queries'
import { AdminPageHeading, JobStatusChip } from '@/shared/components'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import { Book, ClockArrowRotateLeft } from '@gravity-ui/icons'
import {
    BreadcrumbItem,
    Breadcrumbs,
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
    Tab,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tabs,
    useDisclosure,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useFormik } from 'formik'
import {
    Activity,
    Building2,
    ChevronLeft,
    CropIcon,
    Edit3,
    EyeIcon,
    Mail,
    Phone,
    Receipt,
    TrendingUp,
    UserCircle,
} from 'lucide-react'
import { z } from 'zod'
import { ClientHelper } from '../../../../lib/helpers'

enum TabOptions {
    HISTORY = 'history',
}
export const clientDetailSchema = z.object({
    tab: z.nativeEnum(TabOptions).default(TabOptions.HISTORY),
})
export type TClientDetailSchema = z.infer<typeof clientDetailSchema>
export const Route = createFileRoute('/_administrator/mgmt/clients/$code')({
    validateSearch: (search) => clientDetailSchema.parse(search),
    loaderDeps: ({ search }) => ({ search }),
    component: ClientDetailPage,
})

export default function ClientDetailPage() {
    const searchParams = Route.useSearch()
    const router = useRouter()
    const { code } = Route.useParams()
    const { isOpen, onOpen, onClose } = useDisclosure()

    const {
        data: client,
        isLoading,
        error,
    } = useSuspenseQuery(clientOptions(code))

    const clientJobs = client?.jobs || []

    if (isLoading) return <div>Loading client details...</div>
    if (error) return <div>Error loading client details.</div>

    // Calculate Client-Specific Stats
    const totalSpent = clientJobs.reduce(
        (sum, j) => sum + (j.incomeCost || 0),
        0
    )

    const unpaidBalance = clientJobs
        .filter((j) => !JobHelper.isCompleted(j))
        .reduce((sum, j) => sum + (j.incomeCost || 0), 0)

    const activeJobsCount = clientJobs.filter(
        (j) => !JobHelper.isCompleted(j)
    ).length

    const clientTypeDisplay = ClientHelper.getClientTypeDisplay(client.type)

    return (
        <div className="min-h-screen">
            <AdminPageHeading
                title={
                    <div className="flex items-center gap-1.5">
                        <Button
                            isIconOnly
                            variant="light"
                            onPress={() => router.history.back()}
                        >
                            <ChevronLeft size={16} />
                        </Button>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 text-primary bg-primary-50 rounded-xl">
                                {client.type === 'COMPANY' ? (
                                    <Building2 size={24} />
                                ) : (
                                    <UserCircle size={24} />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold tracking-tight text-text-default">
                                        {client.name}
                                    </h1>
                                    <Chip
                                        size="sm"
                                        color={clientTypeDisplay.colorName}
                                    >
                                        <span className="px-1 py-0.5 font-semibold text-white">
                                            {clientTypeDisplay.title}
                                        </span>
                                    </Chip>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-text-subdued">
                                        Code: {client.code}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                actions={
                    <Button
                        color="primary"
                        startContent={<Edit3 size={16} />}
                        onPress={onOpen}
                    >
                        Edit Profile
                    </Button>
                }
            />

            <AdminContentContainer className="pt-0 mx-auto space-y-6 max-w-7xl">
                <Breadcrumbs className="mb-4 text-xs" underline="hover">
                    <BreadcrumbItem>
                        <Link
                            to={INTERNAL_URLS.admin.overview}
                            className="text-text-subdued!"
                        >
                            Management
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link
                            to={INTERNAL_URLS.management.clients}
                            className="text-text-subdued!"
                        >
                            Clients
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>{client.name}</BreadcrumbItem>
                </Breadcrumbs>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* --- LEFT COLUMN: Profile --- */}
                    <div className="space-y-6 lg:col-span-4">
                        <Card
                            shadow="none"
                            className="sticky border border-border-default top-6"
                        >
                            <CardHeader className="px-6 py-4 border-b bg-default-50 border-divider">
                                <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wider text-text-default">
                                    <Book
                                        fontSize={16}
                                        className="text-text-subdued"
                                    />
                                    Profile
                                </h3>
                            </CardHeader>
                            <CardBody className="p-0">
                                <div className="p-6 space-y-4 border-b border-divider">
                                    <MetaItem
                                        label="Established"
                                        value={new Date(client.createdAt)
                                            .getFullYear()
                                            .toString()}
                                    />
                                    <div className="flex items-start justify-between">
                                        <span className="text-xs font-semibold tracking-wider uppercase text-text-subdued">
                                            Location
                                        </span>
                                        <div className="text-right">
                                            <span className="block text-sm font-medium text-text-default">
                                                {client.country || 'Unknown'}
                                            </span>
                                            {client.region && (
                                                <span className="text-xs text-text-subdued">
                                                    {client.region}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Protocol */}
                                <div className="p-6 border-b border-divider">
                                    <h5 className="mb-4 text-xs font-semibold tracking-wider uppercase text-text-subdued">
                                        Contact Info
                                    </h5>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm text-text-default">
                                            <Mail
                                                size={16}
                                                className="text-default-400"
                                            />
                                            <a
                                                href={`mailto:${client.email}`}
                                                className="font-medium truncate transition-colors hover:text-primary"
                                            >
                                                {client.email || 'N/A'}
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-text-default">
                                            <Phone
                                                size={16}
                                                className="text-default-400"
                                            />
                                            <span className="font-medium">
                                                {client.phoneNumber || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Configuration */}
                                <div className="p-6">
                                    <h5 className="mb-4 text-xs font-semibold tracking-wider uppercase text-text-subdued">
                                        Financial Configuration
                                    </h5>
                                    <div className="space-y-3">
                                        <MetaItem
                                            label="Tax ID"
                                            value={client.taxId || 'N/A'}
                                        />
                                        <MetaItem
                                            label="Terms"
                                            value={`NET ${client.paymentTerms} Days`}
                                        />
                                        <MetaItem
                                            label="Currency"
                                            value={client.currency}
                                        />

                                        <div className="p-3 mt-4 border rounded-xl bg-default-50 border-divider">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-text-subdued mb-1 flex items-center gap-1.5">
                                                <Receipt size={14} /> Billing
                                                Email
                                            </p>
                                            <p className="text-sm font-medium truncate text-default-800">
                                                {client.billingEmail ||
                                                    client.email ||
                                                    'No billing email set'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* --- RIGHT COLUMN: KPIs & Operational History --- */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <StatCard
                                label="Lifetime Value"
                                value={currencyFormatter(totalSpent)}
                                sub="Total realized revenue"
                                icon={TrendingUp}
                                iconColor="text-success-600"
                                bgColor="bg-success-50"
                            />
                            <StatCard
                                label="Unpaid Balance"
                                value={currencyFormatter(unpaidBalance)}
                                sub={
                                    unpaidBalance > 0
                                        ? 'Requires attention'
                                        : 'Account settled'
                                }
                                icon={CropIcon}
                                iconColor={
                                    unpaidBalance > 0
                                        ? 'text-danger-600'
                                        : 'text-default-600'
                                }
                                bgColor={
                                    unpaidBalance > 0
                                        ? 'bg-danger-50'
                                        : 'bg-default-50'
                                }
                            />
                            <StatCard
                                label="Active Directives"
                                value={activeJobsCount.toString()}
                                sub="Current ongoing projects"
                                icon={Activity}
                                iconColor="text-primary-600"
                                bgColor="bg-primary-50"
                            />
                        </div>

                        {/* Tabs for Data */}
                        <Card shadow="none" className="border border-default">
                            <CardHeader>
                                <Tabs
                                    aria-label="Client Data"
                                    color="primary"
                                    variant="underlined"
                                    selectedKey={searchParams.tab}
                                    onSelectionChange={(key) =>
                                        RouteUtil.updateParams({
                                            tab: key as TabOptions,
                                        })
                                    }
                                    classNames={{
                                        tabList: 'gap-6',
                                        cursor: 'w-full',
                                    }}
                                >
                                    <Tab
                                        key={TabOptions.HISTORY}
                                        title={
                                            <div className="flex items-center gap-2">
                                                <ClockArrowRotateLeft
                                                    fontSize={16}
                                                />
                                                History
                                            </div>
                                        }
                                    ></Tab>
                                </Tabs>
                            </CardHeader>

                            <Divider className="bg-border-default" />

                            <CardBody>
                                {searchParams.tab === TabOptions.HISTORY && (
                                    <Table
                                        aria-label="Client Jobs Table"
                                        removeWrapper
                                    >
                                        <TableHeader>
                                            <TableColumn>Ref</TableColumn>
                                            <TableColumn>
                                                Display name
                                            </TableColumn>
                                            <TableColumn>Deadline</TableColumn>
                                            <TableColumn>Status</TableColumn>
                                            <TableColumn align="end">
                                                Financials
                                            </TableColumn>
                                            <TableColumn align="end">
                                                Actions
                                            </TableColumn>
                                        </TableHeader>
                                        <TableBody emptyContent="No directives registered for this entity.">
                                            {clientJobs.map((job) => {
                                                return (
                                                    <TableRow
                                                        key={job.id}
                                                        className="transition-colors cursor-pointer hover:bg-default-50"
                                                    >
                                                        <TableCell>
                                                            <span className="text-sm font-bold text-text-default">
                                                                {job.no}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="text-sm font-medium text-text-default">
                                                                {
                                                                    job.displayName
                                                                }
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="text-sm text-text-subdued">
                                                                {dateFormatter(
                                                                    job.dueAt
                                                                )}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <JobStatusChip
                                                                data={
                                                                    job.status
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="font-bold text-text-default">
                                                                {currencyFormatter(
                                                                    job.incomeCost ||
                                                                        0
                                                                )}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                variant="light"
                                                                as={Link}
                                                                href={INTERNAL_URLS.management.jobDetail(
                                                                    job.no
                                                                )}
                                                            >
                                                                <EyeIcon
                                                                    size={14}
                                                                />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </AdminContentContainer>

            {/* --- Modals --- */}
            <ClientFormModal
                isOpen={isOpen}
                onClose={onClose}
                client={client}
            />
        </div>
    )
}

// --- Internal Helper Components ---

const MetaItem = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between text-sm">
        <span className="text-xs font-semibold tracking-wider uppercase text-text-subdued">
            {label}
        </span>
        <span className="font-medium text-text-default">{value}</span>
    </div>
)

const StatCard = ({
    label,
    value,
    sub,
    icon: Icon,
    iconColor,
    bgColor,
}: any) => {
    return (
        <Card shadow="none" className="border border-border-default">
            <CardBody className="flex flex-col justify-between p-4">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-medium tracking-wider text-text-subdued">
                        {label}
                    </p>
                    <div className={`p-2 rounded-lg ${bgColor}`}>
                        <Icon size={18} className={iconColor} />
                    </div>
                </div>
                <div>
                    <p className="text-2xl font-bold text-text-default">
                        {value}
                    </p>
                    <p className="mt-1 text-xs text-text-subdued">{sub}</p>
                </div>
            </CardBody>
        </Card>
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
            console.log('Updating client:', values)
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
                    <ModalHeader className="flex flex-col gap-1 pb-4 border-b border-divider">
                        <span className="text-xl font-bold">
                            Edit Client Details
                        </span>
                        <p className="text-sm text-default-500">
                            Update the client's operational and financial
                            profiles.
                        </p>
                    </ModalHeader>

                    <ModalBody className="py-6">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            {/* Left Column: General Info */}
                            <div className="space-y-4">
                                <h3 className="pb-2 text-sm font-bold border-b text-text-default border-default-200">
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
                                            className="text-text-subdued"
                                        />
                                    }
                                />
                            </div>

                            {/* Right Column: Financial & Billing */}
                            <div className="space-y-4">
                                <h3 className="pb-2 text-sm font-bold border-b text-text-default border-default-200">
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
                                            className="text-text-subdued"
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

                    <ModalFooter className="pt-4 border-t border-divider">
                        <Button variant="flat" onPress={onClose}>
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            type="submit"
                            className="font-bold"
                        >
                            Save Changes
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    )
}
