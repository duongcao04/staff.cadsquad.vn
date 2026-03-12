import { optimizeCloudinary } from '@/lib'
import { TanStackHeroTable } from '@/shared/components/ui/tanstack-hero-table'
import { TUser } from '@/shared/types' // Replace with your actual User type
import { Button, Chip, Pagination, User } from '@heroui/react'
import {
    createColumnHelper,
    getCoreRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table'
import { Mail, Phone, ShieldCheck } from 'lucide-react'
import { useMemo } from 'react'
import { StaffDropdown } from '../dropdowns/StaffDropdown'

const columnHelper = createColumnHelper<TUser>()

export const staffColumns = [
    // 1. User Identity (Avatar + Name + Email)
    columnHelper.accessor('displayName', {
        header: 'Employee',
        cell: (info) => (
            <User
                name={info.getValue()}
                description={info.row.original.email}
                avatarProps={{
                    src: optimizeCloudinary(info.row.original.avatar),
                    radius: 'full',
                    color: 'primary',
                }}
                classNames={{
                    name: 'font-bold text-default-700',
                    description: 'text-tiny text-text-default',
                }}
            />
        ),
    }),

    // 2. Role (Color-coded Badge)
    columnHelper.accessor('role', {
        header: 'Role',
        cell: (info) => {
            const role = info.getValue()
            return (
                <Chip
                    size="sm"
                    variant="flat"
                    className="capitalize font-medium gap-1"
                    style={{
                        backgroundColor: `${role?.hexColor}20`, // 20% opacity background
                        color: role?.hexColor,
                        borderColor: role?.hexColor,
                    }}
                    startContent={<ShieldCheck size={14} />}
                >
                    {role?.displayName || 'No Role'}
                </Chip>
            )
        },
    }),

    // 3. Department
    columnHelper.accessor('department', {
        header: 'Department',
        cell: (info) => (
            <div className="flex flex-col">
                <span className="text-tiny text-text-default">
                    {info.getValue()?.displayName || 'Member'}
                </span>
            </div>
        ),
    }),

    // 4. Status (Active/Inactive)
    columnHelper.accessor('isActive', {
        header: 'Status',
        cell: (info) => (
            <Chip
                startContent={
                    <div
                        className={`size-2 rounded-full ${info.getValue() ? 'bg-success' : 'bg-default-400'}`}
                    />
                }
                variant="light"
                size="sm"
                classNames={{ base: 'pl-0' }}
            >
                {info.getValue() ? 'Active' : 'Inactive'}
            </Chip>
        ),
    }),

    // 5. Contact Info (Icons)
    columnHelper.display({
        id: 'contact',
        header: 'Contact',
        cell: ({ row }) => (
            <div className="flex gap-2">
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    as="a"
                    href={`mailto:${row.original.email}`}
                >
                    <Mail size={16} className="text-default-500" />
                </Button>
                {row.original.phoneNumber && (
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        as="a"
                        href={`tel:${row.original.phoneNumber}`}
                    >
                        <Phone size={16} className="text-default-500" />
                    </Button>
                )}
            </div>
        ),
    }),

    // 6. Actions (Dropdown)
    columnHelper.display({
        id: 'actions',
        cell: ({ row }) => (
            <div className="flex justify-end">
                <StaffDropdown selectedUser={row.original} />
            </div>
        ),
    }),
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
}
export default function StaffDirectoryTable({
    data,
    isLoading,
    pagination,
    sortString,
    onSortChange,
    onPageChange,
}: Props) {
    // 1. Sync Sorting State
    const sorting = useMemo<SortingState>(() => {
        if (!sortString) return []
        const [id, dir] = sortString.split(':')
        return [{ id, desc: dir === 'desc' }]
    }, [sortString])

    // 2. Initialize Table
    const table = useReactTable({
        data,
        columns: staffColumns,
        state: { sorting },
        manualSorting: true,
        manualPagination: true,
        rowCount: pagination.total,
        onSortingChange: (updater) => {
            if (typeof updater === 'function') {
                const newSort = updater(sorting)
                if (newSort[0]) {
                    onSortChange(
                        `${newSort[0].id}:${newSort[0].desc ? 'desc' : 'asc'}`
                    )
                }
            }
        },
        getCoreRowModel: getCoreRowModel(),
    })

    // 4. Bottom Controls (Pagination)
    const bottomContent = (
        <div className="flex w-full justify-center">
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
    )

    return (
        <div className="space-y-4">
            <TanStackHeroTable
                table={table}
                isLoading={isLoading}
                bottomContent={bottomContent}
                bottomContentPlacement="outside"
                classNames={{
                    wrapper: 'min-h-[500px]',
                }}
            />
        </div>
    )
}
