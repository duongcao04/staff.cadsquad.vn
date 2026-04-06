import { createTransactionOptions } from '@/lib/queries'
import { ETransactionType } from '@/lib/validationSchemas/_transaction.schema'
import { ChevronLeft } from '@gravity-ui/icons'
import {
    BreadcrumbItem,
    Breadcrumbs,
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Input,
    Select,
    SelectItem,
    Textarea,
    User
} from '@heroui/react'
import {
    useMutation,
    useQueryClient,
    useSuspenseQuery,
} from '@tanstack/react-query'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useFormik } from 'formik'
import { BadgeCheck, Banknote, Receipt } from 'lucide-react'
import { useMemo } from 'react'
import {
    currencyFormatter,
    EXCHANGE_RATE,
    INTERNAL_URLS,
    jobPayoutDetailsOptions,
    TJobPayoutDetail
} from '../../../../lib'
import { AdminPageHeading, AppLoading } from '../../../../shared/components'
import AdminContentContainer from '../../../../shared/components/admin/AdminContentContainer'

export const Route = createFileRoute('/_administrator/financial/payouts/$no')({
    pendingComponent: AppLoading,
    loader: ({ context, params }) => {
        return context.queryClient.ensureQueryData(
            jobPayoutDetailsOptions(params.no)
        )
    },
    component: PayoutDetailPage,
})

function PayoutDetailPage() {
    const { no } = Route.useParams()
    const router = useRouter()
    const { data } = useSuspenseQuery(jobPayoutDetailsOptions(no))

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
                            <ChevronLeft fontSize={18} />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-default-900">
                                Process Payout
                            </h1>
                            <p className="text-sm font-medium tracking-wider uppercase text-default-500">
                                Job #{data.no} —{' '}
                                {data.client?.name || 'Unknown Client'}
                            </p>
                        </div>
                    </div>
                }
            />
            <AdminContentContainer className="pt-0 space-y-4">
                <Breadcrumbs className="text-xs" underline="hover">
                    <BreadcrumbItem>
                        <Link to={INTERNAL_URLS.admin.overview}>
                            Management
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to={INTERNAL_URLS.financial.payouts}>
                            Pending Payouts
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>{data.no}</BreadcrumbItem>
                </Breadcrumbs>

                <PayoutJobDetailContent data={data} />
            </AdminContentContainer>
        </>
    )
}

