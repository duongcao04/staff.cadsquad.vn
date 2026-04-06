import { ConfirmDeleteJobTitleModal } from '@/features/job-title-manage'
import { INTERNAL_URLS, RouteUtil, usersListOptions } from '@/lib'
import { deleteJobTitleOptions, jobTitlesListOptions } from '@/lib/queries'
import { AdminPageHeading, AppLoading } from '@/shared/components'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import { TJobTitle } from '@/shared/types'
import {
    addToast,
    Button,
    Card,
    CardBody,
    CardHeader,
    Divider,
    Input,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tabs,
    useDisclosure,
} from '@heroui/react'
import { useMutation, useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import {
    Briefcase,
    Eye,
    GridIcon,
    ListIcon,
    Plus,
    Search,
    Trash2,
    Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { z } from 'zod'

enum ViewOptions {
    TABLE = 'table',
    GRID = 'grid',
}
export const jobTitleManageSchema = z.object({
    tab: z.nativeEnum(ViewOptions).default(ViewOptions.TABLE),
})
export type TJobTitleManageSchema = z.infer<typeof jobTitleManageSchema>

export const Route = createFileRoute('/_administrator/mgmt/job-titles/')({
    validateSearch: (search) => jobTitleManageSchema.parse(search),
    loaderDeps: ({ search }) => ({ search }),
    head: () => ({ meta: [{ title: 'Job Title Management' }] }),
    loader: ({ context }) =>
        context.queryClient.ensureQueryData(jobTitlesListOptions()),
    pendingComponent: AppLoading,
    component: JobTitlesPage,
})

function JobTitlesPage() {
    const searchParams = Route.useSearch()
    const router = useRouter()
    const [
        {
            data: { jobTitles },
            refetch,
        },
        {
            data: { users },
        },
    ] = useSuspenseQueries({
        queries: [jobTitlesListOptions(), usersListOptions()],
    })
    const [selectedJobTitle, setSelectedJobTitle] = useState<TJobTitle | null>(
        null
    )
    const [searchQuery, setSearchQuery] = useState('')

    const deleteAction = useMutation(deleteJobTitleOptions)

    const confirmDeleteModalState = useDisclosure()

    const stats = useMemo(
        () => [
            {
                label: 'Total Job titles',
                value: jobTitles.length,
                icon: <Briefcase size={18} />,
                color: 'text-blue-500',
                bg: 'bg-blue-500/10',
            },
            {
                label: 'Total users',
                value: users.length,
                icon: <Users size={18} />,
                color: 'text-purple-500',
                bg: 'bg-purple-500/10',
            },
        ],
        [jobTitles]
    )

    const filtered = jobTitles.filter(
        (j) =>
            j.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            j.code.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // const handleCreate = () => {
    //     setSeletectedDept(null)
    //     createDepartmentModalState.onOpen()
    // }

    // const handleEdit = (dept: TDepartment) => {
    //     setSeletectedDept(dept)
    //     createDepartmentModalState.onOpen()
    // }

    const handleDelete = (jobTitle: TJobTitle) => {
        deleteAction.mutateAsync(jobTitle.id, {
            onSuccess() {
                refetch()
                setSelectedJobTitle(null)
                confirmDeleteModalState.onClose()
                addToast({
                    title: 'Delete successfully',
                    color: 'success',
                })
            },
        })
    }

    return (
        <>
            {confirmDeleteModalState.isOpen && (
                <ConfirmDeleteJobTitleModal
                    isOpen={confirmDeleteModalState.isOpen}
                    jobTitle={selectedJobTitle}
                    onClose={confirmDeleteModalState.onClose}
                    onConfirm={handleDelete}
                />
            )}
            <AdminPageHeading
                title="Job Titles"
                showBadge
                badgeCount={jobTitles.length}
                actions={
                    <Button color="primary" startContent={<Plus size={18} />}>
                        Create Title
                    </Button>
                }
            />

            <AdminContentContainer className="mt-2">
                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
                    {stats.map((stat, i) => (
                        <Card
                            key={i}
                            shadow="none"
                            className="border border-border-default backdrop-blur-md"
                        >
                            <CardBody className="flex flex-row items-center gap-4 p-4">
                                <div
                                    className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}
                                >
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium tracking-widest text-text-subdued">
                                        {stat.label}
                                    </p>
                                    <p className="text-xl font-bold">
                                        {stat.value}
                                    </p>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>

                <Card shadow="none" className="border border-border-default">
                    {/* Toolbar */}
                    <CardHeader>
                        <div className="flex items-center justify-between w-full">
                            <Input
                                placeholder="Search by name..."
                                startContent={
                                    <Search
                                        size={16}
                                        className="text-text-subdued"
                                    />
                                }
                                className="max-w-lg"
                                size="sm"
                                variant="bordered"
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                                classNames={{
                                    inputWrapper: 'border-1',
                                }}
                            />
                            <Tabs
                                aria-label="View options"
                                selectedKey={searchParams.tab}
                                onSelectionChange={(key) =>
                                    RouteUtil.updateParams({ tab: key })
                                }
                            >
                                <Tab
                                    key="table"
                                    title={<ListIcon size={16} />}
                                />
                                <Tab
                                    key="grid"
                                    title={<GridIcon size={16} />}
                                />
                            </Tabs>
                        </div>
                    </CardHeader>

                    <Divider className="bg-border-default" />

                    <CardBody>
                        {searchParams.tab === 'table' ? (
                            <Table removeWrapper aria-label="Job Titles">
                                <TableHeader>
                                    <TableColumn>Display name</TableColumn>
                                    <TableColumn>Code</TableColumn>
                                    <TableColumn>Users</TableColumn>
                                    <TableColumn align="end">
                                        Actions
                                    </TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((job) => (
                                        <TableRow
                                            key={job.id}
                                            className="border-b hover:bg-white/5 border-white/5 last:border-none"
                                        >
                                            <TableCell>
                                                <p className="font-bold">
                                                    {job.displayName}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-xs text-primary">
                                                    {job.code}
                                                </code>
                                            </TableCell>
                                            <TableCell>
                                                {job._count.users}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="light"
                                                        onPress={() =>
                                                            router.navigate({
                                                                href: INTERNAL_URLS.management.jobTitlesDetail(
                                                                    job.code
                                                                ),
                                                            })
                                                        }
                                                    >
                                                        <Eye size={16} />
                                                    </Button>
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="light"
                                                        color="danger"
                                                        onPress={() => {
                                                            setSelectedJobTitle(
                                                                job
                                                            )
                                                            confirmDeleteModalState.onOpen()
                                                        }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="p-2 grid grid-cols-1 gap-4 md:grid-cols-3">
                                {filtered.map((job) => (
                                    <Card
                                        shadow="none"
                                        key={job.id}
                                        className="transition-all border border-border-default hover:border-primary/40 group"
                                    >
                                        <CardBody className="p-4">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                                    <Briefcase size={24} />
                                                </div>
                                            </div>
                                            <h4 className="text-lg font-black">
                                                {job.displayName}
                                            </h4>
                                            <p className="text-[10px] font-mono text-primary mb-4">
                                                {job.code}
                                            </p>
                                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                                <span className="text-xs font-bold uppercase text-text-subdued">
                                                    {job._count.users} Members
                                                </span>
                                                <Button
                                                    size="sm"
                                                    variant="flat"
                                                    onPress={() =>
                                                        router.navigate({
                                                            href: INTERNAL_URLS.management.jobTitlesDetail(
                                                                job.code
                                                            ),
                                                        })
                                                    }
                                                >
                                                    Manage
                                                </Button>
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardBody>
                </Card>
            </AdminContentContainer>
        </>
    )
}
