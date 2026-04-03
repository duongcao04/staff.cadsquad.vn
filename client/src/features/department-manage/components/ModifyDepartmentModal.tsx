import {
    COLORS,
    createDepartmentOptions,
    CreateDepartmentSchema,
    departmentOptions,
    TCreateDepartmentInput,
    updateDepartmentOption,
} from '@/lib'
import {
    addToast,
    Button,
    cn,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Textarea,
    Tooltip,
} from '@heroui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useFormik } from 'formik'
import lodash from 'lodash'
import { Hash, Palette, Sparkles, X } from 'lucide-react'
import slugify from 'slugify'
import { toFormikValidationSchema } from 'zod-formik-adapter'

const PRESET_COLORS = [
    '#3B82F6',
    '#8B5CF6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#EC4899',
    '#6366F1',
    '#14B8A6',
    '#F97316',
    '#64748B',
]

type ModifyDepartmentModalProps = {
    isOpen: boolean
    onClose: () => void
    deptId?: string
    onRefresh: () => void
}

export function ModifyDepartmentModal({
    isOpen,
    onClose,
    deptId,
    onRefresh,
}: ModifyDepartmentModalProps) {
    const isEditing = !lodash.isEmpty(deptId)

    const { data: departmentData } = useQuery({
        ...departmentOptions(deptId || '-1'),
        enabled: !!deptId,
    })
    const department = departmentData?.department

    const createAction = useMutation(createDepartmentOptions)
    const updateAction = useMutation(updateDepartmentOption)

    const formik = useFormik<TCreateDepartmentInput>({
        initialValues: {
            code: '',
            displayName: '',
            hexColor: '#3B82F6',
            notes: '',
            ...department,
        },
        enableReinitialize: true,
        validationSchema: toFormikValidationSchema(CreateDepartmentSchema),
        onSubmit: async (values) => {
            if (!isEditing) {
                createAction.mutateAsync(
                    {
                        displayName: values.displayName,
                        code: values.code,
                        hexColor: values.hexColor,
                        notes: values.notes,
                    },
                    {
                        onSuccess() {
                            onRefresh()
                            addToast({
                                title: 'Successfully',
                                description:
                                    'Create new department successfully',
                                color: 'success',
                            })
                        },
                    }
                )
            } else {
                if (!deptId) return
                updateAction.mutateAsync(
                    {
                        id: deptId,
                        data: {
                            displayName: values.displayName,
                            code: values.code,
                            hexColor: values.hexColor,
                            notes: values.notes,
                        },
                    },
                    {
                        onSuccess() {
                            onRefresh()
                            addToast({
                                title: 'Update successfully',
                                color: 'success',
                            })
                        },
                    }
                )
            }
            formik.resetForm()
            onClose()
        },
    })

    const handleGenerateCode = () => {
        if (!formik.values.displayName) return
        const generated = slugify(formik.values.displayName, {
            replacement: '_',
            lower: false,
        })
            .toUpperCase()
            .replace(/[^A-Z0-9_]/g, '')
        formik.setFieldValue('code', generated)
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="2xl"
            classNames={{
                base: 'backdrop-blur-md shadow-2xl',
                header: 'border-b border-border-default pb-4',
                footer: 'border-t border-border-default pt-4',
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Hash size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold">
                                    {isEditing
                                        ? 'Modify Department'
                                        : 'New Department'}
                                </span>
                                <span className="text-xs italic font-normal text-text-subdued">
                                    Define workspace boundaries and team
                                    identity
                                </span>
                            </div>
                        </ModalHeader>
                        <ModalBody className="flex flex-row gap-6 py-6">
                            {/* Main Form Section */}
                            <form
                                id="dept-form"
                                onSubmit={formik.handleSubmit}
                                className="space-y-6 flex-2"
                            >
                                <Input
                                    name="displayName"
                                    label="Department Identity"
                                    placeholder="e.g. Core Engineering"
                                    labelPlacement="outside"
                                    variant="faded"
                                    size="lg"
                                    classNames={{
                                        label: 'font-semibold text-xs uppercase tracking-wider',
                                    }}
                                    value={formik.values.displayName}
                                    onChange={formik.handleChange}
                                />

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold tracking-wider uppercase text-foreground">
                                        System Reference Code
                                    </label>
                                    <div className="flex gap-2 group">
                                        <Input
                                            name="code"
                                            placeholder="ENG_CORE"
                                            variant="bordered"
                                            className="flex-1"
                                            startContent={
                                                <Hash
                                                    size={14}
                                                    className="text-primary/60"
                                                />
                                            }
                                            value={formik.values.code}
                                            onChange={formik.handleChange}
                                        />
                                        <Tooltip
                                            content="Auto-generate from name"
                                            showArrow
                                        >
                                            <Button
                                                isIconOnly
                                                variant="flat"
                                                color="primary"
                                                className="shadow-lg shadow-primary/10"
                                                onPress={handleGenerateCode}
                                                isDisabled={
                                                    !formik.values.displayName
                                                }
                                            >
                                                <Sparkles size={18} />
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </div>

                                <Textarea
                                    name="notes"
                                    label="Notes"
                                    placeholder="Describe the department's scope..."
                                    labelPlacement="outside"
                                    variant="faded"
                                    minRows={3}
                                    classNames={{
                                        label: 'font-semibold text-xs uppercase tracking-wider',
                                    }}
                                    value={formik.values.notes || ''}
                                    onChange={formik.handleChange}
                                />
                            </form>

                            {/* Aesthetics Sidebar */}
                            <div className="flex-1 pl-6 space-y-4 border-l border-white/10">
                                <label className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                                    <Palette size={14} /> Brand Theme
                                </label>

                                <div
                                    className="relative flex items-center justify-center w-full h-24 overflow-hidden transition-all duration-500 border shadow-inner rounded-xl border-white/10"
                                    style={{
                                        backgroundColor: `${formik.values.hexColor}15`,
                                        borderColor: `${formik.values.hexColor}40`,
                                    }}
                                >
                                    <div
                                        className="absolute inset-0 opacity-20 blur-2xl"
                                        style={{
                                            backgroundColor:
                                                formik.values.hexColor ||
                                                COLORS.white,
                                        }}
                                    />
                                    <div
                                        className="z-10 w-12 h-12 border-2 rounded-full shadow-2xl border-white/20 ring-4 ring-black/10"
                                        style={{
                                            backgroundColor:
                                                formik.values.hexColor ||
                                                COLORS.white,
                                        }}
                                    />
                                </div>

                                <div className="grid grid-cols-4 gap-2 mt-4">
                                    {PRESET_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={cn(
                                                'w-full aspect-square rounded-md transition-all hover:scale-110',
                                                formik.values.hexColor === color
                                                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                                                    : 'opacity-80 hover:opacity-100'
                                            )}
                                            style={{ backgroundColor: color }}
                                            onClick={() =>
                                                formik.setFieldValue(
                                                    'hexColor',
                                                    color
                                                )
                                            }
                                        />
                                    ))}
                                </div>

                                <Input
                                    size="sm"
                                    variant="underlined"
                                    label="Hex Override"
                                    value={formik.values.hexColor || ''}
                                    onValueChange={(v) =>
                                        formik.setFieldValue('hexColor', v)
                                    }
                                    className="mt-2"
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                variant="light"
                                onPress={onClose}
                                className="font-medium"
                                startContent={<X size={16} />}
                            >
                                Discard
                            </Button>
                            <Button
                                color="primary"
                                type="submit"
                                form="dept-form"
                                className="px-8 font-bold shadow-lg shadow-primary/20"
                                isLoading={createAction.isPending}
                            >
                                {isEditing ? 'Save Changes' : 'Create'}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
