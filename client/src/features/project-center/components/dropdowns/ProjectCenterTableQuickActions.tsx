import { INTERNAL_URLS } from '@/lib'
import {
    jobsListOptions,
    useDeleteJobMutation,
    useProfile,
} from '@/lib/queries'
import { queryClient } from '@/main'
import { ConfirmDeleteModal } from '@/shared/components'
import type { TJob } from '@/shared/types'
import {
    addToast,
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    useDisclosure,
} from '@heroui/react'
import {
    CircleCheck,
    CircleDollarSign,
    EllipsisVerticalIcon,
    Paperclip,
    SquareArrowOutUpRight,
    Trash,
    UserPlus,
} from 'lucide-react'
import AddAttachmentsModal from '../modals/AddAttachmentsModal'
import AssignMemberModal from '../modals/AssignMemberModal'
import UpdateCostModal from '../modals/UpdateCostModal'

type ProjectCenterTableQuickActionsProps = {
    data: TJob
}

export function ProjectCenterTableQuickActions({
    data,
}: ProjectCenterTableQuickActionsProps) {
    const { isAdmin, isAccounting } = useProfile()

    const { mutateAsync: deleteJobMutation, isPending: isDeleting } =
        useDeleteJobMutation()

    // --- Modal Controllers ---
    const assignModal = useDisclosure()
    const deleteModal = useDisclosure()
    const paidConfirmModal = useDisclosure()
    const updateCostModal = useDisclosure()
    const attachmentModal = useDisclosure()

    // --- Handlers ---
    const onDeleteJob = async () => {
        await deleteJobMutation(data.id, {
            onSuccess: () => {
                queryClient.refetchQueries({
                    queryKey: jobsListOptions().queryKey,
                })
                deleteModal.onClose()
            },
        })
    }

    const handleOpenMarkAsPaidModal = () => {
        if (data.isPaid) {
            addToast({
                title: 'Action redundant',
                description: `#${data.no} is already paid`,
                color: 'warning',
            })
        } else {
            paidConfirmModal.onOpen()
        }
    }

    return (
        <>
            {/* 1. Assignment Modal (Member selection + Cost input) */}
            {assignModal.isOpen && (
                <AssignMemberModal
                    isOpen={assignModal.isOpen}
                    onClose={assignModal.onClose}
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
            {deleteModal.isOpen && (
                <ConfirmDeleteModal
                    isOpen={deleteModal.isOpen}
                    onClose={deleteModal.onClose}
                    onConfirm={onDeleteJob}
                    title="Delete Job"
                    description={`Are you sure you want to permanently delete job #${data?.no}?`}
                    isLoading={isDeleting}
                />
            )}

            {/* 5. Update Cost Modal */}
            {updateCostModal.isOpen && (
                <UpdateCostModal
                    isOpen={updateCostModal.isOpen}
                    onClose={updateCostModal.onClose}
                    jobNo={data.no}
                />
            )}

            {/* --- DROPDOWN TRIGGER --- */}
            <Dropdown placement="bottom-end">
                <DropdownTrigger>
                    <Button isIconOnly variant="light" size="sm" radius="full">
                        <EllipsisVerticalIcon
                            size={18}
                            className="text-default-400"
                        />
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    aria-label="Action menu"
                    variant="flat"
                    disabledKeys={data.isPaid ? ['markAsPaid'] : []}
                >
                    {/* General Section: Visible to All */}
                    <DropdownSection title="General">
                        <DropdownItem
                            key="openDetail"
                            startContent={<SquareArrowOutUpRight size={16} />}
                            onPress={() =>
                                window.open(
                                    INTERNAL_URLS.jobDetail(data.no),
                                    '_blank'
                                )
                            }
                        >
                            Open detail
                        </DropdownItem>
                        <DropdownItem
                            key="attachments"
                            startContent={<Paperclip size={16} />}
                            onPress={attachmentModal.onOpen}
                        >
                            Add attachments
                        </DropdownItem>
                    </DropdownSection>

                    {/* Admin Section: Management */}
                    {isAdmin ? (
                        <DropdownSection title="Management">
                            <DropdownItem
                                key="assign"
                                startContent={<UserPlus size={16} />}
                                onPress={assignModal.onOpen}
                            >
                                Assign / Reassign
                            </DropdownItem>
                            <DropdownItem
                                key="delete"
                                color="danger"
                                className="text-danger"
                                startContent={<Trash size={16} />}
                                onPress={deleteModal.onOpen}
                            >
                                Delete job
                            </DropdownItem>
                        </DropdownSection>
                    ) : null}

                    {/* TODO: */}
                    {/* Financial Section: Admin & Accounting Only */}
                    {false && (isAdmin || isAccounting) ? (
                        <DropdownSection title="Accounting">
                            <DropdownItem
                                key="updateCost"
                                startContent={<CircleDollarSign size={16} />}
                                onPress={updateCostModal.onOpen}
                            >
                                Update project cost
                            </DropdownItem>
                            <DropdownItem
                                key="markAsPaid"
                                color="primary"
                                startContent={<CircleCheck size={16} />}
                                onPress={handleOpenMarkAsPaidModal}
                            >
                                Mark as paid
                            </DropdownItem>
                        </DropdownSection>
                    ) : null}
                </DropdownMenu>
            </Dropdown>
        </>
    )
}
