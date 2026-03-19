import { ChangeRoleModal, PermissionRow } from '@/features/user-access'
import { optimizeCloudinary } from '@/lib'
import {
    permissionGroupsListOptions,
    rolesListOptions,
    userOptions,
} from '@/lib/queries'
import { getPermissionStatus, PermissionAction } from '@/lib/utils/_user-access'
import { HeroCard } from '@/shared/components'
import {
    Accordion,
    AccordionItem,
    Avatar,
    Button,
    Card,
    CardBody,
    Chip,
    Divider,
    Select,
    SelectItem,
    useDisclosure,
} from '@heroui/react'
import {
    useMutation,
    useQueryClient,
    useSuspenseQueries,
} from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AlertCircle, ArrowLeft, LayoutGrid, Shield } from 'lucide-react'
import { useMemo } from 'react'
import { toast } from 'sonner' // Assuming you use Sonner or React-Hot-Toast

export const Route = createFileRoute(
    '/_administrator/mgmt/access-control/users/$username'
)({
    loader: ({ context, params }) => {
        void context.queryClient.ensureQueryData(permissionGroupsListOptions())
        void context.queryClient.ensureQueryData(rolesListOptions())
        void context.queryClient.ensureQueryData(userOptions(params.username))
    },
    component: UserAccessPage,
})

