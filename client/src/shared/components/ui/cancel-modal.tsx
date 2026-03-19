import { Button } from '@heroui/react'
import {
    HeroModal,
    HeroModalBody,
    HeroModalContent,
    HeroModalFooter,
    HeroModalHeader,
} from './hero-modal'

type CancelModalProps = {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title?: string
    message?: string
    confirmText?: string
    cancelText?: string
    confirmColor?:
        | 'danger'
        | 'default'
        | 'primary'
        | 'secondary'
        | 'success'
        | 'warning'
}
export default function CancelModal({
    isOpen,
    onClose,
    onConfirm,
    // Added new props with default values
    title = 'Cancel Job Creation',
    message = 'Are you sure you do not want to create this job?',
    confirmText = 'Yes',
    cancelText = 'Cancel',
    confirmColor = 'danger', // Allows you to change the button color (e.g., "primary", "warning")
}: CancelModalProps) {
    return (
        <HeroModal isOpen={isOpen} onClose={onClose} backdrop="blur">
            <HeroModalContent>
                {(onClose) => (
                    <>
                        <HeroModalHeader className="flex flex-col gap-1 text-danger">
                            {title}
                        </HeroModalHeader>
                        <HeroModalBody>
                            <p>{message}</p>
                        </HeroModalBody>
                        <HeroModalFooter>
                            <Button
                                color="default"
                                variant="light"
                                onPress={onClose}
                            >
                                {cancelText}
                            </Button>
                            <Button
                                color={confirmColor}
                                onPress={() => {
                                    onConfirm()
                                    onClose()
                                }}
                            >
                                {confirmText}
                            </Button>
                        </HeroModalFooter>
                    </>
                )}
            </HeroModalContent>
        </HeroModal>
    )
}
