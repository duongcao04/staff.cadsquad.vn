import { WorkbenchPage } from '@presentation/features/user-workspace/workbench'
import { workbenchDataOptions } from '@presentation/lib/queries'
import { jobFiltersSchema } from '@presentation/lib/validationSchemas'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const DEFAULT_SORT = 'displayName:asc'
export const workbenchParamsSchema = z
    .object({
        sort: z.string().optional().catch(DEFAULT_SORT),
        search: z.string().trim().optional(),
        limit: z.coerce.number().int().min(1).max(100).optional().catch(10),
        page: z.coerce.number().int().min(1).optional().catch(1),
        showAll: z.coerce.boolean().optional().catch(false),
    })
    .merge(jobFiltersSchema)
export type TWorkbenchSearch = z.infer<typeof workbenchParamsSchema>

export const Route = createFileRoute('/_workspace/_workbench')({
    head: () => ({ meta: [{ title: 'Workbench' }] }),
    validateSearch: (search) => workbenchParamsSchema.parse(search),
    loaderDeps: ({ search }) => ({ search }),
    loader: ({ context, deps }) => {
        const {
            limit = 10,
            page = 1,
            search,
            sort = DEFAULT_SORT,
        } = deps.search
        void context.queryClient.ensureQueryData(
            workbenchDataOptions({ limit, page, search, sort: [sort] })
        )
    },
    component: WorkbenchPage,
})
