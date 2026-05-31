import {
    ClientHelper,
    currencyFormatter,
    dateFormatter,
    INTERNAL_URLS,
    JobHelper,
    RouteUtil,
} from '@/presentation/lib'
import { clientOptions } from '@/presentation/lib/queries'
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
import { AdminPageHeading, JobStatusChip } from '@presentation/components'
import AdminContentContainer from '@presentation/components/admin/AdminContentContainer'
import { TabOptions } from '@presentation/routes/_administrator/mgmt/clients/$code'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, useParams, useRouter, useSearch } from '@tanstack/react-router'
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
import { ClientFormModal } from '../_components/client-form-modal'

export function ClientDetailPage() {
    const searchParams = useSearch({
        from: '/_administrator/mgmt/clients/$code',
    })
    const router = useRouter()
    const { code } = useParams({
        from: '/_administrator/mgmt/clients/$code',
    })
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
