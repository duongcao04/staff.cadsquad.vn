import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Switch,
    Textarea,
} from '@heroui/react'
import {
    AlertTriangle,
    Ban,
    Bug,
    CheckCircle2,
    FileQuestion,
    Send,
    ServerCrash,
} from 'lucide-react'
import { useEffect,useState } from 'react'

// --- Issue Types Configuration ---
const ISSUE_TYPES = [
    { key: 'missing_assets', label: 'Missing Assets', icon: FileQuestion },
    { key: 'technical_bug', label: 'Technical Bug', icon: Bug },
    { key: 'server_error', label: 'Server / API Error', icon: ServerCrash },
    {
        key: 'client_feedback',
        label: 'Client Feedback / Scope',
        icon: AlertTriangle,
    },
]

interface IssueReportModalProps {
    isOpen: boolean
    onClose: () => void
    jobId?: string // Optional: Link to a specific job
    jobTitle?: string
}

export const IssueReportModal = ({
    isOpen,
    onClose,
    jobId,
    jobTitle,
}: IssueReportModalProps) => {
    const [issueType, setIssueType] = useState<string>('missing_assets')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [isBlocking, setIsBlocking] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setIssueType('missing_assets')
            setTitle('')
            setDescription('')
            setIsBlocking(false)
            setIsSubmitting(false)
        }
    }, [isOpen])

    const handleSubmit = () => {
        setIsSubmitting(true)

        // Simulate API Call
        console.log('Reporting Issue:', {
            jobId,
            type: issueType,
            title,
            description,
            isBlocking, // Critical flag for Admins
        })

        setTimeout(() => {
            setIsSubmitting(false)
            onClose()
            // Trigger Toast: "Issue reported. Admin notified."
        }, 1500)
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="md"
            backdrop="blur"
            classNames={{
                header: 'border-b border-slate-100',
                footer: 'border-t border-slate-100',
            }}
        >
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 bg-slate-50/50">
                            <div className="flex items-center gap-2 text-slate-800">
                                <AlertTriangle
                                    className={
                                        isBlocking
                                            ? 'text-danger'
                                            : 'text-warning-500'
                                    }
                                    size={22}
                                />
                                <span className="text-xl font-bold">
                                    Report an Issue
                                </span>
                            </div>
                            {jobTitle && (
                                <p className="text-xs text-slate-500 font-normal">
                                    Regarding Job:{' '}
                                    <span className="font-mono font-bold text-slate-700">
                                        {jobTitle}
                                    </span>
                                </p>
                            )}
                        </ModalHeader>

                        <ModalBody className="py-6 space-y-4">
                            {/* 1. Blocker Toggle (High Priority) */}
                            <div
                                className={`p-4 rounded-xl border transition-colors ${isBlocking ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span
                                            className={`font-bold text-sm ${isBlocking ? 'text-red-700' : 'text-slate-700'}`}
                                        >
                                            Is this a blocker?
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            Checking this alerts the Admin
                                            immediately.
                                        </span>
                                    </div>
                                    <Switch
                                        size="sm"
                                        color="danger"
                                        isSelected={isBlocking}
                                        onValueChange={setIsBlocking}
                                        thumbIcon={({
                                            isSelected,
                                            className,
                                        }) =>
                                            isSelected ? (
                                                <Ban className={className} />
                                            ) : (
                                                <CheckCircle2
                                                    className={className}
                                                />
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {/* 2. Issue Details */}
                            <Select
                                label="Issue Type"
                                placeholder="What's going wrong?"
                                labelPlacement="outside"
                                variant="bordered"
                                selectedKeys={[issueType]}
                                onChange={(e) => setIssueType(e.target.value)}
                            >
                                {ISSUE_TYPES.map((type) => (
                                    <SelectItem
                                        key={type.key}
                                        textValue={type.label}
                                    >
                                        <div className="flex items-center gap-2">
                                            <type.icon
                                                size={16}
                                                className="text-slate-500"
                                            />
                                            <span>{type.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </Select>

                            <Input
                                label="Subject"
                                placeholder="Brief summary..."
                                labelPlacement="outside"
                                variant="bordered"
                                value={title}
                                onValueChange={setTitle}
                            />

                            <Textarea
                                label="Description"
                                placeholder="Describe the issue. Include error messages or links if applicable."
                                labelPlacement="outside"
                                variant="bordered"
                                minRows={3}
                                value={description}
                                onValueChange={setDescription}
                            />
                        </ModalBody>

                        <ModalFooter>
                            <Button variant="light" onPress={close}>
                                Cancel
                            </Button>
                            <Button
                                color={isBlocking ? 'danger' : 'warning'}
                                className={
                                    isBlocking
                                        ? 'bg-red-600 text-white font-bold shadow-md shadow-red-200'
                                        : 'text-white font-semibold'
                                }
                                isLoading={isSubmitting}
                                onPress={handleSubmit}
                                startContent={
                                    !isSubmitting && <Send size={18} />
                                }
                            >
                                {isSubmitting
                                    ? 'Submitting...'
                                    : isBlocking
                                      ? 'Report Blocker'
                                      : 'Submit Issue'}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
