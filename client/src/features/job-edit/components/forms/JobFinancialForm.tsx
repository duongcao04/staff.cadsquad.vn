import { optimizeCloudinary, useProfile } from '@/lib'
import {
    HeroDropdown,
    HeroDropdownItem,
    HeroDropdownMenu,
    HeroDropdownTrigger,
    HeroTooltip,
} from '@/shared/components' // Assuming HeroTooltip is exported from here
import { HeroCard, HeroCardBody } from '@/shared/components/ui/hero-card'
import { TJob } from '@/shared/types'
import {
    addToast,
    Avatar,
    Button,
    Chip,
    Divider,
    Input,
    Switch,
} from '@heroui/react'
import { useFormik } from 'formik'
import {
    DollarSign,
    Download,
    FileText,
    MoreVertical,
    PencilIcon,
    Save,
    SquarePenIcon,
    Users,
} from 'lucide-react'
import { z } from 'zod'
import { toFormikValidationSchema } from 'zod-formik-adapter'

// --- Validation Schema (Zod) ---
const jobFinancialsSchema = z.object({
    incomeCost: z.coerce
        .number({
            message: 'Must be a number',
        })
        .min(0, 'Cannot be negative'),
    assignments: z.array(
        z.object({
            id: z.string(),
            userId: z.string(),
            staffCost: z.coerce
                .number({
                    message: 'Must be a number',
                })
                .min(0, 'Cannot be negative'),
        })
    ),
    isPaid: z.boolean(),
})

export type TJobFinancialsForm = z.infer<typeof jobFinancialsSchema>

