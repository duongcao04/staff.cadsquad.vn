import { RouteUtil } from '@/utils'
import { TJobFilters } from '@core/validations'
import { useSearch } from '@tanstack/react-router'
import { useTransition } from 'react'

export function useWorkbenchFilters() {
    const search = useSearch({
        from: '/_workspace/_workbench/',
    })
    const [isPending] = useTransition()

    return {
        search,
        isPending,
        updateParams: RouteUtil.updateParams,
        onSearchChange: (search?: string) =>
            RouteUtil.updateParams({ search: search || undefined, page: 1 }),
        onSortChange: (sort: string) =>
            RouteUtil.updateParams({ sort, page: 1 }),
        onPageChange: (page: number) => RouteUtil.updateParams({ page }),
        onLimitChange: (limit: number) =>
            RouteUtil.updateParams({ limit, page: 1 }),
        onFiltersChange: (filters: Partial<TJobFilters>) =>
            RouteUtil.updateParams({ ...filters, page: 1 }),
    }
}
