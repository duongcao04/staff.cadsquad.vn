import { TJobFilters } from '@/lib/validationSchemas'
import { useCallback, useTransition } from 'react'
import { Route, TWorkbenchSearch } from '../index'

export function useWorkbenchFilters() {
    const navigate = Route.useNavigate()
    const search = Route.useSearch()
    const [isPending, startTransition] = useTransition()

    const updateParams = useCallback(
        (newParams: Partial<TWorkbenchSearch>) => {
            startTransition(() => {
                navigate({
                    search: (prev) => ({ ...prev, ...newParams }),
                    replace: true,
                })
            })
        },
        [navigate]
    )

    return {
        search,
        isPending,
        updateParams,
        onSearchChange: (search?: string) =>
            updateParams({ search: search || undefined, page: 1 }),
        onSortChange: (sort: string) => updateParams({ sort, page: 1 }),
        onPageChange: (page: number) => updateParams({ page }),
        onLimitChange: (limit: number) => updateParams({ limit, page: 1 }),
        onFiltersChange: (filters: Partial<TJobFilters>) =>
            updateParams({ ...filters, page: 1 }),
    }
}
