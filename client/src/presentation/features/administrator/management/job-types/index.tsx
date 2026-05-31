import { CreateJobTypeModal } from '@/presentation/features/job-type-manage'
import { COLORS, INTERNAL_URLS, jobTypesListOptions } from '@/presentation/lib'
import {
    Button,
    Card,
    CardBody,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure,
} from '@heroui/react'
import { AdminPageHeading } from '@presentation/components'
import AdminContentContainer from '@presentation/components/admin/AdminContentContainer'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Plus, Tag } from 'lucide-react'

export function JobTypesListPage() {
    const createModal = useDisclosure()
    const {
        data: { jobTypes },
    } = useSuspenseQuery(jobTypesListOptions())

    return (
        <div>
            {createModal.isOpen && (
                <CreateJobTypeModal
                    isOpen={createModal.isOpen}
                    onOpenChange={createModal.onOpenChange}
                />
            )}
            <AdminPageHeading
                title="Job Types"
                description="Manage categories, color codes, and default folder templates for jobs."
                actions={
                    <Button
                        color="primary"
                        startContent={<Plus size={16} />}
                        className="font-bold shadow-sm"
                        onPress={createModal.onOpen}
                    >
                        Create new
                    </Button>
                }
            />
            <AdminContentContainer>
                <div className="px-6 mx-auto max-w-7xl space-y-6">
                    <Card
                        shadow="none"
                        className="border border-border-default"
                    >
                        <CardBody>
                            <Table
                                aria-label="Job Types Table"
                                shadow="none"
                                classNames={{
                                    wrapper: 'p-0 rounded-none border-none',
                                }}
                            >
                                <TableHeader>
                                    <TableColumn>Display Name</TableColumn>
                                    <TableColumn>Code</TableColumn>
                                    <TableColumn>Color</TableColumn>
                                    <TableColumn>Active Jobs</TableColumn>
                                    <TableColumn align="end">
                                        Actions
                                    </TableColumn>
                                </TableHeader>
                                <TableBody emptyContent="No job types found.">
                                    {jobTypes.map((type) => (
                                        <TableRow
                                            key={type.id}
                                            className="hover:bg-default-50 transition-colors"
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3 py-1">
                                                    <div className="p-2 rounded-lg bg-default-100 text-default-500">
                                                        <Tag size={16} />
                                                    </div>
                                                    <span className="font-bold text-default-900">
                                                        {type.displayName}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-xs font-bold text-default-500 bg-default-100 px-2 py-1 rounded">
                                                    {type.code}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 rounded-full border border-black/10 shadow-sm"
                                                        style={{
                                                            backgroundColor:
                                                                type.hexColor ||
                                                                COLORS.black,
                                                        }}
                                                    />
                                                    <span className="text-xs font-medium text-default-600 uppercase">
                                                        {type.hexColor}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold text-default-700">
                                                    {type.jobs.length} jobs
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    as={Link}
                                                    to={INTERNAL_URLS.management.jobTypesDetail(
                                                        type.id
                                                    )}
                                                    size="sm"
                                                    variant="light"
                                                    color="primary"
                                                    className="font-medium"
                                                >
                                                    Manage
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardBody>
                    </Card>
                </div>
            </AdminContentContainer>
        </div>
    )
}
