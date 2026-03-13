import {
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
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useFormik } from 'formik'
import { BadgeCheck, Banknote, Receipt, UploadCloud } from 'lucide-react'
import { AdminPageHeading } from '../../../../shared/components'

export const Route = createFileRoute('/_administrator/financial/payouts/$no')({
    component: () => {
        return (
            <>
                <AdminPageHeading
                    title="Folder Templates"
                    description=" Manage SharePoint folder structures used for
                        automatically generating job workspaces."
                />
                <PayoutJobDetail />
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

export default function PayoutJobDetail() {
    // const { no } = useParams({ strict: false }) // TanStack Router parameter
    const no = 'JOB-2026-001' // Mocking for preview

    const job = getMockJobDetail(no as string)
    const profit = job.income - job.totalCost

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(val)

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
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Banknote className="text-primary" /> Process Payout
                </h1>
                <p className="text-sm text-default-500">
                    Job #{job.no} • {job.displayName}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN: Financial Breakdown (Read-Only) */}
                <div className="lg:col-span-7 space-y-6">
                    <Card shadow="sm" className="border border-divider">
                        <CardHeader className="bg-default-50 border-b border-divider px-6 py-4">
                            <h2 className="text-base font-bold flex items-center gap-2">
                                <Receipt size={18} /> Financial Summary
                            </h2>
                        </CardHeader>
                        <CardBody className="p-6 space-y-6">
                            {/* Income Block */}
                            <div>
                                <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-3">
                                    Client Payment (In)
                                </p>
                                <div className="flex items-center justify-between p-4 bg-success-50 rounded-xl border border-success-100">
                                    <div>
                                        <p className="text-sm font-semibold text-success-900">
                                            {job.clientName}
                                        </p>
                                        <p className="text-xs text-success-700">
                                            via {job.paymentChannel} •{' '}
                                            {job.completedAt}
                                        </p>
                                    </div>
                                    <p className="text-xl font-bold text-success-700">
                                        {formatCurrency(job.income)}
                                    </p>
                                </div>
                            </div>

                            {/* Staff Cost Block */}
                            <div>
                                <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-3">
                                    Staff Distribution (Out)
                                </p>
                                <div className="space-y-3">
                                    {job.assignees.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between p-3 border border-default-200 rounded-lg"
                                        >
                                            <User
                                                name={
                                                    <span className="font-semibold text-sm">
                                                        {user.name}
                                                    </span>
                                                }
                                                description={user.role}
                                                avatarProps={{
                                                    src: user.avatar,
                                                    size: 'sm',
                                                }}
                                            />
                                            <p className="font-bold text-danger-600">
                                                {formatCurrency(user.cost)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-divider">
                                    <span className="font-semibold text-sm text-default-600">
                                        Total Payout Required:
                                    </span>
                                    <span className="font-bold text-lg text-danger-600">
                                        {formatCurrency(job.totalCost)}
                                    </span>
                                </div>
                            </div>

                            {/* Margin Block */}
                            <div className="flex justify-between items-center p-4 bg-primary-50 rounded-xl border border-primary-100">
                                <span className="font-bold text-sm text-primary-900">
                                    Net Company Profit:
                                </span>
                                <span className="font-bold text-xl text-primary-700">
                                    {formatCurrency(profit)}
                                </span>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* RIGHT COLUMN: Payout Action Form */}
                <div className="lg:col-span-5">
                    <Card
                        shadow="md"
                        className="border border-default-200 sticky top-6"
                    >
                        <form onSubmit={formik.handleSubmit}>
                            <CardHeader className="px-6 py-5 border-b border-divider">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <BadgeCheck className="text-success" />{' '}
                                    Confirm Transfer
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
                                    <SelectItem
                                        key="vpbank"
                                        textValue="VP Bank"
                                    >
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
                                        <span className="text-default-400 text-sm">
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
                                    <label className="cursor-pointer border-2 border-dashed border-default-300 hover:border-primary hover:bg-primary-50 transition-all rounded-xl p-4 flex flex-col items-center justify-center gap-2">
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
                                <p className="text-xs text-center text-default-400 mt-2">
                                    Staff will be notified via email
                                    automatically.
                                </p>
                            </CardBody>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    )
}
