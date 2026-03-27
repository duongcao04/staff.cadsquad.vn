import {
    jobByNoOptions,
    paymentChannelsListOptions,
    updateAssignmentCostOptions,
    updateJobRevenueMutationOptions,
} from '@/lib/queries'
import {
    addToast,
    Avatar,
    Button,
    Card,
    CardBody,
    Select,
    SelectItem,
    Skeleton,
    Spinner,
    Tab,
    Tabs,
} from '@heroui/react'
import { useMutation, useSuspenseQueries } from '@tanstack/react-query'
import { Image } from 'antd'
import {
    CheckCircle2,
    DollarSign,
    Landmark,
    ReceiptText,
    SaveIcon,
    SquarePenIcon,
    TrendingUp,
    Users,
    Wallet,
    XIcon,
} from 'lucide-react'
import {
    Dispatch,
    FormEvent,
    SetStateAction,
    Suspense,
    useEffect,
    useMemo,
    useState,
} from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { optimizeCloudinary, TUpdateJobRevenue } from '../../../../lib'
import { TJob, TPaymentChannel } from '../../../../shared/types'
import { HeroButton } from '../../../../shared/components/ui/hero-button'
import {
    HeroCard,
    HeroCardBody,
} from '../../../../shared/components/ui/hero-card'
import {
    HeroModal,
    HeroModalBody,
    HeroModalContent,
    HeroModalFooter,
    HeroModalHeader,
} from '../../../../shared/components/ui/hero-modal'
import HeroNumberInput from '../../../../shared/components/ui/hero-number-input'
import { HeroTooltip } from '../../../../shared/components/ui/hero-tooltip'
import {
    ScrollArea,
    ScrollBar,
} from '../../../../shared/components/ui/scroll-area'

type AssignedMember = {
    userId: string
    displayName: string
    avatar: string
    staffCost: number
}

type UpdateCostModalProps = {
    jobNo: string
    isOpen: boolean
    onClose: () => void
}
export default function UpdateCostModal({
    jobNo,
    isOpen,
    onClose,
}: UpdateCostModalProps) {
    return (
        <HeroModal isOpen={isOpen} onClose={onClose} size="2xl">
            <HeroModalContent>
                {/* 1. Bao bọc nội dung bằng ErrorBoundary và Suspense */}
                <ErrorBoundary
                    fallback={
                        <div className="p-10 text-center">Have an error !</div>
                    }
                >
                    <Suspense fallback={<UpdateCostSkeleton />}>
                        {/* Chỉ kích hoạt fetch khi Modal mở */}
                        {isOpen && (
                            <UpdateCostContainer
                                jobNo={jobNo}
                                onClose={onClose}
                                isOpen={isOpen}
                            />
                        )}
                    </Suspense>
                </ErrorBoundary>
            </HeroModalContent>
        </HeroModal>
    )
}
function UpdateCostContainer({ isOpen, onClose, jobNo }: UpdateCostModalProps) {
    const [
        { data: job },
        {
            data: { paymentChannels },
        },
    ] = useSuspenseQueries({
        queries: [
            { ...jobByNoOptions(jobNo) },
            { ...paymentChannelsListOptions() },
        ],
    })
    return (
        <UpdateCostContent
            job={job}
            isOpen={isOpen}
            onClose={onClose}
            paymentChannels={paymentChannels}
        />
    )
}

