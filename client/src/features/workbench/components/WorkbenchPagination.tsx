import { TABLE_ROW_PER_PAGE_OPTIONS } from '@/lib/utils'
import { IPaginate } from '@/shared/interfaces'
import { Pagination, Select, SelectItem } from '@heroui/react'

type Props = {
    pagination: IPaginate
    onLimitChange: (newLimit: number) => void
    onPageChange: (newPage: number) => void
}

export function WorkbenchPagination({
    pagination,
    onLimitChange,
    onPageChange,
}: Props) {
    return (
        <div className="py-2 px-2 flex justify-between items-center">
            <Select
                className="w-40"
                label="Rows per page"
                variant="bordered"
                size="sm"
                selectedKeys={[pagination.limit.toString()]}
                onSelectionChange={(keys) =>
                    onLimitChange(Number(Array.from(keys)[0]))
                }
            >
                {TABLE_ROW_PER_PAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value}>{opt.displayName}</SelectItem>
                ))}
            </Select>
            <Pagination
                isCompact
                showControls
                color="primary"
                page={pagination.page}
                total={pagination.totalPages}
                onChange={onPageChange}
            />
            <div className="w-40" />
        </div>
    )
}
