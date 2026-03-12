import { createFileRoute } from '@tanstack/react-router'
import { CreateFolderTemplateModal } from '@/features/job-folder-templates'
import {
    Button,
    Card,
    CardBody,
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
import { Edit, Folder, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { jobFolderTemplatesListOptions } from '@/lib/queries'
import {
    useCreateJobFolderTemplate,
    useUpdateJobFolderTemplate,
    useDeleteJobFolderTemplate,
} from '@/lib/queries'

export const Route = createFileRoute(
    '/_administrator/admin/mgmt/jobs/folder-templates/'
)({
    component: JobFolderTemplatePage,
})

// --- Main Page Component ---

export default function JobFolderTemplatePage() {
    const { data: { jobFolderTemplates } } = useSuspenseQuery(jobFolderTemplatesListOptions())
    const createFolderTemplateDisclosure = useDisclosure()
    const [editingTemplate, setEditingTemplate] = useState<any>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const createMutation = useCreateJobFolderTemplate()
    const updateMutation = useUpdateJobFolderTemplate()
    const deleteMutation = useDeleteJobFolderTemplate()

    const handleOpenModal = (template: any = null) => {
        setEditingTemplate(template)
        createFolderTemplateDisclosure.onOpen()
    }

    const handleCloseModal = () => {
        setEditingTemplate(null)
        createFolderTemplateDisclosure.onClose()
    }

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this template?')) {
            deleteMutation.mutate(id)
        }
    }

    const handleSave = (data: any) => {
        if (editingTemplate) {
            updateMutation.mutate({ id: editingTemplate.id, data })
        } else {
            createMutation.mutate(data)
        }
        handleCloseModal()
    }

    const filteredTemplates = jobFolderTemplates.filter((t: any) =>
        t.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1B365D]">
                        Job Folder Templates
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Manage standardized SharePoint folder structures for
                        jobs.
                    </p>
                </div>
                <Button
                    onPress={() => handleOpenModal()}
                    color="primary"
                    className="bg-[#F37021] text-white font-bold"
                    startContent={<Plus size={18} />}
                >
                    Create Template
                </Button>
            </div>

            {/* Controls Area */}
            <div className="flex items-center gap-4 w-full md:w-72">
                <Input
                    placeholder="Search templates..."
                    startContent={
                        <Search size={18} className="text-slate-400" />
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    variant="bordered"
                />
            </div>

            {/* Templates Table */}
            <Card shadow="sm">
                <CardBody className="p-0">
                    <Table
                        aria-label="Job Folder Templates Table"
                        removeWrapper
                    >
                        <TableHeader>
                            <TableColumn>DISPLAY NAME</TableColumn>
                            <TableColumn>SHAREPOINT FOLDER SOURCE</TableColumn>
                            <TableColumn align="center">ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="No templates found.">
                            {filteredTemplates.map((template) => (
                                <TableRow key={template.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-50 text-[#F37021] rounded">
                                                <Folder size={18} />
                                            </div>
                                            <span className="font-medium text-slate-700">
                                                {template.displayName}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-500 italic">
                                        {template.folderName}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-center gap-2">
                                            <Tooltip content="Edit Template">
                                                <Button
                                                    isIconOnly
                                                    variant="light"
                                                    onPress={() =>
                                                        handleOpenModal(
                                                            template
                                                        )
                                                    }
                                                >
                                                    <Edit
                                                        size={18}
                                                        className="text-[#1B365D]"
                                                    />
                                                </Button>
                                            </Tooltip>
                                            <Tooltip
                                                content="Delete"
                                                color="danger"
                                            >
                                                <Button
                                                    isIconOnly
                                                    variant="light"
                                                    onPress={() =>
                                                        handleDelete(
                                                            template.id
                                                        )
                                                    }
                                                >
                                                    <Trash2
                                                        size={18}
                                                        className="text-danger"
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

            <CreateFolderTemplateModal
                isOpen={createFolderTemplateDisclosure.isOpen}
                onClose={handleCloseModal}
                editingTemplate={editingTemplate}
                onSave={handleSave}
            />
        </div>
    )
}
