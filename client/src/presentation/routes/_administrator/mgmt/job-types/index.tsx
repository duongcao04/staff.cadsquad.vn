import { AppLoading } from '@presentation/components'
import { JobTypesListPage } from '@presentation/features/administrator/management/job-types'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_administrator/mgmt/job-types/')({
    head: () => ({ meta: [{ title: 'Job Types Management' }] }),
    pendingComponent: AppLoading,
    component: JobTypesListPage,
})
