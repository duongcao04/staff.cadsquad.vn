import { restoreUserOptions, userOptions } from '@/lib'
import { HeroButton, HeroInput } from '@/shared/components'
import { TUser } from '@/shared/types'
import {
    addToast,
    Chip,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from '@heroui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Info, RotateCcw } from 'lucide-react'
import { useState } from 'react'

interface RestoreUserModalProps {
    isOpen: boolean
    onClose: () => void
    user: TUser
}

export const RestoreUserModal = ({
    isOpen,
    onClose,
    user,
}: RestoreUserModalProps) => {
    const queryClient = useQueryClient()
    const restoreUserMutation = useMutation(restoreUserOptions)

    const [confirmText, setConfirmText] = useState('')

    const username = user.username.includes('_')
        ? user.username.split('_')[0]
        : user.username

    const handleRestore = async () => {
        if (confirmText !== username) return
        await restoreUserMutation.mutateAsync(user.id, {
            onSuccess: () => {
                addToast({
                    title: `Restored user ${user.displayName} successful`,
                    color: 'success',
                })
                queryClient.invalidateQueries({
                    queryKey: userOptions(user.code).queryKey,
                })
                setConfirmText('')
                onClose()
            },
        })
    }

    const isMatch = confirmText === username

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
            hideCloseButton={restoreUserMutation.isPending}
        >
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 bg-success-50/50 dark:bg-success-950/50 border-b border-success-100 dark:border-success-900/40">
                            <div className="flex items-center gap-2 text-success-600">
                                <div className="p-2 bg-success-100 dark:bg-success-900/40 rounded-full">
                                    <RotateCcw size={20} />
                                </div>
                                <span className="text-lg font-bold">
                                    Restore User Account?
                                </span>
                            </div>
                        </ModalHeader>

                        <ModalBody className="py-6">
                            <div className="space-y-4">
                                <div className="bg-success-50 border border-success-100 p-4 rounded-xl text-sm text-success-800 flex flex-col gap-2">
                                    <div className="flex items-center gap-1.5 font-bold">
                                        <Info size={16} />
                                        Information: Reactivating this account.
                                    </div>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>
                                            The user{' '}
                                            <strong>@{username}</strong> will
                                            regain access to the platform.
                                        </li>
                                        <li>
                                            Previous roles and system
                                            permissions will be reinstated.
                                        </li>
                                        <li>
                                            Historical logs and assigned tasks
                                            will re-link to this active profile.
                                        </li>
                                    </ul>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-default">
                                        To confirm, type{' '}
                                        <Chip variant="flat" color="success">
                                            <p className="font-semibold text-sm">
                                                {username}
                                            </p>
                                        </Chip>{' '}
                                        below:
                                    </label>
                                    <div className="mt-1">
                                        <HeroInput
                                            placeholder={username}
                                            variant="bordered"
                                            color={
                                                confirmText && !isMatch
                                                    ? 'danger'
                                                    : 'success'
                                            }
                                            labelPlacement="outside-top"
                                            value={confirmText}
                                            onValueChange={setConfirmText}
                                            isDisabled={
                                                restoreUserMutation.isPending
                                            }
                                            errorMessage={
                                                confirmText && !isMatch
                                                    ? 'Username does not match'
                                                    : ''
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </ModalBody>

                        <ModalFooter className="bg-background-muted/2 border-t border-border-default">
                            <HeroButton
                                variant="light"
                                onPress={close}
                                isDisabled={restoreUserMutation.isPending}
                            >
                                Cancel
                            </HeroButton>
                            <HeroButton
                                color="success"
                                variant="shadow"
                                isLoading={restoreUserMutation.isPending}
                                isDisabled={!isMatch}
                                onPress={handleRestore}
                                startContent={
                                    !restoreUserMutation.isPending && (
                                        <RotateCcw size={18} />
                                    )
                                }
                                className="font-medium"
                            >
                                {restoreUserMutation.isPending
                                    ? 'Restoring...'
                                    : 'Restore Account'}
                            </HeroButton>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
