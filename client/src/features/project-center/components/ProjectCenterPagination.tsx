import { TABLE_ROW_PER_PAGE_OPTIONS } from '@/lib/utils'
import { HeroSelect, HeroSelectItem } from '@/shared/components'
import { Pagination } from '@heroui/react'

type Props = {
    pagination: {
        limit: number
        page: number
        totalPages: number
    }
    onLimitChange: (limit: number) => void
    onPageChange: (page: number) => void
}

export function ProjectCenterPagination({
    pagination,
    onLimitChange,
    onPageChange,
}: Props) {
    return (
        <div className="py-2 grid grid-cols-3 gap-5">
            <HeroSelect
                className="w-40 border-px"
                label="Rows per page"
                variant="bordered"
                classNames={{ trigger: 'shadow-SM' }}
                size="sm"
                selectionMode="single"
                defaultSelectedKeys={[pagination.limit.toString()]}
                onSelectionChange={(keys) =>
                    onLimitChange(Number(keys.currentKey))
                }
            >
                {TABLE_ROW_PER_PAGE_OPTIONS.map((opt) => (
                    <HeroSelectItem key={opt.value}>
                        {opt.displayName}
                    </HeroSelectItem>
                ))}
            </HeroSelect>
            <div className="flex items-center justify-center">
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
            <div className="hidden sm:flex w-[30%] justify-end gap-2"></div>
        </div>
    )
}
