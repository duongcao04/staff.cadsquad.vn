import {
    createJobFolderTemplateOptions,
    dateFormatter,
    INTERNAL_URLS,
    jobFolderTemplateQueryKeys,
    jobFolderTemplatesListOptions,
} from '@/lib'
import { AdminPageHeading, HeroButton } from '@/shared/components'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import {
    addToast,
    Button,
    Card,
    CardBody,
    CardHeader,
    Input,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tooltip,
    useDisclosure,
} from '@heroui/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
    ExternalLink,
    FolderTree,
    HardDrive,
    PencilLineIcon,
    Plus,
    Search,
    Star
} from 'lucide-react'
import { useState } from 'react'
import { CreateFolderTemplateModal } from '../../../../../features/job-folder-templates'
import { queryClient } from '../../../../../main'

export const Route = createFileRoute(
    '/_administrator/mgmt/jobs/folder-templates/'
)({
    component: () => {
        const { isOpen, onOpen, onClose } = useDisclosure()

        const createFolderTemplate = useMutation({
            ...createJobFolderTemplateOptions(),
            onSuccess: () => {
                queryClient.refetchQueries({
                    queryKey: jobFolderTemplateQueryKeys.lists(),
                })
                addToast({
                    title: 'Successfully',
                    description: 'Create new folder template successfully',
                    color: 'success',
                })
            },
        })

        return (
            <>
                <CreateFolderTemplateModal
                    isOpen={isOpen}
                    onClose={onClose}
                    onSave={async (data) => {
                        createFolderTemplate.mutateAsync({
                            displayName: data.displayName,
                            folderId: data.folderId,
                            folderName: data.folderName,
                            size: data.size,
                            webUrl: data.webUrl,
                        })
                    }}
                />
                <AdminPageHeading
                    title="Folder Templates"
                    description=" Manage SharePoint folder structures used for
                        automatically generating job workspaces."
                    actions={
                        <div className="flex gap-2">
                            <HeroButton
                                color="primary"
                                startContent={<Plus size={16} />}
                                onPress={onOpen}
                            >
                                New Template
                            </HeroButton>
                        </div>
                    }
                />
                <AdminContentContainer className="mt-5 space-y-6 max-w-7xl mx-auto">
                    <JobFolderTemplatesPage />
                </AdminContentContainer>
            </>
        )
    },
})

export default function JobFolderTemplatesPage() {
    const {
        data: { jobFolderTemplates },
    } = useSuspenseQuery(jobFolderTemplatesListOptions())
    const [searchQuery, setSearchQuery] = useState('')

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const filteredTemplates = jobFolderTemplates.filter((tpl) =>
        tpl.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Calculate Stats
    const totalTemplates = jobFolderTemplates.length
    const totalSize = jobFolderTemplates.reduce((sum, tpl) => sum + tpl.size, 0)
    const mostUsedTemplate = [...jobFolderTemplates].sort(
        (a, b) => b.jobs.length - a.jobs.length
    )[0]

    return (
        <>
            {/* 2. Stats / KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Templates */}
                <Card shadow="sm">
                    <CardBody className="p-5 flex flex-row items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-text-subdued">
                                Active Templates
                            </p>
                            <p className="text-2xl font-bold text-text-default mt-1">
                                {totalTemplates}
                            </p>
                        </div>
                        <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
                            <FolderTree size={24} />
                        </div>
                    </CardBody>
                </Card>

                {/* Total Storage Footprint */}
                <Card shadow="sm">
                    <CardBody className="p-5 flex flex-row items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-text-subdued">
                                Total Blueprint Size
                            </p>
                            <p className="text-2xl font-bold text-text-default mt-1">
                                {formatBytes(totalSize)}
                            </p>
                            <p className="text-xs text-default-400 mt-1">
                                Cost per copied workspace
                            </p>
                        </div>
                        <div className="p-3 bg-warning-50 rounded-xl text-warning-600">
                            <HardDrive size={24} />
                        </div>
                    </CardBody>
                </Card>

                {/* Most Used Template */}
                <Card shadow="sm" className="bg-success-50/50">
                    <CardBody className="p-5 flex flex-row items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-success-700">
                                Most Used Blueprint
                            </p>
                            <p className="text-lg font-bold text-success-900 mt-1 truncate max-w-45">
                                {mostUsedTemplate?.displayName}
                            </p>
                            <p className="text-xs text-success-600 mt-1">
                                Used in {mostUsedTemplate?.jobs.length} jobs
                            </p>
                        </div>
                        <div className="p-3 bg-success-100 rounded-xl text-success-600">
                            <Star size={24} />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* 3. Table Area */}
            <Card shadow="sm">
                <CardHeader>
                    <Input
                        placeholder="Search templates..."
                        startContent={
                            <Search size={16} className="text-default-400" />
                        }
                        className="max-w-sm"
                        variant="bordered"
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                </CardHeader>

                <CardBody>
                    <Table
                        aria-label="Folder Templates Table"
                        removeWrapper
                        className="bg-transparent"
                    >
                        <TableHeader>
                            <TableColumn>DISPLAY NAME</TableColumn>
                            <TableColumn>SHAREPOINT FOLDER</TableColumn>
                            <TableColumn>SIZE</TableColumn>
                            <TableColumn>USAGE</TableColumn>
                            <TableColumn>LAST SYNCED</TableColumn>
                            <TableColumn align="end">ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="No folder templates found.">
                            {filteredTemplates.map((tpl) => (
                                <TableRow
                                    key={tpl.id}
                                    className="hover:bg-background-hovered transition-colors rounded-lg"
                                >
                                    <TableCell>
                                        <span className="font-bold text-text-default">
                                            {tpl.displayName}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-text-default">
                                                {tpl.folderName}
                                            </span>
                                            <span className="text-[10px] text-text-subdued font-mono mt-0.5">
                                                ID:{' '}
                                                {tpl.folderId.slice(
                                                    -8,
                                                    tpl.folderId.length
                                                )}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-medium text-text-default">
                                            {formatBytes(tpl.size)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-text-subdued">
                                            {tpl.jobs.length} jobs
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-text-subdued">
                                            {dateFormatter(tpl.updatedAt)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-2">
                                            <Tooltip content="Open in SharePoint">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    color="primary"
                                                    as="a"
                                                    href={tpl.webUrl}
                                                    target="_blank"
                                                >
                                                    <ExternalLink size={16} />
                                                </Button>
                                            </Tooltip>
                                            <Tooltip
                                                content="Edit template"
                                                color="warning"
                                                className="text-white"
                                            >
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    color="warning"
                                                    as={Link}
                                                    href={INTERNAL_URLS.management.jobFolderTemplateDetail(
                                                        tpl.id
                                                    )}
                                                >
                                                    <PencilLineIcon
                                                        size={16}
                                                        className="text-yellow-600"
                                                    />
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        </>
    )
}
