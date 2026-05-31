import { jobFiltersSchema } from '@core/validations'
import { ProjectCenterTabEnum } from '@presentation/enums'
import { ProjectCenterPage } from '@presentation/features/user-workspace/project-center'
import { ProjectCenterLayout } from '@presentation/features/user-workspace/project-center/layout'
import {
    jobsListOptions,
    jobStatusesListOptions,
    jobTypesListOptions,
    paymentChannelsListOptions,
    usersListOptions,
} from '@presentation/lib/queries'
import { createFileRoute, redirect } from '@tanstack/react-router'
import lodash from 'lodash'
import { z } from 'zod'

const DEFAULT_SORT = 'displayName:asc'
export const projectCenterParamsSchema = z
    .object({
        sort: z.string().optional().catch(DEFAULT_SORT),
        search: z.string().trim().optional(),
        limit: z.coerce.number().int().min(1).max(100).optional().catch(10),
        page: z.coerce.number().int().min(1).optional().catch(1),
    })
    .merge(jobFiltersSchema)
export type TProjectCenterSearch = z.infer<typeof projectCenterParamsSchema>

export const Route = createFileRoute('/_workspace/project-center/$tab')({
    head: ({ params }) => {
        const title =
            'Project Center' +
            ' - ' +
            lodash.upperFirst(params.tab.trim()) +
            ' jobs'
        return { meta: [{ title }] }
    },
    validateSearch: (search) => projectCenterParamsSchema.parse(search),
    parseParams: (params) => {
        const result = z.nativeEnum(ProjectCenterTabEnum).safeParse(params.tab)
        if (!result.success)
            throw redirect({ href: '/project-center/priority' })
        return { tab: result.data }
    },
    loaderDeps: ({ search }) => ({ search }),
    loader: async ({ context, deps, params }) => {
        const { search } = deps as { search: TProjectCenterSearch }
        const { tab } = params as { tab: ProjectCenterTabEnum }

        await Promise.all([
            context.queryClient.ensureQueryData(jobStatusesListOptions()),
            context.queryClient.ensureQueryData(jobTypesListOptions()),
            context.queryClient.ensureQueryData(paymentChannelsListOptions()),
            context.queryClient.ensureQueryData(usersListOptions()),
            context.queryClient.ensureQueryData(
                jobsListOptions({
                    ...search,
                    tab,
                })
            ),
        ])
    },
    component: () => {
        return (
            <ProjectCenterLayout>
                <ProjectCenterPage />
            </ProjectCenterLayout>
        )
    },
})
