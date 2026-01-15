import {
    Autocomplete,
    Avatar,
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    SelectItem,
} from '@heroui/react'
import { Search, ShieldCheck, UserPlus, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { optimizeCloudinary } from '../../../../lib'
import { TRole, TUser } from '../../../../shared/types'
import { useSuspenseQuery } from '@tanstack/react-query'
import { usersListOptions } from '../../../../lib/queries'

interface Props {
    isOpen: boolean
    onClose: () => void
    role: TRole
    onConfirm: (userId: string, roleId: string) => void
    isLoading?: boolean
}

export const AddRoleMemberModal = ({
    isOpen,
    onClose,
    role,
    onConfirm,
    isLoading,
}: Props) => {
    const { data: users } = useSuspenseQuery({ ...usersListOptions() })
    const roleUsernames = role.users.map((it) => it.username)
    const availableUsers = users.users.filter(
        (it) => !roleUsernames.includes(it.username)
    )
    // Chỉ lưu trữ 1 user duy nhất thay vì mảng
    const [selectedUser, setSelectedUser] = useState<TUser | null>(null)

    // Filter: Nếu đã chọn 1 người thì không hiện list nữa hoặc loại người đó ra
    const filteredOptions = useMemo(() => {
        if (selectedUser) return [] // Ẩn toàn bộ gợi ý nếu đã chọn xong 1 người
        return availableUsers
    }, [availableUsers, selectedUser])

    const handleSelectUser = (key: string | number | null) => {
        if (!key) return
        const user = availableUsers.find((u) => u.id === String(key))
        if (user) {
            setSelectedUser(user)
        }
    }

    const removeUser = () => {
        setSelectedUser(null)
    }

    const handleConfirm = () => {
        if (selectedUser) {
            onConfirm(selectedUser.id, role.id)
            setSelectedUser(null)
            onClose()
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
            backdrop="blur"
            classNames={{
                header: 'border-b border-divider',
                footer: 'border-t border-divider',
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 pt-6">
                            <div className="flex items-center gap-3">
                                <div
                                    className="p-2 rounded-xl text-white shadow-lg"
                                    style={{ backgroundColor: role.hexColor }}
                                >
                                    <UserPlus size={22} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black">
                                        Assign {role.displayName} Member
                                    </h2>
                                    <p className="text-tiny text-default-500 font-bold uppercase tracking-wider">
                                        Single Authority Assignment
                                    </p>
                                </div>
                            </div>
                        </ModalHeader>

                        <ModalBody className="py-6 space-y-6">
                            <div className="p-4 bg-default-50 rounded-2xl border border-divider flex items-start gap-4">
                                <ShieldCheck
                                    className="text-primary mt-0.5"
                                    size={20}
                                />
                                <p className="text-xs text-default-600 leading-snug">
                                    You are assigning <b>one</b> user to the{' '}
                                    <b>{role.displayName}</b> role. This user
                                    will receive all associated permissions
                                    immediately.
                                </p>
                            </div>

                            {/* Autocomplete Search: Disable nếu đã chọn xong */}
                            <Autocomplete
                                label="Search Staff Member"
                                placeholder={
                                    selectedUser
                                        ? 'User selected'
                                        : 'Type name or email...'
                                }
                                variant="bordered"
                                labelPlacement="outside"
                                items={filteredOptions}
                                onSelectionChange={handleSelectUser}
                                isDisabled={!!selectedUser}
                                startContent={
                                    <Search
                                        size={18}
                                        className="text-default-400"
                                    />
                                }
                            >
                                {(user) => (
                                    <SelectItem
                                        key={user.id}
                                        textValue={user.displayName}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                src={optimizeCloudinary(
                                                    user.avatar
                                                )}
                                                size="sm"
                                                name={user.displayName}
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-small font-bold">
                                                    {user.displayName}
                                                </span>
                                                <span className="text-tiny text-default-400">
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </SelectItem>
                                )}
                            </Autocomplete>

                            {/* Selected User Display */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-default-400 uppercase tracking-widest px-1">
                                    Selected Member
                                </h4>

                                {selectedUser ? (
                                    <div className="flex items-center justify-between p-3 bg-primary-50 border-1 border-primary-200 rounded-xl animate-in zoom-in-95 duration-200">
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                src={optimizeCloudinary(
                                                    selectedUser.avatar
                                                )}
                                                size="md"
                                                radius="lg"
                                                className="shadow-sm"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-primary-700">
                                                    {selectedUser.displayName}
                                                </span>
                                                <span className="text-xs text-primary-500">
                                                    {selectedUser.email}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="flat"
                                            color="primary"
                                            radius="full"
                                            onPress={removeUser}
                                        >
                                            <X size={16} />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center border-2 border-dashed border-divider rounded-2xl">
                                        <p className="text-tiny text-default-400 font-medium italic">
                                            Please search and select a member
                                            above
                                        </p>
                                    </div>
                                )}
                            </div>
                        </ModalBody>

                        <ModalFooter className="bg-default-50/50 p-6">
                            <Button
                                variant="light"
                                onPress={onClose}
                                className="font-bold"
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                className="font-bold px-10 shadow-lg shadow-primary/30"
                                isDisabled={!selectedUser}
                                isLoading={isLoading}
                                onPress={handleConfirm}
                            >
                                Confirm Assignment
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
