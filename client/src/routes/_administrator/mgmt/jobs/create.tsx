import CreateJobForm from '@/features/job-manage/components/forms/CreateJobForm'
import {
    copySharepointItemOptions,
    createJobOptions,
    getPageTitle,
    INTERNAL_URLS,
} from '@/lib'
import {
    AdminPageHeading,
    HeroBreadcrumbItem,
    HeroBreadcrumbs,
} from '@/shared/components'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import { addToast, Button } from '@heroui/react'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { ArrowLeft, Briefcase } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_administrator/mgmt/jobs/create')({
    head: () => ({
        meta: [
            {
                title: getPageTitle('Create New Job'),
            },
        ],
    }),
    component: CreateJobPage,
})

function CreateJobPage() {
    const router = useRouter()

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

            // Redirect back to job list upon success
            router.history.back()
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
                            <h1 className="text-2xl font-bold text-default-900 flex items-center gap-2">
                                <Briefcase size={24} className="text-primary" />
                                Create New Job
                            </h1>
                            <p className="text-sm text-default-500">
                                Initialize a new project workspace and
                                synchronize SharePoint directories.
                            </p>
                        </div>
                    </div>
                }
            />

            <AdminContentContainer className="pt-0 space-y-6">
                <HeroBreadcrumbs className="text-xs">
                    <HeroBreadcrumbItem>
                        <Link
                            to={INTERNAL_URLS.admin.overview}
                            className="text-default-500 hover:text-default-900"
                        >
                            Management
                        </Link>
                    </HeroBreadcrumbItem>
                    <HeroBreadcrumbItem>
                        <Link
                            to={INTERNAL_URLS.management.jobs}
                            className="text-default-500 hover:text-default-900"
                        >
                            Jobs Directory
                        </Link>
                    </HeroBreadcrumbItem>
                    <HeroBreadcrumbItem>Create Job</HeroBreadcrumbItem>
                </HeroBreadcrumbs>

                <div className="max-w-5xl mx-auto w-full bg-background rounded-xl border border-default-200 shadow-sm p-4 md:p-8">
                    <CreateJobForm
                        isSubmitting={isSubmitting}
                        rootSharepointFolderId={rootSharepointFolderId}
                        setRootSharepointFolderId={setRootSharepointFolderId}
                        onSubmit={handleSubmit}
                        afterSubmit={() => router.history.back()}
                    />
                </div>
            </AdminContentContainer>
        </>
    )
}
