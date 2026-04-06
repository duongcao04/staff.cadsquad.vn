import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from '@heroui/react'

interface ConfirmRestoreJobProps {
    isOpen: boolean
    onOpenChange: () => void
    onConfirm: () => Promise<void> | void
    isLoading?: boolean
    jobTitle?: string
    notes?: React.ReactNode
}
export const ConfirmRestoreJob = ({
    isOpen,
    onOpenChange,
    onConfirm,
    isLoading = false,
    jobTitle = 'this job',
}: ConfirmRestoreJobProps) => {
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
                        <ModalHeader className="flex flex-col gap-1 text-primary">
                            Do you want restore this job?
                        </ModalHeader>
                        <ModalBody>
                            <p>
                                Would you like to bring this job{' '}
                                <span className="font-semibold">
                                    {jobTitle}
                                </span>{' '}
                                from the archive back to the current workflow?
                            </p>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                color="default"
                                variant="light"
                                onPress={onClose}
                                isDisabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onPress={onConfirm}
                                isLoading={isLoading}
                                variant="shadow"
                            >
                                Confirm Restore
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
