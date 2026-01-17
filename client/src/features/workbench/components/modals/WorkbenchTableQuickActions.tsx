import { DeliverJobModal } from '@/features/job-manage/components/modals/DeliverJobModal'
import ReScheduleModal from '@/features/job-manage/components/modals/ReScheduleModal'
import AssignMemberModal from '@/features/project-center/components/modals/AssignMemberModal'
import UpdateCostModal from '@/features/project-center/components/modals/UpdateCostModal'
import { INTERNAL_URLS } from '@/lib'
import {
    useDeleteJobMutation,
    useMarkPaidMutation,
    workbenchDataOptions,
} from '@/lib/queries'
import { APP_PERMISSIONS } from '@/lib/utils'
import ConfirmModal from '@/shared/components/ui/confirm-modal'
import { usePermission } from '@/shared/hooks'
import type { TJob } from '@/shared/types'
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    useDisclosure,
} from '@heroui/react'
import {
    CalendarClock,
    CircleCheck,
    CircleDollarSign,
    EllipsisVerticalIcon,
    SquareArrowOutUpRight,
    Trash,
    TruckElectricIcon,
    UserPlus,
    WindArrowDownIcon,
} from 'lucide-react'

type WorkbenchTableQuickActionsProps = {
    data: TJob
}
export function WorkbenchTableQuickActions({
    data,
}: WorkbenchTableQuickActionsProps) {
    const { hasPermission } = usePermission()

    const markPaidMutation = useMarkPaidMutation()

    const canPayout = useMemo(
        () => data.status.systemType === 'COMPLETED' && !data.isPaid,
        [data]
    )
    const { mutateAsync: deleteJobMutation, isPending: isDeleting } =
        useDeleteJobMutation()

    const {
        isOpen: isOpenAssignModal,
        onOpen: onOpenAssignModal,
        onClose: onCloseAssignModal,
    } = useDisclosure({
        id: 'AssignMemberModal',
    })
    const {
        isOpen: isOpenModal,
        onOpen: onOpenModal,
        onClose: onCloseModal,
    } = useDisclosure({
        id: 'ConfirmDeleteModal',
    })
    const {
        isOpen: isOpenRescheduleModal,
        onOpen: onOpenRescheduleModal,
        onClose: onCloseRescheduleModal,
    } = useDisclosure({
        id: 'RescheduleModal',
    })

    const confirmPayoutModalDisclosure = useDisclosure({
        id: 'PayoutModal',
    })

    const {
        isOpen: isOpenUCostModal,
        onOpen: onOpenUCostModal,
        onClose: onCloseUCostModal,
    } = useDisclosure({
        id: 'UpdateCostModal',
    })

    const deliverJobModal = useDisclosure({
        id: 'DeliverJobModal',
    })

    const onDeleteJob = async () => {
        await deleteJobMutation(data?.id, {
            onSuccess: () => {
                queryClient.refetchQueries({
                    queryKey: workbenchDataOptions().queryKey,
                })
                onCloseModal()
            },
        })
    }

    const handleConfirmPayout = async () => {
        if (data?.id) {
            await markPaidMutation.mutateAsync(data.id, {
                onSuccess: () => {
                    confirmPayoutModalDisclosure.onClose()
                },
            })
        }
    }

    return (
        <>
            {hasPermission(APP_PERMISSIONS.JOB.DELETE) && isOpenModal && (
                <ConfirmModal
                    isOpen={isOpenModal}
                    onClose={onCloseModal}
                    onConfirm={onDeleteJob}
                    title="Delete job"
                    content={`Are you sure you want to delete job ${data.no}? This action cannot be undone.`}
                    confirmLabel="Yes"
                    isLoading={isDeleting}
                />
            )}
            {hasPermission(APP_PERMISSIONS.JOB.DELIVER) &&
                deliverJobModal.isOpen && (
                    <DeliverJobModal
                        isOpen={deliverJobModal.isOpen}
                        onClose={deliverJobModal.onClose}
                        onConfirm={() => {}}
                        defaultJob={data.id}
                    />
                )}
            {hasPermission(APP_PERMISSIONS.JOB.UPDATE) && isOpenUCostModal && (
                <UpdateCostModal
                    isOpen={isOpenUCostModal}
                    onClose={onCloseUCostModal}
                    jobNo={data.no}
                />
            )}
            {hasPermission(APP_PERMISSIONS.JOB.PAID) &&
                confirmPayoutModalDisclosure.isOpen && (
                    <ConfirmPaymentModal
                        isOpen={confirmPayoutModalDisclosure.isOpen}
                        onOpenChange={confirmPayoutModalDisclosure.onOpenChange}
                        job={data}
                        onConfirm={handleConfirmPayout}
                    />
                )}

            {hasPermission(APP_PERMISSIONS.JOB.UPDATE) &&
                isOpenRescheduleModal && (
                    <ReScheduleModal
                        isOpen={isOpenRescheduleModal}
                        onClose={onCloseRescheduleModal}
                        job={data}
                    />
                )}

            {hasPermission(APP_PERMISSIONS.JOB.ASSIGN_MEMBER) &&
                isOpenAssignModal && (
                    <AssignMemberModal
                        isOpen={isOpenAssignModal}
                        onClose={onCloseAssignModal}
                        jobNo={data.no}
                    />
                )}

            <Dropdown>
                <DropdownTrigger>
                    <Button isIconOnly variant="light" size="sm">
                        <EllipsisVerticalIcon size={16} />
                    </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Job menu actions">
                    <DropdownSection key="quick_actions" title="View">
                        <DropdownItem
                            key="openInNewTab"
                            startContent={
                                <SquareArrowOutUpRight
                                    className="text-text-default"
                                    size={14}
                                />
                            }
                            onPress={() =>
                                window.open(
                                    INTERNAL_URLS.getJobDetailUrl(data.no),
                                    '_blank'
                                )
                            }
                        >
                            Open in new tab
                        </DropdownItem>
                    </DropdownSection>
                    <DropdownSection key="job_actions" title="Job">
                        {hasPermission(APP_PERMISSIONS.JOB.DELIVER) ? (
                            <DropdownItem
                                key="deliverJob"
                                startContent={
                                    <TruckElectricIcon
                                        className="text-text-default"
                                        size={14}
                                    />
                                }
                                onPress={deliverJobModal.onOpen}
                            >
                                Deliver Job
                            </DropdownItem>
                        ) : null}
                        {hasPermission(APP_PERMISSIONS.JOB.ASSIGN_MEMBER) ? (
                            <DropdownItem
                                key="assignReassign"
                                startContent={
                                    <UserPlus
                                        size={14}
                                        className="text-text-default"
                                    />
                                }
                                onPress={() => onOpenAssignModal()}
                            >
                                Assign / Reassign
                            </DropdownItem>
                        ) : null}

                        {/* TODO: */}
                        {false && hasPermission(APP_PERMISSIONS.JOB.UPDATE) ? (
                            <DropdownItem
                                key="reschedule"
                                startContent={
                                    <CalendarClock
                                        size={14}
                                        className="text-text-default"
                                    />
                                }
                                onPress={() => onOpenRescheduleModal()}
                            >
                                Reschedule
                            </DropdownItem>
                        ) : null}
                        {hasPermission(APP_PERMISSIONS.JOB.DELETE) ? (
                            <DropdownItem
                                key="deleteJob"
                                startContent={
                                    <Trash
                                        size={14}
                                        className="text-text-default"
                                    />
                                }
                                onPress={() => onOpenModal()}
                            >
                                Delete
                            </DropdownItem>
                        ) : null}
                    </DropdownSection>
                    <DropdownSection key="payment_actions" title="Payment">
                        {hasPermission(APP_PERMISSIONS.JOB.UPDATE) ? (
                            <DropdownItem
                                key="updateCost"
                                startContent={
                                    <CircleDollarSign
                                        size={14}
                                        className="text-text-default"
                                    />
                                }
                                onPress={() => onOpenUCostModal()}
                            >
                                Update Cost
                            </DropdownItem>
                        ) : null}
                        {hasPermission(APP_PERMISSIONS.JOB.PAID) &&
                        canPayout ? (
                            <DropdownItem
                                key="confirmPayout"
                                startContent={
                                    <CircleCheck
                                        size={14}
                                        className="text-text-default"
                                    />
                                }
                                onPress={confirmPayoutModalDisclosure.onOpen}
                            >
                                Confirm Payout
                            </DropdownItem>
                        ) : null}
                    </DropdownSection>
                </DropdownMenu>
            </Dropdown>
        </>
    )
}

