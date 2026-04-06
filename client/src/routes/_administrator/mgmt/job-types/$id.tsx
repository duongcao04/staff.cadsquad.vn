import {
    addToast,
    Button,
    Card,
    CardBody,
    CardHeader,
    Divider,
    Input,
    Tooltip,
} from '@heroui/react'
import {
    useMutation,
    useQuery,
    useQueryClient,
    useSuspenseQuery,
} from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useFormik } from 'formik'
import {
    ChevronLeft,
    Cloud,
    ExternalLink,
    Folder,
    HelpCircle,
    Pencil,
    Save,
    Search,
    Settings,
    ShieldCheck,
} from 'lucide-react'
import { useState } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import { AdminPageHeading, AppLoading } from '@/shared/components'
import { ResolvePathModal } from '@/features/sharepoint'
import {
    dateFormatter,
    INTERNAL_URLS,
    jobTypeDetailOptions,
    sharepointFolderDetailOptions,
    updateJobTypeOptions,
    UpdateJobTypeSchema,
} from '@/lib'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'

export const Route = createFileRoute('/_administrator/mgmt/job-types/$id')({
    pendingComponent: AppLoading,
    component: JobTypeDetailPage,
})
function JobTypeDetailPage() {
    const { id } = Route.useParams()
    const queryClient = useQueryClient()
    const [isEditingFolder, setIsEditingFolder] = useState(false)
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)

    // 1. Fetch Main Job Type Data
    const { data: jobType } = useSuspenseQuery(jobTypeDetailOptions(id))

    // 2. Setup Update Mutation
    const updateTypeAction = useMutation({
        ...updateJobTypeOptions(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: jobTypeDetailOptions(id).queryKey,
            })
            addToast({
                title: 'Success',
                description: 'Job type updated',
                color: 'success',
            })
            setIsEditingFolder(false)
        },
        onError: (error: any) => {
            addToast({
                title: 'Error',
                description: error?.message,
                color: 'danger',
            })
        },
    })

    // 4. Form Management
    const formik = useFormik({
        initialValues: {
            displayName: jobType.displayName || '',
            code: jobType.code || '',
            hexColor: jobType.hexColor || '#000000',
            sharepointFolderId: jobType.sharepointFolderId || '',
        },
        validationSchema: toFormikValidationSchema(UpdateJobTypeSchema),
        enableReinitialize: true,
        onSubmit: async (values) => {
            await updateTypeAction.mutateAsync(
                {
                    displayName: values.displayName,
                    code: values.code,
                    hexColor: values.hexColor,
                },
                {
                    onSuccess() {
                        addToast({
                            title: 'Update successfully',
                            color: 'success',
                        })
                    },
                }
            )
        },
    })

    // 3. Setup SharePoint Folder Check Query
    const {
        data: folderData,
        refetch: checkFolder,
        isFetching: isCheckingFolder,
        isError: isFolderError,
    } = useQuery({
        ...sharepointFolderDetailOptions(formik.values.sharepointFolderId),
        enabled: false,
    })
    console.log(folderData);
    

    const handlePathResolved = (resolvedId: string) => {
        formik.setFieldValue('sharepointFolderId', resolvedId)
        setIsEditingFolder(true) // Ensure we are in edit mode to see the result
        setTimeout(() => checkFolder(), 100)
    }

    const handleAppyFolder = async () => {
        await updateTypeAction.mutateAsync(
            { sharepointFolderId: formik.values.sharepointFolderId },
            {
                onSuccess() {
                    addToast({ title: 'Apply successfully', color: 'success' })
                },
            }
        )
    }

    return (
        <div>
            <AdminPageHeading
                title={
                    <div className="flex items-center gap-3">
                        <Button
                            as={Link}
                            to={INTERNAL_URLS.management.jobTypes}
                            isIconOnly
                            variant="light"
                        >
                            <ChevronLeft size={20} />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {formik.values.displayName}
                            </h1>
                            <p className="text-sm text-text-subdued">
                                Code:{' '}
                                <span
                                    className="px-2 rounded transition-colors"
                                    style={{
                                        backgroundColor: `${formik.values.hexColor}30`,
                                        color: formik.values.hexColor,
                                    }}
                                >
                                    {formik.values.code}
                                </span>
                            </p>
                        </div>
                    </div>
                }
                actions={
                    <Button
                        color="primary"
                        startContent={<Save size={16} />}
                        onPress={() => formik.handleSubmit()}
                        isLoading={formik.isSubmitting}
                        isDisabled={!formik.dirty}
                        className="font-bold shadow-sm"
                    >
                        Save Changes
                    </Button>
                }
            />

            <AdminContentContainer className="p-6 mx-auto max-w-7xl space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT: Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card
                            shadow="none"
                            className="border border-default-200"
                        >
                            <CardHeader className="px-6 pt-6 flex items-center gap-2">
                                <Settings
                                    size={18}
                                    className="text-default-500"
                                />
                                <span className="text-sm font-bold uppercase tracking-wider">
                                    Core Settings
                                </span>
                            </CardHeader>
                            <CardBody className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    name="displayName"
                                    label="Type Name"
                                    labelPlacement="outside"
                                    variant="bordered"
                                    value={formik.values.displayName}
                                    onChange={formik.handleChange}
                                    className="md:col-span-2"
                                    isRequired
                                    classNames={{
                                        label: 'font-semibold',
                                    }}
                                />
                                <Input
                                    name="code"
                                    label="System Code"
                                    labelPlacement="outside"
                                    variant="bordered"
                                    value={formik.values.code}
                                    onChange={(e) =>
                                        formik.setFieldValue(
                                            'code',
                                            e.target.value.toUpperCase()
                                        )
                                    }
                                    isRequired
                                    classNames={{
                                        label: 'font-semibold',
                                    }}
                                />
                                <Input
                                    name="hexColor"
                                    label="Hex Color"
                                    labelPlacement="outside"
                                    variant="bordered"
                                    value={formik.values.hexColor ?? ''}
                                    onChange={formik.handleChange}
                                    startContent={
                                        <div
                                            className="w-4 h-4 rounded-full border border-black/10"
                                            style={{
                                                backgroundColor:
                                                    formik.values.hexColor ||
                                                    'transparent',
                                            }}
                                        />
                                    }
                                    classNames={{
                                        label: 'font-semibold',
                                    }}
                                />
                            </CardBody>
                        </Card>
                    </div>

                    {/* RIGHT: SharePoint & Metadata */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card
                            shadow="none"
                            className="border border-default-200"
                        >
                            <CardHeader className="px-5 py-4 border-b border-default-100 flex justify-between items-center bg-default-50/50">
                                <div className="flex items-center gap-2">
                                    <Cloud
                                        size={16}
                                        className="text-default-500"
                                    />
                                    <span className="text-xs font-bold uppercase tracking-wider">
                                        SharePoint Integration
                                    </span>
                                </div>
                                {!isEditingFolder && (
                                    <Button
                                        size="sm"
                                        variant="light"
                                        isIconOnly
                                        onPress={() => setIsEditingFolder(true)}
                                    >
                                        <Pencil size={14} />
                                    </Button>
                                )}
                            </CardHeader>
                            <CardBody className="p-5 flex flex-col gap-4">
                                {isEditingFolder ? (
                                    <div className="space-y-4">
                                        <div className="flex items-end gap-2">
                                            <Input
                                                name="sharepointFolderId"
                                                label="Folder ID"
                                                labelPlacement="outside"
                                                variant="bordered"
                                                value={
                                                    formik.values
                                                        .sharepointFolderId ??
                                                    ''
                                                }
                                                onChange={formik.handleChange}
                                                className="flex-1"
                                            />
                                            <Button
                                                color="primary"
                                                variant="flat"
                                                isLoading={isCheckingFolder}
                                                onPress={() => checkFolder()}
                                            >
                                                <span className="font-semibold">
                                                    Check
                                                </span>
                                            </Button>
                                        </div>

                                        {isFolderError && (
                                            <p className="text-[10px] text-danger font-bold px-1">
                                                Invalid Folder ID or access
                                                denied.
                                            </p>
                                        )}

                                        {folderData && (
                                            <Card
                                                shadow="none"
                                                className="border bg-success-50/20 border-success-200"
                                            >
                                                <CardBody className="p-0">
                                                    <div className="flex items-center gap-4 p-4 border-b border-success-100">
                                                        <div className="p-3 rounded-xl bg-success-100 text-success-600">
                                                            <Folder size={24} />
                                                        </div>
                                                        <div className="flex flex-col flex-1 overflow-hidden">
                                                            <span className="text-sm font-bold text-success-900 truncate">
                                                                {
                                                                    folderData.name
                                                                }
                                                            </span>
                                                            <span className="text-[10px] truncate text-success-600">
                                                                {
                                                                    folderData.displayPath
                                                                }
                                                            </span>
                                                        </div>
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="flat"
                                                            color="success"
                                                            onPress={() =>
                                                                window.open(
                                                                    folderData.webUrl,
                                                                    '_blank'
                                                                )
                                                            }
                                                        >
                                                            <ExternalLink
                                                                size={16}
                                                            />
                                                        </Button>
                                                    </div>
                                                    <div className="grid grid-cols-2 p-4 gap-y-4 bg-white/50">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] uppercase font-bold text-default-400">
                                                                Total Items
                                                            </span>
                                                            <div className="flex items-center gap-1 text-sm font-semibold text-success-700">
                                                                <ShieldCheck
                                                                    size={14}
                                                                />{' '}
                                                                {
                                                                    folderData.childCount
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] uppercase font-bold text-default-400">
                                                                Storage
                                                            </span>
                                                            <span className="text-sm font-semibold">
                                                                {
                                                                    folderData.sizeInMB
                                                                }{' '}
                                                                MB
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 px-4 py-2 bg-success-100/50">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                                                        <span className="text-[10px] font-bold text-success-700 uppercase">
                                                            Verified
                                                        </span>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        )}
                                        <div className="flex items-center justify-between gap-3">
                                            <Button
                                                fullWidth
                                                size="sm"
                                                variant={
                                                    folderData
                                                        ? 'light'
                                                        : 'bordered'
                                                }
                                                onPress={() =>
                                                    setIsEditingFolder(false)
                                                }
                                            >
                                                Cancel
                                            </Button>
                                            {folderData && (
                                                <Button
                                                    fullWidth
                                                    size="sm"
                                                    variant="shadow"
                                                    color="primary"
                                                    onPress={handleAppyFolder}
                                                >
                                                    Apply
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3 p-3 bg-primary-50 rounded-xl border border-primary-100">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                                            <Folder
                                                size={18}
                                                fill="currentColor"
                                            />
                                        </div>
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="text-sm font-bold text-primary-900 truncate">
                                                {jobType.sharepointFolderId
                                                    ? 'Connected Template'
                                                    : 'No Template Linked'}
                                            </span>
                                            <span className="text-xs font-mono text-primary-600 truncate">
                                                {jobType.sharepointFolderId ||
                                                    'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardBody>
                        </Card>

                        {/* HELP AREA */}
                        <Card
                            shadow="none"
                            className="border border-default-200"
                        >
                            <CardHeader className="px-5 py-4 border-b border-default-100 flex items-center gap-2 bg-default-50/50">
                                <HelpCircle
                                    size={16}
                                    className="text-default-500"
                                />
                                <span className="text-xs font-bold uppercase tracking-wider text-default-700">
                                    Help & Tools
                                </span>
                            </CardHeader>
                            <CardBody className="p-5 space-y-3">
                                <p className="text-[11px] text-default-500 leading-normal">
                                    Can't find the Folder ID? Use the Path
                                    Resolver to find it using a SharePoint site
                                    path.
                                </p>
                                <Tooltip
                                    content="Search for a unique ID using a SharePoint path"
                                    placement="top"
                                    showArrow
                                >
                                    <Button
                                        fullWidth
                                        size="sm"
                                        variant="flat"
                                        color="secondary"
                                        className="font-bold"
                                        startContent={<Search size={14} />}
                                        onPress={() =>
                                            setIsResolveModalOpen(true)
                                        }
                                    >
                                        Get Folder ID
                                    </Button>
                                </Tooltip>
                            </CardBody>
                        </Card>

                        {/* METADATA */}
                        <Card
                            shadow="none"
                            className="border border-default-200"
                        >
                            <CardHeader className="px-5 py-4 border-b border-default-100 bg-default-50/50">
                                <span className="text-xs font-bold uppercase tracking-wider text-default-700">
                                    System Metadata
                                </span>
                            </CardHeader>
                            <CardBody className="p-5 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-default-500">
                                        System ID
                                    </span>
                                    <span className="text-[10px] font-mono font-bold bg-default-100 px-2 py-0.5 rounded">
                                        {jobType.id}
                                    </span>
                                </div>
                                <Divider />
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-default-500">
                                        Last Modified
                                    </span>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-bold flex items-center gap-1">
                                            <Pencil size={10} /> System Admin
                                        </span>
                                        <span className="text-[10px] text-default-400">
                                            {dateFormatter(jobType.updatedAt)}
                                        </span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </AdminContentContainer>

            {/* Resolve Path Modal Component */}
            <ResolvePathModal
                isOpen={isResolveModalOpen}
                onOpenChange={setIsResolveModalOpen}
                onResolved={handlePathResolved}
            />
        </div>
    )
}
