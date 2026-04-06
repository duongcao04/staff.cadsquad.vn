import {
    jobFinancialDetailOptions,
    optimizeCloudinary,
    useProfile,
} from '@/lib'
import {
    HeroDropdown,
    HeroDropdownItem,
    HeroDropdownMenu,
    HeroDropdownTrigger,
    HeroTooltip,
} from '@/shared/components'
import { HeroCard, HeroCardBody } from '@/shared/components/ui/hero-card'
import { TJob } from '@/shared/types'
import {
    Avatar,
    Button,
    CardHeader,
    Chip,
    Divider,
    Progress,
    Skeleton,
} from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import {
    AlertCircle,
    Banknote,
    CheckCircle2,
    Download,
    FileText,
    HandCoins,
    MoreVertical,
    Timer,
    TrendingUp,
    Users,
    Wallet,
} from 'lucide-react'

// --- Component 1: Badge trạng thái thu tiền từ Khách hàng ---
export function JobClientPaymentBadge({
    isPaid,
    remaining,
}: {
    isPaid: boolean
    remaining: number
}) {
    return (
        <div className="flex flex-col items-end gap-1">
            <Chip
                variant="flat"
                color={
                    isPaid ? 'success' : remaining > 0 ? 'warning' : 'default'
                }
                startContent={
                    isPaid ? (
                        <CheckCircle2 size={14} />
                    ) : (
                        <HandCoins size={14} />
                    )
                }
                className="font-bold border-none px-3"
            >
                {isPaid
                    ? 'CLIENT: FULLY PAID'
                    : remaining > 0
                      ? 'CLIENT: PARTIAL'
                      : 'CLIENT: UNPAID'}
            </Chip>
            <p className="text-[9px] text-default-400 font-medium">
                {isPaid
                    ? 'Collection completed'
                    : `Remaining: $${remaining.toLocaleString()}`}
            </p>
        </div>
    )
}

// --- Component 2: Badge trạng thái trả lương Staff ---
export function JobPayoutStatusBadge({ status }: { status: string }) {
    const config = {
        PAID: {
            color: 'success' as const,
            label: 'FULLY PAID TO STAFF',
            icon: <CheckCircle2 size={14} />,
            description: 'All team members have received their full quota.',
        },
        PENDING: {
            color: 'warning' as const,
            label: 'PAYMENT IN PROGRESS',
            icon: <Timer size={14} />,
            description: 'Some members are paid, some are still waiting.',
        },
        UNPAID: {
            color: 'default' as const,
            label: 'AWAITING PAYOUT',
            icon: <AlertCircle size={14} />,
            description: 'No payments have been recorded for this job yet.',
        },
        FAILED: {
            color: 'danger' as const,
            label: 'PAYMENT FAILED',
            icon: <AlertCircle size={14} />,
            description: 'There was an error in the last transaction.',
        },
    }

    const current = config[status as keyof typeof config] || config.UNPAID

    return (
        <div className="flex flex-col items-end gap-1">
            <Chip
                variant="shadow"
                color={current.color}
                startContent={current.icon}
                className="font-black text-white border-none px-3"
            >
                {current.label}
            </Chip>
            <p className="text-[10px] text-default-400 italic">
                {current.description}
            </p>
        </div>
    )
}