function UpdateCostContent({
    job,
    isOpen,
    onClose,
    paymentChannels,
}: {
    job: TJob
    isOpen: boolean
    onClose: () => void
    paymentChannels: TPaymentChannel[]
}) {
    const updateJobRevenue = useMutation(updateJobRevenueMutationOptions)
    const [selectedTab, setSelectedTab] = useState<string>('revenue')

    // Revenue States
    const [incomeCost, setIncomeCost] = useState<number | undefined>(undefined)
    const [paymentChannelId, setPaymentChannelId] = useState<string>('')

    // Assignment States
    const [assignedMembers, setAssignedMembers] = useState<AssignedMember[]>([])

    useEffect(() => {
        if (isOpen && job) {
            setIncomeCost(job.incomeCost || 25000000)
            setPaymentChannelId(job?.paymentChannel?.id || 'ch_1')
            if (job.assignments) {
                setAssignedMembers(
                    job.assignments.map((asgn: any) => ({
                        userId: asgn.user.id,
                        displayName: asgn.user.displayName,
                        avatar: asgn.user.avatar,
                        staffCost: asgn.staffCost || 0,
                    }))
                )
            }
        }
    }, [isOpen, job])

    const totalStaffCost = useMemo(
        () => assignedMembers.reduce((sum, m) => sum + m.staffCost, 0),
        [assignedMembers]
    )

    const isSameOldData = useMemo(
        () =>
            paymentChannelId === job.paymentChannel?.id &&
            incomeCost === job.incomeCost,
        [paymentChannelId, incomeCost]
    )

    const handleUpdateRevenue = async (e?: FormEvent<HTMLFormElement>) => {
        e?.preventDefault()
        if (isSameOldData) {
            addToast({
                title: 'No changes detected',
                description:
                    'The information is the same as before. Nothing to update.',
                color: 'danger',
            })
        }
        const updateValues: TUpdateJobRevenue = {
            paymentChannelId:
                paymentChannelId === job.paymentChannel?.id
                    ? undefined
                    : paymentChannelId,
            incomeCost: incomeCost === job.incomeCost ? undefined : incomeCost,
        }
        await updateJobRevenue.mutateAsync(
            {
                jobId: job.id,
                data: updateValues,
            },
            {
                onSuccess() {
                    ;(setIncomeCost(undefined), setPaymentChannelId(''))
                    onClose()
                },
            }
        )
    }

    return (
        <>
            <HeroModalHeader className="flex flex-col gap-1 py-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <TrendingUp size={22} className="text-primary" />
                    </div>
                    <div>
                        <span>Financial</span>
                        <p className="text-xs font-medium text-text-subdued">
                            Managing Records for Job #{job?.no || 'N/A'}
                        </p>
                    </div>
                </div>
            </HeroModalHeader>

            <HeroModalBody className="py-0 px-8">
                <Tabs
                    fullWidth
                    aria-label="Financial Tabs"
                    color="primary"
                    variant="solid"
                    radius="full"
                    selectedKey={selectedTab}
                    onSelectionChange={(k) => setSelectedTab(k as string)}
                    classNames={{
                        tabList: 'bg-background-muted p-1',
                        cursor: 'shadow-sm',
                        tab: 'h-10',
                    }}
                >
                    {/* TAB 1: REVENUE */}
                    <Tab
                        key="revenue"
                        title={
                            <div className="flex items-center gap-2">
                                <DollarSign size={16} />
                                <span>Income</span>
                            </div>
                        }
                    >
                        <form
                            onSubmit={handleUpdateRevenue}
                            className="flex flex-col gap-8"
                        >
                            <div className="grid grid-cols-1 gap-6">
                                <HeroNumberInput
                                    label="Income cost"
                                    placeholder="0"
                                    type="number"
                                    labelPlacement="outside"
                                    size="md"
                                    allowNegative={false}
                                    value={incomeCost}
                                    notNull={false}
                                    onValueChange={(val) => {
                                        setIncomeCost(val ?? undefined)
                                    }}
                                    startContent={
                                        <span className="text-text-subdued font-medium">
                                            $
                                        </span>
                                    }
                                    classNames={{
                                        input: 'font-medium',
                                    }}
                                />
                                <Select
                                    label="Settlement Account"
                                    labelPlacement="outside"
                                    placeholder="Select account channel"
                                    size="md"
                                    variant="bordered"
                                    classNames={{
                                        trigger: 'border-1!',
                                    }}
                                    selectedKeys={[paymentChannelId]}
                                    onSelectionChange={(keys) =>
                                        setPaymentChannelId(
                                            Array.from(keys)[0] as string
                                        )
                                    }
                                    disallowEmptySelection
                                    startContent={
                                        <Landmark
                                            size={20}
                                            className="text-primary"
                                        />
                                    }
                                >
                                    {paymentChannels.map((c) => (
                                        <SelectItem
                                            key={c.id}
                                            textValue={c.displayName}
                                        >
                                            <div className="flex items-center justify-start gap-2">
                                                <Image
                                                    src={c.logoUrl}
                                                    rootClassName="size-8! rounded-full"
                                                    className="size-full rounded-full object-cover"
                                                    preview={false}
                                                />
                                                {c.displayName}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    color="primary"
                                    className="shadow-md shadow-primary/30"
                                    startContent={
                                        updateJobRevenue.isPending ? (
                                            <Spinner />
                                        ) : (
                                            <CheckCircle2 size={18} />
                                        )
                                    }
                                    isDisabled={isSameOldData}
                                    onPress={() => handleUpdateRevenue()}
                                >
                                    Update Revenue
                                </Button>
                            </div>
                        </form>
                    </Tab>

                    {/* TAB 2: STAFF COSTS */}
                    <Tab
                        key="assignments"
                        title={
                            <div className="flex items-center gap-2">
                                <Users size={16} />
                                <span>Payouts</span>
                            </div>
                        }
                    >
                        <ScrollArea className="size-full h-100 py-6">
                            <ScrollBar orientation="horizontal" />
                            <ScrollBar orientation="vertical" />
                            <Card
                                className="bg-background-hovered border-none shadow-none"
                                radius="lg"
                            >
                                <CardBody className="flex-row items-center gap-3 py-3">
                                    <div className="p-2 bg-primary rounded-full">
                                        <ReceiptText
                                            size={16}
                                            className="text-white"
                                        />
                                    </div>
                                    <p className="text-xs font-medium text-primary">
                                        Adjust individual payouts for current
                                        team members below.
                                    </p>
                                </CardBody>
                            </Card>
                            <div className="flex flex-col gap-6 py-4">
                                <div className="flex flex-col gap-3">
                                    {assignedMembers.map((member) => (
                                        <AssignedMemberCard
                                            key={member.userId}
                                            jobId={job.id}
                                            onAssignedMembersChange={
                                                setAssignedMembers
                                            }
                                            member={member}
                                        />
                                    ))}
                                </div>
                            </div>
                        </ScrollArea>
                    </Tab>
                </Tabs>
            </HeroModalBody>

            <HeroModalFooter className="flex-col items-stretch gap-3 px-8">
                <div className="flex items-center justify-between bg-primary/5 px-4 py-2 rounded-xl gap-1 border border-primary/10">
                    <div className="flex items-center gap-2 text-primary-500 mb-1">
                        <Wallet size={22} />
                        <span className="text-xs uppercase font-black tracking-wider">
                            Total Expenses
                        </span>
                    </div>
                    <div className="text-xl font-black text-primary">
                        {totalStaffCost.toLocaleString()}
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-xs text-text-subdued max-w-[60%]">
                        * All changes are logged for auditing purposes and will
                        impact the monthly balance sheet.
                    </p>
                    <Button variant="light" onPress={onClose}>
                        Close
                    </Button>
                </div>
            </HeroModalFooter>
        </>
    )
}

export function UpdateCostSkeleton() {
    return (
        <>
            {/* Header Skeleton */}
            <div className="p-4 border-b border-divider flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-2">
                    <Skeleton className="w-32 h-5 rounded-md" />
                    <Skeleton className="w-48 h-3 rounded-md" />
                </div>
            </div>

            <div className="p-8 space-y-6">
                {/* Tabs Skeleton */}
                <Skeleton className="w-full h-12 rounded-full" />

                <div className="py-6 space-y-8">
                    {/* Input Area Skeleton */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="w-20 h-4 rounded-md" />
                            <Skeleton className="w-full h-14 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="w-20 h-4 rounded-md" />
                            <Skeleton className="w-full h-14 rounded-xl" />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Skeleton className="w-36 h-10 rounded-xl" />
                    </div>
                </div>
            </div>

            {/* Footer Stats Skeleton */}
            <div className="p-8 border-t border-divider space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <HeroCard className="shadow-none border border-divider">
                        <HeroCardBody className="p-4 gap-2">
                            <Skeleton className="w-16 h-3 rounded-md" />
                            <Skeleton className="w-24 h-8 rounded-md" />
                        </HeroCardBody>
                    </HeroCard>
                    <HeroCard className="shadow-none border border-divider">
                        <HeroCardBody className="p-4 gap-2">
                            <Skeleton className="w-16 h-3 rounded-md" />
                            <Skeleton className="w-24 h-8 rounded-md" />
                        </HeroCardBody>
                    </HeroCard>
                </div>
                <div className="flex justify-between items-center">
                    <Skeleton className="w-1/2 h-3 rounded-md" />
                    <Skeleton className="w-24 h-10 rounded-xl" />
                </div>
            </div>
        </>
    )
}

function AssignedMemberCard({
    jobId,
    member,
    onAssignedMembersChange,
}: {
    jobId: string
    member: AssignedMember
    onAssignedMembersChange: Dispatch<SetStateAction<AssignedMember[]>>
}) {
    const updateAssignmentCostMutation = useMutation(
        updateAssignmentCostOptions
    )

    const [editable, setEditable] = useState(false)
    const handleUpdateCost = (userId: string, value: string) => {
        const numericValue = parseFloat(value) || 0
        onAssignedMembersChange((prev) =>
            prev.map((m) =>
                m.userId === userId ? { ...m, staffCost: numericValue } : m
            )
        )
    }

    const onSave = () => {
        updateAssignmentCostMutation.mutateAsync(
            {
                jobId: jobId,
                memberId: member.userId,
                staffCost: member.staffCost,
            },
            {
                onSuccess() {
                    setEditable(false)
                },
            }
        )
    }

    return (
        <div className="flex items-center justify-between p-4 bg-default-50 rounded-2xl border border-transparent hover:border-primary-200 hover:bg-white dark:hover:bg-zinc-900 transition-all">
            <div className="flex items-center gap-3">
                <Avatar
                    src={optimizeCloudinary(member.avatar)}
                    className="w-10 h-10 shadow-sm"
                />
                <div className="flex flex-col">
                    <span className="text-sm font-bold">
                        {member.displayName}
                    </span>
                </div>
            </div>
            <div className="flex items-center justify-end gap-3">
                <HeroNumberInput
                    hideStepper
                    size="sm"
                    placeholder="0"
                    notNull={true}
                    allowNegative={false}
                    isDisabled={!editable}
                    value={member.staffCost.toString()}
                    onValueChange={(val) =>
                        handleUpdateCost(member.userId, val?.toString() ?? '0')
                    }
                    className="w-36"
                    endContent={
                        <span className="text-[10px] font-bold text-text-subdued">
                            VND
                        </span>
                    }
                />
                {!editable && (
                    <HeroTooltip content="Edit cost" color="warning">
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="warning"
                            onPress={() => setEditable(true)}
                        >
                            <SquarePenIcon size={16} />
                        </Button>
                    </HeroTooltip>
                )}
                {editable && (
                    <>
                        <HeroTooltip content="Save cost">
                            <HeroButton
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="blue"
                                onPress={onSave}
                            >
                                <SaveIcon size={16} />
                            </HeroButton>
                        </HeroTooltip>

                        <HeroTooltip content="Cancel">
                            <HeroButton
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="default"
                                onPress={() => setEditable(false)}
                            >
                                <XIcon size={16} />
                            </HeroButton>
                        </HeroTooltip>
                    </>
                )}
            </div>
        </div>
    )
}
