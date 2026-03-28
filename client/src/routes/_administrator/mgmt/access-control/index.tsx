import {
    permissionGroupsListOptions,
    permissionsListOptions,
    rolesListOptions
} from '@/lib/queries'
import {
    AdminPageHeading,
    AppLoading,
    HeroButton,
    HeroCard,
    HeroCardBody,
} from '@/shared/components'
import { Eye } from '@gravity-ui/icons'
import {
    Avatar,
    AvatarGroup,
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    Input,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tabs,
    Tooltip,
    useDisclosure,
} from '@heroui/react'
import { useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import {
    Activity,
    LayoutGrid,
    List,
    Lock,
    MoreHorizontalIcon,
    Plus,
    Search,
    Shield,
    ShieldCheck,
    Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import CreateRoleModal from '../../../../features/user-access/components/modals/CreateRoleModal'
import { INTERNAL_URLS } from '../../../../lib'
import AdminContentContainer from '../../../../shared/components/admin/AdminContentContainer'
import { TRole } from '../../../../shared/types'

export const Route = createFileRoute('/_administrator/mgmt/access-control/')({
    pendingComponent: AppLoading,
    component: () => {
        const router = useRouter()

        const [
            {
                data: { roles },
            },
            {
                data: { permissions },
            },
            { data: permissionGroups },
        ] = useSuspenseQueries({
            queries: [
                { ...rolesListOptions() },
                { ...permissionsListOptions() },
                { ...permissionGroupsListOptions() },
            ],
        })

        const createRoleModalState = useDisclosure()

        return (
            <div>
                {createRoleModalState.isOpen && (
                    <CreateRoleModal
                        isOpen={createRoleModalState.isOpen}
                        onClose={createRoleModalState.onClose}
                        allPermissions={permissionGroups}
                    />
                )}
                <AdminPageHeading
                    title="Roles & Permissions"
                    description="Review your members roles and allocate permissions"
                    actions={
                        <div className="flex gap-3">
                            <Button
                                color="primary"
                                onPress={createRoleModalState.onOpen}
                                startContent={<Plus size={18} />}
                                className="font-medium shadow-sm w-full sm:w-auto"
                            >
                                Create New Role
                            </Button>
                            <Dropdown placement="bottom-end">
                                <DropdownTrigger>
                                    <HeroButton
                                        isIconOnly
                                        variant="bordered"
                                        color="default"
                                        className="min-w-unit-10"
                                    >
                                        <MoreHorizontalIcon size={20} />
                                    </HeroButton>
                                </DropdownTrigger>
                                <DropdownMenu>
                                    <DropdownSection title="Actions">
                                        <DropdownItem
                                            key="allPerms"
                                            onPress={() =>
                                                router.navigate({
                                                    href: INTERNAL_URLS
                                                        .management.permissions,
                                                })
                                            }
                                        >
                                            View all Permissions
                                        </DropdownItem>
                                    </DropdownSection>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    }
                />
                <AdminContentContainer className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <StatCard
                            title="Roles"
                            value={roles.length}
                            icon={<ShieldCheck className="text-primary" />}
                        />
                        <StatCard
                            title="Permissions"
                            value={permissions.length}
                            icon={<Lock className="text-secondary" />}
                        />
                        <StatCard
                            title="Moderators"
                            value="12"
                            icon={<Users className="text-success" />}
                        />
                        <StatCard
                            title="Administrators"
                            value="24h"
                            icon={<Activity className="text-warning" />}
                        />
                    </div>
                    <RolePermissionOverviewPage roles={roles} />
                </AdminContentContainer>
            </div>
        )
    },
})

interface RolePermissionOverviewProps {
    roles: TRole[]
}
export default function RolePermissionOverviewPage({
    roles,
}: RolePermissionOverviewProps) {
    const router = useRouter()

    const [searchQuery, setSearchQuery] = useState('')

    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

    // Filter roles based on search query (checks name and code)
    const filteredRoles = useMemo(() => {
        if (!searchQuery.trim()) return roles

        const lowerCaseQuery = searchQuery.toLowerCase()
        return roles.filter(
            (role) =>
                role.displayName.toLowerCase().includes(lowerCaseQuery) ||
                role.code.toLowerCase().includes(lowerCaseQuery)
        )
    }, [roles, searchQuery])

    return (
        <div className="max-w-7xl mx-auto">
            <Card shadow="none" className="border border-border-default">
                {/* --- HEADER: Search & View Toggles on the same row --- */}
                <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 pt-6">
                    <Input
                        isClearable
                        className="w-full sm:max-w-md"
                        placeholder="Search roles by name or code..."
                        startContent={
                            <Search className="text-default-400" size={18} />
                        }
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        onClear={() => setSearchQuery('')}
                        variant="faded"
                    />

                    {/* Custom Toggle Buttons */}
                    <Tabs
                        aria-label="View Mode Toggle"
                        selectedKey={viewMode}
                        onSelectionChange={(key) =>
                            setViewMode(key as 'list' | 'grid')
                        }
                        size="md"
                        classNames={{
                            tabList: 'bg-default-100 rounded-lg p-1',
                            cursor: 'bg-background shadow-sm rounded-md',
                            tab: 'h-8 px-4',
                            tabContent:
                                'group-data-[selected=true]:text-foreground text-default-500 font-medium',
                        }}
                    >
                        <Tab
                            key="list"
                            title={
                                <div className="flex items-center gap-2">
                                    <List size={16} />
                                    <span className="text-sm">List</span>
                                </div>
                            }
                        />
                        <Tab
                            key="grid"
                            title={
                                <div className="flex items-center gap-2">
                                    <LayoutGrid size={16} />
                                    <span className="text-sm">Grid</span>
                                </div>
                            }
                        />
                    </Tabs>
                </CardHeader>

                {/* --- BODY: Conditionally render List or Grid based on state --- */}
                <CardBody>
                    {viewMode === 'list' ? (
                        /* --- LIST VIEW --- */
                        <Table
                            aria-label="Roles Management Table"
                            classNames={{
                                wrapper: 'shadow-none',
                                td: 'py-2',
                            }}
                        >
                            <TableHeader>
                                <TableColumn width={300}>ROLE NAME</TableColumn>
                                <TableColumn>SYSTEM CODE</TableColumn>
                                <TableColumn>MEMBERS</TableColumn>
                                <TableColumn align="end">ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody
                                emptyContent={
                                    searchQuery
                                        ? 'No roles found matching your search.'
                                        : 'No roles available.'
                                }
                            >
                                {filteredRoles.map((role) => (
                                    <TableRow
                                        key={role.id}
                                        className="hover:bg-default-50/50 transition-colors"
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-default-100 rounded-lg text-default-500">
                                                    <Shield size={16} />
                                                </div>
                                                <span className="font-semibold text-sm">
                                                    {role.displayName}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                className="font-mono text-xs"
                                            >
                                                {role.code}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-default-600">
                                                <Users
                                                    size={16}
                                                    className="text-default-400"
                                                />
                                                {role.users?.length || 0}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Tooltip content="View detail">
                                                    <Button
                                                        isIconOnly
                                                        radius="full"
                                                        variant="flat"
                                                        onPress={() =>
                                                            router.navigate({
                                                                href: INTERNAL_URLS.management.roleDetail(
                                                                    role.code
                                                                ),
                                                            })
                                                        }
                                                    >
                                                        <Eye fontSize={16} />
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        /* --- GRID VIEW --- */
                        <div className="p-6">
                            {filteredRoles.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-default-500 bg-default-50 rounded-2xl mt-2 border border-dashed border-divider">
                                    <Search
                                        size={32}
                                        className="mb-4 text-default-300"
                                    />
                                    <p>
                                        No roles found matching "{searchQuery}"
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                    {filteredRoles.map((role) => (
                                        <HeroCard
                                            key={role.id}
                                            className="border border-border-default p-2"
                                            shadow="none"
                                        >
                                            <HeroCardBody className="space-y-6">
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
                                                        {role.users?.length ||
                                                            0}{' '}
                                                        Member
                                                        {role.users?.length >= 2
                                                            ? 's'
                                                            : ''}
                                                    </Chip>
                                                </div>

                                                <p className="text-sm text-text-subdued leading-relaxed min-h-12">
                                                    Full access to manage
                                                    members, billing, and
                                                    organization-wide settings.
                                                </p>

                                                <div className="flex justify-between items-center pt-2">
                                                    <AvatarGroup
                                                        isBordered
                                                        max={5}
                                                        renderCount={(
                                                            count
                                                        ) => (
                                                            <p className="text-small text-foreground font-medium ms-2">
                                                                +{count} others
                                                            </p>
                                                        )}
                                                    >
                                                        {role.users.map(
                                                            (it) => {
                                                                return (
                                                                    <Avatar
                                                                        key={
                                                                            it.id
                                                                        }
                                                                        src={
                                                                            it.avatar
                                                                        }
                                                                    />
                                                                )
                                                            }
                                                        )}
                                                    </AvatarGroup>
                                                    <Button
                                                        onPress={() =>
                                                            router.navigate({
                                                                href: INTERNAL_URLS.management.roleDetail(
                                                                    role.code
                                                                ),
                                                            })
                                                        }
                                                        startContent={
                                                            <Eye
                                                                fontSize={14}
                                                            />
                                                        }
                                                    >
                                                        View
                                                    </Button>
                                                </div>
                                            </HeroCardBody>
                                        </HeroCard>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    )
}

function StatCard({ title, value, icon }: any) {
    return (
        <Card shadow="none" className="border border-border-default">
            <CardBody className="flex flex-row items-center gap-4 p-5">
                <div className="p-3 bg-background-hovered rounded-2xl">
                    {icon}
                </div>
                <div>
                    <p className="text-xs font-medium text-text-subdued tracking-widest">
                        {title}
                    </p>
                    <p className="text-2xl font-black">{value}</p>
                </div>
            </CardBody>
        </Card>
    )
}
