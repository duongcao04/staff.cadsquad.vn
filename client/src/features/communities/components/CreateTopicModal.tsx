import {
    Button,
    Form,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Textarea,
} from '@heroui/react'
import React, { useState } from 'react'

import {
    createTopicSchema,
    TCreateTopicInput,
} from '../../../lib/validationSchemas/_topic.schema'

interface CreateTopicModalProps {
    isOpen: boolean
    onClose: () => void
    communityId?: string
    // Updated type to use the Zod inferred type
    onSubmit: (data: TCreateTopicInput) => Promise<void>
}

export const CreateTopicModal = ({
    isOpen,
    onClose,
    communityId,
    onSubmit,
}: CreateTopicModalProps) => {
    const [isLoading, setIsLoading] = useState(false)

    // Form State
    const [formData, setFormData] = useState<TCreateTopicInput>({
        title: '',
        description: '',
    })

    // Validation State
    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // --- 2. Run Validation ---
        const result = createTopicSchema.safeParse(formData)

        if (!result.success) {
            const fieldErrors: Record<string, string> = {}
            result.error.issues.forEach((issue) => {
                const path = issue.path[0]
                if (path) {
                    fieldErrors[path.toString()] = issue.message
                }
            })
            setErrors(fieldErrors)
            return
        }

        // --- 3. Submit Valid Data ---
        try {
            setIsLoading(true)
            setErrors({}) // Clear errors

            await onSubmit(result.data)

            // Reset form on success
            setFormData({ title: '', description: '' })
            onClose()
        } catch (error) {
            console.error('Failed to create topic', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Helper to update fields and clear specific error on change
    const handleFieldChange = (
        field: keyof TCreateTopicInput,
        value: string
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: undefined as unknown as string,
            }))
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onClose} // Best practice: mapped to onOpenChange
            placement="center"
            backdrop="blur"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            Create New Topic
                            {communityId && (
                                <span className="text-small font-normal text-default-500">
                                    for Community #{communityId}
                                </span>
                            )}
                        </ModalHeader>

                        <ModalBody>
                            <Form
                                className="flex flex-col gap-4"
                                onSubmit={handleSubmit}
                                id="create-topic-form"
                            >
                                <Input
                                    autoFocus
                                    label="Title"
                                    placeholder="e.g., General Discussion"
                                    variant="bordered"
                                    value={formData.title}
                                    onValueChange={(val) =>
                                        handleFieldChange('title', val)
                                    }
                                    isInvalid={!!errors.title}
                                    errorMessage={errors.title}
                                    isRequired
                                />

                                <Textarea
                                    label="Description"
                                    placeholder="What is this topic about?"
                                    variant="bordered"
                                    minRows={3}
                                    value={formData.description || ''}
                                    onValueChange={(val) =>
                                        handleFieldChange('description', val)
                                    }
                                    isInvalid={!!errors.description}
                                    errorMessage={errors.description}
                                />
                            </Form>
                        </ModalBody>

                        <ModalFooter>
                            <Button
                                color="danger"
                                variant="flat"
                                onPress={onClose}
                                isDisabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                type="submit"
                                form="create-topic-form"
                                isLoading={isLoading}
                            >
                                Create Topic
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
