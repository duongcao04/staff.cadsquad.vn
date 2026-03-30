import ViewContentDropdown from '@/features/staff-directory/components/dropdowns/ViewContentDropdown'
import StaffDirectoryGrid from '@/features/staff-directory/components/views/StaffDirectoryGrid'
import StaffDirectoryTable from '@/features/staff-directory/components/views/StaffDirectoryTable'
import { COLORS } from '@/lib'
import { departmentsListOptions, usersListOptions } from '@/lib/queries'
import { getPageTitle, RouteUtil } from '@/lib/utils'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import {
    Button,
    Input,
    Select,
    SelectItem,
    Spinner,
    useDisclosure,
} from '@heroui/react'
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import lodash from 'lodash'
import {
    FileDownIcon,
    Filter,
    LayoutGridIcon,
    RefreshCw,
    Search,
    TableIcon,
    UserRoundPlusIcon,
} from 'lucide-react'
import { useMemo } from 'react'
import { z } from 'zod'
import CreateUserModal from '../../../../features/staff-directory/components/modals/CreateUserModal'
import { AdminPageHeading, HeroButton } from '../../../../shared/components'

// --- 1. CONSTANTS & SCHEMA ---
const VIEW_OPTIONS = [
    {
        key: 'table',
        label: 'List View',
        icon: TableIcon,
        description: 'Standard row layout',
    },
    {
        key: 'grid',
        label: 'Grid View',
        icon: LayoutGridIcon,
        description: 'Card gallery layout',
    },
]

const staffSearchSchema = z.object({
    page: z.number().catch(1),
    limit: z.number().catch(8),
    search: z.string().optional(),
    departmentId: z.string().optional(),
    // Fixed: Default to 'table' instead of 'grid'
    view: z.enum(['table', 'grid']).default('table'),
})

export type TStaffSearchValues = z.infer<typeof staffSearchSchema>

// --- 2. ROUTE DEFINITION ---
export const Route = createFileRoute('/_administrator/mgmt/staff-directory/')({
    validateSearch: (search) => staffSearchSchema.parse(search),
    loaderDeps: ({ search }) => ({
        page: search.page,
        limit: search.limit,
        search: search.search,
        departmentId: search.departmentId,
    }),
    head: () => {
        return {
            meta: [
                {
                    title: getPageTitle('Staff Directory'),
                },
            ],
        }
    },
    loader: async ({ context, deps }) => {
        const { departmentId, limit, page, search } = deps
        return Promise.all([
            context.queryClient.ensureQueryData(
                usersListOptions({
                    limit,
                    page,
                    sortBy: 'displayName',
                    sortOrder: 'asc',
                    departmentId,
                    search,
                })
            ),
            context.queryClient.ensureQueryData(departmentsListOptions()),
        ])
    },
    component: () => {
        const options = usersListOptions()
        const {
            data: { total },
        } = useSuspenseQuery(options)

        const createUserModalDisclosure = useDisclosure({
            id: 'CreateUserModal',
        })
        return (
            <>
                {createUserModalDisclosure.isOpen && (
                    <CreateUserModal
                        isOpen={createUserModalDisclosure.isOpen}
                        onClose={createUserModalDisclosure.onClose}
                    />
                )}
                <AdminPageHeading
                    title="Staff Directory"
                    showBadge
                    badgeCount={total}
                    actions={
                        <div className="flex gap-3">
                            <HeroButton
                                variant="flat"
                                color="default"
                                startContent={<FileDownIcon size={16} />}
                                className="hidden sm:flex"
                            >
                                Export
                            </HeroButton>
                            <HeroButton
                                color="primary"
                                className="px-6"
                                startContent={<UserRoundPlusIcon size={16} />}
                                onPress={createUserModalDisclosure.onOpen}
                            >
                                New Member
                            </HeroButton>
                        </div>
                    }
                />
                <StaffDirectoryPage />
            </>
        )
    },
})

