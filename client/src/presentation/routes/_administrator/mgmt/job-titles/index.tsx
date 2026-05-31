import { jobTitlesListOptions } from '@/presentation/lib/queries'
import { AppLoading } from '@presentation/components'
import { JobTitlesPage } from '@presentation/features/administrator/management/job-title'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

enum ViewOptions {
    TABLE = 'table',
    GRID = 'grid',
}
export const jobTitleManageSchema = z.object({
    tab: z.nativeEnum(ViewOptions).default(ViewOptions.TABLE),
})
export type TJobTitleManageSchema = z.infer<typeof jobTitleManageSchema>

export const Route = createFileRoute('/_administrator/mgmt/job-titles/')({
    validateSearch: (search) => jobTitleManageSchema.parse(search),
    loaderDeps: ({ search }) => ({ search }),
    head: () => ({ meta: [{ title: 'Job Title Management' }] }),
    loader: ({ context }) =>
        context.queryClient.ensureQueryData(jobTitlesListOptions()),
    pendingComponent: AppLoading,
    component: JobTitlesPage,
})
