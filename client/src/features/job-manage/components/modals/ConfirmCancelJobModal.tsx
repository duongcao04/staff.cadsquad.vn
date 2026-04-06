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
    notes?: React.ReactNode
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
            hideCloseButton={isLoading}
            isDismissable={!isLoading}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 text-danger">
                            Do you want cancel this job?
                        </ModalHeader>
                        <ModalBody>
                            <p>
                                Are you sure you want to cancel{' '}
                                <span className="font-semibold">
                                    {jobTitle}
                                </span>
                                ? Once canceled, you will not be able to modify
                                the project's workflows.
                            </p>

                            {/* Information Block */}
                            <div className="mt-2 p-3 bg-default-100 rounded-medium border-l-4 border-warning">
                                <p className="text-small text-default-600">
                                    <span className="font-bold text-warning">
                                        Note:
                                    </span>{' '}
                                    You can still review or restore the project
                                    in the{' '}
                                    <Chip
                                        size="sm"
                                        variant="flat"
                                        color="danger"
                                    >
                                        Cancelled Jobs
                                    </Chip>{' '}
                                    section.
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
