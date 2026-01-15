import {
    FileText,
    Link as IconLink,
    PackageOpen,
    Plus,
    Trash2,
    X,
} from 'lucide-react'
import { useState } from 'react'

import { HeroButton } from '../ui/hero-button'
import { HeroCard, HeroCardBody, HeroCardHeader } from '../ui/hero-card'
import { HeroInput } from '../ui/hero-input'

type JobAttachmentsFieldProps = {
    defaultAttachments?: string[]
    // Sửa lại type onChange để trả về data cho form cha
    onChange: (attachments: string[]) => void
    onRemove?: (attachments: string[]) => void
}

export default function JobAttachmentsField({
    defaultAttachments = [],
    onChange,
    onRemove,
}: JobAttachmentsFieldProps) {
    const [attachments, setAttachments] = useState<string[]>(defaultAttachments)
    const [isAdding, setIsAdding] = useState(false)

    // Xử lý thêm mới
    const handleAdd = (url: string) => {
        const newAttachments = [...attachments, url]
        setAttachments(newAttachments)
        onChange(newAttachments) // Bắn event ra ngoài
        setIsAdding(false)
    }

    // Xử lý xóa
    const handleRemove = (indexToRemove: number) => {
        const newAttachments = attachments.filter(
            (_, idx) => idx !== indexToRemove
        )
        setAttachments(newAttachments)
        if (onRemove) {
            onRemove(newAttachments)
        } else {
            onChange(newAttachments)
        }
    }

    return (
        <HeroCard>
            <HeroCardHeader>
                {/* Header Actions */}
                <div className="w-full flex items-center justify-between border-b border-default-100">
                    <h3 className="text-sm font-semibold text-default-700">
                        Attachments ({attachments.length})
                    </h3>
                    {!isAdding && (
                        <HeroButton
                            size="sm"
                            variant="light"
                            startContent={<Plus size={16} />}
                            onClick={() => setIsAdding(true)}
                        >
                            Add Link
                        </HeroButton>
                    )}
                </div>
            </HeroCardHeader>
            <HeroCardBody className="p-0">
                {/* Empty State */}
                {attachments.length === 0 && !isAdding && (
                    <div className="flex flex-col items-center justify-center py-10 text-text-subdued">
                        <PackageOpen
                            size={32}
                            strokeWidth={1}
                            className="mb-2 opacity-50"
                        />
                        <p className="text-default-400 text-sm">
                            No attachments found.
                        </p>
                        <p
                            className="text-text-subdued text-sm underline underline-offset-2 hover:text-text-default cursor-pointer w-fit"
                            onClick={() => setIsAdding(true)}
                        >
                            Add one
                        </p>
                    </div>
                )}

                {/* List Items */}
                <div className="flex flex-col">
                    {attachments.map((attachment, idx) => (
                        <div
                            key={idx}
                            className="group flex items-center justify-between p-4 border-b border-default-100 last:border-0 hover:bg-default-50 transition-colors"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="bg-primary-50 p-2 rounded-lg text-primary shrink-0">
                                    {/* Tự động check nếu là URL thì hiện icon Link, không thì File */}
                                    {attachment.startsWith('http') ? (
                                        <IconLink size={20} />
                                    ) : (
                                        <FileText size={20} />
                                    )}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <a
                                        href={attachment}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm font-medium truncate hover:underline hover:text-primary transition-colors"
                                    >
                                        {attachment}
                                    </a>
                                    <span className="text-xs text-default-400">
                                        {attachment.startsWith('http')
                                            ? 'External Link'
                                            : 'File Path'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <HeroButton
                                    isIconOnly
                                    size="sm"
                                    color="danger"
                                    variant="light"
                                    onClick={() => handleRemove(idx)}
                                >
                                    <Trash2 size={16} />
                                </HeroButton>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Form Area */}
                {isAdding && (
                    <div className="p-4 bg-default-50 border-t border-default-100">
                        <AttachmentForm
                            onSave={handleAdd}
                            onCancel={() => setIsAdding(false)}
                        />
                    </div>
                )}
            </HeroCardBody>
        </HeroCard>
    )
}

// --- Sub Component: Attachment Form ---
type AttachmentFormProps = {
    onSave: (val: string) => void
    onCancel: () => void
}

function AttachmentForm({ onSave, onCancel }: AttachmentFormProps) {
    const [value, setValue] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = () => {
        if (!value.trim()) {
            setError('Please enter a valid URL or path')
            return
        }
        onSave(value)
        setValue('')
        setError('')
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSubmit()
        if (e.key === 'Escape') onCancel()
    }

    return (
        <div className="flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2">
                <div className="flex-1">
                    <HeroInput
                        autoFocus
                        placeholder="Paste URL here (e.g. https://google.drive...)"
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value)
                            if (error) setError('')
                        }}
                        onKeyDown={handleKeyDown}
                        // Nếu Input component của bạn hỗ trợ errorMessage
                        // errorMessage={error}
                        className="w-full"
                    />
                </div>
                <div className="flex items-center gap-1">
                    <HeroButton
                        size="sm"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={!value.trim()}
                    >
                        Save
                    </HeroButton>
                    <HeroButton
                        size="sm"
                        variant="light"
                        isIconOnly
                        onClick={onCancel}
                    >
                        <X size={18} />
                    </HeroButton>
                </div>
            </div>
            {error && <p className="text-xs text-danger">{error}</p>}
        </div>
    )
}
