import { DeliverJobModal } from '@/features/job-manage/components/modals/DeliverJobModal'
import ReScheduleModal from '@/features/job-manage/components/modals/ReScheduleModal'
import AssignMemberModal from '@/features/project-center/components/modals/AssignMemberModal'
import UpdateCostModal from '@/features/project-center/components/modals/UpdateCostModal'
import { INTERNAL_URLS, JobHelper } from '@/lib'
import {
    cancelJobOptions,
    markJobPaidOptions,
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
import { EllipsisVerticalIcon, WindArrowDownIcon } from 'lucide-react'

type WorkbenchTableQuickActionsProps = {
    data: TJob
    onRefresh: () => void
}
export function WorkbenchTableQuickActions({
    data,
    onRefresh,
}: WorkbenchTableQuickActionsProps) {
    const { hasPermission, hasSomePermissions } = usePermission()
    const canPayout = JobHelper.canPayout(data)

    const markPaidMutation = useMutation(markJobPaidOptions)

    const cancelJobAction = useMutation(cancelJobOptions)

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

    const deliverModal = useDisclosure({
        id: 'DeliverJobModal',
    })

    const handleCancelJob = async () => {
        await cancelJobAction.mutateAsync(data?.id, {
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
                    onConfirm={handleCancelJob}
                    title="Delete job"
                    content={`Are you sure you want to delete job ${data.no}? This action cannot be undone.`}
                    confirmLabel="Yes"
                    isLoading={cancelJobAction.isPending}
                />
            )}
            {hasPermission(APP_PERMISSIONS.JOB.DELIVER) &&
                deliverModal.isOpen && (
                    <DeliverJobModal
                        isOpen={deliverModal.isOpen}
                        onClose={deliverModal.onClose}
                        onSuccess={onRefresh}
                        defaultJob={data}
                        showSelect={false}
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

            {hasPermission(APP_PERMISSIONS.JOB.ASSIGNMENT) &&
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
                    <DropdownSection key="quick_actions">
                        <DropdownItem
                            key="view_fullscreen"
                            startContent={<SquareDashed fontSize={14} />}
                            as={Link}
                            href={INTERNAL_URLS.jobDetail(data.no)}
                        >
                            View Fullscreen
                        </DropdownItem>
                    </DropdownSection>
                    {hasSomePermissions([
                        APP_PERMISSIONS.JOB.DELIVER,
                        APP_PERMISSIONS.JOB.ASSIGNMENT,
                        APP_PERMISSIONS.JOB.UPDATE,
                        APP_PERMISSIONS.JOB.DELETE,
                    ]) ? (
                        <DropdownSection
                            key="job_operations"
                            title="Operations"
                        >
                            {hasPermission(APP_PERMISSIONS.JOB.DELIVER) ? (
                                <DropdownItem
                                    key="deliver_job"
                                    startContent={
                                        <LocationArrow fontSize={14} />
                                    }
                                    onPress={deliverModal.onOpen}
                                >
                                    Deliver
                                </DropdownItem>
                            ) : null}
                            {hasPermission(APP_PERMISSIONS.JOB.ASSIGNMENT) ? (
                                <DropdownItem
                                    key="assignment_setting"
                                    startContent={<PersonGear fontSize={14} />}
                                    onPress={() => onOpenAssignModal()}
                                >
                                    Assignment
                                </DropdownItem>
                            ) : null}

                            {hasPermission(APP_PERMISSIONS.JOB.UPDATE) ? (
                                <DropdownItem
                                    key="reschedule_job"
                                    startContent={<Clock fontSize={14} />}
                                    onPress={() => onOpenRescheduleModal()}
                                >
                                    Reschedule
                                </DropdownItem>
                            ) : null}

                            {hasPermission(APP_PERMISSIONS.JOB.DELETE) ? (
                                <DropdownItem
                                    key="cancel_job"
                                    startContent={<Xmark fontSize={14} />}
                                    onPress={() => onOpenModal()}
                                    color="danger"
                                >
                                    Cancel
                                </DropdownItem>
                            ) : null}
                        </DropdownSection>
                    ) : null}
                    {hasSomePermissions([
                        APP_PERMISSIONS.JOB.UPDATE_FINANCIAL,
                        APP_PERMISSIONS.JOB.PAID,
                    ]) ? (
                        <DropdownSection
                            key="financial_operations"
                            title="Financials"
                        >
                            {hasPermission(APP_PERMISSIONS.JOB.UPDATE) ? (
                                <DropdownItem
                                    key="update_financials"
                                    startContent={<Sliders fontSize={14} />}
                                    onPress={() => onOpenUCostModal()}
                                >
                                    Update Financials
                                </DropdownItem>
                            ) : null}
                            {hasPermission(APP_PERMISSIONS.JOB.PAID) &&
                            canPayout ? (
                                <DropdownItem
                                    key="confirm_payout"
                                    startContent={<CircleCheck fontSize={14} />}
                                    onPress={
                                        confirmPayoutModalDisclosure.onOpen
                                    }
                                >
                                    Confirm Payout
                                </DropdownItem>
                            ) : null}
                        </DropdownSection>
                    ) : null}
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
import {
    CircleCheck,
    Clock,
    LocationArrow,
    PersonGear,
    Sliders,
    SquareDashed,
    Xmark,
} from '@gravity-ui/icons'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react'
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
