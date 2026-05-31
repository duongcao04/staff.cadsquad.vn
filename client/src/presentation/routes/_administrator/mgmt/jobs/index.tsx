import { getDateRangeOptions } from '@/presentation/features/job-manage'
import {
    adminJobStatsOptions,
    jobsListOptions,
} from '@/presentation/lib/queries'
import { AppLoading } from '@presentation/components'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { JobManagementPage } from '../../../../features/administrator/management/jobs'

export enum EJobManagementTableTabs {
    ALL = 'all',
    PRIORITY = 'priority',
    ACTIVE = 'active',
    LATE = 'late',
    DELIVERED = 'delivered',
    COMPLETED = 'completed',
    FINISHED = 'finished',
    CANCELED = 'cancelled',
}

const DEFAULT_SORT = 'displayName:asc'
export const manageJobsParamsSchema = z.object({
    sort: z.string().optional().catch(DEFAULT_SORT),
    search: z.string().trim().optional(),
    status: z.string().optional(),
    dateRange: z.string().optional().catch('this_year'),
    limit: z.coerce.number().int().min(1).max(100).optional().catch(10),
    page: z.coerce.number().int().min(1).optional().catch(1),
    dueIn: z.string().optional(),
    tab: z
        .nativeEnum(EJobManagementTableTabs)
        .catch(EJobManagementTableTabs.ALL),
})
export type TManageJobsParams = z.infer<typeof manageJobsParamsSchema>

export const Route = createFileRoute('/_administrator/mgmt/jobs/')({
    head: () => ({
        meta: [{ title: 'Job Management' }],
    }),
    validateSearch: (search) => manageJobsParamsSchema.parse(search),
    loaderDeps: ({ search }) => ({ search }),
    loader: ({ context, deps }) => {
        const {
            limit = 10,
            page = 1,
            search,
            status,
            sort = DEFAULT_SORT,
            dateRange = 'this_year',
        } = deps.search

        const dateRangeOptions = getDateRangeOptions()
        const dateRangeOption = dateRangeOptions.find(
            (it) => dateRange === it.key
        )

        context.queryClient.prefetchQuery(
            jobsListOptions({
                limit,
                page,
                search,
                sort: [sort],
            })
        )
        context.queryClient.prefetchQuery(
            adminJobStatsOptions({
                from: dateRangeOption?.from?.toISOString(),
                to: dateRangeOption?.to?.toISOString(),
            })
        )
    },
    pendingComponent: AppLoading,
    component: JobManagementPage,
})
