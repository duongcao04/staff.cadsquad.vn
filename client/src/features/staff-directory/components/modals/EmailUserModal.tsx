import { optimizeCloudinary } from '@/lib'
import { useSendManualEmailMutation } from '@/lib/queries/useEmail'
import {
    EMAIL_TEMPLATES,
    getFieldErrors,
    getFieldValue,
    isFieldInvalid,
} from '@/lib/utils'
import { SendEmailFormValues, sendEmailSchema } from '@/lib/validationSchemas'
import {
    HeroInput,
    HeroModal,
    HeroModalBody,
    HeroModalContent,
    HeroModalFooter,
    HeroModalHeader,
    RichInput,
} from '@/shared/components'
import { TUser } from '@/shared/types'
import {
    Avatar,
    Button,
    Chip,
    Divider,
    Input,
    Select,
    SelectItem,
} from '@heroui/react'
import { useForm } from '@tanstack/react-form'
import { Copy, FileText, Mail, Paperclip, Send } from 'lucide-react'
import { useEffect, useState } from 'react'

interface EmailUserModalProps {
    isOpen: boolean
    onClose: () => void
    user: TUser
}
export const EmailUserModal = ({
    isOpen,
    onClose,
    user,
}: EmailUserModalProps) => {
    const [showCc, setShowCc] = useState(false)
    const [attachments, setAttachments] = useState<string[]>([])

    // React Query Mutation
    const mutation = useSendManualEmailMutation()

    // --- TanStack Form ---
    const form = useForm({
        defaultValues: {
            to: user?.email || '',
            subject: '',
            content: '',
            cc: [],
            bcc: [],
        } as SendEmailFormValues,
        validators: {
            onChange: sendEmailSchema,
        },
        onSubmit: async ({ value }) => {
            console.log(value)

            // Execute Mutation
            await mutation.mutateAsync(value)
            onClose()
        },
    })

    // Reset/Initialize form when modal opens or user changes
    useEffect(() => {
        if (isOpen && user) {
            form.reset()
            form.setFieldValue('to', user.email)
            setAttachments([])
            setShowCc(false)
        }
    }, [isOpen, user, form])

    const handleTemplateSelect = (key: string) => {
        const template = EMAIL_TEMPLATES.find((t) => t.key === key)
        if (template && user) {
            form.setFieldValue('subject', template.subject)
            form.setFieldValue(
                'content',
                template.body.replace('{{name}}', user.displayName)
            )
        }
    }

    const addMockAttachment = () => {
        setAttachments([...attachments, 'Policy_Document_v2.pdf'])
    }

    return (
        <HeroModal isOpen={isOpen} onClose={onClose} size="2xl">
            <HeroModalContent>
                {(close) => (
                    <>
                        <HeroModalHeader className="flex flex-col gap-1 bg-background-muted">
                            <span className="text-xl flex items-center gap-4">
                                <Mail className="text-text-subdued" size={20} />
                                Compose Email
                            </span>
                        </HeroModalHeader>

                        <Divider />

                        <HeroModalBody className="p-0">
                            {/* 1. Recipient Info (Read-only Display, but bound to Form Logic via 'to' field if needed) */}
                            <div className="px-6 py-4 bg-background-muted">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3 p-2 bg-background border border-border-default rounded-xl pr-6 w-fit">
                                        <Avatar
                                            src={optimizeCloudinary(
                                                user?.avatar
                                            )}
                                            size="sm"
                                        />
                                        <div>
                                            <p className="text-xs text-text-subdued font-bold uppercase">
                                                To:
                                            </p>
                                            <p className="text-sm font-semibold text-text-default">
                                                {user?.displayName} &lt;
                                                {user?.email}&gt;
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="light"
                                        className="text-text-subdued"
                                        onPress={() => setShowCc(!showCc)}
                                    >
                                        Cc/Bcc
                                    </Button>
                                </div>

                                {/* CC / BCC Fields */}
                                {showCc && (
                                    <div className="grid grid-cols-2 gap-4 mb-4 animate-in fade-in slide-in-from-top-2">
                                        <form.Field name="cc">
                                            {(field) => (
                                                <Input
                                                    label="Cc"
                                                    size="sm"
                                                    variant="flat"
                                                    placeholder="cc@example.com"
                                                    onBlur={(e) => {
                                                        const val =
                                                            e.target.value
                                                        field.handleChange(
                                                            val ? [val] : []
                                                        )
                                                    }}
                                                />
                                            )}
                                        </form.Field>
                                        <form.Field name="bcc">
                                            {(field) => (
                                                <Input
                                                    label="Bcc"
                                                    size="sm"
                                                    variant="flat"
                                                    placeholder="bcc@example.com"
                                                    onBlur={(e) => {
                                                        const val =
                                                            e.target.value
                                                        field.handleChange(
                                                            val ? [val] : []
                                                        )
                                                    }}
                                                />
                                            )}
                                        </form.Field>
                                    </div>
                                )}

                                {/* 2. Template Selector */}
                                <div className="mt-1 flex items-center gap-3 mb-4">
                                    <Select
                                        placeholder="Insert Template"
                                        size="sm"
                                        className="max-w-xs"
                                        startContent={
                                            <Copy
                                                size={14}
                                                className="text-text-subdued"
                                            />
                                        }
                                        onChange={(e) =>
                                            handleTemplateSelect(e.target.value)
                                        }
                                    >
                                        {EMAIL_TEMPLATES.map((t) => (
                                            <SelectItem
                                                key={t.key}
                                                textValue={t.label}
                                            >
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <div className="h-px bg-text-subdued flex-1"></div>
                                </div>

                                {/* 3. Inputs Bound to TanStack Form */}
                                <div className="space-y-4">
                                    <form.Field
                                        name="subject"
                                        children={(field) => (
                                            <HeroInput
                                                label="Subject"
                                                placeholder="Enter email subject"
                                                variant="bordered"
                                                labelPlacement="outside-top"
                                                onValueChange={
                                                    field.handleChange
                                                }
                                                value={getFieldValue(field)}
                                                isInvalid={isFieldInvalid(
                                                    field
                                                )}
                                                errorMessage={getFieldErrors(
                                                    field
                                                )}
                                            />
                                        )}
                                    />

                                    <form.Field
                                        name="content"
                                        children={(field) => {
                                            const isInvalid =
                                                isFieldInvalid(field)
                                            const errorMessage =
                                                getFieldErrors(field)

                                            return (
                                                <div className="space-y-2">
                                                    <p
                                                        className={`${isInvalid ? 'text-danger' : 'text-text-default'} text-sm`}
                                                    >
                                                        Message
                                                    </p>
                                                    <div
                                                        className={`${isInvalid ? 'border-danger' : 'border-border-default'} border rounded-2xl`}
                                                    >
                                                        <RichInput
                                                            placeholder="Type your message here..."
                                                            value={
                                                                field.state
                                                                    .value
                                                            }
                                                            onChange={
                                                                field.handleChange
                                                            }
                                                        />
                                                    </div>
                                                    {isInvalid && (
                                                        <p className="text-danger text-xs">
                                                            {errorMessage}
                                                        </p>
                                                    )}
                                                </div>
                                            )
                                        }}
                                    />
                                </div>

                                {/* 4. Attachments Area */}
                                <div className="mt-4">
                                    <div className="flex gap-2 flex-wrap">
                                        {attachments.map((file, i) => (
                                            <Chip
                                                key={i}
                                                variant="flat"
                                                color="primary"
                                                onClose={() =>
                                                    setAttachments(
                                                        attachments.filter(
                                                            (_, idx) =>
                                                                idx !== i
                                                        )
                                                    )
                                                }
                                                classNames={{ base: 'pl-2' }}
                                            >
                                                <span className="flex items-center gap-1 text-xs">
                                                    <FileText size={12} />{' '}
                                                    {file}
                                                </span>
                                            </Chip>
                                        ))}
                                        <Button
                                            size="sm"
                                            variant="solid"
                                            className="border-slate-300 text-text-subdued"
                                            startContent={
                                                <Paperclip size={14} />
                                            }
                                            onPress={addMockAttachment}
                                        >
                                            Attach File
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </HeroModalBody>

                        <Divider />

                        <HeroModalFooter>
                            <Button variant="light" onPress={close}>
                                Discard
                            </Button>
                            {/* TanStack Form Subscribe to Submission State */}
                            <form.Subscribe
                                selector={(state) => [
                                    state.canSubmit,
                                    state.isSubmitting,
                                ]}
                                children={([canSubmit, isSubmitting]) => (
                                    <Button
                                        color="primary"
                                        endContent={
                                            !isSubmitting && <Send size={16} />
                                        }
                                        isLoading={
                                            isSubmitting || mutation.isPending
                                        }
                                        isDisabled={!canSubmit}
                                        onPress={form.handleSubmit}
                                        className="font-semibold"
                                    >
                                        {isSubmitting || mutation.isPending
                                            ? 'Sending...'
                                            : 'Send Email'}
                                    </Button>
                                )}
                            />
                        </HeroModalFooter>
                    </>
                )}
            </HeroModalContent>
        </HeroModal>
    )
}
