import { deleteUserOptions, INTERNAL_URLS } from '@/lib'
import { HeroButton, HeroInput } from '@/shared/components'
import { TUser } from '@/shared/types'
import {
    Chip,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from '@heroui/react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface DeleteUserModalProps {
    isOpen: boolean
    onClose: () => void
    user: TUser
}

export const DeleteUserPermanentlyModal = ({
    isOpen,
    onClose,
    user,
}: DeleteUserModalProps) => {
    const router = useRouter()
    const deleteUserMutation = useMutation(deleteUserOptions)

    const [confirmText, setConfirmText] = useState('')

    const handleDelete = async () => {
        if (confirmText !== user?.username) return
        await deleteUserMutation.mutateAsync(user.id, {
            onSuccess: () => {
                setConfirmText('')
                onClose()
                router.navigate({ href: INTERNAL_URLS.management.team })
            },
        })
    }

    const isMatch = confirmText === user?.username

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
            hideCloseButton={deleteUserMutation.isPending}
        >
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 bg-danger-50/50 dark:bg-danger-950/50 border-b border-red-100 dark:border-red-900/40">
                            <div className="flex items-center gap-2 text-danger">
                                <div className="p-2 bg-red-100 dark:border-red-900/40 rounded-full">
                                    <AlertTriangle size={20} />
                                </div>
                                <span className="text-lg font-bold">
                                    Delete User Permanently?
                                </span>
                            </div>
                        </ModalHeader>

                        <ModalBody className="py-6">
                            <div className="space-y-4">
                                <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-sm text-red-800">
                                    <strong>Warning:</strong> This action is{' '}
                                    <u>irreversible</u>.
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        <li>
                                            The user{' '}
                                            <strong>@{user?.username}</strong>{' '}
                                            will be removed.
                                        </li>
                                        <li>
                                            All login sessions will be
                                            terminated.
                                        </li>
                                        <li>
                                            Historical logs (like created jobs)
                                            may be anonymized.
                                        </li>
                                    </ul>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-default">
                                        To confirm, type{' '}
                                        <Chip variant="flat">
                                            <p className="font-semibold text-sm">
                                                {user?.username}
                                            </p>
                                        </Chip>{' '}
                                        below:
                                    </label>
                                    <div className="mt-1">
                                        <HeroInput
                                            placeholder={user?.username}
                                            variant="bordered"
                                            color={
                                                confirmText && !isMatch
                                                    ? 'danger'
                                                    : 'default'
                                            }
                                            labelPlacement="outside-top"
                                            value={confirmText}
                                            onValueChange={setConfirmText}
                                            isDisabled={
                                                deleteUserMutation.isPending
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
                                isDisabled={deleteUserMutation.isPending}
                            >
                                Cancel
                            </HeroButton>
                            <HeroButton
                                color="danger"
                                variant="shadow"
                                isLoading={deleteUserMutation.isPending}
                                isDisabled={!isMatch}
                                onPress={handleDelete}
                                startContent={
                                    !deleteUserMutation.isPending && (
                                        <Trash2 size={18} />
                                    )
                                }
                                className="font-medium"
                            >
                                {deleteUserMutation.isPending
                                    ? 'Deleting...'
                                    : 'Permanently Delete'}
                            </HeroButton>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
