import {
    Button,
    cn,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Radio,
    RadioGroup,
    Textarea,
} from '@heroui/react'
import { GlobeIcon,LockIcon, UsersIcon } from 'lucide-react'
import { useState } from 'react'

import {
    createCommunitySchema,
    TCreateCommunityInput,
} from '../../../../lib/validationSchemas/_community.schema'

// --- 1. Define Constants & Schema ---
const COLORS = [
    'bg-pink-600',
    'bg-purple-600',
    'bg-indigo-600',
    'bg-blue-600',
    'bg-cyan-600',
    'bg-teal-600',
    'bg-green-600',
    'bg-orange-600',
    'bg-red-600',
    'bg-zinc-700',
] as const // "as const" allows Zod to use this array as a literal enum

interface CreateCommunityModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit?: (data: TCreateCommunityInput) => void
}

export const CreateCommunityModal = ({
    isOpen,
    onClose,
    onSubmit,
}: CreateCommunityModalProps) => {
    // Form State
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [selectedColor, setSelectedColor] = useState<string>(COLORS[2])
    const [privacy, setPrivacy] = useState<string>('public')

    // UI State
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Generate initials for the preview icon
    const getInitials = (str: string) => {
        if (!str) return 'C'
        return str
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
    }

    const handleSubmit = async (closeModal: () => void) => {
        // --- 2. Validation Logic ---
        const payload = {
            name,
            description,
            color: selectedColor,
            privacy,
        }

        const result = createCommunitySchema.safeParse(payload)

        if (!result.success) {
            // Map Zod errors to a simple object: { name: "Error message", ... }
            const fieldErrors: Record<string, string> = {}
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] // e.g., "name"
                if (path) {
                    fieldErrors[path.toString()] = issue.message
                }
            })
            setErrors(fieldErrors)
            return // Stop execution if validation fails
        }

        // Clear errors if validation passes
        setErrors({})
        setIsLoading(true)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        console.log('Creating Community:', result.data) // result.data contains the typed, validated data

        if (onSubmit) {
            // We cast result.data to match the interface needed,
            // though keeping strict types is better.
            onSubmit(result.data as TCreateCommunityInput)
        }

        setIsLoading(false)

        // Reset form
        setName('')
        setDescription('')
        setPrivacy('public')
        setSelectedColor(COLORS[2])
        closeModal()
    }

    // Clear specific error when user types
    const handleNameChange = (value: string) => {
        setName(value)
        if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
    }

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onClose} // Use onOpenChange for standard HeroUI behavior
            placement="center"
            backdrop="blur"
            size="lg"
            classNames={{
                base: 'bg-zinc-900 border border-zinc-800 text-zinc-100',
                header: 'border-b border-zinc-800',
                footer: 'border-t border-zinc-800',
                closeButton: 'hover:bg-zinc-800 active:bg-zinc-700',
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            Create a Community
                            <span className="text-sm font-normal text-zinc-400">
                                Communities are spaces where teams communicate
                                and collaborate.
                            </span>
                        </ModalHeader>

                        <ModalBody className="py-6">
                            <div className="flex flex-col gap-6">
                                {/* 1. Identity Section (Icon Preview & Name) */}
                                <div className="flex gap-4 items-start">
                                    {/* Icon Preview */}
                                    <div className="flex flex-col gap-2 items-center">
                                        <div
                                            className={cn(
                                                'w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg transition-colors duration-300',
                                                selectedColor
                                            )}
                                        >
                                            {getInitials(name)}
                                        </div>
                                        <span className="text-xs text-zinc-500">
                                            Preview
                                        </span>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        {/* --- Name Input with Validation --- */}
                                        <Input
                                            autoFocus
                                            label="Community Name"
                                            placeholder="e.g. Engineering Dept"
                                            variant="bordered"
                                            value={name}
                                            onValueChange={handleNameChange}
                                            isInvalid={!!errors.name}
                                            errorMessage={errors.name}
                                            classNames={{
                                                inputWrapper:
                                                    'bg-zinc-950 border-zinc-700 hover:border-zinc-600 focus-within:border-primary data-[hover=true]:border-zinc-600',
                                                label: 'text-zinc-400',
                                            }}
                                        />

                                        {/* Color Picker */}
                                        <div>
                                            <label className="text-tiny text-zinc-400 block mb-2">
                                                Theme Color
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {COLORS.map((color) => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedColor(
                                                                color
                                                            )
                                                        }
                                                        className={cn(
                                                            'w-6 h-6 rounded-full transition-all hover:scale-110',
                                                            color,
                                                            selectedColor ===
                                                                color
                                                                ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110'
                                                                : 'opacity-70 hover:opacity-100'
                                                        )}
                                                        aria-label="Select color"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Description with Validation */}
                                <Textarea
                                    label="Description"
                                    placeholder="What is this community for?"
                                    variant="bordered"
                                    value={description}
                                    onValueChange={setDescription}
                                    isInvalid={!!errors.description}
                                    errorMessage={errors.description}
                                    classNames={{
                                        inputWrapper:
                                            'bg-zinc-950 border-zinc-700 hover:border-zinc-600 focus-within:border-primary',
                                        label: 'text-zinc-400',
                                    }}
                                />

                                {/* 3. Privacy Settings */}
                                <div>
                                    <label className="text-small font-medium text-zinc-300 mb-2 block">
                                        Privacy
                                    </label>
                                    <RadioGroup
                                        value={privacy}
                                        onValueChange={setPrivacy}
                                        color="primary"
                                    >
                                        <div
                                            className={cn(
                                                'flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:bg-zinc-800/50',
                                                privacy === 'public'
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-zinc-700 bg-transparent'
                                            )}
                                            onClick={() => setPrivacy('public')}
                                        >
                                            <Radio
                                                value="public"
                                                className="mt-1"
                                            />
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 font-medium text-zinc-200">
                                                    <GlobeIcon size={16} />{' '}
                                                    Public
                                                </div>
                                                <span className="text-tiny text-zinc-400">
                                                    Anyone in your organization
                                                    can find and join.
                                                </span>
                                            </div>
                                        </div>
                                        <div className="h-2" />
                                        <div
                                            className={cn(
                                                'flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:bg-zinc-800/50',
                                                privacy === 'private'
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-zinc-700 bg-transparent'
                                            )}
                                            onClick={() =>
                                                setPrivacy('private')
                                            }
                                        >
                                            <Radio
                                                value="private"
                                                className="mt-1"
                                            />
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 font-medium text-zinc-200">
                                                    <LockIcon size={16} />{' '}
                                                    Private
                                                </div>
                                                <span className="text-tiny text-zinc-400">
                                                    Only invited members can
                                                    view content.
                                                </span>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                        </ModalBody>

                        <ModalFooter>
                            <Button
                                variant="flat"
                                onPress={onClose}
                                className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onPress={() => handleSubmit(onClose)}
                                isLoading={isLoading}
                                startContent={
                                    !isLoading && <UsersIcon size={18} />
                                }
                            >
                                Create Community
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
