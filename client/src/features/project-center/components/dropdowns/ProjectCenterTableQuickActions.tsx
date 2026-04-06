import {
    APP_PERMISSIONS,
    INTERNAL_URLS,
    JobHelper,
    markJobPaidOptions,
} from '@/lib'
import { cancelJobOptions } from '@/lib/queries'
import { ConfirmDeleteModal } from '@/shared/components'
import { usePermission } from '@/shared/hooks'
import type { TJob } from '@/shared/types'
import { LocationArrow, PersonGear, Xmark } from '@gravity-ui/icons'
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    useDisclosure,
} from '@heroui/react'
import { useMutation } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { CircleCheck, Clock, Sliders, SquareDashed } from '@gravity-ui/icons'
import { ConfirmPaymentModal } from '../../../financial'
import AddAttachmentsModal from '../modals/AddAttachmentsModal'
import AssignMemberModal from '../modals/AssignMemberModal'
import UpdateCostModal from '../modals/UpdateCostModal'
import { EllipsisVerticalIcon } from 'lucide-react'
import { DeliverJobModal } from '../../../job-manage'

type ProjectCenterTableQuickActionsProps = {
    data: TJob
    onRefresh: () => void
}

export function ProjectCenterTableQuickActions({
    data,
    onRefresh,
}: ProjectCenterTableQuickActionsProps) {
    const { hasPermission, hasSomePermissions } = usePermission()

    const cancelJobAction = useMutation(cancelJobOptions)
    const confirmPayoutAction = useMutation(markJobPaidOptions)

    // --- Modal Controllers ---
    const assignmentModal = useDisclosure()
    const cancelModal = useDisclosure()
    const rescheduleModal = useDisclosure()
    const confirmPayoutModal = useDisclosure()
    const updateFinanModal = useDisclosure()
    const attachmentModal = useDisclosure()
    const deliverModal = useDisclosure()

    const handleCancelJob = async () => {
        await cancelJobAction.mutateAsync(data?.id, {
            onSuccess: () => {
                onRefresh()
                cancelModal.onClose()
            },
        })
    }

    const handleConfirmPayout = async () => {
        if (data?.id) {
            await confirmPayoutAction.mutateAsync(data.id, {
                onSuccess: () => {
                    confirmPayoutModal.onClose()
                },
            })
        }
    }

    return (
        <>
            {/* 1. Assignment Modal (Member selection + Cost input) */}
            {assignmentModal.isOpen && (
                <AssignMemberModal
                    isOpen={assignmentModal.isOpen}
                    onClose={assignmentModal.onClose}
                    jobNo={data.no}
                />
            )}

            {/* 2. Attachment Modal (URL / File links) */}
            {attachmentModal.isOpen && (
                <AddAttachmentsModal
                    isOpen={attachmentModal.isOpen}
                    onClose={attachmentModal.onClose}
                    jobNo={data.no}
                />
            )}

            {/* 3. Delete Confirmation */}
            {cancelModal.isOpen && (
                <ConfirmDeleteModal
                    isOpen={cancelModal.isOpen}
                    onClose={cancelModal.onClose}
                    onConfirm={handleCancelJob}
                    title="Delete Job"
                    description={`Are you sure you want to permanently delete job #${data?.no}?`}
                    isLoading={cancelJobAction.isPending}
                />
            )}

            {/* 5. Update Cost Modal */}
            {updateFinanModal.isOpen && (
                <UpdateCostModal
                    isOpen={updateFinanModal.isOpen}
                    onClose={updateFinanModal.onClose}
                    jobNo={data.no}
                />
            )}

            {hasPermission(APP_PERMISSIONS.JOB.PAID) &&
                confirmPayoutModal.isOpen && (
                    <ConfirmPaymentModal
                        isOpen={confirmPayoutModal.isOpen}
                        onOpenChange={confirmPayoutModal.onOpenChange}
                        job={data}
                        onConfirm={handleConfirmPayout}
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
                                    onPress={assignmentModal.onOpen}
                                >
                                    Assignment
                                </DropdownItem>
                            ) : null}

                            {hasPermission(APP_PERMISSIONS.JOB.UPDATE) ? (
                                <DropdownItem
                                    key="reschedule_job"
                                    startContent={<Clock fontSize={14} />}
                                    onPress={rescheduleModal.onOpen}
                                >
                                    Reschedule
                                </DropdownItem>
                            ) : null}

                            {hasPermission(APP_PERMISSIONS.JOB.DELETE) ? (
                                <DropdownItem
                                    key="cancel_job"
                                    startContent={<Xmark fontSize={14} />}
                                    onPress={cancelModal.onOpen}
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
                                    onPress={updateFinanModal.onOpen}
                                >
                                    Update Financials
                                </DropdownItem>
                            ) : null}
                            {hasPermission(APP_PERMISSIONS.JOB.PAID) &&
                            JobHelper.canPayout(data) ? (
                                <DropdownItem
                                    key="confirm_payout"
                                    startContent={<CircleCheck fontSize={14} />}
                                    onPress={confirmPayoutModal.onOpen}
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
