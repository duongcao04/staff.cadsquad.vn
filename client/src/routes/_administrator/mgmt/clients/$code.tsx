import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { clientOptions } from '../../../../lib/queries/options/client-queries'

export const Route = createFileRoute('/_administrator/mgmt/clients/$code')({
    component: ClientDetailPage,
})

import {
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
} from '@heroui/react'
import { Link } from '@tanstack/react-router' // Adjust if using Next.js
import {
    ArrowLeft,
    Banknote,
    Briefcase,
    Building2,
    Edit3,
    Mail,
    MapPin,
    Phone,
    Receipt,
    UserCircle,
} from 'lucide-react'
import { dateFormatter, INTERNAL_URLS } from '../../../../lib'
import { JobStatusSystemTypeEnum } from '../../../../shared/enums'
import {
    AdminPageHeading,
    HeroBreadcrumbItem,
    HeroBreadcrumbs,
} from '../../../../shared/components'
import AdminContentContainer from '../../../../shared/components/admin/AdminContentContainer'

export default function ClientDetailPage() {
    const router = useRouter()
    const { code } = Route.useParams()

    // Fetch client details using react-query
    const {
        data: client,
        isLoading,
        error,
    } = useSuspenseQuery(clientOptions(code))

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: client?.currency || 'USD',
        }).format(val)

    if (isLoading) return <div>Loading client details...</div>
    if (error) return <div>Error loading client details.</div>

    // Calculate Client-Specific Stats
    const totalSpent = client.jobs
        .filter((j) => j.isPaid)
        .reduce((sum, j) => sum + (j.incomeCost || 0), 0)
    const unpaidBalance = client.jobs
        .filter(
            (j) =>
                !j.isPaid &&
                j.status.systemType === JobStatusSystemTypeEnum.COMPLETED
        )
        .reduce((sum, j) => sum + (j.incomeCost || 0), 0)
    const activeJobsCount = client.jobs.filter(
        (j) =>
            j.status.systemType !== JobStatusSystemTypeEnum.TERMINATED &&
            j.status.systemType !== JobStatusSystemTypeEnum.COMPLETED
    ).length

    return (
        <>
            <AdminPageHeading
                title={
                    <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-4">
                            <Button
                                isIconOnly
                                variant="flat"
                                onPress={() => router.history.back()}
                            >
                                <ArrowLeft size={18} />
                            </Button>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-default-900">
                                        {client?.name}
                                    </h1>
                                    <Chip
                                        size="sm"
                                        color={
                                            client.type === 'COMPANY'
                                                ? 'primary'
                                                : 'default'
                                        }
                                        variant="flat"
                                    >
                                        {client.type}
                                    </Chip>
                                </div>
                                <p className="text-sm text-default-500 font-mono mt-1">
                                    Client Code: {client.code}
                                </p>
                            </div>
                        </div>
                    </div>
                }
                actions={
                    <Button color="primary" startContent={<Edit3 size={16} />}>
                        Edit Profile
                    </Button>
                }
            />
            <AdminContentContainer className="pt-0 max-w-7xl mx-auto space-y-4">
                <HeroBreadcrumbs className="text-xs">
                    <HeroBreadcrumbItem>Management</HeroBreadcrumbItem>
                    <HeroBreadcrumbItem>
                        <Link
                            to={INTERNAL_URLS.management.clients}
                            className="text-text-subdued!"
                        >
                            Clients
                        </Link>
                    </HeroBreadcrumbItem>
                    <HeroBreadcrumbItem>{client.name}</HeroBreadcrumbItem>
                </HeroBreadcrumbs>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* 2. LEFT COLUMN: Client Profile Card (Sticky) */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card
                            shadow="sm"
                            className="border border-default-200 sticky top-6"
                        >
                            <CardHeader className="p-6 border-b border-divider flex flex-col items-center text-center gap-3 bg-default-50/50">
                                <div className="w-20 h-20 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center">
                                    {client.type === 'COMPANY' ? (
                                        <Building2 size={40} />
                                    ) : (
                                        <UserCircle size={40} />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-default-900">
                                        {client.name}
                                    </h2>
                                    <p className="text-sm text-default-500">
                                        Member since{' '}
                                        {new Date(
                                            client.createdAt
                                        ).getFullYear()}
                                    </p>
                                </div>
                            </CardHeader>

                            <CardBody className="p-6 space-y-6">
                                {/* Contact Info */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-default-400 uppercase tracking-wider">
                                        Contact Info
                                    </h3>
                                    <div className="flex items-center gap-3 text-sm text-default-700">
                                        <Mail
                                            size={16}
                                            className="text-default-400"
                                        />
                                        <a
                                            href={`mailto:${client.email}`}
                                            className="hover:text-primary transition-colors"
                                        >
                                            {client.email}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-default-700">
                                        <Phone
                                            size={16}
                                            className="text-default-400"
                                        />
                                        <span>{client.phoneNumber}</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm text-default-700">
                                        <MapPin
                                            size={16}
                                            className="text-default-400 mt-0.5"
                                        />
                                        <div>
                                            <p>{client.country}</p>
                                            <p className="text-xs text-default-500">
                                                {client.region}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Divider />

                                {/* Financial Info */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-default-400 uppercase tracking-wider">
                                        Billing Profile
                                    </h3>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-default-500">
                                            Tax ID:
                                        </span>
                                        <span className="font-semibold">
                                            {client.taxId || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-default-500">
                                            Terms:
                                        </span>
                                        <span className="font-semibold">
                                            NET {client.paymentTerms} Days
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-default-500">
                                            Currency:
                                        </span>
                                        <span className="font-semibold">
                                            {client.currency}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1 mt-2 p-3 bg-default-100 rounded-lg">
                                        <span className="text-xs text-default-500 flex items-center gap-2">
                                            <Receipt size={14} /> Billing Email
                                        </span>
                                        <span className="text-sm font-medium">
                                            {client.billingEmail}
                                        </span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* 3. RIGHT COLUMN: KPIs & Tabs */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Client KPIs */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card
                                shadow="sm"
                                className="border border-success-200 bg-success-50"
                            >
                                <CardBody className="p-4">
                                    <p className="text-sm font-semibold text-success-700">
                                        Total Lifetime Value
                                    </p>
                                    <p className="text-2xl font-bold text-success-900 mt-1">
                                        {formatCurrency(totalSpent)}
                                    </p>
                                </CardBody>
                            </Card>

                            <Card
                                shadow="sm"
                                className="border border-danger-200 bg-danger-50"
                            >
                                <CardBody className="p-4">
                                    <p className="text-sm font-semibold text-danger-700">
                                        Unpaid Balance
                                    </p>
                                    <p className="text-2xl font-bold text-danger-900 mt-1">
                                        {formatCurrency(unpaidBalance)}
                                    </p>
                                    {unpaidBalance > 0 && (
                                        <p className="text-xs text-danger-600 mt-1">
                                            Requires immediate attention
                                        </p>
                                    )}
                                </CardBody>
                            </Card>

                            <Card
                                shadow="sm"
                                className="border border-primary-200"
                            >
                                <CardBody className="p-4">
                                    <p className="text-sm font-semibold text-primary-700">
                                        Active Jobs
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-2xl font-bold text-primary-900">
                                            {activeJobsCount}
                                        </p>
                                        <Briefcase
                                            size={20}
                                            className="text-primary-500 opacity-50"
                                        />
                                    </div>
                                </CardBody>
                            </Card>
                        </div>

                        {/* Tabs for Data */}
                        <Tabs
                            aria-label="Client Data"
                            color="primary"
                            variant="underlined"
                            classNames={{ tabList: 'gap-6', cursor: 'w-full' }}
                        >
                            {/* TAB 1: Job History */}
                            <Tab
                                key="jobs"
                                title={
                                    <div className="flex items-center gap-2">
                                        <Briefcase size={16} /> Job History
                                    </div>
                                }
                            >
                                <Card
                                    shadow="sm"
                                    className="border border-default-200 mt-2"
                                >
                                    <Table
                                        aria-label="Client Jobs Table"
                                        removeWrapper
                                        className="bg-transparent"
                                    >
                                        <TableHeader>
                                            <TableColumn>JOB REF</TableColumn>
                                            <TableColumn>
                                                PROJECT NAME
                                            </TableColumn>
                                            <TableColumn>DATE</TableColumn>
                                            <TableColumn>STATUS</TableColumn>
                                            <TableColumn align="end">
                                                AMOUNT
                                            </TableColumn>
                                        </TableHeader>
                                        <TableBody emptyContent="No jobs found for this client.">
                                            {client.jobs.map((job) => (
                                                <TableRow
                                                    key={job.id}
                                                    className="hover:bg-default-50 transition-colors cursor-pointer"
                                                >
                                                    <TableCell>
                                                        <span className="font-bold text-sm text-default-900">
                                                            {job.no}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-medium text-sm text-default-700">
                                                            {job.displayName}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-default-500">
                                                            {dateFormatter(
                                                                job.dueAt
                                                            )}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            size="sm"
                                                            variant="flat"
                                                            color={
                                                                job.status
                                                                    .systemType ===
                                                                JobStatusSystemTypeEnum.COMPLETED
                                                                    ? 'success'
                                                                    : 'primary'
                                                            }
                                                        >
                                                            {
                                                                job.status
                                                                    .displayName
                                                            }
                                                        </Chip>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-bold text-default-900">
                                                                {formatCurrency(
                                                                    job.incomeCost ||
                                                                        0
                                                                )}
                                                            </span>
                                                            <span
                                                                className={`text-[10px] font-bold mt-0.5 ${job.isPaid ? 'text-success-600' : 'text-danger-600'}`}
                                                            >
                                                                {job.isPaid
                                                                    ? 'PAID'
                                                                    : 'UNPAID'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </Tab>

                            {/* TAB 2: Financial Activity */}
                            <Tab
                                key="financials"
                                title={
                                    <div className="flex items-center gap-2">
                                        <Banknote size={16} /> Financial
                                        Activity
                                    </div>
                                }
                            >
                                <Card
                                    shadow="sm"
                                    className="border border-default-200 mt-2 p-10 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center text-default-400 gap-3">
                                        <Receipt
                                            size={48}
                                            className="opacity-50"
                                        />
                                        <p className="font-medium">
                                            Financial ledger view is connected
                                            to the Accounting Module.
                                        </p>
                                        <Link
                                            to="/financial/ledger"
                                            className="text-primary font-semibold hover:underline mt-2"
                                        >
                                            View Master Ledger &rarr;
                                        </Link>
                                    </div>
                                </Card>
                            </Tab>
                        </Tabs>
                    </div>
                </div>
            </AdminContentContainer>
        </>
    )
}
