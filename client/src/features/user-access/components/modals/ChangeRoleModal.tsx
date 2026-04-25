import { TRole, TUser } from '@/shared/types'
import {
    addToast,
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
} from '@heroui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ShieldUserIcon, UserCog } from 'lucide-react'
import { useState } from 'react'
import { assignMemberRoleOptions, userOptions } from '../../../../lib'

interface ChangeRoleModalProps {
    isOpen: boolean
    onClose: () => void
    currentRoleId: number | string
    roles: TRole[]
    user: TUser
}

export const ChangeRoleModal = ({
    isOpen,
    onClose,
    currentRoleId,
    roles,
    user,
}: ChangeRoleModalProps) => {
    const queryClient = useQueryClient()
    const userAssignRoleMutation = useMutation(assignMemberRoleOptions)
    const [selectedRole, setSelectedRole] = useState<string | null>(null)

    const handleConfirm = async () => {
        if (selectedRole) {
            await userAssignRoleMutation.mutateAsync(
                {
                    roleId: selectedRole,
                    userId: user.id,
                },
                {
                    onSuccess() {
                        addToast({
                            title: `Change role for ${user.displayName} successful`,
                            color: 'success',
                        })
                        queryClient.invalidateQueries({
                            queryKey: userOptions(user.code).queryKey,
                        })
                        onClose()
                    },
                }
            )
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex gap-2 items-center text-warning-600">
                            <ShieldUserIcon />
                            Change User Role
                        </ModalHeader>
                        <ModalBody className="gap-4">
                            <div className="p-3 bg-warning-50 rounded-lg text-sm text-warning-800 border border-warning-200">
                                <strong>Warning:</strong> Defines the user’s
                                global permissions. Changes take effect
                                immediately across the system.
                            </div>

                            <Select
                                label="Select New Role"
                                placeholder="Choose a role..."
                                variant="bordered"
                                selectedKeys={
                                    selectedRole ? [selectedRole] : []
                                }
                                onSelectionChange={(keys) => {
                                    setSelectedRole(keys.currentKey as string)
                                }}
                                startContent={
                                    <UserCog
                                        size={16}
                                        className="text-default-400"
                                    />
                                }
                            >
                                {roles
                                    .filter(
                                        (r) =>
                                            String(r.id) !==
                                            String(currentRoleId)
                                    ) // Exclude current
                                    .map((role) => (
                                        <SelectItem
                                            key={role.id}
                                            textValue={role.displayName}
                                        >
                                            {role.displayName}
                                        </SelectItem>
                                    ))}
                            </Select>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button
                                color="warning"
                                onPress={handleConfirm}
                                isDisabled={!selectedRole || !selectedRole}
                                isLoading={userAssignRoleMutation.isPending}
                            >
                                Confirm Change
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
