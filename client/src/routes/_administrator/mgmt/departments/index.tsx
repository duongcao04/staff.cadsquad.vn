import { INTERNAL_URLS, TCreateDepartmentInput } from '@/lib'
import { departmentsListOptions } from '@/lib/queries'
import { AdminPageHeading } from '@/shared/components'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import { TDepartment } from '@/shared/types'
import {
    Badge,
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
    useDisclosure,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import {
    Edit,
    Eye,
    Hash,
    LayoutGrid,
    LayoutList,
    Palette,
    Plus,
    PlusIcon,
    Search,
    Trash2,
    Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { ModifyDepartmentModal } from '../../../../features/department-manage'

export const Route = createFileRoute('/_administrator/mgmt/departments/')({
    loader: ({ context }) => {
        return context.queryClient.ensureQueryData(departmentsListOptions())
    },
    component: () => {
        const [selectedDept, setSeletectedDept] = useState<TDepartment | null>(
            null
        )

        const {
            data: { departments },
        } = useSuspenseQuery({ ...departmentsListOptions() })

        const createDepartmentModalState = useDisclosure({
            id: 'CreateDepartmentModal',
        })

        const handleCreate = () => {
            setSeletectedDept(null)
            createDepartmentModalState.onOpen()
        }

        const handleEdit = (dept: TDepartment) => {
            setSeletectedDept(dept)
            createDepartmentModalState.onOpen()
        }

        return (
            <>
                <ModifyDepartmentModal
                    isOpen={createDepartmentModalState.isOpen}
                    onClose={createDepartmentModalState.onClose}
                    deptId={selectedDept?.id}
                />

                <AdminPageHeading
                    title={
                        <Badge
                            content={departments.length}
                            color="danger"
                            variant="solid"
                            classNames={{
                                badge: '-right-1 top-1 text-[10px]! font-bold!',
                            }}
                        >
                            Departments
                        </Badge>
                    }
                    actions={
                        <Button
                            startContent={<PlusIcon size={16} />}
                            color="primary"
                            onPress={handleCreate}
                        >
                            Create new
                        </Button>
                    }
                />
                <DepartmentsSettingsPage
                    depts={departments}
                    onEdit={handleEdit}
                />
            </>
        )
    },
})

function DepartmentsSettingsPage({
    depts: departments,
    onEdit,
}: {
    depts: TDepartment[]
    onEdit: (dept: TDepartment) => void
}) {
    const router = useRouter()

    // States
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

    // --- Statistics Logic ---
    const stats = useMemo(() => {
        const totalDepts = departments.length
        const totalMembers = departments.reduce(
            (acc, curr) => acc + (curr._count?.users || 0),
            0
        )
        return [
            {
                label: 'Total Depts',
                value: totalDepts,
                icon: <Hash size={18} />,
                color: 'text-blue-500',
                bg: 'bg-blue-500/10',
            },
            {
                label: 'Total Members',
                value: totalMembers,
                icon: <Users size={18} />,
                color: 'text-purple-500',
                bg: 'bg-purple-500/10',
            },
            {
                label: 'Active Teams',
                value: departments.filter((d) => d._count.users > 0).length,
                icon: <Palette size={18} />,
                color: 'text-orange-500',
                bg: 'bg-orange-500/10',
            },
        ]
    }, [departments])

    // --- Filtering ---
    const filteredDepts = useMemo(() => {
        return departments.filter(
            (d) =>
                d.displayName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                d.code.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [departments, searchQuery])

    return (
        <>
            <AdminContentContainer className="mt-2">
                {/* --- Stats Row --- */}
                <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
                    {stats.map((stat, i) => (
                        <Card
                            key={i}
                            className="border shadow-none border-border-default bg-background/50 backdrop-blur-sm"
                        >
                            <CardBody className="flex flex-row items-center gap-4 p-4">
                                <div
                                    className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}
                                >
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-text-subdued tracking-wider">
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

                {/* --- Toolbar --- */}
                <div className="flex flex-col items-center justify-between gap-4 mb-5 md:flex-row">
                    <div className="flex items-center w-full gap-3 md:w-auto">
                        <Input
                            placeholder="Search..."
                            startContent={
                                <Search
                                    size={16}
                                    className="text-text-subdued"
                                />
                            }
                            className="max-w-xs"
                            size="sm"
                            variant="bordered"
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            isClearable
                        />
                    </div>

                    <div className="flex items-center gap-1 p-1 border rounded-lg bg-background-hovered border-border-default">
                        <Button
                            isIconOnly
                            size="sm"
                            variant={viewMode === 'table' ? 'solid' : 'light'}
                            color={viewMode === 'table' ? 'primary' : 'default'}
                            onPress={() => setViewMode('table')}
                        >
                            <LayoutList size={16} />
                        </Button>
                        <Button
                            isIconOnly
                            size="sm"
                            variant={viewMode === 'grid' ? 'solid' : 'light'}
                            color={viewMode === 'grid' ? 'primary' : 'default'}
                            onPress={() => setViewMode('grid')}
                        >
                            <LayoutGrid size={16} />
                        </Button>
                    </div>
                </div>

                {/* --- Main Content --- */}
                {viewMode === 'table' ? (
                    <Card className="border shadow-sm border-border-default">
                        <CardBody className="p-0">
                            <Table
                                aria-label="Departments List"
                                shadow="none"
                                removeWrapper
                                className="min-w-full"
                            >
                                <TableHeader>
                                    <TableColumn>DEPARTMENT NAME</TableColumn>
                                    <TableColumn>CODE</TableColumn>
                                    <TableColumn>COLOR TAG</TableColumn>
                                    <TableColumn>MEMBERS</TableColumn>
                                    <TableColumn align="end">
                                        ACTIONS
                                    </TableColumn>
                                </TableHeader>
                                <TableBody emptyContent="No departments found.">
                                    {filteredDepts.map((dept) => (
                                        <TableRow
                                            key={dept.id}
                                            className="border-b hover:bg-background-hovered border-border-default last:border-none group"
                                        >
                                            <TableCell>
                                                <div>
                                                    <p className="font-bold text-text-default">
                                                        {dept.displayName}
                                                    </p>
                                                    <p className="text-xs truncate text-text-subdued max-w-50">
                                                        {dept.notes ||
                                                            'No description'}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="px-2 py-1 font-mono text-xs font-bold rounded bg-background-hovered text-text-subdued">
                                                    {dept.code}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-5 h-5 border rounded-full border-white/20"
                                                        style={{
                                                            backgroundColor:
                                                                dept.hexColor,
                                                        }}
                                                    ></div>
                                                    <span className="font-mono text-xs uppercase text-text-subdued">
                                                        {dept.hexColor}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm font-medium text-text-subdued">
                                                    <Users size={14} />{' '}
                                                    {dept._count.users}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="light"
                                                        onPress={() =>
                                                            router.navigate({
                                                                href: INTERNAL_URLS.management.departmentsDetail(
                                                                    dept.code
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
                                                        onPress={() =>
                                                            onEdit(dept)
                                                        }
                                                    >
                                                        <Edit size={16} />
                                                    </Button>
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="light"
                                                        color="danger"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardBody>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredDepts.map((dept) => (
                            <Card
                                key={dept.id}
                                className="transition-all border border-border-default hover:border-primary/40 bg-background/40 backdrop-blur-sm group"
                            >
                                <CardBody className="flex flex-col gap-4 p-4">
                                    <div className="flex items-start justify-between">
                                        <div
                                            className="flex items-center justify-center w-12 h-12 text-lg font-black text-white shadow-lg rounded-2xl"
                                            style={{
                                                backgroundColor: dept.hexColor,
                                                boxShadow: `0 10px 20px -10px ${dept.hexColor}`,
                                            }}
                                        >
                                            {dept.code
                                                .substring(0, 2)
                                                .toUpperCase()}
                                        </div>
                                        <div className="flex gap-1 transition-opacity opacity-0 group-hover:opacity-100">
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="flat"
                                                onPress={() =>
                                                    handleOpenEdit(dept)
                                                }
                                            >
                                                <Edit size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold leading-tight">
                                            {dept.displayName}
                                        </h4>
                                        <p className="text-[10px] font-mono text-text-subdued uppercase tracking-widest mt-1">
                                            {dept.code}
                                        </p>
                                    </div>
                                    <p className="h-8 text-xs text-text-subdued line-clamp-2">
                                        {dept.notes ||
                                            'No description provided.'}
                                    </p>
                                    <div className="flex items-center justify-between pt-3 mt-auto border-t border-border-default">
                                        <div className="flex items-center gap-1.5 text-text-subdued text-xs font-bold">
                                            <Users size={14} />{' '}
                                            {dept._count.users} members
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="light"
                                            onPress={() =>
                                                router.navigate({
                                                    href: INTERNAL_URLS.management.departmentsDetail(
                                                        dept.code
                                                    ),
                                                })
                                            }
                                        >
                                            Details
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}
            </AdminContentContainer>
        </>
    )
}
