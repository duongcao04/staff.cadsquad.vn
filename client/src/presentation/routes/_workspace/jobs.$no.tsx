import { useLayout } from '@/presentation/contexts'
import { useDevice } from '@/presentation/hooks'
import { ApiResponse, getPageTitle } from '@/presentation/lib'
import { jobByNoOptions } from '@/presentation/lib/queries'
import { TJob } from '@/presentation/types'
import { JobDetailPage } from '@presentation/features/user-workspace/jobs/detail'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { z } from 'zod'

export enum JobDetailTabEnum {
    OVERVIEW = 'overview',
    FINANCIALS = 'financials',
    team = 'team',
    ATTACHMENTS = 'attachments',
    COMMENTS = 'comments',
}
export const jobDetailSearchSchema = z.object({
    tab: z.nativeEnum(JobDetailTabEnum).catch(JobDetailTabEnum.OVERVIEW),
})
export type TJobDetailSearch = z.infer<typeof jobDetailSearchSchema>

export const Route = createFileRoute('/_workspace/jobs/$no')({
    head: (ctx) => {
        const response = ctx.loaderData as unknown as ApiResponse<TJob>
        return {
            meta: [
                { title: getPageTitle(response?.result?.displayName ?? 'Job') },
            ],
        }
    },
    validateSearch: (search): TJobDetailSearch =>
        jobDetailSearchSchema.parse(search),
    loader({ context, params }) {
        return context.queryClient.ensureQueryData({
            ...jobByNoOptions(params.no),
        })
    },
    component: () => {
        const { no } = Route.useParams()
        const { isSmallView } = useDevice()
        const { setShowHeader } = useLayout()

        useEffect(() => {
            if (isSmallView) {
                setShowHeader(false)
            }
            return () => setShowHeader(true)
        }, [setShowHeader])

        const { data: job } = useSuspenseQuery({
            ...jobByNoOptions(no),
        })
        return <JobDetailPage job={job} />
    },
})
