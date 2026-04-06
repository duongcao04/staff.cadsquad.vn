import {
    Avatar,
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from '@heroui/react'
import { UserMinus, AlertTriangle } from 'lucide-react'
import { optimizeCloudinary } from '@/lib'
import { TUser, TRole } from '@/shared/types'

interface RemoveRoleMemberModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    user: TUser
    role: TRole
    isLoading?: boolean
}
export const RemoveRoleMemberModal = ({
    isOpen,
    onClose,
    onConfirm,
    user,
    role,
    isLoading,
}: RemoveRoleMemberModalProps) => {
    if (!user) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="md"
            backdrop="blur"
            classNames={{
                base: 'border border-danger-100',
                header: 'border-b border-divider',
            }}
        >
            <ModalContent>
                <ModalHeader className="flex gap-3 items-center text-danger">
                    <UserMinus size={22} />
                    <h2 className="text-xl font-bold">Remove Member</h2>
                </ModalHeader>

                <ModalBody className="py-6">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="relative">
                            <Avatar
                                src={optimizeCloudinary(user.avatar)}
                                className="w-20 h-20 text-large shadow-lg"
                                isBordered
                                color="danger"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-danger text-white p-1 rounded-full border-2 border-white shadow-sm">
                                <AlertTriangle size={14} />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-lg font-bold text-default-800">
                                {user.displayName}
                            </p>
                            <p className="text-sm text-default-500 font-medium italic">
                                {user.email}
                            </p>
                        </div>

                        <div className="bg-danger-50 p-4 rounded-2xl border border-danger-100 w-full mt-2">
                            <p className="text-xs text-danger-700 leading-relaxed font-medium">
                                Warning: Removing this user from the{' '}
                                <b>{role.displayName}</b> role will immediately
                                revoke all associated permissions. They may lose
                                access to critical system features.
                            </p>
                        </div>
                    </div>
                </ModalBody>

                <ModalFooter className="bg-default-50/50">
                    <Button
                        variant="light"
                        onPress={onClose}
                        className="font-bold text-default-500"
                    >
                        Cancel
                    </Button>
                    <Button
                        color="danger"
                        className="font-bold px-8 shadow-lg shadow-danger/20"
                        isLoading={isLoading}
                        onPress={onConfirm}
                    >
                        Confirm Removal
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