// --- 3. MAIN PAGE COMPONENT ---
function StaffDirectoryPage() {
    const searchParams = Route.useSearch()

    const [
        {
            data: { users, total: totalUsers, totalPages },
            isFetching: isUsersLoading,
            refetch,
        },
        {
            data: { departments },
        },
    ] = useSuspenseQueries({
        queries: [
            {
                ...usersListOptions({
                    limit: searchParams.limit,
                    page: searchParams.page,
                    sortBy: 'displayName',
                    sortOrder: 'asc',
                    departmentId: searchParams.departmentId,
                    search: searchParams.search,
                }),
            },
            { ...departmentsListOptions() },
        ],
    })

    // --- Handlers ---
    const handlePageChange = (newPage: number) => {
        RouteUtil.updateParams<TStaffSearchValues>({ page: newPage })
    }

    const handleLimitChange = (newLimit: number) =>
        RouteUtil.updateParams<TStaffSearchValues>({ limit: newLimit })

    const handleSearchChange = (newSearch?: string) =>
        RouteUtil.updateParams<TStaffSearchValues>({
            search: newSearch,
            page: 1,
        })

    const handleViewChange = (newView: any) =>
        RouteUtil.updateParams<TStaffSearchValues>({
            view: newView,
            page: 1,
        })

    const handleFilters = (deptId: string) =>
        RouteUtil.updateParams<TStaffSearchValues>({
            departmentId: deptId === 'all' ? undefined : deptId,
            page: 1,
        })

    // Now debouncedSearchChange won't reset on every render
    const debouncedSearchChange = useMemo(
        () =>
            lodash.debounce((value: string) => handleSearchChange(value), 500),
        [handleSearchChange] // stable now because handleSearchChange is useCallback
    )

    return (
        <>
            <AdminContentContainer className="mt-1 pb-10">
                {/* --- Toolbar --- */}
                <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
                    <Input
                        isClearable
                        className="w-full md:max-w-md"
                        placeholder="Search name or email..."
                        startContent={
                            <Search size={18} className="text-default-400" />
                        }
                        value={searchParams.search}
                        onValueChange={(val) => {
                            if (!val)
                                handleSearchChange(undefined) // Instant reset on clear
                            else debouncedSearchChange(val)
                        }}
                        variant="bordered"
                    />

                    <Select
                        labelPlacement="outside"
                        className="w-full md:max-w-xs"
                        classNames={{
                            trigger: 'border-1 border-border-default',
                        }}
                        selectedKeys={
                            new Set([searchParams.departmentId || 'all'])
                        }
                        onSelectionChange={(keys) => {
                            const selectedValue = Array.from(keys)[0] as string
                            if (selectedValue) {
                                handleFilters(selectedValue)
                            }
                        }}
                        variant="bordered"
                        aria-label="Filter by department"
                        startContent={
                            <Filter size={16} className="text-text-subdued" />
                        }
                    >
                        {[
                            {
                                code: 'all-departments',
                                createdAt: new Date(),
                                displayName: 'All Departments',
                                hexColor: COLORS.white,
                                id: 'all',
                                notes: 'Empty',
                                updatedAt: new Date(),
                                users: [],
                            },
                            ...departments,
                        ].map((dept) => (
                            <SelectItem
                                key={dept.id}
                                textValue={dept.displayName}
                            >
                                {dept.displayName}
                            </SelectItem>
                        ))}
                    </Select>

                    <ViewContentDropdown
                        onSelectionChange={(value) => {
                            handleViewChange(value)
                        }}
                        options={VIEW_OPTIONS}
                        selectedKey={searchParams.view}
                    />

                    <div className="w-px mx-3 h-5 bg-text-muted"></div>

                    <div className="flex gap-3">
                        <Button
                            startContent={
                                isUsersLoading ? (
                                    <Spinner size="sm" />
                                ) : (
                                    <RefreshCw
                                        size={14}
                                        className="text-small"
                                    />
                                )
                            }
                            className="border-1"
                            variant="bordered"
                            onPress={() => {
                                refetch()
                            }}
                        >
                            <span className="font-medium">Refresh</span>
                        </Button>
                    </div>

                    <div className="ml-auto flex items-center gap-4">
                        <span className="text-default-400 text-xs font-medium">
                            {isUsersLoading
                                ? 'Syncing...'
                                : `${totalUsers || 0} members`}
                        </span>
                        <Select
                            size="sm"
                            className="w-20"
                            classNames={{
                                popoverContent: 'w-32!',
                                trigger: 'border-1 border-border-default',
                            }}
                            selectedKeys={[searchParams.limit.toString()]}
                            onChange={(e) =>
                                handleLimitChange(Number(e.target.value))
                            }
                            disallowEmptySelection
                            variant="bordered"
                            aria-label="Rows per page"
                        >
                            <SelectItem key="8" textValue="8">
                                8 / page
                            </SelectItem>
                            <SelectItem key="12" textValue="12">
                                12 / page
                            </SelectItem>
                            <SelectItem key="24" textValue="24">
                                24 / page
                            </SelectItem>
                        </Select>
                    </div>
                </div>

                <p className="text-xs text-default-500 font-medium order-2 md:order-1 mb-4">
                    Showing{' '}
                    {users.length > 0
                        ? (searchParams.page - 1) * searchParams.limit + 1
                        : 0}
                    {' - '}
                    {Math.min(
                        searchParams.page * searchParams.limit,
                        totalUsers || 0
                    )}
                    {' of '} {totalUsers || 0} users
                </p>

                {/* --- Content Area --- */}
                <div className="mt-4">
                    {searchParams.view === 'grid' ? (
                        <StaffDirectoryGrid
                            data={users}
                            isLoading={isUsersLoading}
                            searchParams={searchParams}
                            pagination={{
                                limit: searchParams.limit,
                                page: searchParams.page,
                                total: totalUsers,
                                totalPages: totalPages,
                            }}
                            onAddStaff={() => {}}
                            onPageChange={handlePageChange}
                        />
                    ) : (
                        <StaffDirectoryTable
                            data={users}
                            isLoading={isUsersLoading}
                            onPageChange={handlePageChange}
                            onSearch={handleSearchChange}
                            pagination={{
                                limit: searchParams.limit,
                                page: searchParams.page,
                                total: totalUsers,
                                totalPages: totalPages,
                            }}
                            onSortChange={() => {}}
                            sortString=""
                            searchParams={searchParams}
                        />
                    )}
                </div>
            </AdminContentContainer>
        </>
    )
}
