import { optimizeCloudinary } from '@/lib'
import { jobByNoOptions, usersListOptions } from '@/lib/queries'
import {
    useAssignMemberMutation,
    useRemoveMemberMutation,
    useUpdateAssignmentCostMutation,
} from '@/lib/queries/useJob'
import { HeroButton } from '@/shared/components/ui/hero-button'
import {
    HeroModal,
    HeroModalBody,
    HeroModalContent,
    HeroModalFooter,
    HeroModalHeader,
} from '@/shared/components/ui/hero-modal'
import HeroNumberInput from '@/shared/components/ui/hero-number-input'
import { HeroTooltip } from '@/shared/components/ui/hero-tooltip'
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area'
import { TJob, TUser } from '@/shared/types'
import {
    addToast,
    Autocomplete,
    AutocompleteItem,
    Avatar,
    Button,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Skeleton,
} from '@heroui/react'
import { useSuspenseQueries } from '@tanstack/react-query'
import {
    AlertTriangle,
    SaveIcon,
    Search,
    SquarePenIcon,
    Trash2,
    Wallet,
    XIcon,
} from 'lucide-react'
import { Dispatch, SetStateAction, Suspense, useMemo, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

type AssignedMember = {
    userId: string
    displayName: string
    avatar: string
    staffCost: number
}

type AssignMemberModalProps = {
    jobNo?: string
    isOpen: boolean
    onClose: () => void
}
export default function AssignMemberModal({
    jobNo = 'F.26001',
    isOpen,
    onClose,
}: AssignMemberModalProps) {
    return (
        <HeroModal isOpen={isOpen} onClose={onClose} size="2xl">
            <HeroModalContent>
                {/* 1. Bọc ErrorBoundary để bắt lỗi API */}
                <ErrorBoundary
                    fallback={<div className="p-4">Có lỗi xảy ra!</div>}
                >
                    {/* 2. Bọc Suspense để hiển thị Loading Skeleton */}
                    <Suspense fallback={<AssignMemberSkeleton />}>
                        <AssignMemberContainer
                            jobNo={jobNo}
                            onClose={onClose}
                        />
                    </Suspense>
                </ErrorBoundary>
            </HeroModalContent>
        </HeroModal>
    )
}

function AssignMemberContainer({
    jobNo,
    onClose,
}: {
    jobNo: string
    onClose: () => void
}) {
    const [
        {
            data: { users },
        },
        { data: job, refetch },
    ] = useSuspenseQueries({
        queries: [{ ...usersListOptions() }, { ...jobByNoOptions(jobNo) }],
    })

    return (
        <AssignMemberContent
            users={users}
            job={job}
            onClose={onClose}
            onRefetchJob={refetch}
        />
    )
}

function AssignMemberContent({
    users,
    job,
    onClose,
    onRefetchJob,
}: {
    users: TUser[]
    job: TJob
    onClose: () => void
    onRefetchJob: () => void
}) {
    const assignMemberMutation = useAssignMemberMutation()

    const [assigningMember, setAssigningMember] =
        useState<AssignedMember | null>(null)
    const [assignedMembers, setAssignedMembers] = useState<AssignedMember[]>(
        job.assignments.map((ass) => ({
            avatar: ass.user.avatar,
            displayName: ass.user.displayName,
            staffCost: ass.staffCost,
            userId: ass.user.id,
        }))
    )

    // --- LOGIC: Filter members ---
    // This derived state only contains users NOT currently in the assigned list
    const availableUsers = useMemo(() => {
        const assignedIds = assigningMember
            ? assignedMembers.concat([assigningMember]).map((m) => m.userId)
            : assignedMembers.map((m) => m.userId)
        return users.filter((user) => !assignedIds.includes(user.id))
    }, [assignedMembers])

    const totalStaffCost = useMemo(() => {
        return assigningMember
            ? assignedMembers
                  .concat([assigningMember])
                  .reduce((sum, m) => sum + m.staffCost, 0)
            : assignedMembers.reduce((sum, m) => sum + m.staffCost, 0)
    }, [assignedMembers])

    const handleAddMember = (userId: string | number | null) => {
        if (!userId) return

        const user = users.find((u) => u.id === String(userId))
        if (!user) return

        setAssigningMember({
            userId: user.id,
            displayName: user.displayName,
            avatar: user.avatar,
            staffCost: 0,
        })
    }

    const handleAssignMember = async () => {
        if (!assigningMember) {
            addToast({
                title: 'Please select least member',
                color: 'danger',
            })
            return
        } else {
            await assignMemberMutation.mutateAsync(
                {
                    jobId: job.id,
                    data: {
                        memberId: assigningMember?.userId,
                        staffCost: assigningMember?.staffCost,
                    },
                },
                {
                    onSuccess: () => {
                        // 1. Update Local State immediately for UI feedback
                        setAssignedMembers((prev) => [assigningMember, ...prev])
                        setAssigningMember(null)
                        onRefetchJob()
                    },
                }
            )
        }
    }

    return (
        <>
            <HeroModalHeader className="flex flex-col gap-1 border-b border-divider">
                <span>Assign Members</span>
                <span className="text-xs font-normal text-text-subdued">
                    Project #{job.no}
                </span>
            </HeroModalHeader>
            <HeroModalBody className="pt-4 pb-6 px-0">
                <div className="flex flex-col gap-6">
                    {/* 1. Selection with filter logic */}
                    <div className="space-y-2 px-6">
                        <Autocomplete
                            placeholder="Search by name..."
                            variant="bordered"
                            label="Add Staff Member"
                            labelPlacement="outside-top"
                            allowsCustomValue={false}
                            onSelectionChange={handleAddMember}
                            startContent={
                                <Search
                                    size={18}
                                    className="text-text-subdued"
                                />
                            }
                            // Use the filtered list here
                            items={availableUsers}
                        >
                            {(user) => (
                                <AutocompleteItem
                                    key={user.id}
                                    textValue={user.displayName}
                                >
                                    <div className="flex items-center gap-2">
                                        <Avatar
                                            size="sm"
                                            src={optimizeCloudinary(
                                                user.avatar
                                            )}
                                        />
                                        <span className="text-small">
                                            {user.displayName}
                                        </span>
                                    </div>
                                </AutocompleteItem>
                            )}
                        </Autocomplete>
                    </div>

                    {assigningMember && (
                        <div className="space-y-3 px-7">
                            <AssigningMemberCard
                                key={assigningMember.userId}
                                member={assigningMember}
                                onAssignedMembersChange={setAssigningMember}
                            />
                        </div>
                    )}
                    {/* 2. Assigned List */}
                    <div className="space-y-3">
                        <div className="px-7 grid grid-cols-[1fr_180px]">
                            <p className="text-xs font-bold text-text-subdued uppercase tracking-wider">
                                Assigned List ({assignedMembers.length})
                            </p>
                            <p className="text-xs font-medium text-text-subdued">
                                Staff cost
                            </p>
                        </div>

                        <ScrollArea className="h-70 pl-6 pr-6">
                            <ScrollBar orientation="vertical" />
                            <ScrollBar orientation="horizontal" />
                            <div className="flex flex-col gap-2">
                                {assignedMembers.length === 0 ? (
                                    <div className="py-8 text-center border-2 border-dashed border-divider rounded-2xl text-text-subdued text-sm">
                                        Use the search above to add members.
                                    </div>
                                ) : (
                                    assignedMembers.map((member) => (
                                        <AssignedMemberCard
                                            key={member.userId}
                                            jobId={job.id}
                                            member={member}
                                            onAssignedMembersChange={
                                                setAssignedMembers
                                            }
                                        />
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </HeroModalBody>

            {/* 3. Footer with Summary */}
            <HeroModalFooter className="flex-col items-stretch gap-4 border-t border-divider">
                <div className="flex justify-between items-center bg-primary-50 p-4 rounded-2xl border border-primary-100">
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <Wallet size={20} />
                        <span>Total Staff Cost</span>
                    </div>
                    <div className="text-right">
                        <span className="text-xl font-black text-primary">
                            {totalStaffCost.toLocaleString()}
                        </span>
                        <span className="ml-1 text-xs font-bold text-primary">
                            VND
                        </span>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="flat" onPress={onClose}>
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        className="font-bold px-10"
                        onPress={handleAssignMember}
                        isDisabled={!assigningMember}
                    >
                        Assign
                    </Button>
                </div>
            </HeroModalFooter>
        </>
    )
}

export function AssignMemberSkeleton() {
    return (
        <>
            {/* Header Skeleton */}
            <HeroModalHeader className="flex flex-col gap-2 border-b border-divider">
                <Skeleton className="w-1/3 h-6 rounded-lg" />
                <Skeleton className="w-1/4 h-3 rounded-lg" />
            </HeroModalHeader>

            <HeroModalBody className="pt-4 pb-6">
                <div className="flex flex-col gap-6">
                    {/* 1. Autocomplete Search Skeleton */}
                    <div className="space-y-2">
                        <Skeleton className="w-24 h-4 rounded-lg" />
                        <Skeleton className="w-full h-12 rounded-2xl" />
                    </div>

                    {/* 2. Assigned List Skeleton */}
                    <div className="space-y-3">
                        <Skeleton className="w-32 h-3 rounded-lg ml-1" />

                        <div className="flex flex-col gap-2">
                            {/* Mô phỏng 3 dòng item đã assign */}
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4 p-3 border border-default-100 rounded-2xl"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <Skeleton className="flex rounded-full w-8 h-8" />
                                        <Skeleton className="w-24 h-4 rounded-lg" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="w-32 h-8 rounded-xl" />
                                        <Skeleton className="w-8 h-8 rounded-lg" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </HeroModalBody>

            {/* Footer Skeleton */}
            <HeroModalFooter className="flex-col items-stretch gap-4 border-t border-divider">
                {/* Total Cost Box Skeleton */}
                <div className="flex justify-between items-center p-4 rounded-2xl border border-default-100">
                    <div className="flex items-center gap-2">
                        <Skeleton className="w-5 h-5 rounded-full" />
                        <Skeleton className="w-28 h-5 rounded-lg" />
                    </div>
                    <Skeleton className="w-32 h-7 rounded-lg" />
                </div>

                <div className="flex justify-end gap-2">
                    <Skeleton className="w-24 h-10 rounded-xl" />
                    <Skeleton className="w-40 h-10 rounded-xl" />
                </div>
            </HeroModalFooter>
        </>
    )
}

function AssigningMemberCard({
    member,
    onAssignedMembersChange,
}: {
    member: AssignedMember
    onAssignedMembersChange: Dispatch<SetStateAction<AssignedMember | null>>
}) {
    const handleUpdateCost = (value: string) => {
        const numericValue = parseFloat(value) || 0
        onAssignedMembersChange({
            ...member,
            staffCost: numericValue,
        })
    }

    const handleRemoveMember = () => {
        onAssignedMembersChange(null)
    }
    return (
        <div className="group flex items-center gap-4 p-3 bg-default-50 rounded-2xl border border-default-100 transition-all hover:border-primary-300">
            <div className="flex items-center gap-3 flex-1">
                <Avatar
                    src={optimizeCloudinary(member.avatar)}
                    size="sm"
                    isBordered
                    color="primary"
                />
                <span className="text-sm font-medium">
                    {member.displayName}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <HeroNumberInput
                    hideStepper
                    size="sm"
                    placeholder="0"
                    notNull={true}
                    allowNegative={false}
                    value={member.staffCost.toString()}
                    onValueChange={(val) =>
                        handleUpdateCost(val?.toString() ?? '0')
                    }
                    className="w-36"
                    endContent={
                        <span className="text-[10px] font-bold text-text-subdued">
                            VND
                        </span>
                    }
                />
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={handleRemoveMember}
                >
                    <Trash2 size={16} />
                </Button>
            </div>
        </div>
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
    const unassignMemberMutation = useRemoveMemberMutation()
    const updateAssignmentCostMutation = useUpdateAssignmentCostMutation()

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

    const handleConfirmRemove = async () => {
        await unassignMemberMutation.mutateAsync(
            { jobId, memberId: member.userId },
            {
                onSuccess: () => {
                    // 1. Remove from local list
                    onAssignedMembersChange((prev) =>
                        prev.filter((m) => m.userId !== member.userId)
                    )
                    // 2. Refetch to update Total Staff Cost in footer
                },
            }
        )
    }

    return (
        <div className="group flex items-center gap-4 p-3 bg-default-50 rounded-2xl border border-default-100 transition-all hover:border-primary-300">
            <div className="flex items-center gap-3 flex-1">
                <Avatar
                    src={optimizeCloudinary(member.avatar)}
                    size="sm"
                    isBordered
                    color="primary"
                />
                <span className="text-sm font-medium">
                    {member.displayName}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <HeroNumberInput
                    hideStepper
                    size="sm"
                    placeholder="0"
                    notNull={true}
                    isDisabled={!editable}
                    allowNegative={false}
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
                            className="hidden group-hover:flex"
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
                {!editable && (
                    <HeroTooltip content="Unassign member" color="danger">
                        <UnassignConfirmPopover
                            name={member.displayName}
                            onConfirm={handleConfirmRemove}
                            isLoading={unassignMemberMutation.isPending}
                        >
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                            >
                                <Trash2 size={16} />
                            </Button>
                        </UnassignConfirmPopover>
                    </HeroTooltip>
                )}
            </div>
        </div>
    )
}

type UnassignConfirmPopoverProps = {
    children: React.ReactNode
    onConfirm: () => void
    isLoading?: boolean
    name: string
}

export function UnassignConfirmPopover({
    children,
    onConfirm,
    isLoading,
    name,
}: UnassignConfirmPopoverProps) {
    return (
        <Popover placement="bottom-end" showArrow backdrop="opaque">
            <PopoverTrigger>{children}</PopoverTrigger>
            <PopoverContent className="p-4 w-70">
                <div className="flex flex-col gap-3 w-full">
                    <div className="flex items-center gap-2 text-danger font-bold">
                        <AlertTriangle size={18} />
                        <span className="text-small">Remove Member?</span>
                    </div>
                    <p className="text-tiny text-text-subdued">
                        Are you sure you want to remove <b>{name}</b> from this
                        project? This will also subtract their cost from the
                        total.
                    </p>
                    <div className="flex justify-end gap-2 mt-1">
                        <Button size="sm" variant="flat" onPress={() => {}}>
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            color="danger"
                            onPress={onConfirm}
                            isLoading={isLoading}
                            startContent={!isLoading && <Trash2 size={14} />}
                        >
                            Remove
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
