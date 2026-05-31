import { jobTitleOptions } from '@/presentation/lib/queries'
import { AppLoading } from '@presentation/components'
import { JobTitleDetailPage } from '@presentation/features/administrator/management/job-title/detail'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_administrator/mgmt/job-titles/$code')({
    loader: ({ context, params }) =>
        context.queryClient.ensureQueryData(jobTitleOptions(params.code)),
    pendingComponent: AppLoading,
    component: JobTitleDetailPage,
})
