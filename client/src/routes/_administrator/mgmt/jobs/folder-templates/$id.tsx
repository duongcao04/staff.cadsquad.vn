import { createFileRoute, Link } from '@tanstack/react-router'
import { dateFormatter, INTERNAL_URLS, jobFolderTemplateOptions } from '@/lib'
import {
    AdminPageHeading,
    HeroBreadcrumbItem,
    HeroBreadcrumbs,
} from '@/shared/components'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import { JobStatusSystemTypeEnum } from '@/shared/enums'
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Divider,
    Input,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useFormik } from 'formik'
import {
    ArrowLeft,
    Briefcase,
    CloudIcon,
    ExternalLink,
    RefreshCw,
    Save,
} from 'lucide-react'

export const Route = createFileRoute(
    '/_administrator/mgmt/jobs/folder-templates/$id'
)({
    component: () => {
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
                                <h1 className="text-2xl font-bold text-default-900">
                                    Edit Template
                                </h1>
                                <p className="text-sm text-default-500">
                                    ID: tpl-001
                                </p>
                            </div>
                        </div>
                    }
                />
                <JobFolderTemplateDetailPage />
            </>
        )
    },
})

export default function JobFolderTemplateDetailPage() {
    const { id } = Route.useParams()

    const { data: template } = useSuspenseQuery(jobFolderTemplateOptions(id))

    const formik = useFormik({
        initialValues: {
            displayName: template.displayName,
        },
        onSubmit: async (values) => {
            console.log('Updating Template:', values)
            // API Call: Update JobFolderTemplate -> displayName
        },
    })

    const handleSync = async () => {
        console.log('Triggering Graph API to resync folder sizes and names...')
        // Call your backend SharepointService to update the details based on folderId
    }

    const formatBytes = (bytes: number) => {
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
        <AdminContentContainer className="pt-0 space-y-4">
            <HeroBreadcrumbs className="text-xs">
                <HeroBreadcrumbItem>
                    <Link
                        to={INTERNAL_URLS.admin.overview}
                        className="text-text-subdued!"
                    >
                        Management
                    </Link>
                </HeroBreadcrumbItem>
                <HeroBreadcrumbItem>Job</HeroBreadcrumbItem>
                <HeroBreadcrumbItem>
                    <Link
                        to={INTERNAL_URLS.management.jobFolderTemplates}
                        className="text-text-subdued!"
                    >
                        Folder Templates
                    </Link>
                </HeroBreadcrumbItem>
                <HeroBreadcrumbItem>Standard 3D Project</HeroBreadcrumbItem>
            </HeroBreadcrumbs>

            <div className="space-y-6">
                {/* TOP SECTION: Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* LEFT: System Configuration (Editable) */}
                    <div className="space-y-6">
                        <Card
                            shadow="sm"
                            className="border border-default-200 h-fit"
                        >
                            <form onSubmit={formik.handleSubmit}>
                                <CardHeader className="px-6 py-4 border-b border-divider">
                                    <h2 className="text-lg font-bold text-default-900">
                                        Internal Settings
                                    </h2>
                                </CardHeader>
                                <CardBody className="p-6 space-y-6">
                                    <Input
                                        isRequired
                                        name="displayName"
                                        label="Template Display Name"
                                        description="This is the name users will see when creating a new job."
                                        variant="bordered"
                                        labelPlacement="outside"
                                        value={formik.values.displayName}
                                        onChange={formik.handleChange}
                                    />

                                    <Divider className="my-2" />

                                    <div className="flex justify-end">
                                        <Button
                                            color="primary"
                                            type="submit"
                                            startContent={<Save size={16} />}
                                            isDisabled={!formik.dirty}
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                </CardBody>
                            </form>
                        </Card>

                        {/* BOTTOM SECTION: Usage Table */}
                        <Card shadow="sm" className="border border-default-200">
                            <CardHeader className="px-6 py-4 border-b border-divider bg-default-50 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Briefcase
                                        size={18}
                                        className="text-default-600"
                                    />
                                    <h2 className="text-lg font-bold text-default-900">
                                        Template Usage History
                                    </h2>
                                </div>
                                <Chip size="sm" variant="flat" color="default">
                                    {template.jobs.length} Jobs
                                </Chip>
                            </CardHeader>
                            <Table
                                aria-label="Template Usage Table"
                                removeWrapper
                                className="bg-transparent"
                            >
                                <TableHeader>
                                    <TableColumn>JOB REF</TableColumn>
                                    <TableColumn>PROJECT NAME</TableColumn>
                                    <TableColumn>CLIENT</TableColumn>
                                    <TableColumn>CREATED AT</TableColumn>
                                    <TableColumn>STATUS</TableColumn>
                                </TableHeader>
                                <TableBody emptyContent="This template has not been used yet.">
                                    {template.jobs.map((job) => (
                                        <TableRow
                                            key={job.id}
                                            className="hover:bg-default-50 transition-colors"
                                        >
                                            <TableCell>
                                                <span className="font-bold text-sm text-default-900">
                                                    #{job.no}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm font-medium text-default-800">
                                                    {job.displayName}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-default-600">
                                                    {job.client?.name}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-default-500">
                                                    {dateFormatter(
                                                        job.createdAt
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="sm"
                                                    variant="flat"
                                                    color={
                                                        job.status
                                                            .systemType ===
                                                        JobStatusSystemTypeEnum.COMPLETED
                                                            ? 'primary'
                                                            : job.status
                                                                    .systemType ===
                                                                JobStatusSystemTypeEnum.TERMINATED
                                                              ? 'success'
                                                              : 'default'
                                                    }
                                                >
                                                    {job.status.displayName}
                                                </Chip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>

                    {/* RIGHT: SharePoint Data (Read-Only) */}
                    <Card
                        shadow="sm"
                        className="border border-primary-200 bg-primary-50/30 h-fit"
                    >
                        <CardHeader className="px-6 py-4 border-b border-primary-100 flex justify-between items-center bg-primary-50">
                            <h2 className="text-lg font-bold text-primary-900 flex items-center gap-2">
                                <CloudIcon size={20} className="text-primary" />{' '}
                                SharePoint Status
                            </h2>
                            <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                startContent={<RefreshCw size={14} />}
                                onPress={handleSync}
                            >
                                Sync Now
                            </Button>
                        </CardHeader>
                        <CardBody className="p-6 space-y-5">
                            <div>
                                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-1">
                                    Target Folder Name
                                </p>
                                <div className="p-3 bg-white border border-default-200 rounded-lg flex items-center justify-between">
                                    <span className="font-mono text-sm font-semibold">
                                        {template.folderName}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-1">
                                        Total Template Size
                                    </p>
                                    <p className="text-lg font-bold text-default-900">
                                        {formatBytes(template.size)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-1">
                                        Last Synced
                                    </p>
                                    <p className="text-sm font-medium text-default-700">
                                        {new Date(
                                            template.updatedAt
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-1">
                                    SharePoint Folder ID
                                </p>
                                <p className="text-xs font-mono text-default-400 bg-default-100 p-2 rounded">
                                    {template.folderId}
                                </p>
                            </div>

                            <Divider className="my-2" />

                            <Button
                                className="w-full bg-white border border-primary-200 text-primary-700 font-semibold shadow-sm hover:bg-primary-50"
                                as="a"
                                href={template.webUrl}
                                target="_blank"
                                endContent={<ExternalLink size={16} />}
                            >
                                View Folder in SharePoint
                            </Button>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </AdminContentContainer>
    )
}
