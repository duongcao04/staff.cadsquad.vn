import { ChevronLeft } from '@gravity-ui/icons'
import {
    BreadcrumbItem,
    Breadcrumbs,
    Button,
    Card,
    CardBody,
    CardHeader,
    Divider,
    Input,
    Select,
    SelectItem,
    Textarea,
    User,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useFormik } from 'formik'
import { BadgeCheck, Receipt, UploadCloud } from 'lucide-react'
import {
    currencyFormatter,
    dateFormatter,
    EXCHANGE_RATE,
    INTERNAL_URLS,
    jobPayoutDetailsOptions,
    TJobPayoutDetail,
} from '../../../../lib'
import { AdminPageHeading, AppLoading } from '../../../../shared/components'
import AdminContentContainer from '../../../../shared/components/admin/AdminContentContainer'

export const Route = createFileRoute('/_administrator/financial/payouts/$no')({
    pendingComponent: AppLoading,
    component: () => {
        const router = useRouter()
        const { no } = Route.useParams()
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
                                <p className="text-sm font-medium tracking-wider text-text-subdued">
                                    Job #{data.no}-{' '}
                                    {data.client?.name?.toUpperCase() ||
                                        'UNKNOWN'}
                                    _{data.displayName.toUpperCase()}
                                </p>
                            </div>
                        </div>
                    }
                />
                <AdminContentContainer className="pt-0 space-y-4">
                    <Breadcrumbs className="text-xs" underline="hover">
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
                                to={INTERNAL_URLS.financial.payouts}
                                className="text-text-subdued!"
                            >
                                Pending Payouts
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>{data.no}</BreadcrumbItem>
                    </Breadcrumbs>

                    <PayoutJobDetail data={data} />
                </AdminContentContainer>
            </>
        )
    },
})

// --- Mock Data Fetcher ---
const getMockJobDetail = (no: string) => ({
    no,
    displayName: '3D Character Model',
    clientName: 'Tom Jain',
    completedAt: 'March 10, 2026',
    income: 500,
    paymentChannel: 'Stripe',
    assignees: [
        {
            id: '1',
            name: 'Cao Hai Duong',
            role: '3D Artist',
            cost: 100,
            avatar: 'https://i.pravatar.cc/150?u=1',
        },
        {
            id: '2',
            name: 'John Doe',
            role: 'Reviewer',
            cost: 50,
            avatar: 'https://i.pravatar.cc/150?u=2',
        },
    ],
    totalCost: 150,
})

