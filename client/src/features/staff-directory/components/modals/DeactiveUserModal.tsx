import {
    Avatar,
    Button,
    Chip,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from '@heroui/react'
import { AlertTriangle, Ban, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { TUser } from '../../../../shared/types'
import { optimizeCloudinary } from '../../../../lib'

interface DeactivateUserModalProps {
    isOpen: boolean
    onClose: () => void
    user: TUser
}

export const DeactivateUserModal = ({
    isOpen,
    onClose,
    user,
}: DeactivateUserModalProps) => {
    const [isLoading, setIsLoading] = useState(false)

    const handleDeactivate = () => {
        setIsLoading(true)
        // Simulate API Call: PATCH /users/{id}/deactivate
        console.log(`Deactivating user: ${user?.id}`)

        setTimeout(() => {
            setIsLoading(false)
            onClose()
            // Trigger a toast notification: "User access revoked."
        }, 1500)
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            backdrop="blur"
            size="md"
            classNames={{
                header: 'border-b border-border-default',
                footer: 'border-t border-border-default',
            }}
        >
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 bg-red-50/50 dark:bg-red-950/20">
                            <div className="flex items-center gap-2 text-danger">
                                <ShieldAlert size={24} />
                                <span className="text-xl font-bold">
                                    Deactivate Account?
                                </span>
                            </div>
                        </ModalHeader>

                        <ModalBody className="py-6">
                            <p className="text-text-subdued text-sm mb-4">
                                Are you sure you want to deactivate this user?
                                This action will immediately revoke their access
                                to the <strong>HiveQ Workspace</strong>.
                            </p>

                            {/* User Summary Card */}
                            <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 dark:bg-background dark:hover:bg-background-hovered dark:border-border-default rounded-xl mb-6">
                                <Avatar
                                    src={optimizeCloudinary(user?.avatar)}
                                    size="lg"
                                    isBordered
                                    className="shrink-0"
                                />
                                <div className="min-w-0">
                                    <h4 className="font-bold text-text-default text-sm truncate">
                                        {user?.displayName}
                                    </h4>
                                    <p className="text-xs text-text-subdued mb-1">
                                        @{user?.username}
                                    </p>
                                    <Chip
                                        size="sm"
                                        variant="flat"
                                        className="h-5 text-[10px] px-1"
                                        color="primary"
                                    >
                                        {user.role.displayName}
                                    </Chip>
                                </div>
                            </div>

                            {/* Consequences List */}
                            <div className="space-y-3">
                                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    What happens next:
                                </h5>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-3 text-sm text-text-subdued">
                                        <Ban
                                            size={16}
                                            className="text-red-400 mt-0.5 shrink-0"
                                        />
                                        <span>
                                            User will be logged out of all
                                            active sessions immediately.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-text-subdued">
                                        <AlertTriangle
                                            size={16}
                                            className="text-orange-400 mt-0.5 shrink-0"
                                        />
                                        <span>
                                            Assigned jobs will remain assigned
                                            but they cannot update them.
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </ModalBody>

                        <ModalFooter>
                            <Button variant="light" onPress={close}>
                                Cancel
                            </Button>
                            <Button
                                color="danger"
                                variant="shadow"
                                isLoading={isLoading}
                                onPress={handleDeactivate}
                                startContent={!isLoading && <Ban size={18} />}
                                className="font-semibold"
                            >
                                {isLoading
                                    ? 'Deactivating...'
                                    : 'Deactivate User'}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
