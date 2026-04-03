import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Textarea,
    Tooltip,
} from '@heroui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useFormik } from 'formik'
import lodash from 'lodash'
import { Hash, Palette, Wand2 } from 'lucide-react' // Added Wand2 icon
import { toFormikValidationSchema } from 'zod-formik-adapter'
import {
    createDepartmentOptions,
    departmentOptions,
    TCreateDepartmentInput,
} from '../../../lib'
import { CreateDepartmentSchema } from '../../../lib/validationSchemas'
import slugify from 'slugify'

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
}

export function ModifyDepartmentModal({
    isOpen,
    onClose,
    deptId,
}: ModifyDepartmentModalProps) {
    const isEditing = !lodash.isEmpty(deptId)

    const { data: department } = useQuery({
        ...departmentOptions(deptId || '-1'),
        enabled: !!deptId,
    })

    const createAction = useMutation(createDepartmentOptions)

    const formik = useFormik<TCreateDepartmentInput>({
        initialValues: {
            code: '',
            displayName: '',
            hexColor: '#3B82F6', // Default color
            notes: '',
            ...department,
        },
        enableReinitialize: true,
        validationSchema: toFormikValidationSchema(CreateDepartmentSchema),
        onSubmit: async (values) => {
            console.log('Submit:', values)
            onClose()
        },
    })

    // --- Logic to Generate Code ---
    const handleGenerateCode = () => {
        if (!formik.values.displayName) return

        // Take first 3 letters of each word or just first 4 of first word, uppercase
        const generated = slugify(formik.values.displayName).toUpperCase()

        formik.setFieldValue('code', generated.slice(0, 5)) // Cap at 5 chars
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} placement="center" size="lg">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="text-xl font-bold">
                            {isEditing
                                ? 'Edit Department'
                                : 'Create new Department'}
                        </ModalHeader>
                        <ModalBody>
                            <form
                                id="dept-form"
                                onSubmit={formik.handleSubmit}
                                className="space-y-5"
                            >
                                <div className="flex items-end gap-4">
                                    <Input
                                        name="displayName"
                                        label="Display name"
                                        placeholder="e.g. Design Team"
                                        labelPlacement="outside"
                                        variant="bordered"
                                        className="flex-1"
                                        value={formik.values.displayName}
                                        onChange={formik.handleChange}
                                    />
                                    <div className="relative flex items-end">
                                        <Input
                                            name="code"
                                            label="Code"
                                            placeholder="DES"
                                            labelPlacement="outside"
                                            variant="bordered"
                                            className="w-36"
                                            startContent={
                                                <Hash
                                                    size={14}
                                                    className="text-text-subdued"
                                                />
                                            }
                                            endContent={
                                                <Tooltip content="Auto-generate from name">
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="light"
                                                        className="w-6 h-6 min-w-6"
                                                        onPress={
                                                            handleGenerateCode
                                                        }
                                                        isDisabled={
                                                            !formik.values
                                                                .displayName
                                                        }
                                                    >
                                                        <Wand2
                                                            size={14}
                                                            className="text-primary"
                                                        />
                                                    </Button>
                                                </Tooltip>
                                            }
                                            value={formik.values.code}
                                            onChange={formik.handleChange}
                                        />
                                    </div>
                                </div>

                                <Textarea
                                    name="notes"
                                    label="Description"
                                    placeholder="Briefly describe this team..."
                                    labelPlacement="outside"
                                    variant="bordered"
                                    minRows={2}
                                    value={formik.values.notes}
                                    onChange={formik.handleChange}
                                />

                                <div>
                                    <label className="block mb-2 font-bold text-small">
                                        Theme Color
                                    </label>
                                    <Popover placement="bottom" showArrow>
                                        <PopoverTrigger>
                                            <Button
                                                variant="bordered"
                                                className="justify-start w-full font-mono"
                                                startContent={
                                                    <div
                                                        className="w-4 h-4 border rounded-full border-black/10"
                                                        style={{
                                                            backgroundColor:
                                                                formik.values
                                                                    .hexColor,
                                                        }}
                                                    />
                                                }
                                            >
                                                {formik.values.hexColor ||
                                                    'Select color'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-64 p-3">
                                            <div className="grid w-full grid-cols-5 gap-2">
                                                {PRESET_COLORS.map((color) => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${formik.values.hexColor === color ? 'border-primary shadow-sm' : 'border-transparent'}`}
                                                        style={{
                                                            backgroundColor:
                                                                color,
                                                        }}
                                                        onClick={() =>
                                                            formik.setFieldValue(
                                                                'hexColor',
                                                                color
                                                            )
                                                        }
                                                    />
                                                ))}
                                            </div>
                                            <div className="w-full pt-3 mt-3 border-t border-border-default">
                                                <Input
                                                    size="sm"
                                                    variant="flat"
                                                    value={
                                                        formik.values.hexColor
                                                    }
                                                    onValueChange={(v) =>
                                                        formik.setFieldValue(
                                                            'hexColor',
                                                            v
                                                        )
                                                    }
                                                    startContent={
                                                        <Palette size={14} />
                                                    }
                                                />
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </form>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                type="submit"
                                form="dept-form"
                                className="font-bold"
                                isLoading={createAction.isPending}
                            >
                                {isEditing ? 'Update' : 'Create'} Department
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
