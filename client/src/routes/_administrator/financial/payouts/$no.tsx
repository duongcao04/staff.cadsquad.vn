import {
    currencyFormatter,
    EXCHANGE_RATE,
    INTERNAL_URLS,
    paymentChannelsListOptions,
    TJobPayoutDetail
} from '@/lib'
import { createTransactionOptions, jobPayoutDetailOptions } from '@/lib/queries'
import { ETransactionType } from '@/lib/validationSchemas/_transaction.schema'
import { AdminPageHeading, AppLoading } from '@/shared/components'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import { ChevronLeft } from '@gravity-ui/icons'
import {
    addToast,
    BreadcrumbItem,
    Breadcrumbs,
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Divider,
    Input,
    Select,
    SelectItem,
    Textarea,
    User,
} from '@heroui/react'
import {
    useMutation,
    useQueryClient,
    useSuspenseQuery,
} from '@tanstack/react-query'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useFormik } from 'formik'
import { BadgeCheck, Banknote, CheckCircle2, Receipt, Timer, TrendingUp, UsersIcon } from 'lucide-react'
import { useMemo } from 'react'

export const Route = createFileRoute('/_administrator/financial/payouts/$no')({
    pendingComponent: AppLoading,
    loader: ({ context, params }) => {
        return context.queryClient.ensureQueryData(
            jobPayoutDetailOptions(params.no)
        )
    },
    component: PayoutDetailPage,
})

function PayoutDetailPage() {
    const { no } = Route.useParams()
    const router = useRouter()
    const { data } = useSuspenseQuery(jobPayoutDetailOptions(no))

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
                                Job #{data.no} — {data.client?.name || 'Unknown Client'}
                            </p>
                        </div>
                    </div>
                }
            />
            <AdminContentContainer className="pt-0 space-y-4">
                <Breadcrumbs className="text-xs" underline="hover">
                    <BreadcrumbItem><Link to={INTERNAL_URLS.admin.overview}>Management</Link></BreadcrumbItem>
                    <BreadcrumbItem><Link to={INTERNAL_URLS.financial.payouts}>Pending Payouts</Link></BreadcrumbItem>
                    <BreadcrumbItem>{data.no}</BreadcrumbItem>
                </Breadcrumbs>

                <PayoutJobDetailContent data={data} />
            </AdminContentContainer>
        </>
    )
}

