import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    type ModalProps,
} from '@heroui/react'


type ConfirmDeleteModalProps = Omit<
    ModalProps,
    'isOpen' | 'onClose' | 'children'
> & {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    children?: React.ReactNode
    isLoading?: boolean
    color?: 'danger' | 'primary' | 'success' | 'warning'
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Delete User',
    description = 'Are you sure you want to delete this user? This action cannot be undone.',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    isLoading = false,
    children,
    color = 'danger',
    ...props
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            placement="center"
            hideCloseButton
            {...props}
        >
            <ModalContent
                className="p-2"
                style={{
                    zIndex: 999999999,
                }}
            >
                <ModalHeader
                    className="text-danger font-semibold text-lg"
                    style={{
                        color: `var(--color-${color})`,
                    }}
                >
                    {title}
                </ModalHeader>
                <ModalBody
                    style={{
                        zIndex: 999999999,
                    }}
                >
                    {children ? (
                        children
                    ) : (
                        <p className="text-sm text-default-600">
                            {description}
                        </p>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                        {cancelText}
                    </Button>
                    <Button
                        color={color}
                        isLoading={isLoading}
                        onPress={() => {
                            onConfirm()
                            if (!isLoading) {
                                onClose()
                            }
                        }}
                    >
                        {confirmText}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
