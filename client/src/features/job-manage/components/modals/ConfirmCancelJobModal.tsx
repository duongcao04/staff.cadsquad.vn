import {
    Button,
    Chip,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from '@heroui/react'

interface ConfirmCancelJobModalProps {
    isOpen: boolean
    onOpenChange: () => void
    onConfirm: () => Promise<void> | void
    isLoading?: boolean
    jobTitle?: string
}

export const ConfirmCancelJobModal = ({
    isOpen,
    onOpenChange,
    onConfirm,
    isLoading = false,
    jobTitle = 'this job',
}: ConfirmCancelJobModalProps) => {
    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            backdrop="blur"
            hideCloseButton={isLoading}
            isDismissable={!isLoading}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 text-danger">
                            Cancel Job
                        </ModalHeader>
                        <ModalBody>
                            <p>
                                Are you sure you want to remove{' '}
                                <span className="font-bold">{jobTitle}</span>{' '}
                                from the active board?
                            </p>

                            {/* Information Block */}
                            <div className="mt-2 p-3 bg-default-100 rounded-medium border-l-4 border-warning">
                                <p className="text-small text-default-600">
                                    <span className="font-bold text-warning">
                                        Note:
                                    </span>{' '}
                                    This will NOT permanently delete the record.
                                    You can view or restore it later in the{' '}
                                    <Chip
                                        size="sm"
                                        variant="flat"
                                        color="warning"
                                    >
                                        Cancelled Jobs
                                    </Chip>{' '}
                                    page.
                                </p>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                color="default"
                                variant="light"
                                onPress={onClose}
                                isDisabled={isLoading}
                            >
                                Keep Active
                            </Button>
                            <Button
                                color="danger"
                                onPress={onConfirm}
                                isLoading={isLoading}
                                variant="shadow"
                            >
                                Confirm Cancel
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
