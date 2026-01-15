import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from '@heroui/react'
import { FileIcon, LinkIcon, PlusIcon, XIcon } from 'lucide-react'
import { useState } from 'react'

type Props = {
    jobNo?: string
    isOpen: boolean
    onClose: () => void
}

export default function AddAttachmentsModal({
    jobNo = 'F.26001',
    isOpen,
    onClose,
}: Props) {
    const [urlInput, setUrlInput] = useState('')
    const [attachments, setAttachments] = useState<string[]>([])

    const handleAddUrl = () => {
        if (!urlInput.trim()) return
        // Simple URL validation logic
        if (!urlInput.startsWith('http')) {
            alert('Please enter a valid URL (starting with http/https)')
            return
        }
        setAttachments((prev) => [...prev, urlInput.trim()])
        setUrlInput('')
    }

    const handleRemove = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSave = () => {
        console.log('Saving attachments for Job:', jobNo, attachments)
        // Here you would call your jobApi.update method
        onClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            backdrop="blur"
            classNames={{
                base: 'border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]',
                header: 'border-b-[1px] border-[#292f46]',
                footer: 'border-t-[1px] border-[#292f46]',
                closeButton: 'hover:bg-white/5 active:bg-white/10',
            }}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <FileIcon size={20} className="text-primary" />
                        <span>Add Attachments</span>
                    </div>
                    <p className="text-xs font-normal text-default-400">
                        Upload links or documents for Job #{jobNo}
                    </p>
                </ModalHeader>
                <ModalBody className="py-6">
                    <div className="flex flex-col gap-6">
                        {/* URL Input Area */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">
                                Paste Link (Cloudinary, Drive, Dropbox)
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="https://..."
                                    variant="bordered"
                                    value={urlInput}
                                    onValueChange={setUrlInput}
                                    startContent={
                                        <LinkIcon
                                            size={16}
                                            className="text-default-400"
                                        />
                                    }
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && handleAddUrl()
                                    }
                                />
                                <Button
                                    color="primary"
                                    isIconOnly
                                    onPress={handleAddUrl}
                                >
                                    <PlusIcon size={20} />
                                </Button>
                            </div>
                        </div>

                        {/* List of Attachments */}
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-default-400 uppercase tracking-wider">
                                Pending Uploads ({attachments.length})
                            </p>

                            <div className="flex flex-col gap-2 max-h-50 overflow-y-auto pr-2">
                                {attachments.length === 0 ? (
                                    <div className="py-10 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
                                        <FileIcon
                                            size={32}
                                            className="text-white/20 mb-2"
                                        />
                                        <p className="text-sm text-white/30">
                                            No links added yet
                                        </p>
                                    </div>
                                ) : (
                                    attachments.map((url, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:border-primary/50 transition-all group"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <LinkIcon
                                                    size={14}
                                                    className="text-primary shrink-0"
                                                />
                                                <span className="text-xs truncate text-default-400">
                                                    {url}
                                                </span>
                                            </div>
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                color="danger"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                onPress={() =>
                                                    handleRemove(index)
                                                }
                                            >
                                                <XIcon size={16} />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        className="font-bold shadow-lg shadow-primary/20"
                        onPress={handleSave}
                        isDisabled={attachments.length === 0}
                    >
                        Save Attachments
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
