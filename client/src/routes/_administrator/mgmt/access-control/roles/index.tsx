import { AddRoleMemberModal } from '@/features/user-access/components/modals/AddRoleMemberModal'
import CreateRoleModal from '@/features/user-access/components/modals/CreateRoleModal'
import { permissionGroupsListOptions } from '@/lib'
import {
    assignMemberRoleOptions,
    rolesListOptions,
} from '@/lib/queries/options/role-queries'
import { HeroButton, HeroCard } from '@/shared/components'
import { TRole } from '@/shared/types'
import {
    BreadcrumbItem,
    Breadcrumbs,
    Card,
    CardBody,
    Chip,
    useDisclosure,
} from '@heroui/react'
import { useMutation, useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute(
    '/_administrator/mgmt/access-control/roles/'
)({
    component: RolesPage,
})

export default function RolesPage() {
    const router = useRouter()

    const addMemberToRole = useMutation(assignMemberRoleOptions)
    const [roleSelected, setRoleSelected] = useState<TRole | null>(null)

    const [
        {
            data: { roles },
        },
        { data: permissions },
    ] = useSuspenseQueries({
        queries: [
            { ...rolesListOptions() },
            { ...permissionGroupsListOptions() },
        ],
    })

    const addRoleMemberModalDisclosure = useDisclosure({
        id: 'AddRoleMemberModal',
    })
    const createRoleModalDisclosure = useDisclosure()

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
            {createRoleModalDisclosure.isOpen && (
                <CreateRoleModal
                    isOpen={createRoleModalDisclosure.isOpen}
                    onClose={createRoleModalDisclosure.onClose}
                    allPermissions={permissions}
                />
            )}
            <div className="space-y-4 min-h-screen">
                <Breadcrumbs variant="light">
                    <BreadcrumbItem
                        onPress={() =>
                            router.navigate({
                                href: '..',
                            })
                        }
                    >
                        Access Control
                    </BreadcrumbItem>
                    <BreadcrumbItem>Roles Manage</BreadcrumbItem>
                </Breadcrumbs>
                {/* Roles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {roles.map((role) => (
                        <HeroCard
                            key={role.id}
                            className="border border-border-muted p-2"
                            shadow="none"
                        >
                            <CardBody className="space-y-6">
                                {/* Role Title & Member Count */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-text-default">
                                            {role.displayName}
                                        </h3>
                                        <p className="text-xs text-text-subdued font-medium mt-1">
                                            Scope:{' '}
                                            <span className="text-text-subdued">
                                                Organization
                                            </span>
                                        </p>
                                    </div>
                                    <Chip
                                        variant="flat"
                                        className="h-8 px-4 font-bold bg-background-hovered text-text-default rounded-lg"
                                    >
                                        {role.users?.length || 0} Member
                                        {role.users?.length >= 2 ? 's' : ''}
                                    </Chip>
                                </div>

                                {/* Role Description - Fallback if not in schema */}
                                <p className="text-sm text-text-subdued leading-relaxed min-h-12">
                                    {
                                        'Full access to manage members, billing, and organization-wide settings.'
                                    }
                                </p>

                                {/* Action HeroButtons */}
                                <div className="flex justify-between items-center pt-2">
                                    <HeroButton
                                        variant="bordered"
                                        size="sm"
                                        className="font-medium border-border-default"
                                        onPress={() =>
                                            router.navigate({
                                                href: `${role.code}`,
                                            })
                                        }
                                    >
                                        View Managers
                                    </HeroButton>
                                    <HeroButton
                                        variant="bordered"
                                        color="primary"
                                        size="sm"
                                        className="font-medium border-primary text-primary"
                                        onPress={() =>
                                            handleAddRoleMember(role)
                                        }
                                    >
                                        Add New{' '}
                                        {role.displayName.replace(' Admin', '')}
                                    </HeroButton>
                                </div>
                            </CardBody>
                        </HeroCard>
                    ))}

                    {/* Create New Role Dotted Card */}
                    <Card
                        isPressable
                        onPress={createRoleModalDisclosure.onOpen}
                        shadow="none"
                        className="border-2 border-dashed border-border-default bg-transparent flex justify-center items-center p-8 hover:bg-background-muted hover:border-indigo-300 transition-all"
                    >
                        <CardBody className="flex flex-col items-center justify-center gap-4">
                            <div className="p-3 rounded-full border-2 border-border-default text-text-subdued">
                                <Plus size={24} />
                            </div>
                            <HeroButton
                                variant="bordered"
                                className="bg-background font-bold border border-border-default text-text-default"
                                onPress={createRoleModalDisclosure.onOpen}
                                disableRipple
                                disableAnimation
                            >
                                Create New Role
                            </HeroButton>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </>
    )
}
