import {
    CreateDepartmentSchema,
    INTERNAL_URLS,
    TCreateDepartmentInput,
} from '@/lib'
import { departmentsListOptions } from '@/lib/queries'
import {
    AdminPageHeading,
    HeroModal,
    HeroModalBody,
    HeroModalContent,
    HeroModalFooter,
    HeroModalHeader,
} from '@/shared/components'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import { TDepartment } from '@/shared/types'
import {
    Badge,
    Button,
    Card,
    CardBody,
    Input,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Textarea,
    useDisclosure,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useFormik } from 'formik'
import {
    Edit,
    Eye,
    Hash,
    Palette,
    Plus,
    Search,
    Trash2,
    Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/_administrator/mgmt/departments/')({
    loader: ({ context }) => {
        return context.queryClient.ensureQueryData(departmentsListOptions())
    },
    component: DepartmentsSettingsPage,
})

// --- Color Palette Options ---
const PRESET_COLORS = [
    '#3B82F6', // Blue
    '#8B5CF6', // Violet
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#64748B', // Slate
]

function DepartmentsSettingsPage() {
    const router = useRouter()
    const {
        data: { departments },
    } = useSuspenseQuery({
        ...departmentsListOptions(),
    })
    const [searchQuery, setSearchQuery] = useState('')
    const [editingDept, setEditingDept] = useState<TDepartment | null>(null)
    const [formValues, setFormValues] = useState<TCreateDepartmentInput>({
        code: '',
        displayName: '',
        hexColor: '#EF4444',
        notes: '',
    })

    console.log(departments)

    const createDepartmentDisclosure = useDisclosure({
        id: 'CreateDepartmentModal',
    })

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

    // --- Handlers ---
    const handleOpenAdd = () => {
        setEditingDept(null)
        setFormValues({
            code: '',
            displayName: '',
            hexColor: '#EF4444',
            notes: '',
        })
        createDepartmentDisclosure.onOpen()
    }

    const handleOpenEdit = (dept: TDepartment) => {
        setEditingDept(dept)
        setFormValues({
            code: dept.code,
            displayName: dept.displayName,
            hexColor: dept.hexColor,
            notes: dept.notes ?? undefined,
        })
        createDepartmentDisclosure.onOpen()
    }

    // const handleSave = () => {
    //     if (editingDept) {
    //         // Edit Logic
    //         setDepartments(
    //             departments.map((d) =>
    //                 d.id === editingDept.id
    //                     ? ({ ...d, ...formData } as TDepartment)
    //                     : d
    //             )
    //         )
    //     } else {
    //         // Create Logic
    //         const newDept = {
    //             ...formData,
    //             id: Math.random().toString(36).substr(2, 9),
    //             memberCount: 0,
    //         } as unknown as TDepartment
    //         setDepartments([...departments, newDept])
    //     }
    //     onOpenChange()
    // }

    // const handleDelete = (id: string) => {
    //     if (
    //         window.confirm(
    //             'Are you sure? This will remove the department tag from all users.'
    //         )
    //     ) {
    //         setDepartments(departments.filter((d) => d.id !== id))
    //     }
    // }

    return (
        <>
            {/* --- Add/Edit Modal --- */}
            {createDepartmentDisclosure.isOpen && (
                <CreateDepartmentModal
                    isOpen={createDepartmentDisclosure.isOpen}
                    onClose={createDepartmentDisclosure.onClose}
                    isEditing={Boolean(editingDept)}
                    initialValues={formValues}
                />
            )}
            <AdminPageHeading
                title={
                    <Badge
                        content={0}
                        size="sm"
                        color="danger"
                        variant="solid"
                        classNames={{
                            badge: '-right-1 top-1 text-[10px]! font-bold!',
                        }}
                    >
                        Departments
                    </Badge>
                }
            />

            <AdminContentContainer className="mt-2">
                {/* --- Header --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <Button
                        color="primary"
                        startContent={<Plus size={18} />}
                        onPress={handleOpenAdd}
                        className="font-medium shadow-md shadow-blue-500/20"
                    >
                        Add Department
                    </Button>
                </div>

                {/* --- Content Card --- */}
                <Card className="mt-5 shadow-sm border border-border-default">
                    <CardBody className="p-0">
                        {/* Toolbar */}
                        <div className="p-4 border-b border-border-default flex justify-between items-center bg-background-muted rounded-t-lg">
                            <Input
                                placeholder="Search departments..."
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
                                onClear={() => setSearchQuery('')}
                            />
                            <span className="text-xs text-text-subdued font-medium">
                                {filteredDepts.length} Groups
                            </span>
                        </div>

                        {/* Table */}
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
                                <TableColumn align="end">ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody emptyContent="No departments found.">
                                {filteredDepts.map((dept) => (
                                    <TableRow
                                        key={dept.id}
                                        className="hover:bg-background-hovered border-b border-border-default last:border-none group"
                                    >
                                        <TableCell>
                                            <div>
                                                <p className="font-bold text-text-default">
                                                    {dept.displayName}
                                                </p>
                                                <p className="text-xs text-text-subdued truncate max-w-50">
                                                    {dept.notes ||
                                                        'No description'}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-xs font-bold bg-background-hovered px-2 py-1 rounded text-text-subdued">
                                                {dept.code}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                                    style={{
                                                        backgroundColor:
                                                            dept.hexColor,
                                                    }}
                                                ></div>
                                                <span className="text-xs text-text-subdued font-mono">
                                                    {dept.hexColor}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-text-subdued text-sm">
                                                <Users
                                                    size={16}
                                                    className="text-text-subdued"
                                                />
                                                {dept._count.users}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-2">
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
                                                        handleOpenEdit(dept)
                                                    }
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    color="danger"
                                                    // onPress={() =>
                                                    //     handleDelete(dept.id)
                                                    // }
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
            </AdminContentContainer>
        </>
    )
}

type CreateDepartmentModalProps = {
    isOpen: boolean
    onClose: () => void
    isEditing: boolean
    initialValues?: TCreateDepartmentInput
}
function CreateDepartmentModal({
    isOpen,
    onClose,
    isEditing,
    initialValues = {
        displayName: '',
        code: '',
        hexColor: '#3B82F6',
        notes: '',
    },
}: CreateDepartmentModalProps) {
    // Form State
    const [formData, setFormData] = useState<Partial<TDepartment>>()
    const formik = useFormik<TCreateDepartmentInput>({
        initialValues: initialValues,
        enableReinitialize: true,
        validationSchema: CreateDepartmentSchema,
        onSubmit: async (values) => {
            console.log(values)
        },
    })

    return (
        <HeroModal
            isOpen={isOpen}
            onClose={onClose}
            placement="center"
            size="lg"
        >
            <HeroModalContent>
                {(onClose) => (
                    <>
                        <HeroModalHeader className="flex flex-col gap-1">
                            {isEditing ? 'Edit Department' : 'New Department'}
                        </HeroModalHeader>
                        <HeroModalBody>
                            <form
                                onSubmit={formik.handleSubmit}
                                className="space-y-4"
                            >
                                {/* Name & Code Row */}
                                <div className="flex gap-4">
                                    <Input
                                        name="displayName"
                                        label="Display name"
                                        placeholder="e.g. Design Team"
                                        labelPlacement="outside-top"
                                        variant="bordered"
                                        className="flex-1"
                                        value={formik.values.displayName}
                                        onChange={formik.handleChange}
                                    />
                                    <Input
                                        name="code"
                                        label="Code"
                                        placeholder="e.g. DES"
                                        labelPlacement="outside-top"
                                        variant="bordered"
                                        className="w-32"
                                        startContent={
                                            <Hash
                                                size={14}
                                                className="text-text-subdued"
                                            />
                                        }
                                        value={formik.values.code}
                                        onChange={formik.handleChange}
                                    />
                                </div>

                                {/* Description */}
                                <Textarea
                                    name="notes"
                                    label="Description"
                                    placeholder="What does this team do?"
                                    labelPlacement="outside-top"
                                    variant="bordered"
                                    minRows={2}
                                    classNames={{
                                        input: 'py-2',
                                    }}
                                    value={formik.values.notes}
                                    onChange={formik.handleChange}
                                />

                                {/* Color Picker */}
                                <div>
                                    <label className="text-small font-medium text-foreground mb-2 block">
                                        Theme Color
                                    </label>
                                    <Popover
                                        placement="bottom"
                                        showArrow={true}
                                    >
                                        <PopoverTrigger>
                                            <Button
                                                variant="bordered"
                                                className="w-full justify-start"
                                                startContent={
                                                    <div
                                                        className="w-5 h-5 rounded-full border border-border-default"
                                                        style={{
                                                            backgroundColor:
                                                                formik.values
                                                                    .hexColor,
                                                        }}
                                                    ></div>
                                                }
                                            >
                                                {formik.values.hexColor}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-64">
                                            <div className="px-1 py-2 w-full">
                                                <p className="text-small font-bold text-foreground mb-2">
                                                    Select Color
                                                </p>
                                                <div className="grid grid-cols-5 gap-2">
                                                    {PRESET_COLORS.map(
                                                        (color) => (
                                                            <button
                                                                key={color}
                                                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${formik.values.hexColor === color ? 'border-slate-800' : 'border-transparent'}`}
                                                                style={{
                                                                    backgroundColor:
                                                                        color,
                                                                }}
                                                                onClick={() =>
                                                                    setFormData(
                                                                        {
                                                                            ...formData,
                                                                            hexColor:
                                                                                color,
                                                                        }
                                                                    )
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-border-default">
                                                    <Input
                                                        size="sm"
                                                        label="Custom Hex"
                                                        variant="flat"
                                                        value={
                                                            formik.values
                                                                .hexColor
                                                        }
                                                        onValueChange={(v) =>
                                                            setFormData({
                                                                ...formData,
                                                                hexColor: v,
                                                            })
                                                        }
                                                        startContent={
                                                            <Palette
                                                                size={14}
                                                            />
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </form>
                        </HeroModalBody>
                        <HeroModalFooter>
                            <Button
                                color="danger"
                                variant="light"
                                onPress={onClose}
                            >
                                Cancel
                            </Button>
                            <Button color="primary" type="submit">
                                Save Department
                            </Button>
                        </HeroModalFooter>
                    </>
                )}
            </HeroModalContent>
        </HeroModal>
    )
}
