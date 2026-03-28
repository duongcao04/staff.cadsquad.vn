import { AddRoleMemberModal } from '@/features/user-access/components/modals/AddRoleMemberModal'
import { INTERNAL_URLS, optimizeCloudinary } from '@/lib'
import {
    assignMemberRoleOptions,
    removeMemberRoleOptions,
    roleOptions,
} from '@/lib/queries'
import { queryClient } from '@/main'
import { AdminPageHeading, AppLoading } from '@/shared/components'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import { TRole, TUser } from '@/shared/types'
import { Plus, Xmark } from '@gravity-ui/icons'
import {
    addToast,
    Avatar,
    BreadcrumbItem,
    Breadcrumbs,
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Divider,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tooltip,
    useDisclosure,
    User,
} from '@heroui/react'
import { useMutation, useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
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
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute(
    '/_administrator/mgmt/access-control/roles/$code/'
)({
    pendingComponent: AppLoading,
    component: () => {
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

        const addRoleMemberModalState = useDisclosure({
            id: 'AddRoleMemberModal',
        })
        const [roleSelected, setRoleSelected] = useState<TRole | null>(null)

        const addMemberToRole = useMutation(assignMemberRoleOptions)

        const handleAddRoleMember = (role: TRole) => {
            setRoleSelected(role)
            addRoleMemberModalState.onOpen()
        }

        const handleConfirmAddMemberToRole = async (
            userId: string,
            roleId: string
        ) => {
            // Gọi mutation
            await addMemberToRole.mutateAsync(
                {
                    roleId,
                    userId,
                },
                {
                    onSuccess() {
                        addToast({
                            title: 'Successfully',
                            description: (
                                <p>
                                    Assign member to role{' '}
                                    <span
                                        className="font-medium"
                                        style={{ color: role.hexColor }}
                                    >
                                        {role.displayName}
                                    </span>{' '}
                                    successfully
                                </p>
                            ),
                            color: 'success',
                        })
                        addRoleMemberModalState.onClose()
                        queryClient.refetchQueries({
                            queryKey: roleOptions(code).queryKey,
                        })
                    },
                }
            )
        }
        return (
            <>
                {addRoleMemberModalState.isOpen && roleSelected && (
                    <AddRoleMemberModal
                        isOpen={addRoleMemberModalState.isOpen}
                        onClose={addRoleMemberModalState.onClose}
                        onConfirm={handleConfirmAddMemberToRole}
                        role={roleSelected}
                    />
                )}
                <AdminPageHeading
                    title={
                        <div className="flex items-center gap-4">
                            <Button
                                isIconOnly
                                variant="flat"
                                onPress={() => router.history.back()}
                            >
                                <ArrowLeft size={18} />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-default-900">
                                    {role.displayName}
                                </h1>
                                <p className="text-sm text-text-subdued font-normal">
                                    Review your members roles and allocate
                                    permissions
                                </p>
                            </div>
                        </div>
                    }
                    actions={
                        <div className="flex gap-3">
                            <Button
                                color="primary"
                                onPress={() => handleAddRoleMember(role)}
                                startContent={<Plus fontSize={14} />}
                                className="font-medium shadow-sm w-full sm:w-auto"
                            >
                                Assign to member
                            </Button>
                        </div>
                    }
                />
                <AdminContentContainer className="pt-0 space-y-4">
                    <Breadcrumbs className="text-xs">
                        <BreadcrumbItem>
                            <Link
                                to={INTERNAL_URLS.admin.overview}
                                className="text-text-subdued!"
                            >
                                Management
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link
                                to={INTERNAL_URLS.management.accessControl}
                                className="text-text-subdued!"
                            >
                                Access Control
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>Roles</BreadcrumbItem>
                        <BreadcrumbItem>{role.displayName}</BreadcrumbItem>
                    </Breadcrumbs>

                    <div className="space-y-6">
                        <RoleDetailPage
                            data={role}
                            rolePermissions={rolePermissions}
                        />
                    </div>
                </AdminContentContainer>
            </>
        )
    },
})

interface RoleDetailPageProps {
    data: TRole
    rolePermissions: string[]
}
export default function RoleDetailPage({
    data: role,
    rolePermissions,
}: RoleDetailPageProps) {
    const removeMemberRole = useMutation(removeMemberRoleOptions)
    const router = useRouter()

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
            <div className="mt-7 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Role Stats */}
                <div className="space-y-6">
                    <Card
                        shadow="none"
                        className="border border-border-default"
                    >
                        <CardBody className="p-6 space-y-4">
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
                                        href: INTERNAL_URLS.management.rolePermMatrix(
                                            role.code
                                        ),
                                    })
                                }
                            >
                                Edit Permissions Matrix
                            </Button>
                        </CardBody>
                    </Card>
                </div>

                {/* Right Column: Member Table */}
                <div className="lg:col-span-2 space-y-4">
                    <Card
                        shadow="none"
                        className="border border-border-default"
                    >
                        <CardHeader className="p-0">
                            <div className="p-6 w-full  flex justify-between items-center">
                                <h3 className="font-medium text-lg">
                                    Assigned Members
                                </h3>
                                <Chip
                                    variant="dot"
                                    color="success"
                                    className="font-medium"
                                >
                                    {role.users.length} Active Users
                                </Chip>
                            </div>
                        </CardHeader>

                        <Divider />

                        <CardBody className="px-0">
                            <Table
                                aria-label="Members table"
                                classNames={{
                                    wrapper: 'shadow-none',
                                }}
                            >
                                <TableHeader>
                                    <TableColumn>NAME</TableColumn>
                                    <TableColumn>CONTACT</TableColumn>
                                    <TableColumn align="end">
                                        ACTIONS
                                    </TableColumn>
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
                                                <Tooltip
                                                    content="Remove"
                                                    color="danger"
                                                >
                                                    <Button
                                                        size="sm"
                                                        isIconOnly
                                                        variant="flat"
                                                        color="danger"
                                                        onPress={() =>
                                                            handleOpenConfirmRemoveMemberModal(
                                                                user
                                                            )
                                                        }
                                                    >
                                                        <Xmark fontSize={16} />
                                                    </Button>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardBody>
                    </Card>
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
    return (
        <>
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
