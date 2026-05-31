import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from '@heroui/react'
import { Maximize2, Save } from 'lucide-react'
import ModernEditor from '../../../../shared/components/editor-quill/QuillEditor'
import { useState } from 'react'

interface JobDescriptionModalProps {
    isOpen: boolean
    onClose: () => void
    defaultValue: string
    onSave: (value: string) => void
    title?: string
}

export default function JobDescriptionModal({
    isOpen,
    onClose,
    defaultValue,
    onSave,
    title = 'Full Description Editor',
}: JobDescriptionModalProps) {
    const [value, setValue] = useState(defaultValue)
    const handleSave = () => {
        onSave(value)
        onClose()
    }
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="5xl"
            scrollBehavior="inside"
            backdrop="blur"
            classNames={{
                base: 'bg-background border border-border-muted max-h-[90vh]',
                header: 'border-b border-border-muted',
                footer: 'border-t border-border-muted',
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex items-center gap-2">
                            <Maximize2 size={18} className="text-primary" />
                            <span>{title}</span>
                        </ModalHeader>
                        <ModalBody className="p-0">
                            {/* We use your existing ModernEditor here */}
                            <ModernEditor value={value} onChange={setValue} />
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                variant="flat"
                                color="danger"
                                onPress={onClose}
                            >
                                Close
                            </Button>
                            <Button
                                color="primary"
                                startContent={<Save size={18} />}
                                onPress={handleSave}
                            >
                                Save Changes
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