export function JobFinancialForm({ job }: { job: TJob | any }) {
    const { data: profile } = useProfile()

    const { data: financials, isLoading } = useQuery({
        ...jobFinancialDetailOptions(job.id),
        enabled: !!job.id,
    })

    const summary = financials?.summary
    const isLoss = (summary?.potentialProfit || 0) < 0

    if (isLoading) return <Skeleton className="h-60 rounded-xl" />

    return (
        <div className="space-y-6 animate-in fade-in duration-400">
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between pb-4 border-b border-divider">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-bold text-default-900">
                            Financial Insights
                        </h1>
                        <HeroTooltip content="Overview of collection from client and payouts to staff.">
                            <div className="flex items-center justify-center w-4 h-4 rounded-full bg-default-100 text-[10px] font-bold text-default-400 cursor-help">
                                !
                            </div>
                        </HeroTooltip>
                    </div>
                    <p className="text-sm text-default-500 font-medium">
                        Job #{financials?.jobNo || job.no}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Badge 1: Thu tiền khách */}
                    <JobClientPaymentBadge
                        isPaid={summary?.isClientFullyPaid}
                        remaining={summary?.remainingReceivable || 0}
                    />
                    <HeroDropdown placement="bottom-end">
                        <HeroDropdownTrigger>
                            <Button isIconOnly variant="light" radius="full">
                                <MoreVertical size={18} />
                            </Button>
                        </HeroDropdownTrigger>
                        <HeroDropdownMenu aria-label="Financial Actions">
                            <HeroDropdownItem
                                key="ledger"
                                startContent={
                                    <FileText
                                        size={16}
                                        className="text-primary"
                                    />
                                }
                            >
                                View Ledger
                            </HeroDropdownItem>
                            <HeroDropdownItem
                                key="export"
                                startContent={<Download size={16} />}
                            >
                                Export CSV
                            </HeroDropdownItem>
                        </HeroDropdownMenu>
                    </HeroDropdown>
                </div>
            </div>

            {/* --- KPI CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <HeroCard
                    className="bg-blue-50/50 border-blue-100"
                    shadow="none"
                >
                    <HeroCardBody className="p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
                            <Banknote size={16} /> Collected
                        </div>
                        <p className="text-2xl font-black text-blue-700">
                            ${summary?.totalCollected.toLocaleString()}
                        </p>
                    </HeroCardBody>
                </HeroCard>

                <HeroCard
                    className="bg-orange-50/50 border-orange-100"
                    shadow="none"
                >
                    <HeroCardBody className="p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-wider">
                            <Wallet size={16} /> Staff Paid
                        </div>
                        <p className="text-2xl font-black text-orange-700">
                            ${summary?.totalStaffPaid.toLocaleString()}
                        </p>
                    </HeroCardBody>
                </HeroCard>

                <HeroCard
                    className={
                        isLoss
                            ? 'bg-danger-50/50 border-danger-100'
                            : 'bg-emerald-50/50 border-emerald-100'
                    }
                    shadow="none"
                >
                    <HeroCardBody className="p-4 flex flex-col gap-3">
                        <div
                            className={`flex items-center gap-2 font-bold text-xs uppercase tracking-wider ${isLoss ? 'text-danger-600' : 'text-emerald-600'}`}
                        >
                            <TrendingUp size={16} />{' '}
                            {isLoss ? 'Loss' : 'Profit'}
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p
                                className={`text-2xl font-black ${isLoss ? 'text-danger-700' : 'text-emerald-700'}`}
                            >
                                ${summary?.potentialProfit.toLocaleString()}
                            </p>
                            <span className="text-[10px] font-bold">
                                ({summary?.marginPercent}%)
                            </span>
                        </div>
                    </HeroCardBody>
                </HeroCard>
            </div>

            {/* --- PROGRESS --- */}
            <div className="p-5 border border-divider rounded-2xl bg-default-50/50 space-y-3">
                <div className="flex justify-between items-end">
                    <p className="text-sm font-bold text-default-900">
                        Collection Progress
                    </p>
                    <div className="text-right flex flex-col">
                        <span className="text-lg font-black text-default-900">
                            ${summary?.totalCollected.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-default-400">
                            Budget: ${financials?.incomeCost.toLocaleString()}
                        </span>
                    </div>
                </div>
                <Progress
                    aria-label="Collection progress"
                    value={
                        (summary?.totalCollected /
                            (financials?.incomeCost || 1)) *
                        100
                    }
                    color={summary?.isClientFullyPaid ? 'success' : 'primary'}
                    size="md"
                />
            </div>

            {/* --- TABLE --- */}
            <HeroCard shadow="none" className="border border-divider">
                <CardHeader>
                    <div className="w-full flex items-center justify-between">
                        <div className="p-4 flex items-center gap-2 bg-default-50/30">
                            <Users size={16} className="text-default-500" />
                            <span className="text-xs font-bold uppercase text-default-600">
                                Staff Audit
                            </span>
                        </div>

                        {/* Badge 2: Trả lương staff */}
                        <JobPayoutStatusBadge status={job.paymentStatus} />
                    </div>
                </CardHeader>

                <Divider className="bg-border-default" />

                <HeroCardBody className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-divider bg-default-50/20">
                                    <th className="p-4 text-[10px] font-bold uppercase text-default-400">
                                        Assignee
                                    </th>
                                    <th className="p-4 text-[10px] font-bold uppercase text-default-400 text-right">
                                        Quota
                                    </th>
                                    <th className="p-4 text-[10px] font-bold uppercase text-default-400 text-right">
                                        Paid
                                    </th>
                                    <th className="p-4 text-[10px] font-bold uppercase text-default-400 text-right">
                                        Debt
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-divider">
                                {financials?.staffBreakdown?.map(
                                    (staff: any) => {
                                        const isMe =
                                            staff.userId === profile?.id
                                        return (
                                            <tr
                                                key={staff.assignmentId}
                                                className="hover:bg-default-50/50 transition-colors"
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar
                                                            src={optimizeCloudinary(
                                                                staff.avatar,
                                                                {
                                                                    width: 80,
                                                                    height: 80,
                                                                }
                                                            )}
                                                            size="sm"
                                                        />
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-sm font-bold text-default-800">
                                                                    {
                                                                        staff.displayName
                                                                    }
                                                                </span>
                                                                {isMe && (
                                                                    <Chip
                                                                        size="sm"
                                                                        color="primary"
                                                                        variant="flat"
                                                                        className="h-4 text-[8px] font-black px-1"
                                                                    >
                                                                        YOU
                                                                    </Chip>
                                                                )}
                                                            </div>
                                                            <span className="text-[9px] text-default-400 uppercase">
                                                                Artist
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right font-medium text-default-600">
                                                    $
                                                    {staff.quota.toLocaleString()}
                                                </td>
                                                <td className="p-4 text-right font-bold text-success-600">
                                                    $
                                                    {staff.paid.toLocaleString()}
                                                </td>
                                                <td className="p-4 text-right">
                                                    {staff.remainingDebt > 0 ? (
                                                        <span className="text-danger-600 font-bold text-sm">
                                                            $
                                                            {staff.remainingDebt.toLocaleString()}
                                                        </span>
                                                    ) : (
                                                        <CheckCircle2
                                                            size={16}
                                                            className="text-success inline-block"
                                                        />
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    }
                                )}
                            </tbody>
                        </table>
                    </div>
                </HeroCardBody>
            </HeroCard>
        </div>
    )
}
