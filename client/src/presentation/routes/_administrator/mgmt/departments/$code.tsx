import { departmentOptions } from '@/presentation/lib/queries'
import { AppLoading } from '@presentation/components'
import { DepartmentDetailPage } from '@presentation/features/administrator/management/department/detail'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_administrator/mgmt/departments/$code')({
    loader: ({ context, params }) => {
        return context.queryClient.ensureQueryData(
            departmentOptions(params.code)
        )
    },
    pendingComponent: AppLoading,
    component: DepartmentDetailPage,
})
