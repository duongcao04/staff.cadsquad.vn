import {
    dateFormatter,
    INTERNAL_URLS,
    jobFolderTemplatesListOptions,
} from '@/lib'
import { AdminPageHeading, HeroButton } from '@/shared/components'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import {
    Button,
    Card,
    CardBody,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tooltip,
    useDisclosure,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useFormik } from 'formik'
import {
    ExternalLink,
    FolderTree,
    HardDrive,
    Plus,
    RefreshCw,
    Search,
    Star,
    Trash2,
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute(
    '/_administrator/mgmt/jobs/folder-templates/'
)({
    component: () => {
        const { isOpen, onOpen, onClose } = useDisclosure()

        return (
            <>
                <CreateTemplateModal isOpen={isOpen} onClose={onClose} />
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
                <JobFolderTemplatesPage />
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
        <AdminContentContainer className="pt-0 space-y-4 max-w-7xl mx-auto">
            {/* 2. Stats / KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Templates */}
                <Card shadow="sm" className="border border-default-200">
                    <CardBody className="p-5 flex flex-row items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-default-600">
                                Active Templates
                            </p>
                            <p className="text-2xl font-bold text-default-900 mt-1">
                                {totalTemplates}
                            </p>
                        </div>
                        <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
                            <FolderTree size={24} />
                        </div>
                    </CardBody>
                </Card>

                {/* Total Storage Footprint */}
                <Card shadow="sm" className="border border-default-200">
                    <CardBody className="p-5 flex flex-row items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-default-600">
                                Total Blueprint Size
                            </p>
                            <p className="text-2xl font-bold text-default-900 mt-1">
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
                <Card
                    shadow="sm"
                    className="border border-default-200 bg-success-50/50"
                >
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
            <Card shadow="sm" className="border border-default-200">
                <div className="p-4 border-b border-divider flex flex-col md:flex-row md:items-center justify-between gap-4 bg-default-50">
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
                    <Button
                        variant="flat"
                        color="default"
                        startContent={<RefreshCw size={14} />}
                    >
                        Sync All Sizes
                    </Button>
                </div>

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
                                className="hover:bg-default-100/50 transition-colors"
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
                                        <Link
                                            to={INTERNAL_URLS.management.jobFolderTemplateDetail(
                                                tpl.id
                                            )}
                                        >
                                            <Button
                                                size="sm"
                                                variant="flat"
                                                color="primary"
                                            >
                                                Edit
                                            </Button>
                                        </Link>
                                        <Tooltip
                                            content="Delete Template"
                                            color="danger"
                                        >
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                color="danger"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* Quick Add Modal */}
        </AdminContentContainer>
    )
}

// --- Inner Component: Create Modal ---
const CreateTemplateModal = ({
    isOpen,
    onClose,
}: {
    isOpen: boolean
    onClose: () => void
}) => {
    const formik = useFormik({
        initialValues: { displayName: '', sharepointUrlOrId: '' },
        onSubmit: async (values) => {
            console.log('Creating template linked to:', values)
            // API Call: Create new JobFolderTemplate
            onClose()
            formik.resetForm()
        },
    })

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <form onSubmit={formik.handleSubmit}>
                    <ModalHeader className="flex flex-col gap-1">
                        <span className="text-xl font-bold">
                            Add Folder Template
                        </span>
                        <p className="text-sm text-default-500">
                            Link an existing SharePoint folder to use as a
                            blueprint.
                        </p>
                    </ModalHeader>
                    <ModalBody className="py-4 space-y-4">
                        <Input
                            isRequired
                            name="displayName"
                            label="Template Display Name"
                            placeholder="e.g. Standard Architectural Setup"
                            variant="bordered"
                            labelPlacement="outside"
                            value={formik.values.displayName}
                            onChange={formik.handleChange}
                        />
                        <Input
                            isRequired
                            name="sharepointUrlOrId"
                            label="SharePoint Folder URL or ID"
                            placeholder="Paste the link to the SharePoint folder..."
                            variant="bordered"
                            labelPlacement="outside"
                            value={formik.values.sharepointUrlOrId}
                            onChange={formik.handleChange}
                            description="The system will automatically sync folder metadata upon creation."
                        />
                    </ModalBody>
                    <ModalFooter className="border-t border-divider mt-4 pt-4">
                        <Button variant="flat" onPress={onClose}>
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            type="submit"
                            className="font-bold shadow-md"
                        >
                            Sync & Create
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    )
}
