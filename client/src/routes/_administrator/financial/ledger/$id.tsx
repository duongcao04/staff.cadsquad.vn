import { currencyFormatter, INTERNAL_URLS } from '@/lib'
import { transactionDetailOptions } from '@/lib/queries'
import { AdminPageHeading, AppLoading, HeroTooltip } from '@/shared/components'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import {
	BreadcrumbItem,
	Breadcrumbs,
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Divider,
	User as UserProfile,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import dayjs from 'dayjs'
import {
	ArrowDownRight,
	ArrowUpRight,
	Calendar,
	CheckCircle2,
	ChevronLeft,
	FileText,
	Link as LinkIcon,
	Receipt
} from 'lucide-react'

export const Route = createFileRoute('/_administrator/financial/ledger/$id')({
    pendingComponent: AppLoading,
    loader: ({ context, params }) => {
        return context.queryClient.ensureQueryData(
            transactionDetailOptions(params.id)
        )
    },
    component: TransactionDetailPage,
})

function TransactionDetailPage() {
    const { id } = Route.useParams()
    const router = useRouter()
    const { data: txn } = useSuspenseQuery(transactionDetailOptions(id))

    const isIncome = txn.type === 'INCOME'

    return (
        <>
            <AdminPageHeading
                title={
                    <div className="flex items-center gap-1.5">
                        <Button
                            isIconOnly
                            variant="light"
                            onPress={() => router.history.back()}
                        >
                            <ChevronLeft size={20} />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-default-900">
                                Transaction Detail
                            </h1>
                            <p className="font-mono text-sm text-default-500">
                                ID: {txn.id}
                            </p>
                        </div>
                    </div>
                }
                actions={
                    <Button
                        color="primary"
                        variant="flat"
                        startContent={<FileText size={18} />}
                    >
                        Print Receipt
                    </Button>
                }
            />

            <AdminContentContainer className="pt-0 space-y-6">
                <Breadcrumbs className="text-xs" underline="hover">
                    <BreadcrumbItem>
                        <Link to={INTERNAL_URLS.admin.overview}>
                            Management
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to={INTERNAL_URLS.financial.ledger}>
                            Master Ledger
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>{txn.id.split('-')[0]}...</BreadcrumbItem>
                </Breadcrumbs>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* LEFT: Main Info */}
                    <div className="space-y-6 lg:col-span-8">
                        <Card
                            shadow="none"
                            className="border border-default-200"
                        >
                            <CardHeader className="flex items-center justify-between px-6 py-4 border-b border-divider bg-default-50/50">
                                <div className="flex items-center gap-2 font-bold text-default-700">
                                    <Receipt size={18} /> Basic Information
                                </div>
                                <Chip
                                    color={
                                        txn.status === 'COMPLETED'
                                            ? 'success'
                                            : 'warning'
                                    }
                                    variant="flat"
                                    size="sm"
                                    startContent={
                                        <CheckCircle2
                                            size={14}
                                            className="ml-1"
                                        />
                                    }
                                >
                                    {txn.status}
                                </Chip>
                            </CardHeader>
                            <CardBody className="p-6">
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold tracking-widest uppercase text-default-400">
                                                Amount
                                            </label>
                                            <p
                                                className={`text-3xl font-black mt-1 ${isIncome ? 'text-success-600' : 'text-danger-600'}`}
                                            >
                                                {isIncome ? '+' : '-'}
                                                {currencyFormatter(
                                                    txn.amount,
                                                    'Vietnamese'
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold tracking-widest uppercase text-default-400">
                                                Type
                                            </label>
                                            <div className="flex items-center gap-2 mt-1">
                                                {isIncome ? (
                                                    <ArrowDownRight className="text-success" />
                                                ) : (
                                                    <ArrowUpRight className="text-danger" />
                                                )}
                                                <span className="font-bold">
                                                    {isIncome
                                                        ? 'Client Income'
                                                        : 'Staff Payout'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold tracking-widest uppercase text-default-400">
                                                Recorded Date
                                            </label>
                                            <p className="flex items-center gap-2 mt-1 text-sm font-semibold">
                                                <Calendar size={14} />{' '}
                                                {dayjs(txn.createdAt).format(
                                                    'LLLL'
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold tracking-widest uppercase text-default-400">
                                                Payment Channel
                                            </label>
                                            <p className="mt-1 text-sm font-semibold">
                                                {txn.paymentChannel
                                                    ?.displayName ||
                                                    'Unknown Channel'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Divider className="my-6" />

                                <div>
                                    <label className="text-xs font-bold tracking-widest uppercase text-default-400">
                                        Internal Note
                                    </label>
                                    <p className="p-4 mt-2 text-sm italic border text-default-600 bg-default-50 rounded-xl border-default-100">
                                        {txn.note ||
                                            'No notes provided for this transaction.'}
                                    </p>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Evidence Image */}
                        {txn.evidenceUrl && (
                            <Card
                                shadow="none"
                                className="border border-default-200"
                            >
                                <CardHeader className="px-6 py-4 font-bold border-b border-divider">
                                    Payment Evidence (Bill)
                                </CardHeader>
                                <CardBody className="p-4">
                                    <img
                                        src={txn.evidenceUrl}
                                        alt="Transaction Bill"
                                        className="w-full max-w-lg mx-auto border shadow-sm rounded-xl border-default-200"
                                    />
                                </CardBody>
                            </Card>
                        )}
                    </div>

                    {/* RIGHT: Relations */}
                    <div className="space-y-6 lg:col-span-4">
                        {/* Job Context */}
                        <Card
                            shadow="sm"
                            className="border border-primary-100 bg-primary-50/30"
                        >
                            <CardHeader className="justify-between">
                                <p className="font-bold text-primary-800">
                                    Linked Job
                                </p>
                                <HeroTooltip content={'Open Job Details'}>
                                    <Button
                                        as={Link}
                                        to={INTERNAL_URLS.management.jobDetail(
                                            txn.job?.no
                                        )}
                                        size="sm"
                                        variant="light"
                                        color="primary"
                                        className="font-bold"
                                        startContent={<LinkIcon size={14} />}
                                    >
                                        View Job Ref.
                                    </Button>
                                </HeroTooltip>
                            </CardHeader>
                            <CardBody className="pt-0">
                                <div className="p-3 bg-white border border-primary-100 rounded-xl">
                                    <p className="text-xs font-bold text-primary-600">
                                        #{txn.job?.no}
                                    </p>
                                    <p className="text-sm font-bold truncate text-default-900">
                                        {txn.job?.displayName}
                                    </p>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Entity Info */}
                        <Card
                            shadow="none"
                            className="border border-default-200"
                        >
                            <CardHeader className="font-bold">
                                {isIncome ? 'Client Source' : 'Paid To'}
                            </CardHeader>
                            <CardBody className="pt-0">
                                {isIncome ? (
                                    <div className="flex flex-col gap-1 p-3 bg-default-50 rounded-xl">
                                        <p className="text-sm font-bold text-default-900">
                                            {txn.client?.name}
                                        </p>
                                        <p className="text-xs text-default-500">
                                            Contractor / Client
                                        </p>
                                    </div>
                                ) : (
                                    <UserProfile
                                        name={
                                            <span className="font-bold">
                                                {
                                                    txn.assignment?.user
                                                        ?.displayName
                                                }
                                            </span>
                                        }
                                        description="Project Staff"
                                        avatarProps={{
                                            src: txn.assignment?.user?.avatar,
                                            size: 'md',
                                        }}
                                        className="p-1"
                                    />
                                )}
                            </CardBody>
                        </Card>

                        {/* Audit Info */}
                        <Card
                            shadow="none"
                            className="border border-default-200 bg-default-50/50"
                        >
                            <CardBody className="p-4 space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-default-500">
                                        Recorded By:
                                    </span>
                                    <span className="font-bold text-default-700">
                                        {txn.createdBy?.displayName}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-default-500">
                                        Reference No:
                                    </span>
                                    <span className="font-mono font-bold text-primary-600">
                                        {txn.referenceNo || 'N/A'}
                                    </span>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </AdminContentContainer>
        </>
    )
}