export default function PayoutJobDetail({ data }: { data: TJobPayoutDetail }) {
    // const { no } = useParams({ strict: false }) // TanStack Router parameter
    const no = 'JOB-2026-001' // Mocking for preview

    const job = getMockJobDetail(no as string)

    const totalPayout = data.assignments.reduce((sum, assignment) => {
        return sum + (assignment.staffCost || 0)
    }, 0)

    const profit = data.incomeCost * EXCHANGE_RATE.USD - totalPayout

    // Setup Formik for the payout form
    const formik = useFormik({
        initialValues: {
            transactionId: '',
            paymentMethod: '',
            actualAmountPaid: job.totalCost,
            note: '',
            receiptFile: null as File | null,
        },
        onSubmit: async (values) => {
            console.log('Submitting Payout:', values)
            // 1. Call API to update status to COMPLETED/PAID
            // 2. Call API to notify staff (your sendJobPaidNotification)
            // 3. Redirect back to list
            // router.navigate({ to: '/financial/pending-payouts' })
        },
    })

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* LEFT COLUMN: Financial Breakdown (Read-Only) */}
            <div className="space-y-6 lg:col-span-7">
                <Card shadow="none" className="border border-border-default">
                    <CardHeader className="px-6 py-4 border-b bg-default-50 border-divider">
                        <h2 className="flex items-center gap-2 text-base font-bold">
                            <Receipt size={18} /> Summary
                        </h2>
                    </CardHeader>
                    <CardBody className="p-6 space-y-6">
                        {/* Income Block */}
                        <div>
                            <p className="mb-3 text-xs font-bold tracking-wider uppercase text-default-400">
                                Client Payment (In)
                            </p>
                            <div className="flex items-center justify-between p-4 border bg-success-50 rounded-xl border-success-100">
                                <div>
                                    <p className="text-sm font-semibold text-success-900">
                                        {data.client?.name}
                                    </p>
                                    {data.paymentChannel ? (
                                        <p className="text-xs text-success-700">
                                            via{' '}
                                            {data.paymentChannel?.displayName} •{' '}
                                            {dateFormatter(data.createdAt, {
                                                format: 'full',
                                            })}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-success-700">
                                            at{' '}
                                            {dateFormatter(data.createdAt, {
                                                format: 'full',
                                            })}
                                        </p>
                                    )}
                                </div>
                                <p className="text-xl font-bold text-success-700">
                                    {currencyFormatter(data.incomeCost)}
                                </p>
                            </div>
                        </div>

                        {/* Staff Cost Block */}
                        <div>
                            <p className="mb-3 text-xs font-bold tracking-wider uppercase text-default-400">
                                Staff Distribution (Out)
                            </p>
                            <div className="space-y-3">
                                {data.assignments.map((ass) => (
                                    <div
                                        key={ass.id}
                                        className="flex items-center justify-between p-3 border rounded-lg border-default-200"
                                    >
                                        <User
                                            name={
                                                <span className="text-sm font-semibold">
                                                    {ass.user.displayName}
                                                </span>
                                            }
                                            description={
                                                ass.user.department.displayName
                                            }
                                            avatarProps={{
                                                src: ass.user.avatar,
                                                size: 'sm',
                                            }}
                                        />
                                        <p className="font-bold text-danger-600">
                                            {currencyFormatter(
                                                ass.staffCost,
                                                'Vietnamese'
                                            )}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-between pt-3 mt-3 border-t border-divider">
                                <span className="text-sm font-semibold text-default-600">
                                    Total Payout Required:
                                </span>
                                <span className="text-lg font-bold text-danger-600">
                                    {currencyFormatter(
                                        totalPayout,
                                        'Vietnamese'
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Margin Block */}
                        <div className="flex items-center justify-between p-4 border bg-primary-50 rounded-xl border-primary-100">
                            <span className="text-sm font-bold text-primary-900">
                                Company Profit:
                            </span>
                            <span className="text-xl font-bold text-primary-700">
                                {currencyFormatter(profit, 'Vietnamese')}
                            </span>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* RIGHT COLUMN: Payout Action Form */}
            <div className="lg:col-span-5">
                <Card
                    shadow="md"
                    className="sticky border border-default-200 top-6"
                >
                    <form onSubmit={formik.handleSubmit}>
                        <CardHeader className="px-6 py-5 border-b border-divider">
                            <h2 className="flex items-center gap-2 text-lg font-bold">
                                <BadgeCheck className="text-success" /> Confirm
                                Transfer
                            </h2>
                        </CardHeader>
                        <CardBody className="p-6 space-y-5">
                            <Input
                                isRequired
                                label="Transaction / Reference ID"
                                placeholder="e.g. TXN-987654321"
                                labelPlacement="outside"
                                variant="bordered"
                                name="transactionId"
                                value={formik.values.transactionId}
                                onChange={formik.handleChange}
                            />

                            <Select
                                isRequired
                                label="Payment Method"
                                placeholder="Select bank or channel"
                                labelPlacement="outside"
                                variant="bordered"
                                name="paymentMethod"
                                onChange={formik.handleChange}
                            >
                                <SelectItem key="vpbank" textValue="VP Bank">
                                    VP Bank Transfer
                                </SelectItem>
                                <SelectItem key="paypal" textValue="PayPal">
                                    PayPal
                                </SelectItem>
                                <SelectItem key="wise" textValue="Wise">
                                    Wise
                                </SelectItem>
                            </Select>

                            <Input
                                isRequired
                                type="number"
                                label="Actual Amount Paid"
                                labelPlacement="outside"
                                variant="bordered"
                                name="actualAmountPaid"
                                startContent={
                                    <span className="text-sm text-default-400">
                                        $
                                    </span>
                                }
                                value={formik.values.actualAmountPaid.toString()}
                                onChange={formik.handleChange}
                                description="Adjust if there were transaction fees."
                            />

                            {/* Receipt Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Payment Receipt
                                </label>
                                <label className="flex flex-col items-center justify-center gap-2 p-4 transition-all border-2 border-dashed cursor-pointer border-default-300 hover:border-primary hover:bg-primary-50 rounded-xl">
                                    <input type="file" className="hidden" />
                                    <UploadCloud
                                        size={24}
                                        className="text-default-400"
                                    />
                                    <span className="text-sm text-default-500">
                                        Upload screenshot (JPG, PDF)
                                    </span>
                                </label>
                            </div>

                            <Textarea
                                label="Internal Note"
                                placeholder="Optional notes about this payout..."
                                labelPlacement="outside"
                                variant="bordered"
                                name="note"
                                value={formik.values.note}
                                onChange={formik.handleChange}
                            />

                            <Divider className="my-2" />

                            <Button
                                type="submit"
                                color="success"
                                className="w-full font-bold text-white shadow-lg shadow-success/30"
                                size="lg"
                            >
                                Confirm & Mark as Paid
                            </Button>
                            <p className="mt-2 text-xs text-center text-default-400">
                                Staff will be notified via email automatically.
                            </p>
                        </CardBody>
                    </form>
                </Card>
            </div>
        </div>
    )
}
