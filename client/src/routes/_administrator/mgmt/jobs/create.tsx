import {
    copySharepointItemOptions,
    createJobOptions,
    INTERNAL_URLS,
} from '@/lib'
import { AdminPageHeading, AppLoading } from '@/shared/components'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import {
    addToast,
    BreadcrumbItem,
    Breadcrumbs,
    Button,
    Card,
} from '@heroui/react'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import CreateJobForm from '../../../../features/job-manage/components/forms/CreateJobForm'

export const Route = createFileRoute('/_administrator/mgmt/jobs/create')({
    head: () => ({
        meta: [
            {
                title: 'Create New Job',
            },
        ],
    }),
    pendingComponent: AppLoading,
    component: () => {
        return (
            <CreateJobPageLayout>
                <CreateJobPageContent />
            </CreateJobPageLayout>
        )
    },
})

function CreateJobPageLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    return (
        <>
            <AdminPageHeading
                title={
                    <div className="flex items-center gap-4">
                        <Button
                            isIconOnly
                            variant="flat"
                            onPress={() => router.history.back()}
                        >
                            <ArrowLeft size={18} />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-text-default flex items-center gap-2">
                                Create New Job
                            </h1>
                            <p className="text-sm text-text-subdued font-normal">
                                Initialize a new project workspace and
                                synchronize SharePoint directories.
                            </p>
                        </div>
                    </div>
                }
            />

            <AdminContentContainer className="pt-0 space-y-6">
                <Breadcrumbs className="text-xs" underline="hover">
                    <BreadcrumbItem
                        as={Link}
                        href={INTERNAL_URLS.admin.overview}
                    >
                        Management
                    </BreadcrumbItem>
                    <BreadcrumbItem
                        as={Link}
                        href={INTERNAL_URLS.management.jobs}
                    >
                        Jobs
                    </BreadcrumbItem>
                    <BreadcrumbItem>Create Job</BreadcrumbItem>
                </Breadcrumbs>
                {children}
            </AdminContentContainer>
        </>
    )
}

function CreateJobPageContent() {
    const [rootSharepointFolderId, setRootSharepointFolderId] = useState<
        string | null
    >(null)

    const createJobMutation = useMutation(createJobOptions)
    const copySharepointMutation = useMutation(copySharepointItemOptions)

    // Combined loading state for the whole flow
    const isSubmitting =
        createJobMutation.isPending || copySharepointMutation.isPending

    const handleSubmit = async (values: any) => {
        try {
            const createData: any = {
                attachmentUrls: values.attachmentUrls,
                clientName: values.clientName,
                displayName: values.displayName,
                dueAt: values.dueAt,
                incomeCost: values.incomeCost,
                jobAssignments: values.jobAssignments,
                no: values.no,
                startedAt: values.startedAt,
                totalStaffCost: values.totalStaffCost,
                typeId: values.typeId,
                description: values.description,
                paymentChannelId: values.paymentChannelId,
                sharepointFolderId: '',
            }

            // 1. Handle SharePoint Folder Logic
            if (values.useExistingSharepointFolder) {
                createData['sharepointFolderId'] =
                    values.sharepointFolderId as string
            } else {
                const sharepointFolderName =
                    values.no +
                    '- ' +
                    values.clientName.toUpperCase() +
                    '_' +
                    values.displayName.toUpperCase()

                const newSharepointFolderId = await copySharepointMutation
                    .mutateAsync({
                        itemId: values.sharepointTemplateId as string,
                        destinationFolderId: rootSharepointFolderId as string,
                        newName: sharepointFolderName,
                    })
                    .then((res) => res.result.id)

                createData['sharepointFolderId'] =
                    newSharepointFolderId as string
            }

            // 2. Create Job in Database
            await createJobMutation.mutateAsync(createData)

            addToast({
                title: 'Job created successfully',
                color: 'success',
            })
        } catch (error) {
            console.error('Error creating job:', error)
            addToast({
                title: 'Failed to create job',
                description: 'An error occurred during job initialization.',
                color: 'danger',
            })
        }
    }

    return (
        <Card
            shadow="none"
            className="max-w-6xl mx-auto border border-border-default"
        >
            <CreateJobForm
                rootSharepointFolderId={rootSharepointFolderId}
                setDirtyForm={() => {}}
                setRootSharepointFolderId={setRootSharepointFolderId}
                onSubmit={handleSubmit}
            />
        </Card>
    )
}