// --- Component ---
export function JobFinancialForm({ job }: { job: TJob }) {
    const { data: profile } = useProfile()
    // const updateFinancialsMutation = useUpdateJobFinancialsMutation()

    const formik = useFormik<TJobFinancialsForm>({
        initialValues: {
            incomeCost: job?.incomeCost || 0,
            assignments:
                job?.assignments?.map((ass) => ({
                    id: ass.id,
                    userId: ass.user.id,
                    staffCost: ass.staffCost || 0,
                })) || [],
            isPaid: job?.isPaid || false,
        },
        enableReinitialize: true,
        validationSchema: toFormikValidationSchema(jobFinancialsSchema),
        onSubmit: async (values) => {
            try {
                const totalStaffCost = values.assignments.reduce(
                    (sum, a) => sum + Number(a.staffCost),
                    0
                )

                // await updateFinancialsMutation.mutateAsync({
                //     jobId: job.id,
                //     data: {
                //         incomeCost: values.incomeCost,
                //         totalStaffCost: totalStaffCost,
                //         assignments: values.assignments,
                //         isPaid: values.isPaid,
                //     },
                // })
                addToast({
                    title: 'Financials updated successfully',
                    color: 'success',
                })
            } catch (error) {
                addToast({
                    title: 'Failed to update financials',
                    color: 'danger',
                })
            }
        },
    })

    const totalCalculatedStaffCost = formik.values.assignments.reduce(
        (sum, current) => sum + (Number(current.staffCost) || 0),
        0
    )

    return (
        <form
            onSubmit={formik.handleSubmit}
            className="space-y-6 animate-in fade-in"
        >
            {/* --- FORM HEADER & TOOLTIP --- */}
            <div className="flex items-center justify-between pb-4 border-b border-border-default">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-bold text-text-default">
                            Financial Management
                        </h1>
                        <HeroTooltip
                            placement="right"
                            content={
                                <div className="px-1 py-1 max-w-[250px] text-tiny text-default-600">
                                    Financial data is restricted. Team members
                                    can only see their own individual payout
                                    amounts, not the total income or other
                                    members' costs.
                                </div>
                            }
                        >
                            <div className="flex items-center justify-center w-4 h-4 rounded-full bg-default-200 hover:bg-default-300 text-[10px] font-bold text-default-600 cursor-help transition-colors">
                                !
                            </div>
                        </HeroTooltip>
                    </div>
                    <p className="text-sm text-text-subdued">
                        Manage the project's revenue, allocate staff payouts,
                        and track the client's payment status.
                    </p>
                </div>

                {/* --- Payment Status Row --- */}
                <div>
                    {/* --- Action Buttons --- */}
                    <div className="flex justify-end items-center gap-2">
                        <Button
                            type="button"
                            color="primary"
                            startContent={<SquarePenIcon size={16} />}
                            // isLoading={updateFinancialsMutation.isPending}
                            // isDisabled={
                            //     !formik.dirty || updateFinancialsMutation.isPending
                            // }
                        >
                            Update
                        </Button>
                        <HeroDropdown placement="bottom-end">
                            <HeroDropdownTrigger>
                                <Button
                                    type="button"
                                    isIconOnly
                                    color="default"
                                    variant="flat"
                                    aria-label="More financial actions"
                                >
                                    <MoreVertical
                                        size={18}
                                        className="text-default-600"
                                    />
                                </Button>
                            </HeroDropdownTrigger>
                            <HeroDropdownMenu
                                aria-label="Financial Actions"
                                variant="flat"
                            >
                                <HeroDropdownItem
                                    key="invoice"
                                    startContent={
                                        <FileText
                                            size={16}
                                            className="text-primary"
                                        />
                                    }
                                    description="Generate or view the PDF invoice"
                                >
                                    Create/View Invoice
                                </HeroDropdownItem>
                                <HeroDropdownItem
                                    key="export"
                                    startContent={
                                        <Download
                                            size={16}
                                            className="text-default-500"
                                        />
                                    }
                                    description="Download cost breakdown as CSV"
                                >
                                    Export Data
                                </HeroDropdownItem>
                            </HeroDropdownMenu>
                        </HeroDropdown>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-border-default rounded-xl">
                <div>
                    <h4 className="font-bold text-text-default">
                        Payment Status
                    </h4>
                    <p className="text-sm text-text-subdued">
                        Has the client paid for this job?
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span
                        className={`text-sm font-bold ${
                            formik.values.isPaid
                                ? 'text-emerald-600'
                                : 'text-text-subdued'
                        }`}
                    >
                        {formik.values.isPaid ? 'PAID' : 'UNPAID'}
                    </span>
                    <Switch
                        isSelected={formik.values.isPaid}
                        onValueChange={(val) =>
                            formik.setFieldValue('isPaid', val)
                        }
                        color="success"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mt-2">
                {/* --- Total Income Card --- */}
                <HeroCard
                    className="bg-emerald-50 dark:bg-emerald-50/10 border border-emerald-100 dark:border-emerald-100/50"
                    shadow="none"
                >
                    <HeroCardBody className="p-5 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <label className="text-xs font-bold text-emerald-700 uppercase">
                                    Total Income
                                </label>
                                <p className="text-xs text-emerald-600/80 mt-0.5">
                                    Amount billable to client
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-start gap-2">
                            <div className="p-2 bg-emerald-100/50 dark:bg-emerald-500/20 rounded-lg">
                                <DollarSign
                                    size={18}
                                    className="text-emerald-600"
                                />
                            </div>
                            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400text-right">
                                {job.incomeCost?.toLocaleString()}
                            </p>
                        </div>
                    </HeroCardBody>
                </HeroCard>

                <HeroCard className="bg-orange-50 dark:bg-orange-50/10 border border-orange-100 dark:border-orange-100/50 shadow-none">
                    <HeroCardBody className="p-5 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <label className="text-xs font-bold text-orange-700 uppercase">
                                    Total staff cost
                                </label>
                                <p className="text-xs text-orange-600/80 mt-0.5">
                                    Amount billable to client
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-start gap-2">
                            <div className="p-2 bg-orange-100/50 dark:bg-orange-500/20 rounded-lg">
                                <DollarSign
                                    size={18}
                                    className="text-orange-600"
                                />
                            </div>
                            <p className="text-2xl font-black text-orange-700 dark:text-orange-400text-right">
                                {totalCalculatedStaffCost.toLocaleString()}
                            </p>
                        </div>
                    </HeroCardBody>
                </HeroCard>
            </div>

            <Divider />

            {/* --- Staff Cost Table Card --- */}
            <HeroCard className="h-full" shadow="none">
                <HeroCardBody className="p-0 flex flex-col overflow-hidden">
                    <div className="p-5 pb-3 flex items-center gap-2 border-b border-border-default">
                        <Users size={16} />
                        <label className="text-xs font-bold uppercase tracking-wide">
                            Cost per member
                        </label>
                    </div>

                    <div className="p-5 flex-1 overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-75">
                            <thead>
                                <tr className="border-b border-border-muted">
                                    <th className="pb-3 text-xs font-bold uppercase tracking-wider">
                                        Assignee
                                    </th>
                                    <th className="pb-3 text-xs font-bold uppercase tracking-wider text-right w-35">
                                        Payout ($)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-muted">
                                {job?.assignments?.length > 0 ? (
                                    job.assignments.map((ass, index) => {
                                        const isMe = ass.user.id === profile?.id

                                        return (
                                            <tr key={ass.id} className="group">
                                                <td className="py-3 pr-2 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar
                                                            src={optimizeCloudinary(
                                                                ass.user.avatar,
                                                                {
                                                                    width: 100,
                                                                    height: 100,
                                                                }
                                                            )}
                                                            size="sm"
                                                            className="shrink-0 border border-orange-200/50"
                                                        />
                                                        <div className="flex flex-col truncate">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-semibold text-default-800 truncate">
                                                                    {
                                                                        ass.user
                                                                            .displayName
                                                                    }
                                                                </span>
                                                                {isMe && (
                                                                    <Chip
                                                                        size="sm"
                                                                        color="primary"
                                                                        variant="flat"
                                                                        className="h-4 px-1 text-[9px] font-bold tracking-wider uppercase border-none"
                                                                    >
                                                                        You
                                                                    </Chip>
                                                                )}
                                                            </div>
                                                            {ass.user.department
                                                                ?.displayName && (
                                                                <span className="text-[10px] text-default-500 truncate">
                                                                    {
                                                                        ass.user
                                                                            .department
                                                                            .displayName
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 pl-2 align-middle font-semibold text-right text-text-default">
                                                    $
                                                    {
                                                        formik.getFieldProps(
                                                            `assignments.${index}.staffCost`
                                                        ).value
                                                    }
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={2}
                                            className="py-6 text-center"
                                        >
                                            <p className="text-sm text-orange-600/60 italic">
                                                No staff assigned to this job
                                                yet.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </HeroCardBody>
            </HeroCard>
        </form>
    )
}
