import { CreateJobPage } from '@/features/job-manage/create/CreateJobPage'
import { AppLoading } from '@/shared/components'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_administrator/mgmt/jobs/create')({
    staticData: {
        showHeader: false,
    },
    head: () => ({
        meta: [
            {
                title: 'Create new job',
            },
        ],
    }),
    pendingComponent: AppLoading,
    component: () => {
        return (
            <CreateJobPageLayout>
                <CreateJobPage />
            </CreateJobPageLayout>
        )
    },
})

function CreateJobPageLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminContentContainer
            showHeader
            headerProps={{
                title: 'Create New Job',
                description:
                    'Initialize a new project workspace and synchronize SharePoint directories.',
                canBack: true,
            }}
        >
            {children}
        </AdminContentContainer>
    )
}
