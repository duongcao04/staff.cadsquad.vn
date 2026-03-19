import { INTERNAL_URLS, optimizeCloudinary } from '@/lib'
import { TStaffSearchValues } from '@/routes/_administrator/mgmt/staff-directory/index'
import {
    HeroButton,
    HeroTable,
    HeroTableBody,
    HeroTableCell,
    HeroTableColumn,
    HeroTableHeader,
    HeroTableRow,
    HeroTooltip,
} from '@/shared/components'
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area'
import { TUser } from '@/shared/types'
import { Chip, Pagination, Spinner, User } from '@heroui/react'
import { Link } from '@tanstack/react-router'
import { EyeIcon, ShieldCheck } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { StaffDropdown } from '../dropdowns/StaffDropdown'

const STAFF_COLUMNS = [
    { uid: 'displayName', displayName: 'Staff', sortable: true },
    { uid: 'role', displayName: 'Role', sortable: true },
    { uid: 'department', displayName: 'Department', sortable: true },
    { uid: 'isActive', displayName: 'Status', sortable: true },
    { uid: 'contact', displayName: 'Contact', sortable: false },
    { uid: 'actions', displayName: '', sortable: false },
]

type Props = {
    data: TUser[]
    isLoading: boolean
    pagination: {
        page: number
        limit: number
        totalPages: number
        total: number
    }
    sortString?: string
    onSortChange: (sortStr: string) => void
    onPageChange: (page: number) => void
    onSearch: (term: string) => void
    searchParams: TStaffSearchValues
}

export default function StaffDirectoryTable({
    data,
    isLoading,
    pagination,
    sortString,
    onSortChange,
    onPageChange,
    searchParams,
}: Props) {
    // --- Cell Logic ---
    const renderCell = useCallback(
        (user: TUser, columnKey: string) => {
            switch (columnKey) {
                case 'displayName':
                    return (
                        <User
                            name={user.displayName}
                            description={
                                <p className="text-text-subdued">
                                    # {user.code}
                                </p>
                            }
                            avatarProps={{
                                src: optimizeCloudinary(user.avatar),
                                radius: 'full',
                                color: 'primary',
                            }}
                            classNames={{
                                name: 'font-semibold text-text-default',
                                description: 'text-tiny text-text-default',
                            }}
                        />
                    )
                case 'role': {
                    const role = user.role
                    return (
                        <Chip
                            size="sm"
                            variant="flat"
                            className="capitalize font-medium gap-1"
                            style={{
                                backgroundColor: `${role?.hexColor}20`,
                                color: role?.hexColor,
                                borderColor: role?.hexColor,
                            }}
                            startContent={<ShieldCheck size={14} />}
                        >
                            {role?.displayName || 'No Role'}
                        </Chip>
                    )
                }
                case 'department':
                    return (
                        <div className="flex flex-col">
                            <span className="text-tiny text-text-default">
                                {user.department?.displayName || 'Member'}
                            </span>
                        </div>
                    )
                case 'isActive':
                    return (
                        <Chip
                            variant="flat"
                            size="sm"
                            color={user.isActive ? 'success' : 'danger'}
                        >
                            {user.isActive ? 'Active' : 'Inactive'}
                        </Chip>
                    )
                case 'contact':
                    return (
                        <div>
                            <p>{user.email}</p>
                            {user.phoneNumber && (
                                <p className="text-tiny">
                                    Tel: {user.phoneNumber}
                                </p>
                            )}
                        </div>
                    )
                case 'actions':
                    return (
                        <div className="flex justify-end gap-1">
                            <HeroTooltip content="View detail">
                                <Link
                                    to={INTERNAL_URLS.management.staffDetail(
                                        user.code
                                    )}
                                >
                                    <HeroButton
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                    >
                                        <EyeIcon size={16} />
                                    </HeroButton>
                                </Link>
                            </HeroTooltip>
                            <StaffDropdown selectedUser={user} />
                        </div>
                    )
                default:
                    return null
            }
        },
        [searchParams]
    )

    // --- Bottom Content (Pagination) ---
    const bottomContent = useMemo(
        () => (
            <div className="flex w-full justify-center py-2">
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={pagination.page}
                    total={pagination.totalPages}
                    onChange={onPageChange}
                />
            </div>
        ),
        [pagination.page, pagination.totalPages, onPageChange, searchParams]
    )

    return (
        <HeroTable
            key="staff-directory-table"
            isHeaderSticky
            aria-label="Staff directory table"
            bottomContentPlacement="outside"
            bottomContent={bottomContent}
            sortString={sortString}
            onSortStringChange={onSortChange}
            BaseComponent={(found) => (
                <ScrollArea className="size-full h-full! border border-border p-2 rounded-md min-h-[calc(100%-150px)]">
                    <ScrollBar orientation="horizontal" />
                    <ScrollBar orientation="vertical" />
                    {found.children}
                </ScrollArea>
            )}
            classNames={{
                table: !isLoading ? 'relative' : 'relative min-h-[430px]!',
            }}
        >
            <HeroTableHeader columns={STAFF_COLUMNS}>
                {(column) => (
                    <HeroTableColumn
                        key={column.uid}
                        align={column.uid === 'actions' ? 'center' : 'start'}
                        allowsSorting={column.sortable}
                    >
                        {column.displayName}
                    </HeroTableColumn>
                )}
            </HeroTableHeader>

            <HeroTableBody
                emptyContent={'No staff members found'}
                items={isLoading ? [] : data}
                loadingContent={
                    <div className="flex w-full flex-col items-center justify-center gap-4 rounded-xl bg-content1/50 min-h-75">
                        <Spinner
                            size="lg"
                            color="primary"
                            label="Loading data..."
                        />
                    </div>
                }
                isLoading={isLoading}
            >
                {(item) => (
                    <HeroTableRow key={item.id}>
                        {(columnKey) => (
                            <HeroTableCell>
                                {renderCell(item as TUser, columnKey as string)}
                            </HeroTableCell>
                        )}
                    </HeroTableRow>
                )}
            </HeroTableBody>
        </HeroTable>
    )
}
