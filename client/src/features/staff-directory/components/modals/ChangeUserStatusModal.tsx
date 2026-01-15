import { Button } from '@heroui/react'
import { AlertCircleIcon, UserCheckIcon, UserXIcon } from 'lucide-react'
import { useState } from 'react'
import {
    HeroModal,
    HeroModalBody,
    HeroModalContent,
    HeroModalFooter,
    HeroModalHeader,
} from '../../../../shared/components/ui/hero-modal'

interface UserStatusModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (userId: string, newStatus: boolean) => Promise<void>
    user: { id: string; displayName: string; isActive: boolean } | null
    action: 'active' | 'deActive'
}
export const ChangeUserStatusModal = ({
    isOpen,
    onClose,
    onConfirm,
    user,
    action,
}: UserStatusModalProps) => {
    const [isLoading, setIsLoading] = useState(false)

    if (!user) return null

    // Determine if we are Deactivating (red) or Reactivating (green)
    const isDeactivating = action === 'deActive'
    const config = {
        title: isDeactivating ? 'Deactivate User?' : 'Reactivate User?',
        confirmText: isDeactivating
            ? 'Deactivate Account'
            : 'Reactivate Access',
        color: isDeactivating ? ('danger' as const) : ('success' as const),
        icon: isDeactivating ? (
            <UserXIcon size={32} className="text-danger" />
        ) : (
            <UserCheckIcon size={32} className="text-success" />
        ),
        description: isDeactivating
            ? 'This will immediately revoke all access to the system, projects, and communities.'
            : 'This will restore the user’s ability to log in and access assigned tasks.',
    }

    const handleConfirm = async () => {
        try {
            setIsLoading(true)
            // Send the OPPOSITE of current status
            await onConfirm(user.id, !user.isActive)
            onClose()
        } catch (error) {
            console.error('Failed to toggle user status:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <HeroModal
            isOpen={isOpen}
            onOpenChange={onClose}
            placement="center"
            classNames={{
                closeButton: 'hover:bg-default-100 active:bg-default-200',
            }}
        >
            <HeroModalContent>
                {(onClose) => (
                    <>
                        <HeroModalHeader className="flex flex-col gap-1 items-center pt-8">
                            <div
                                className={`p-4 rounded-full mb-2 ${
                                    isDeactivating
                                        ? 'bg-danger-50'
                                        : 'bg-success-50'
                                }`}
                            >
                                {config.icon}
                            </div>
                            <span className="text-xl font-bold">
                                {config.title}
                            </span>
                        </HeroModalHeader>

                        <HeroModalBody className="text-center pb-6">
                            <p className="text-default-600">
                                Are you sure you want to{' '}
                                {isDeactivating ? 'deactivate' : 'reactivate'}{' '}
                                <span className="font-bold text-default-900">
                                    {user.displayName}
                                </span>
                                ?
                            </p>

                            <div
                                className={`mt-4 p-3 rounded-lg flex gap-3 items-start text-left border ${
                                    isDeactivating
                                        ? 'bg-danger-50 border-danger-100'
                                        : 'bg-success-50 border-success-100'
                                }`}
                            >
                                <AlertCircleIcon
                                    size={18}
                                    className={
                                        isDeactivating
                                            ? 'text-danger'
                                            : 'text-success'
                                    }
                                />
                                <p
                                    className={`text-tiny ${isDeactivating ? 'text-danger-700' : 'text-success-700'}`}
                                >
                                    {config.description}
                                </p>
                            </div>
                        </HeroModalBody>

                        <HeroModalFooter className="bg-default-50/50">
                            <Button
                                variant="flat"
                                onPress={onClose}
                                isDisabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                color={config.color}
                                onPress={handleConfirm}
                                isLoading={isLoading}
                                className={!isDeactivating ? 'text-white' : ''}
                            >
                                {config.confirmText}
                            </Button>
                        </HeroModalFooter>
                    </>
                )}
            </HeroModalContent>
        </HeroModal>
    )
}
