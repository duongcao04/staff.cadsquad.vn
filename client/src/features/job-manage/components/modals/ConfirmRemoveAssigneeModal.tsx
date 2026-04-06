import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    User,
} from '@heroui/react'

import { optimizeCloudinary } from '../../../../lib'
import { TUser } from '../../../../shared/types'

interface ConfirmRemoveAssigneeModalProps {
    isOpen: boolean
    onOpenChange: () => void
    onConfirm: () => Promise<void> | void
    isLoading?: boolean
    assignee: TUser
}

export const ConfirmRemoveAssigneeModal = ({
    isOpen,
    onOpenChange,
    onConfirm,
    isLoading = false,
    assignee,
}: ConfirmRemoveAssigneeModalProps) => {
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 text-danger">
                            Remove Member
                        </ModalHeader>
                        <ModalBody>
                            <p className="mb-2 text-default-500">
                                Are you sure you want to unassign this member
                                from the current job? They will lose access to
                                task-specific updates.
                            </p>

                            {/* Visual confirmation of WHO is being removed */}
                            {assignee && (
                                <div className="p-3 border rounded-lg border-default-200 bg-default-50 dark:bg-default-100/50">
                                    <User
                                        name={assignee.displayName}
                                        description={
                                            `@${assignee.username}` ||
                                            assignee.email
                                        }
                                        avatarProps={{
                                            src: optimizeCloudinary(
                                                assignee.avatar,
                                                { width: 256, height: 256 }
                                            ),
                                            showFallback: true,
                                            name: assignee.displayName.charAt(
                                                0
                                            ), // Fallback initial
                                        }}
                                    />
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                variant="light"
                                onPress={onClose}
                                isDisabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="danger"
                                onPress={onConfirm}
                                isLoading={isLoading}
                                variant="shadow"
                            >
                                Remove Member
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