function PayoutJobDetailContent({ data }: { data: TJobPayoutDetail | any }) {
    const queryClient = useQueryClient()
    const router = useRouter()

    // --- 1. Load Payment Channels for Select ---
    const { data: { paymentChannels } } = useSuspenseQuery(paymentChannelsListOptions())

    // --- 2. Calculations ---
    const eligibleRecipients = useMemo(() => {
        return data.assignments.filter((ass: any) => !ass.isFullyPaid)
    }, [data.assignments])

    const totalStaffPaidVnd = useMemo(() => 
        data.assignments.reduce((sum: number, ass: any) => sum + (ass.totalPaid || 0), 0)
    , [data.assignments])

    const totalStaffQuotaVnd = useMemo(() => 
        data.assignments.reduce((sum: number, ass: any) => sum + (ass.staffCost || 0), 0)
    , [data.assignments])

    const incomeVnd = (data.incomeCost || 0) * EXCHANGE_RATE.USD
    const potentialProfitVnd = incomeVnd - totalStaffQuotaVnd

    // --- 3. Mutation ---
    const { mutate: recordPayout, isPending } = useMutation({
        ...createTransactionOptions,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['financials'] })
            queryClient.invalidateQueries({ queryKey: ['jobs', 'payouts', data.no] })
            addToast({ title: 'Transaction recorded', color: 'success' })
            
            // Nếu không còn ai để pay, quay lại trang danh sách
            if (eligibleRecipients.length <= 1) {
                router.navigate({ to: INTERNAL_URLS.financial.payouts })
            }
        }
    })

    // --- 4. Form Handling ---
    const formik = useFormik({
        initialValues: {
            paymentChannelId: '',
            referenceNo: '',
            note: '',
            assignmentId: eligibleRecipients[0]?.id || '',
        },
        enableReinitialize: true,
        onSubmit: (values) => {
            const selectedAsm = data.assignments.find((a: any) => a.id === values.assignmentId)
            if (!selectedAsm) return

            recordPayout({
                amount: selectedAsm.remainingDebt, // Mặc định trả hết số còn nợ
                type: ETransactionType.PAYOUT,
                jobId: data.id,
                assignmentId: values.assignmentId,
                paymentChannelId: values.paymentChannelId,
                ...(values.referenceNo && {
                        referenceNo: values.referenceNo,
                    }),
                note: values.note || `Payout for Job #${data.no} - ${selectedAsm.user.displayName}`,
            })
        },
    })

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* LEFT: Financial Breakdown & Staff List */}
            <div className="space-y-6 lg:col-span-7">
                <Card shadow="none" className="border border-default-200">
                    <CardHeader className="px-6 py-4 border-b bg-default-50/50 border-divider flex justify-between items-center">
                        <h2 className="flex items-center gap-2 text-base font-bold">
                            <Receipt size={18} /> Audit Summary
                        </h2>
                        <Chip variant="flat" color={data.paymentStatus === 'PAID' ? 'success' : 'warning'} size="sm" className="font-bold">
                            JOB STATUS: {data.paymentStatus}
                        </Chip>
                    </CardHeader>
                    <CardBody className="p-6 space-y-8">
                        {/* KPI Mini Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-success-50 border border-success-100 rounded-2xl">
                                <p className="text-[10px] font-bold text-success-600 uppercase tracking-widest">Total Income (VND)</p>
                                <p className="text-xl font-black text-success-700 mt-1">{currencyFormatter(incomeVnd, 'Vietnamese')}</p>
                            </div>
                            <div className="p-4 bg-primary-50 border border-primary-100 rounded-2xl">
                                <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">Potential Profit</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <p className="text-xl font-black text-primary-700">{currencyFormatter(potentialProfitVnd, 'Vietnamese')}</p>
                                    <TrendingUp size={14} className="text-primary-500" />
                                </div>
                            </div>
                        </div>

                        {/* Assignments Tracking */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold tracking-widest uppercase text-default-400 flex items-center gap-2">
                                <UsersIcon size={14} /> Staff Payout Tracking
                            </label>
                            <div className="space-y-2">
                                {data.assignments.map((ass: any) => (
                                    <div
                                        key={ass.id}
                                        className={`flex items-center justify-between p-3 border rounded-xl transition-all ${
                                            ass.isFullyPaid ? 'bg-default-50 border-default-100 opacity-60' : 'bg-white border-default-200 shadow-sm'
                                        }`}
                                    >
                                        <User
                                            name={<span className="text-sm font-bold">{ass.user.displayName}</span>}
                                            description={ass.user.jobTitle?.displayName || 'Member'}
                                            avatarProps={{ src: ass.user.avatar, size: 'sm' }}
                                        />
                                        <div className="text-right">
                                            <p className={`text-sm font-bold ${ass.isFullyPaid ? 'text-success-600' : 'text-danger-600'}`}>
                                                {ass.isFullyPaid 
                                                    ? currencyFormatter(ass.staffCost, 'Vietnamese') 
                                                    : `Debt: ${currencyFormatter(ass.remainingDebt, 'Vietnamese')}`
                                                }
                                            </p>
                                            <div className="flex items-center justify-end gap-1.5 mt-0.5">
                                                {ass.isFullyPaid ? (
                                                    <Chip size="sm" variant="flat" color="success" startContent={<CheckCircle2 size={12} />}>Settled</Chip>
                                                ) : (
                                                    <Chip size="sm" variant="flat" color={ass.totalPaid > 0 ? "warning" : "default"} startContent={ass.totalPaid > 0 ? <Timer size={12} /> : null}>
                                                        {ass.totalPaid > 0 ? "Partial" : "Awaiting"}
                                                    </Chip>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Progress Footer */}
                        <Divider />
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-default-500 font-medium">Total Already Paid:</span>
                            <span className="font-bold text-success-600">{currencyFormatter(totalStaffPaidVnd, 'Vietnamese')}</span>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* RIGHT: Action Form */}
            <div className="lg:col-span-5">
                <Card shadow="sm" className="sticky border border-default-200 top-6">
                    <form onSubmit={formik.handleSubmit}>
                        <CardHeader className="px-6 py-5 border-b border-divider bg-default-50/50">
                            <h2 className="flex items-center gap-2 text-lg font-bold">
                                <Banknote className="text-success" /> Confirm Payout
                            </h2>
                        </CardHeader>
                        <CardBody className="p-6 space-y-6">
                            {eligibleRecipients.length === 0 ? (
                                <div className="p-8 text-center space-y-3">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-success-100 flex items-center justify-center text-success-600">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <p className="text-sm font-bold text-default-700">All payments completed</p>
                                    <p className="text-xs text-default-400">There are no more pending payouts for this job.</p>
                                    <Button as={Link} to={INTERNAL_URLS.financial.payouts} variant="flat" className="mt-4">Back to List</Button>
                                </div>
                            ) : (
                                <>
                                    <Select
                                        isRequired
                                        label="Recipient"
                                        placeholder="Choose staff member"
                                        labelPlacement="outside"
                                        variant="bordered"
                                        name="assignmentId"
                                        selectedKeys={formik.values.assignmentId ? [formik.values.assignmentId] : []}
                                        onChange={formik.handleChange}
                                    >
                                        {eligibleRecipients.map((ass: any) => (
                                            <SelectItem 
                                                key={ass.id} 
                                                textValue={ass.user.displayName}
                                                description={`Remaining: ${currencyFormatter(ass.remainingDebt, 'Vietnamese')}`}
                                            >
                                                {ass.user.displayName}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <Select
                                        isRequired
                                        label="Payment Channel"
                                        placeholder="Select account"
                                        labelPlacement="outside"
                                        variant="bordered"
                                        name="paymentChannelId"
                                        selectedKeys={formik.values.paymentChannelId ? [formik.values.paymentChannelId] : []}
                                        onChange={formik.handleChange}
                                    >
                                        {paymentChannels.map((pc: any) => (
                                            <SelectItem key={pc.id} textValue={pc.displayName}>
                                                {pc.displayName}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <Input
                                        label="Reference / Transaction ID"
                                        placeholder="Bank ref, MoMo ID, etc."
                                        labelPlacement="outside"
                                        variant="bordered"
                                        name="referenceNo"
                                        value={formik.values.referenceNo}
                                        onChange={formik.handleChange}
                                    />

                                    <Textarea
                                        label="Internal Note"
                                        placeholder="Notes for accounting..."
                                        labelPlacement="outside"
                                        variant="bordered"
                                        name="note"
                                        value={formik.values.note}
                                        onChange={formik.handleChange}
                                    />

                                    <div className="p-4 bg-default-100 rounded-2xl border border-default-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-default-500 uppercase tracking-tighter">Amount to pay:</span>
                                            <span className="text-lg font-black text-danger-600">
                                                {currencyFormatter(
                                                    data.assignments.find((a: any) => a.id === formik.values.assignmentId)?.remainingDebt || 0,
                                                    'Vietnamese'
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        color="success"
                                        className="w-full h-12 font-black text-white shadow-lg shadow-success/20"
                                        isLoading={isPending}
                                        startContent={<BadgeCheck size={20} />}
                                    >
                                        CONFIRM & MARK PAID
                                    </Button>
                                </>
                            )}
                        </CardBody>
                    </form>
                </Card>
            </div>
        </div>
    )
}