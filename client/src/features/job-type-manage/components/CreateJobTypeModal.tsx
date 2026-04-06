import { createJobTypeOptions, CreateJobTypeSchema } from '@/lib'; // Adjust paths
import {
	addToast,
	Button,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader
} from '@heroui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { Cloud, Hash, Save, Search, Settings, Tag } from 'lucide-react'
import { useState } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import { ResolvePathModal } from '../../sharepoint'

interface CreateJobTypeModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateJobTypeModal({
    isOpen,
    onOpenChange,
}: CreateJobTypeModalProps) {
    const queryClient = useQueryClient()
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)

    const { mutateAsync: createJobType, isPending } = useMutation({
        ...createJobTypeOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job-types'] })
            addToast({
                title: 'Success',
                description: 'New job type created',
                color: 'success',
            })
            onOpenChange(false)
            formik.resetForm()
        },
    })

    const formik = useFormik({
        initialValues: {
            displayName: '',
            code: '',
            hexColor: '#3b82f6',
            sharepointFolderId: '',
        },
        validationSchema: toFormikValidationSchema(CreateJobTypeSchema),
        onSubmit: async (values) => {
            await createJobType(values)
        },
    })

    return (
        <>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="2xl"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex items-center gap-2 border-b border-default-100">
                                <Settings size={20} className="text-primary" />
                                <span>Create New Job Type</span>
                            </ModalHeader>
                            <ModalBody className="py-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        name="displayName"
                                        label="Display Name"
                                        placeholder="e.g. Standard Rendering"
                                        labelPlacement="outside"
                                        variant="bordered"
                                        isRequired
                                        value={formik.values.displayName}
                                        onChange={formik.handleChange}
                                        isInvalid={!!formik.errors.displayName}
                                        errorMessage={formik.errors.displayName}
                                        startContent={
                                            <Tag
                                                size={16}
                                                className="text-default-400"
                                            />
                                        }
                                        className="md:col-span-2"
                                    />

                                    <Input
                                        name="code"
                                        label="System Code"
                                        placeholder="e.g. STD"
                                        labelPlacement="outside"
                                        variant="bordered"
                                        isRequired
                                        value={formik.values.code}
                                        onChange={(e) =>
                                            formik.setFieldValue(
                                                'code',
                                                e.target.value.toUpperCase()
                                            )
                                        }
                                        isInvalid={!!formik.errors.code}
                                        errorMessage={formik.errors.code}
                                        startContent={
                                            <Hash
                                                size={16}
                                                className="text-default-400"
                                            />
                                        }
                                    />

                                    <Input
                                        name="hexColor"
                                        label="Hex Color"
                                        labelPlacement="outside"
                                        variant="bordered"
                                        value={formik.values.hexColor}
                                        onChange={formik.handleChange}
                                        startContent={
                                            <div
                                                className="w-4 h-4 rounded-full border border-black/10"
                                                style={{
                                                    backgroundColor:
                                                        formik.values.hexColor,
                                                }}
                                            />
                                        }
                                    />

                                    <div className="md:col-span-2 space-y-2">
                                        <div className="flex justify-between items-end">
                                            <Input
                                                name="sharepointFolderId"
                                                label="SharePoint Template ID"
                                                placeholder="Unique ID"
                                                labelPlacement="outside"
                                                variant="bordered"
                                                value={
                                                    formik.values
                                                        .sharepointFolderId
                                                }
                                                onChange={formik.handleChange}
                                                className="flex-1"
                                                startContent={
                                                    <Cloud
                                                        size={16}
                                                        className="text-default-400"
                                                    />
                                                }
                                            />
                                            <Button
                                                variant="light"
                                                color="primary"
                                                size="sm"
                                                className="ml-2 mb-1"
                                                startContent={
                                                    <Search size={14} />
                                                }
                                                onPress={() =>
                                                    setIsResolveModalOpen(true)
                                                }
                                            >
                                                Resolve
                                            </Button>
                                        </div>
                                        <p className="text-[10px] text-default-400 italic">
                                            This folder will be used as a
                                            template for all jobs of this type.
                                        </p>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter className="border-t border-default-100">
                                <Button variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    className="font-bold"
                                    startContent={<Save size={18} />}
                                    isLoading={isPending}
                                    onPress={() => formik.handleSubmit()}
                                >
                                    Create Type
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Path Resolver Integration */}
            <ResolvePathModal
                isOpen={isResolveModalOpen}
                onOpenChange={setIsResolveModalOpen}
                onResolved={(id) =>
                    formik.setFieldValue('sharepointFolderId', id)
                }
            />
        </>
    )
}
