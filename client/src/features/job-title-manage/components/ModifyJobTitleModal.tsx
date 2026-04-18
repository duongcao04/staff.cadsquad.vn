import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Skeleton,
    Textarea,
    Tooltip,
    addToast,
    useDisclosure,
} from '@heroui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useFormik } from 'formik'
import lodash from 'lodash'
import { Briefcase, Hash, AlignLeft, Sparkles } from 'lucide-react'
import { z } from 'zod'
import { toFormikValidate } from 'zod-formik-adapter'
// Replace these with your actual query/mutation imports
import {
    jobTitleOptions,
    createJobTitleOptions,
    updateJobTitleOptions,
} from '@/lib/queries'
import { CancelModal } from '../../../shared/components'

// --- Validation Schema ---
const JobTitleFormSchema = z.object({
    displayName: z.string().min(1, 'Display name is required'),
    code: z.string().min(1, 'Code is required').toUpperCase(),
    notes: z.string().optional().nullable(),
})

type TJobTitleFormValues = z.infer<typeof JobTitleFormSchema>

interface ModifyJobTitleModalProps {
    isOpen: boolean
    onClose: () => void
    afterSubmit?: () => void
    jobTitleId?: string // If provided -> Edit Mode. If undefined -> Create Mode.
}

export const ModifyJobTitleModal = ({
    isOpen,
    onClose,
    afterSubmit,
    jobTitleId,
}: ModifyJobTitleModalProps) => {
    const isEditMode = !!jobTitleId

    const cancelModalState = useDisclosure()

    // --- 1. Data Fetching (Only if Edit Mode) ---
    const { data, isLoading: isFetching } = useQuery({
        ...jobTitleOptions(jobTitleId || ''),
        enabled: isEditMode && isOpen,
    })

    const jobTitle = data?.jobTitle

    // --- 2. Mutations ---
    const createMutation = useMutation(createJobTitleOptions)
    const updateMutation = useMutation(updateJobTitleOptions)
    const isPending = createMutation.isPending || updateMutation.isPending

    const handleCloseModal = () => {
        if (!formik.dirty) {
            formik.resetForm()
            onClose()
        } else {
            cancelModalState.onOpen()
        }
    }

    // --- 3. Formik Setup ---
    const formik = useFormik<TJobTitleFormValues>({
        enableReinitialize: true,
        initialValues: {
            displayName: jobTitle?.displayName || '',
            code: jobTitle?.code || '',
            notes: jobTitle?.notes || '',
        },
        validate: toFormikValidate(JobTitleFormSchema),
        onSubmit: async (values) => {
            try {
                if (isEditMode && jobTitleId) {
                    await updateMutation.mutateAsync({
                        id: jobTitleId,
                        data: {
                            code: values.code,
                            displayName: values.displayName,
                            notes: values.notes || undefined,
                        },
                    })
                    addToast({
                        title: 'Job Title updated successfully',
                        color: 'success',
                    })
                } else {
                    await createMutation.mutateAsync({
                        code: values.code,
                        displayName: values.displayName,
                        notes: values.notes || undefined,
                    })
                    addToast({
                        title: 'Job Title created successfully',
                        color: 'success',
                    })
                }

                afterSubmit?.()
                onClose()
                formik.resetForm()
            } catch (error) {
                console.error('Submit error:', error)
                addToast({ title: 'An error occurred', color: 'danger' })
            }
        },
    })

    // --- 4. Auto-Generate Code ---
    const handleGenerateCode = () => {
        if (!formik.values.displayName) {
            addToast({
                title: 'Please enter a Display Name first',
                color: 'warning',
            })
            return
        }
        const slugifiedCode = lodash
            .kebabCase(formik.values.displayName)
            .toUpperCase()
        formik.setFieldValue('code', slugifiedCode)
    }

    return (
        <>
            <CancelModal
                isOpen={cancelModalState.isOpen}
                onClose={cancelModalState.onClose}
                onConfirm={() => {
                    formik.resetForm()
                    onClose()
                }}
            />
            <Modal
                isOpen={isOpen}
                onClose={handleCloseModal}
                size="md"
                placement="center"
            >
                <ModalContent>
                    {isEditMode && isFetching ? (
                        <ModifyJobTitleSkeleton />
                    ) : (
                        <form onSubmit={formik.handleSubmit}>
                            <ModalHeader className="flex flex-col gap-1 border-b border-default-100 pb-4 pt-6 px-6">
                                <span className="text-xl font-bold text-default-900">
                                    {isEditMode
                                        ? 'Edit Job Title'
                                        : 'Create Job Title'}
                                </span>
                                <p className="text-sm font-normal text-default-500">
                                    {isEditMode
                                        ? `Update details for ${jobTitle?.displayName}`
                                        : 'Add a new standardized job title to the system.'}
                                </p>
                            </ModalHeader>

                            <ModalBody className="grid grid-cols-1 gap-6 py-6 px-6">
                                <Input
                                    name="displayName"
                                    label="Display Name"
                                    labelPlacement="outside"
                                    placeholder="e.g. Senior 3D Artist"
                                    variant="bordered"
                                    classNames={{
                                        label: 'font-semibold text-default-700',
                                        inputWrapper: 'border-1',
                                    }}
                                    value={formik.values.displayName}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={Boolean(
                                        formik.touched.displayName &&
                                        formik.errors.displayName
                                    )}
                                    errorMessage={
                                        formik.touched.displayName &&
                                        formik.errors.displayName
                                    }
                                    isRequired
                                    startContent={
                                        <Briefcase
                                            size={16}
                                            className="text-default-400 mr-2"
                                        />
                                    }
                                />

                                <Input
                                    name="code"
                                    label="System Code"
                                    labelPlacement="outside"
                                    placeholder="e.g. SNR-3D-ARTIST"
                                    variant="bordered"
                                    classNames={{
                                        label: 'font-semibold text-default-700',
                                        inputWrapper: 'border-1 pr-1',
                                    }}
                                    value={formik.values.code}
                                    onChange={(e) =>
                                        formik.setFieldValue(
                                            'code',
                                            e.target.value.toUpperCase()
                                        )
                                    }
                                    onBlur={formik.handleBlur}
                                    isInvalid={Boolean(
                                        formik.touched.code &&
                                        formik.errors.code
                                    )}
                                    errorMessage={
                                        formik.touched.code &&
                                        formik.errors.code
                                    }
                                    isRequired
                                    startContent={
                                        <Hash
                                            size={16}
                                            className="text-default-400 mr-2"
                                        />
                                    }
                                    endContent={
                                        <Tooltip content="Auto-generate from name">
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="flat"
                                                color="primary"
                                                className="h-7 w-7 min-w-7"
                                                onPress={handleGenerateCode}
                                            >
                                                <Sparkles size={14} />
                                            </Button>
                                        </Tooltip>
                                    }
                                />

                                <Textarea
                                    name="notes"
                                    label="Notes / Description"
                                    labelPlacement="outside"
                                    placeholder="Optional details about this role's responsibilities..."
                                    variant="bordered"
                                    classNames={{
                                        label: 'font-semibold text-default-700',
                                        inputWrapper: 'border-1',
                                    }}
                                    minRows={3}
                                    value={formik.values.notes || ''}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    startContent={
                                        <AlignLeft
                                            size={16}
                                            className="text-default-400 mr-2 mt-1"
                                        />
                                    }
                                />
                            </ModalBody>

                            <ModalFooter className="border-t border-default-100 px-6 py-4">
                                <Button
                                    variant="flat"
                                    onPress={handleCloseModal}
                                    isDisabled={isPending}
                                    className="font-medium"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    type="submit"
                                    isLoading={isPending}
                                    className="font-bold shadow-sm"
                                >
                                    {isEditMode
                                        ? 'Save Changes'
                                        : 'Create Job Title'}
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

function ModifyJobTitleSkeleton() {
    return (
        <>
            <ModalHeader className="flex flex-col gap-2 pb-4 border-b border-default-100 pt-6 px-6">
                <Skeleton className="w-1/2 h-6 rounded-lg" />
                <Skeleton className="w-3/4 h-4 rounded-lg mt-1" />
            </ModalHeader>
            <ModalBody className="p-6 space-y-6">
                <div className="space-y-2">
                    <Skeleton className="w-1/3 h-4 rounded-lg" />
                    <Skeleton className="w-full h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="w-1/4 h-4 rounded-lg" />
                    <Skeleton className="w-full h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="w-1/3 h-4 rounded-lg" />
                    <Skeleton className="w-full h-20 rounded-xl" />
                </div>
            </ModalBody>
            <ModalFooter className="border-t border-default-100 px-6 py-4">
                <Skeleton className="w-20 h-10 rounded-xl" />
                <Skeleton className="w-32 h-10 rounded-xl" />
            </ModalFooter>
        </>
    )
}
