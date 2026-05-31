import { COLORS } from '@/presentation/lib'
import {
    departmentsListOptions,
    usersListOptions,
} from '@/presentation/lib/queries'
import { RouteUtil } from '@/presentation/lib/utils'
import { Button, Input, Select, SelectItem, Spinner } from '@heroui/react'
import AdminContentContainer from '@presentation/components/admin/AdminContentContainer'
import { VIEW_OPTIONS } from '@presentation/routes/_administrator/mgmt/staff-directory'
import { useSuspenseQueries } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import lodash from 'lodash'
import { Filter, RefreshCw, Search } from 'lucide-react'
import { useMemo } from 'react'
import ViewContentDropdown from './_components/dropdowns/ViewContentDropdown'
import StaffDirectoryGrid from './_components/views/StaffDirectoryGrid'
import StaffDirectoryTable from './_components/views/StaffDirectoryTable'

export function StaffDirectoryPage() {
    const searchParams = useSearch({
        from: '/_administrator/mgmt/staff-directory/',
    })

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
        RouteUtil.updateParams({ page: newPage })
    }

    const handleLimitChange = (newLimit: number) =>
        RouteUtil.updateParams({ limit: newLimit })

    const handleSearchChange = (newSearch?: string) =>
        RouteUtil.updateParams({
            search: newSearch,
            page: 1,
        })

    const handleViewChange = (newView: any) =>
        RouteUtil.updateParams({
            view: newView,
            page: 1,
        })

    const handleFilters = (deptId: string) =>
        RouteUtil.updateParams({
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
