import {
    Avatar,
    Button,
    Card,
    CardBody,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Textarea,
} from '@heroui/react'
import {
    AlertTriangle,
    Bell,
    CheckCircle2,
    Info,
    Link as LinkIcon,
    Send,
    Smartphone,
    XCircle,
} from 'lucide-react'
import { useEffect,useState } from 'react'
import { TUser } from '../../../../shared/types'

// --- Types based on Prisma Enum ---
const NOTIFICATION_TYPES = [
    {
        key: 'INFO',
        label: 'Information',
        icon: Info,
        color: 'text-blue-500',
        bg: 'bg-blue-50',
    },
    {
        key: 'SUCCESS',
        label: 'Success',
        icon: CheckCircle2,
        color: 'text-emerald-500',
        bg: 'bg-emerald-50',
    },
    {
        key: 'WARNING',
        label: 'Warning',
        icon: AlertTriangle,
        color: 'text-amber-500',
        bg: 'bg-amber-50',
    },
    {
        key: 'ERROR',
        label: 'Error / Alert',
        icon: XCircle,
        color: 'text-red-500',
        bg: 'bg-red-50',
    },
]

interface SendNotificationModalProps {
    isOpen: boolean
    onClose: () => void
    user:TUser
}

export const SendNotificationModal = ({
    isOpen,
    onClose,
    user,
}: SendNotificationModalProps) => {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [typeKey, setTypeKey] = useState('INFO')
    const [redirectUrl, setRedirectUrl] = useState('')
    const [isSending, setIsSending] = useState(false)

    // Reset form
    useEffect(() => {
        if (isOpen) {
            setTitle('')
            setContent('')
            setTypeKey('INFO')
            setRedirectUrl('')
        }
    }, [isOpen])

    const selectedType =
        NOTIFICATION_TYPES.find((t) => t.key === typeKey) ||
        NOTIFICATION_TYPES[0]

    const handleSend = () => {
        setIsSending(true)
        // Simulate API Call: POST /notifications/send
        console.log('Sending Notification:', {
            userId: user?.id,
            title,
            content,
            type: typeKey,
            redirectUrl,
        })

        setTimeout(() => {
            setIsSending(false)
            onClose()
        }, 1000)
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            backdrop="blur"
            classNames={{
                header: 'border-b border-border-default',
                footer: 'border-t border-border-default',
            }}
        >
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <span className="text-xl flex items-center gap-2">
                                <Bell className="text-slate-400" size={20} />
                                Send Notification
                            </span>
                        </ModalHeader>

                        <ModalBody className="p-6 space-y-6">
                            {/* 1. Recipient & Type Row */}
                            <div className="flex gap-4">
                                <div className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                                    <Avatar
                                        src={user?.avatar}
                                        size="sm"
                                        isBordered
                                    />
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">
                                            Recipient
                                        </p>
                                        <p className="text-sm font-medium text-slate-800">
                                            {user?.displayName}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <Select
                                        aria-label="Notification Type"
                                        placeholder="Select Type"
                                        defaultSelectedKeys={['INFO']}
                                        onChange={(e) =>
                                            setTypeKey(e.target.value)
                                        }
                                        startContent={
                                            <selectedType.icon
                                                size={16}
                                                className={selectedType.color}
                                            />
                                        }
                                        className="w-full"
                                    >
                                        {NOTIFICATION_TYPES.map((t) => (
                                            <SelectItem
                                                key={t.key}
                                                textValue={t.label}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <t.icon
                                                        size={14}
                                                        className={t.color}
                                                    />
                                                    <span>{t.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            </div>

                            {/* 2. Content Form */}
                            <div className="space-y-4">
                                <Input
                                    label="Title (Optional)"
                                    placeholder="Brief headline..."
                                    labelPlacement="outside"
                                    variant="bordered"
                                    value={title}
                                    onValueChange={setTitle}
                                />
                                <Textarea
                                    label="Message Content"
                                    placeholder="What do you want to tell the user?"
                                    labelPlacement="outside"
                                    variant="bordered"
                                    minRows={3}
                                    isRequired
                                    value={content}
                                    onValueChange={setContent}
                                />
                                <Input
                                    label="Redirect URL (Optional)"
                                    placeholder="/jobs/fv-2024"
                                    labelPlacement="outside"
                                    variant="bordered"
                                    startContent={
                                        <LinkIcon
                                            size={14}
                                            className="text-slate-400"
                                        />
                                    }
                                    description="User will be taken here when they click the notification."
                                    value={redirectUrl}
                                    onValueChange={setRedirectUrl}
                                />
                            </div>

                            {/* 3. Live Preview */}
                            <div className="pt-2">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                    <Smartphone size={14} /> Preview
                                </p>
                                {/* Notification Card Preview */}
                                <Card className="shadow-sm border border-border-default bg-white max-w-sm">
                                    <CardBody className="p-3 flex items-start gap-3">
                                        <div
                                            className={`p-2 rounded-lg shrink-0 ${selectedType.bg} ${selectedType.color}`}
                                        >
                                            <selectedType.icon size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-slate-800 mb-0.5">
                                                {title || 'Notification Title'}
                                            </h4>
                                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                                {content ||
                                                    'The message content will appear here...'}
                                            </p>
                                            <span className="text-[10px] text-slate-300 mt-2 block">
                                                Just now
                                            </span>
                                        </div>
                                        {redirectUrl && (
                                            <div className="h-2 w-2 rounded-full bg-blue-500 mt-1"></div>
                                        )}
                                    </CardBody>
                                </Card>
                            </div>
                        </ModalBody>

                        <ModalFooter>
                            <Button variant="light" onPress={close}>
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                endContent={!isSending && <Send size={16} />}
                                isLoading={isSending}
                                onPress={handleSend}
                                className="font-medium"
                                isDisabled={!content}
                            >
                                {isSending ? 'Pushing...' : 'Push Notification'}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
