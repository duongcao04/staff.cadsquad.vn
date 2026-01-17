import { useTransition } from 'react'
import { Route, TProjectCenterSearch } from '../$tab'

export function useProjectCenterFilters() {
    const navigate = Route.useNavigate()
    const search = Route.useSearch()
    const [isPending, startTransition] = useTransition()

    const updateParams = (newParams: Partial<TProjectCenterSearch>) => {
        startTransition(() => {
            navigate({
                search: (prev) => ({ ...prev, ...newParams }),
                replace: true,
            })
        })
    }

    return {
        search,
        isPending,
        updateParams,
        // Helper wrappers for specific actions
        onSearchChange: (search?: string) =>
            updateParams({ search: search || undefined, page: 1 }),
        onSortChange: (sort: string) => updateParams({ sort, page: 1 }),
        onPageChange: (page: number) => updateParams({ page }),
        onLimitChange: (limit: number) => updateParams({ limit, page: 1 }),
        onFiltersChange: (filters: Partial<TProjectCenterSearch>) =>
            updateParams({ ...filters, page: 1 }),
    }
}