import { queryClient } from '@/main'
import {
    HeroModal,
    HeroModalBody,
    HeroModalContent,
    HeroModalFooter,
    HeroModalHeader,
} from '@/shared/components/ui/hero-modal'
import { useNavigate } from '@tanstack/react-router'
import { AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react'
import { useMemo } from 'react'
import { ConfirmPaymentModal } from '../../../financial/components/modals/ConfirmPaymentModal'

interface Props {
    isOpen: boolean
    onClose: () => void
    jobId: string
    jobCode: string
}

export const ConfirmJobPaymentModal = ({
    isOpen,
    onClose,
    jobId,
    jobCode,
}: Props) => {
    const navigate = useNavigate()

    const handleOpenInWindow = () => {
        // Navigate to the job detail/progress page in the current app view
        navigate({ to: `/admin/mgmt/jobs/${jobId}/progress` })
        onClose()
    }

    const handleOpenInNewTab = () => {
        // Open the job progress in a new browser tab for parallel viewing
        const url = `/admin/mgmt/jobs/${jobId}/progress`
        window.open(url, '_blank', 'noopener,noreferrer')
        onClose()
    }

    return (
        <HeroModal
            isOpen={isOpen}
            onClose={onClose}
            size="md"
            classNames={{
                base: 'border border-divider bg-background',
                header: 'border-b border-divider',
            }}
        >
            <HeroModalContent>
                <HeroModalHeader className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-warning">
                        <AlertCircle size={22} />
                        <span className="text-xl font-bold">
                            Verification Required
                        </span>
                    </div>
                </HeroModalHeader>

                <HeroModalBody className="py-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-warning-50 rounded-full text-warning animate-pulse">
                            <CheckCircle2 size={48} />
                        </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">
                        Check Job Progress
                    </h3>
                    <p className="text-sm text-text-subdued leading-relaxed">
                        You are about to mark job{' '}
                        <b className="text-slate-900">#{jobCode}</b> as paid.
                        Please verify that all deliverables are completed and
                        approved before proceeding.
                    </p>
                </HeroModalBody>

                <HeroModalFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                        fullWidth
                        variant="flat"
                        color="primary"
                        className="font-bold h-12"
                        startContent={<WindArrowDownIcon size={18} />}
                        onPress={handleOpenInWindow}
                    >
                        Open this window
                    </Button>
                    <Button
                        fullWidth
                        variant="bordered"
                        className="font-bold h-12 border-2"
                        startContent={<ExternalLink size={18} />}
                        onPress={handleOpenInNewTab}
                    >
                        Open in new tab
                    </Button>
                </HeroModalFooter>
            </HeroModalContent>
        </HeroModal>
    )
}