function PayoutJobDetailContent({ data }: { data: TJobPayoutDetail }) {
    const queryClient = useQueryClient()
    const router = useRouter()

    // --- 1. Calculations ---
    const totalStaffDebtVnd = useMemo(
        () =>
            data.assignments.reduce(
                (sum, ass) => sum + (ass.staffCost || 0),
                0
            ),
        [data.assignments]
    )

    const incomeVnd = (data.incomeCost || 0) * EXCHANGE_RATE.USD
    const profitVnd = incomeVnd - totalStaffDebtVnd

    // --- 2. Mutation ---
    const { mutate: recordPayout, isPending } = useMutation(
        createTransactionOptions
    )

    // --- 3. Form Handling ---
    const formik = useFormik({
        initialValues: {
            paymentChannelId: '',
            referenceNo: '',
            note: '',
            // Mặc định pay cho assignment đầu tiên (hoặc bạn có thể thêm logic chọn assignment)
            assignmentId: data.assignments[0]?.id || '',
        },
        onSubmit: (values) => {
            const selectedAsm = data.assignments.find(
                (a) => a.id === values.assignmentId
            )

            recordPayout(
                {
                    amount: selectedAsm?.staffCost || 0,
                    type: ETransactionType.PAYOUT,
                    jobId: data.id,
                    assignmentId: values.assignmentId,
                    paymentChannelId: values.paymentChannelId,
                    referenceNo: values.referenceNo,
                    note: values.note,
                },
                {
                    onSuccess: () => {
                        addToast({
                            title: `Paid successfully to ${selectedAsm?.user?.displayName}`,
                            color: 'success',
                        })
                        queryClient.invalidateQueries({
                            queryKey: ['jobs', 'payouts', data.no],
                        })
                        // Nếu đã pay hết thì quay lại list
                        if (data.assignments.length <= 1) {
                            router.navigate({
                                to: INTERNAL_URLS.financial.payouts,
                            })
                        }
                    },
                }
            )
        },
    })

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* LEFT: Financial Summary */}
            <div className="space-y-6 lg:col-span-7">
                <Card shadow="none" className="border border-default-200">
                    <CardHeader className="px-6 py-4 border-b bg-default-50 border-divider">
                        <h2 className="flex items-center gap-2 text-base font-bold">
                            <Receipt size={18} /> Financial Breakdown
                        </h2>
                    </CardHeader>
                    <CardBody className="p-6 space-y-8">
                        {/* Income */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold tracking-widest uppercase text-default-400">
                                Income Source
                            </label>
                            <div className="flex items-center justify-between p-4 border bg-success-50 rounded-xl border-success-100">
                                <div>
                                    <p className="font-bold text-success-900">
                                        {data.client?.name || 'N/A'}
                                    </p>
                                    <p className="text-xs text-success-700">
                                        Budget: $
                                        {data.incomeCost.toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-success-700">
                                        {currencyFormatter(
                                            incomeVnd,
                                            'Vietnamese'
                                        )}
                                    </p>
                                    <p className="text-[10px] text-success-600 uppercase">
                                        Converted to VND
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Assignments */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold tracking-widest uppercase text-default-400">
                                Staff Payouts
                            </label>
                            <div className="space-y-2">
                                {data.assignments.map((ass) => (
                                    <div
                                        key={ass.id}
                                        className="flex items-center justify-between p-3 bg-white border rounded-xl border-default-200"
                                    >
                                        <User
                                            name={
                                                <span className="text-sm font-bold">
                                                    {ass.user.displayName}
                                                </span>
                                            }
                                            description={
                                                ass.user.jobTitle
                                                    ?.displayName || 'Member'
                                            }
                                            avatarProps={{
                                                src: ass.user.avatar,
                                                size: 'sm',
                                            }}
                                        />
                                        <div className="text-right">
                                            <p className="font-bold text-danger-600">
                                                {currencyFormatter(
                                                    ass.staffCost,
                                                    'Vietnamese'
                                                )}
                                            </p>
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                color="warning"
                                            >
                                                Pending
                                            </Chip>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Result */}
                        <div className="flex items-center justify-between p-4 border bg-primary-50 rounded-xl border-primary-100">
                            <div>
                                <p className="text-sm font-bold uppercase text-primary-900">
                                    Estimated Net Profit
                                </p>
                                <p className="text-xs text-primary-600">
                                    After all staff payouts
                                </p>
                            </div>
                            <p className="text-2xl font-black text-primary-700">
                                {currencyFormatter(profitVnd, 'Vietnamese')}
                            </p>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* RIGHT: Action Form */}
            <div className="lg:col-span-5">
                <Card
                    shadow="sm"
                    className="sticky border border-default-200 top-6"
                >
                    <form onSubmit={formik.handleSubmit}>
                        <CardHeader className="px-6 py-5 border-b border-divider bg-default-50/50">
                            <h2 className="flex items-center gap-2 text-lg font-bold">
                                <Banknote className="text-success" /> Confirm
                                Payout
                            </h2>
                        </CardHeader>
                        <CardBody className="p-6 space-y-6">
                            <Select
                                isRequired
                                label="Select Recipient"
                                placeholder="Who are you paying?"
                                labelPlacement="outside"
                                variant="bordered"
                                name="assignmentId"
                                selectedKeys={
                                    formik.values.assignmentId
                                        ? [formik.values.assignmentId]
                                        : []
                                }
                                onChange={formik.handleChange}
                            >
                                {data.assignments.map((ass) => (
                                    <SelectItem
                                        key={ass.id}
                                        textValue={ass.user.displayName}
                                    >
                                        {ass.user.displayName} (
                                        {currencyFormatter(
                                            ass.staffCost,
                                            'Vietnamese'
                                        )}
                                        )
                                    </SelectItem>
                                ))}
                            </Select>

                            <Select
                                isRequired
                                label="Payment Channel"
                                placeholder="Bank, Wallet, etc."
                                labelPlacement="outside"
                                variant="bordered"
                                name="paymentChannelId"
                                onChange={formik.handleChange}
                            >
                                {/* Ở đây Dương nên dùng query fetch list PaymentChannels */}
                                <SelectItem
                                    key="vcb-id"
                                    textValue="Vietcombank"
                                >
                                    Vietcombank
                                </SelectItem>
                                <SelectItem
                                    key="momo-id"
                                    textValue="MoMo Business"
                                >
                                    MoMo Business
                                </SelectItem>
                            </Select>

                            <Input
                                label="Reference ID"
                                placeholder="e.g. VCB-123456789"
                                labelPlacement="outside"
                                variant="bordered"
                                name="referenceNo"
                                value={formik.values.referenceNo}
                                onChange={formik.handleChange}
                            />

                            <Textarea
                                label="Note"
                                placeholder="Internal record notes..."
                                labelPlacement="outside"
                                variant="bordered"
                                name="note"
                                value={formik.values.note}
                                onChange={formik.handleChange}
                            />

                            <div className="p-4 space-y-2 bg-default-100 rounded-xl">
                                <div className="flex justify-between text-sm">
                                    <span className="text-default-500">
                                        Amount to Transfer:
                                    </span>
                                    <span className="font-bold text-danger-600">
                                        {currencyFormatter(
                                            data.assignments.find(
                                                (a) =>
                                                    a.id ===
                                                    formik.values.assignmentId
                                            )?.staffCost || 0,
                                            'Vietnamese'
                                        )}
                                    </span>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                color="success"
                                className="w-full h-12 font-bold text-white"
                                isLoading={isPending}
                                startContent={<BadgeCheck size={20} />}
                            >
                                Confirm & Notify Staff
                            </Button>
                        </CardBody>
                    </form>
                </Card>
            </div>
        </div>
    )
}
