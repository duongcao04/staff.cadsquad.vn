import {
    HeroModal,
    HeroModalBody,
    HeroModalContent,
    HeroModalFooter,
    HeroModalHeader,
} from '@/shared/components'
import { TRole, TUser } from '@/shared/types'
import { Button, Select, SelectItem } from '@heroui/react'
import { useMutation } from '@tanstack/react-query'
import { AlertTriangle, UserCog } from 'lucide-react'
import { useState } from 'react'
import { assignMemberRoleOptions } from '../../../../lib'

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
                        onClose()
                    },
                }
            )
        }
    }

    return (
        <HeroModal isOpen={isOpen} onClose={onClose} size="lg">
            <HeroModalContent>
                {(onClose) => (
                    <>
                        <HeroModalHeader className="flex gap-2 items-center text-warning-600">
                            <AlertTriangle /> Change Primary Role
                        </HeroModalHeader>
                        <HeroModalBody className="gap-4">
                            <div className="p-3 bg-warning-50 rounded-lg text-sm text-warning-800 border border-warning-200">
                                <strong>Warning:</strong> Changing the role will{' '}
                                <b>reset all custom permission overrides</b>{' '}
                                (Grants/Denials) for this user to the defaults
                                of the new role.
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
                        </HeroModalBody>
                        <HeroModalFooter>
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
                        </HeroModalFooter>
                    </>
                )}
            </HeroModalContent>
        </HeroModal>
    )
}
