import { ProtectedRoute } from '@/presentation/guards/protected-route'
import { ApiResponse, APP_PERMISSIONS } from '@/presentation/lib'
import { jobByNoOptions } from '@/presentation/lib/queries'
import { TJob } from '@/presentation/types'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { JobDetailManagementPage } from '../../../../features/administrator/management/jobs/detail'
export const manageJobDetailParamsSchema = z.object({
    tab: z
        .enum(['details', 'financials', 'deliveries', 'team', 'activity']) // 1. Restrict to valid tabs
        .catch('details'), // 2. If url is ?tab=garbage, fallback to 'details'
    // .default('details'), // 3. If ?tab is missing, default to 'details'
})

export type TManageJobDetailParams = z.infer<typeof manageJobDetailParamsSchema>
export const Route = createFileRoute('/_administrator/mgmt/jobs/$no')({
    head: (ctx) => {
        const loader = ctx.loaderData as unknown as ApiResponse<TJob>
        return {
            meta: [{ title: loader?.result?.displayName ?? 'Job' }],
        }
    },
    validateSearch: (search) => manageJobDetailParamsSchema.parse(search),
    loaderDeps: ({ search }) => ({ search }),
    loader: ({ context, params }) => {
        const { no } = params
        context.queryClient.ensureQueryData(jobByNoOptions(no))
    },
    component: () => {
        return (
            <ProtectedRoute
                permissions={[
                    APP_PERMISSIONS.JOB.MANAGE,
                    APP_PERMISSIONS.JOB.UPDATE,
                    APP_PERMISSIONS.JOB.READ_ALL,
                    APP_PERMISSIONS.JOB.PAID,
                ]}
                requireAll
            >
                <JobDetailManagementPage />
            </ProtectedRoute>
        )
    },
})
