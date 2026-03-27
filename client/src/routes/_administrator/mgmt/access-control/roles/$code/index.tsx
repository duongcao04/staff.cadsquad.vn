import { INTERNAL_URLS, optimizeCloudinary } from '@/lib'
import {
    assignMemberRoleOptions,
    removeMemberRoleOptions,
    roleOptions,
} from '@/lib/queries'
import {
    Avatar,
    BreadcrumbItem,
    Breadcrumbs,
    Button,
    Chip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure,
    User,
} from '@heroui/react'
import { useMutation, useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import {
    AlertTriangle,
    ArrowLeft,
    Copy,
    Edit3,
    Mail,
    MoreHorizontal,
    Settings2,
    ShieldCheck,
    Trash2,
    UserMinus,
    UserPlus,
} from 'lucide-react'
import { useState } from 'react'
import { AddRoleMemberModal } from '../../../../../../features/user-access/components/modals/AddRoleMemberModal'
import {
    HeroCard,
    HeroCardBody,
    HeroTable,
} from '../../../../../../shared/components'
import { TRole, TUser } from '../../../../../../shared/types'

export const Route = createFileRoute(
    '/_administrator/mgmt/access-control/roles/$code/'
)({
    component: RoleDetailPage,
})

export default function RoleDetailPage() {
    const removeMemberRole = useMutation(removeMemberRoleOptions)
    const router = useRouter()
    const { code } = Route.useParams()
    const [
        {
            data: { role, permissions: rolePermissions },
        },
    ] = useSuspenseQueries({
        queries: [
            {
                ...roleOptions(code),
            },
        ],
    })

    const [selectedUser, setSelectedUser] = useState<TUser | null>(null)

    const confirmRemoveMemberModalDisclosure = useDisclosure({
        id: 'ConfirmRemoveMemberModal',
    })
    const handleOpenConfirmRemoveMemberModal = (user: TUser) => {
        setSelectedUser(user)
        confirmRemoveMemberModalDisclosure.onOpen()
    }
    const handleRemoveMember = async () => {
        if (!selectedUser) {
            return
        }
        removeMemberRole.mutateAsync(selectedUser.id, {
            onSuccess: () => {
                confirmRemoveMemberModalDisclosure.onClose()
            },
        })
    }

    return (
        <>
            {confirmRemoveMemberModalDisclosure.isOpen && selectedUser && (
                <ConfirmRemoveMemberModal
                    isOpen={confirmRemoveMemberModalDisclosure.isOpen}
                    onClose={confirmRemoveMemberModalDisclosure.onClose}
                    onConfirm={handleRemoveMember}
                    role={role}
                    user={selectedUser}
                />
            )}
            <div className="space-y-4 animate-in fade-in duration-500">
                <Breadcrumbs variant="light">
                    <BreadcrumbItem
                        onPress={() =>
                            router.navigate({
                                href: '..',
                            })
                        }
                    >
                        Roles
                    </BreadcrumbItem>
                    <BreadcrumbItem>{role.displayName}</BreadcrumbItem>
                </Breadcrumbs>
                {/* Breadcrumbs / Back */}
                <div className="flex items-center gap-4">
                    <Button
                        isIconOnly
                        variant="flat"
                        radius="full"
                        onPress={() => router.navigate({ href: '..' })}
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black">
                            {role.displayName}
                        </h1>
                        <p className="text-xs text-text-subdued font-bold uppercase tracking-wider">
                            Role Management
                        </p>
                    </div>
                </div>

                <div className="mt-7 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Role Stats */}
                    <div className="space-y-6">
                        <HeroCard shadow="sm" className="border-none">
                            <HeroCardBody className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                                        style={{
                                            backgroundColor: role.hexColor,
                                        }}
                                    >
                                        <ShieldCheck size={28} />
                                    </div>
                                    <QuickActionsDropdown role={role} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-lg">
                                        Role Details
                                    </h4>
                                    <p className="text-sm text-text-subdued mt-1">
                                        {/* {role.description} */}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <Chip
                                        variant="flat"
                                        color="primary"
                                        className="font-bold"
                                    >
                                        {rolePermissions.length} Permissions
                                    </Chip>
                                    <Chip variant="flat" className="font-bold">
                                        Organization Scope
                                    </Chip>
                                </div>
                                <Button
                                    fullWidth
                                    color="primary"
                                    variant="flat"
                                    startContent={<Settings2 size={18} />}
                                    className="font-bold mt-4"
                                    onPress={() =>
                                        router.navigate({
                                            href: INTERNAL_URLS.editRolePermMatrix(
                                                code
                                            ),
                                        })
                                    }
                                >
                                    Edit Permissions Matrix
                                </Button>
                            </HeroCardBody>
                        </HeroCard>
                    </div>

                    {/* Right Column: Member Table */}
                    <div className="lg:col-span-2 space-y-4">
                        <HeroCard
                            shadow="none"
                            className="border border-border-muted"
                        >
                            <HeroCardBody className="p-0">
                                <div className="p-6 border-b border-divider flex justify-between items-center">
                                    <h3 className="font-medium text-lg">
                                        Assigned Members
                                    </h3>
                                    <Chip
                                        size="sm"
                                        variant="dot"
                                        color="success"
                                        className="font-medium"
                                    >
                                        {role.users.length} Active Users
                                    </Chip>
                                </div>
                            </HeroCardBody>
                        </HeroCard>
                        <HeroTable
                            aria-label="Members table"
                            className="bg-background"
                        >
                            <TableHeader>
                                <TableColumn>NAME</TableColumn>
                                <TableColumn>CONTACT</TableColumn>
                                <TableColumn align="end">ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {role.users.map((user) => (
                                    <TableRow
                                        key={user.id}
                                        className="hover:bg-default-50 transition-colors"
                                    >
                                        <TableCell>
                                            <User
                                                name={user.displayName}
                                                avatarProps={{
                                                    src: optimizeCloudinary(
                                                        user.avatar
                                                    ),
                                                    radius: 'lg',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-default-400">
                                                <Mail size={14} />
                                                <span className="text-xs font-medium">
                                                    {user.email}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                variant="light"
                                                color="danger"
                                                className="font-bold"
                                                onPress={() =>
                                                    handleOpenConfirmRemoveMemberModal(
                                                        user
                                                    )
                                                }
                                            >
                                                Remove
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </HeroTable>
                    </div>
                </div>
            </div>
        </>
    )
}

interface QuickActionsProps {
    onEdit?: () => void
    onDelete?: () => void
    onDuplicate?: () => void
    role: TRole
}

export const QuickActionsDropdown = ({
    onEdit,
    onDelete,
    onDuplicate,
    role,
}: QuickActionsProps) => {
    const addRoleMemberModalDisclosure = useDisclosure({
        id: 'AddRoleMemberModal',
    })
    const [roleSelected, setRoleSelected] = useState<TRole | null>(null)

    const addMemberToRole = useMutation(assignMemberRoleOptions)

    const handleAddRoleMember = (role: TRole) => {
        setRoleSelected(role)
        addRoleMemberModalDisclosure.onOpen()
    }

    const handleConfirmAddMemberToRole = async (
        userId: string,
        roleId: string
    ) => {
        // Gọi mutation
        await addMemberToRole.mutateAsync({
            roleId,
            userId,
        })
    }
    return (
        <>
            {addRoleMemberModalDisclosure.isOpen && roleSelected && (
                <AddRoleMemberModal
                    isOpen={addRoleMemberModalDisclosure.isOpen}
                    onClose={addRoleMemberModalDisclosure.onClose}
                    onConfirm={handleConfirmAddMemberToRole}
                    role={roleSelected}
                />
            )}
            <Dropdown placement="bottom-end">
                <DropdownTrigger>
                    <Button isIconOnly variant="light" radius="full">
                        <MoreHorizontal
                            size={20}
                            className="text-text-subdued"
                        />
                    </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Role Actions" variant="flat">
                    <DropdownItem
                        key="edit"
                        startContent={<Edit3 size={16} />}
                        onPress={onEdit}
                    >
                        Edit Role Details
                    </DropdownItem>
                    <DropdownItem
                        key="duplicate"
                        startContent={<Copy size={16} />}
                        onPress={onDuplicate}
                    >
                        Duplicate Role
                    </DropdownItem>
                    <DropdownItem
                        key="assign"
                        startContent={<UserPlus size={16} />}
                        onPress={() => handleAddRoleMember(role)}
                    >
                        Assign to Members
                    </DropdownItem>
                    <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        startContent={<Trash2 size={16} />}
                        description={`Permanently remove ${role.displayName}`}
                        onPress={onDelete}
                    >
                        Delete Role
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </>
    )
}

interface Props {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    user: TUser
    role: TRole
    isLoading?: boolean
}

export const ConfirmRemoveMemberModal = ({
    isOpen,
    onClose,
    onConfirm,
    user,
    role,
    isLoading,
}: Props) => {
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