export default function UserAccessPage() {
    const navigate = useNavigate()
    const { username } = Route.useParams()
    const queryClient = useQueryClient()
    const { isOpen, onOpen, onClose } = useDisclosure()

    // 1. Fetch Data
    const [
        { data: user },
        {
            data: { roles },
        },
        { data: permissionGroups },
    ] = useSuspenseQueries({
        queries: [
            { ...userOptions(username) },
            { ...rolesListOptions() },
            { ...permissionGroupsListOptions() },
        ],
    })

    // 2. Derived State (Permissions)
    // Flatten role permissions to simple array of strings: ['job.read', 'user.create']
    const rolePermissions = useMemo(
        () => user?.role?.permissions?.map((p) => p.entityAction) ?? [],
        [user]
    )
    // Get user overrides (UserPermission table)
    const userOverrides = useMemo(() => user?.userPermissions ?? [], [user])

    // 3. Mutation: Update Permission
    const updatePermissionMutation = useMutation({
        mutationFn: async ({
            permissionId,
            action,
        }: {
            permissionId: string
            action: PermissionAction
        }) => {
            // Replace with your actual API call
            // await axios.post(`/users/${user.id}/permissions`, { permissionId, action });
            console.log(
                `Sending API: ID=${user.id} Perm=${permissionId} Action=${action}`
            )
            return new Promise((resolve) => setTimeout(resolve, 500)) // Fake delay
        },
        onSuccess: () => {
            toast.success('Permissions updated')
            queryClient.invalidateQueries({ queryKey: ['users', username] })
        },
        onError: () => toast.error('Failed to update permission'),
    })

    // 4. Mutation: Change Role
    const changeRoleMutation = useMutation({
        mutationFn: async (newRoleId: string) => {
            // Replace with API call
            console.log('Changing role to', newRoleId)
        },
        onSuccess: () => {
            toast.success('Role updated and permissions reset')
            queryClient.invalidateQueries({ queryKey: ['users', username] })
            onClose()
        },
    })

    return (
        <div className="p-6 pb-24 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2">
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        isIconOnly
                        variant="light"
                        radius="full"
                        onPress={() => navigate({ to: '..' })}
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div className="flex items-center gap-4">
                        <Avatar
                            src={optimizeCloudinary(user.avatar)}
                            size="lg"
                            isBordered
                            color="primary"
                            className="w-16 h-16"
                        />
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black tracking-tight">
                                    {user.displayName}
                                </h1>
                                <Chip
                                    size="sm"
                                    color="primary"
                                    variant="flat"
                                    className="font-bold"
                                >
                                    {user.role.displayName}
                                </Chip>
                            </div>
                            <p className="text-default-500 text-sm font-medium">
                                @{user.username} •{' '}
                                {user.department?.displayName}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* --- LEFT: ROLE & SUMMARY (4 Cols) --- */}
                <div className="lg:col-span-4 space-y-6">
                    <HeroCard
                        title="Role Assignment"
                        // icon={<UserCog size={18} />}
                    >
                        <CardBody className="p-4 space-y-4">
                            <p className="text-sm text-default-500">
                                The primary role defines the baseline
                                permissions. To verify changes, use the
                                'Effective Access' view.
                            </p>

                            {/* Fake Select that triggers Modal */}
                            <div className="relative">
                                <Select
                                    label="Primary Role"
                                    selectedKeys={[String(user.role.id)]} // Ensure string/number match
                                    variant="bordered"
                                    disallowEmptySelection
                                    classNames={{ trigger: 'cursor-pointer' }}
                                >
                                    {roles.map((role) => (
                                        <SelectItem
                                            key={String(role.id)}
                                            textValue={role.displayName}
                                        >
                                            {role.displayName}
                                        </SelectItem>
                                    ))}
                                </Select>
                                {/* Overlay div to capture click for Modal */}
                                <div
                                    className="absolute inset-0 z-10 cursor-pointer"
                                    onClick={onOpen}
                                />
                            </div>

                            <div className="flex items-start gap-2 p-2 bg-default-100 rounded-md text-xs text-default-500">
                                <AlertCircle
                                    size={14}
                                    className="mt-0.5 shrink-0"
                                />
                                <span>
                                    Clicking the selector will open a
                                    confirmation dialog.
                                </span>
                            </div>
                        </CardBody>
                    </HeroCard>

                    <Card className="bg-slate-900 text-white border-none p-6 shadow-xl rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary/20 rounded-lg text-primary">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">
                                    Access Summary
                                </h4>
                                <p className="text-xs text-slate-400">
                                    Live calculations
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                                <span className="text-slate-400">
                                    Base Role
                                </span>
                                <span className="font-bold">
                                    {user.role.displayName}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                                <span className="text-slate-400">
                                    Direct Grants
                                </span>
                                <span className="font-bold text-success">
                                    {
                                        userOverrides.filter((o) => !o.isDenied)
                                            .length
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between text-sm pb-2">
                                <span className="text-slate-400">
                                    Explicit Denials
                                </span>
                                <span className="font-bold text-danger">
                                    {
                                        userOverrides.filter((o) => o.isDenied)
                                            .length
                                    }
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* --- RIGHT: PERMISSION MATRIX (8 Cols) --- */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <LayoutGrid className="text-primary" />{" "}
                                Permission Matrix
                            </h3>
                            <p className="text-default-500 text-sm">
                                Fine-tune access rights for this specific user.
                            </p>
                        </div>

                        {/* Legend */}
                        <div className="hidden sm:flex gap-3 text-[10px] font-bold uppercase text-default-500 bg-content2 p-2 rounded-lg border border-default-200">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-default-400" />{" "}
                                Inherit
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-success-500" />{" "}
                                Grant
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-danger-500" />{" "}
                                Deny
                            </div>
                        </div>
                    </div>

                    <Accordion
                        variant="splitted"
                        selectionMode="multiple"
                        defaultExpandedKeys={[permissionGroups[0]?.name]}
                        itemClasses={{
                            base: 'group mb-2',
                            title: 'font-bold text-sm uppercase text-default-600',
                            content: 'pb-4',
                        }}
                    >
                        {permissionGroups.map((group) => (
                            <AccordionItem
                                key={group.name}
                                aria-label={group.name}
                                startContent={
                                    <div className="w-1 h-6 bg-primary rounded-full mr-2" />
                                }
                                title={group.name}
                                subtitle={`${group.permissions.length} permissions`}
                            >
                                <Divider className="mb-4" />
                                <div className="grid grid-cols-1 gap-2">
                                    {group.permissions.map((perm) => {
                                        // Calculate Status logic
                                        const { status, effective } =
                                            getPermissionStatus(
                                                perm.entityAction,
                                                rolePermissions,
                                                userOverrides
                                            )

                                        return (
                                            <PermissionRow
                                                key={perm.id}
                                                label={perm.displayName}
                                                description={perm.description}
                                                status={status}
                                                effectiveValue={effective}
                                                onChange={(action) =>
                                                    updatePermissionMutation.mutate(
                                                        {
                                                            permissionId:
                                                                perm.id,
                                                            action,
                                                        }
                                                    )
                                                }
                                                isLoading={
                                                    updatePermissionMutation.isPending &&
                                                    updatePermissionMutation
                                                        .variables
                                                        ?.permissionId ===
                                                        perm.id
                                                }
                                            />
                                        )
                                    })}
                                </div>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>

            {/* --- Safety Modal --- */}
            <ChangeRoleModal
                isOpen={isOpen}
                onClose={onClose}
                user={user}
                currentRoleId={user.role.id}
                roles={roles}
            />
        </div>
    )
}
