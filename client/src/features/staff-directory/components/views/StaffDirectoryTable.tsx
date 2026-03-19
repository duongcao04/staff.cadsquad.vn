import { optimizeCloudinary } from '@/lib'
import { TStaffSearchValues } from '@/routes/_administrator/mgmt/staff-directory/index'
import {
    HeroTable,
    HeroTableBody,
    HeroTableCell,
    HeroTableColumn,
    HeroTableHeader,
    HeroTableRow,
} from '@/shared/components'
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area'
import { TUser } from '@/shared/types'
import { Button, Chip, Pagination, Spinner, User } from '@heroui/react'
import { Mail, Phone, ShieldCheck } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { StaffDropdown } from '../dropdowns/StaffDropdown'

const STAFF_COLUMNS = [
    { uid: 'displayName', displayName: 'Employee', sortable: true },
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
                            description={user.email}
                            avatarProps={{
                                src: optimizeCloudinary(user.avatar),
                                radius: 'full',
                                color: 'primary',
                            }}
                            classNames={{
                                name: 'font-bold text-default-700',
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
                            startContent={
                                <div
                                    className={`size-2 rounded-full ${user.isActive ? 'bg-success' : 'bg-default-400'}`}
                                />
                            }
                            variant="light"
                            size="sm"
                            classNames={{ base: 'pl-0' }}
                        >
                            {user.isActive ? 'Active' : 'Inactive'}
                        </Chip>
                    )
                case 'contact':
                    return (
                        <div className="flex gap-2">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                as="a"
                                href={`mailto:${user.email}`}
                            >
                                <Mail size={16} className="text-default-500" />
                            </Button>
                            {user.phoneNumber && (
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    as="a"
                                    href={`tel:${user.phoneNumber}`}
                                >
                                    <Phone
                                        size={16}
                                        className="text-default-500"
                                    />
                                </Button>
                            )}
                        </div>
                    )
                case 'actions':
                    return (
                        <div className="flex justify-end">
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
