import {
    Avatar,
    Button,
    ButtonGroup,
    Chip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Textarea,
    useDisclosure,
} from '@heroui/react'
import {
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    CornerDownRight,
    DownloadCloud,
    ExternalLink,
    FileText,
    MessageSquareQuote,
    XCircle,
} from 'lucide-react'
import { useState } from 'react'

import { dateFormatter } from '../../../../lib'
import { TJobDelivery, TJobDeliverFile } from '../../../../shared/types'
import ApproveDeliveryModal from '../../../job-manage/components/ApproveDeliveryModal'

type AdminDeliveryCardProps = {
    delivery: TJobDelivery
    onApprove: (deliveryId: string) => void
    onReject: (deliveryId: string, feedback: string) => void
    isLoading?: boolean
}

export default function JobDeliveryItemCard({
    delivery,
    onApprove,
    onReject,
    isLoading,
}: AdminDeliveryCardProps) {
    const [rejectReason, setRejectReason] = useState('')
    const [isRejecting, setIsRejecting] = useState(false)

    const isPending = delivery.status === 'PENDING'
    const isRejected = delivery.status === 'REJECTED'
    const isApproved = delivery.status === 'APPROVED'

    const {
        isOpen: isOpenApproveDeliveryModal,
        onOpen: onOpenApproveDeliveryModal,
        onClose: onCloseApproveDeliveryModal,
    } = useDisclosure({
        id: 'ApproveDeliveryModal',
    })

    const handleApprove = () => {
        onApprove(delivery.id)
        onCloseApproveDeliveryModal()
    }

    return (
        <div className="relative pl-4 py-2">
            {/* Timeline Line */}
            <div className="absolute top-8 left-8.75 bottom-0 w-px bg-border-default/60" />

            {isOpenApproveDeliveryModal && (
                <ApproveDeliveryModal
                    isOpen={isOpenApproveDeliveryModal}
                    onClose={onCloseApproveDeliveryModal}
                    onConfirm={handleApprove}
                    isLoading={isLoading}
                />
            )}

            <div className="flex gap-4">
                {/* Avatar Column */}
                <div className="relative z-10 shrink-0 pt-1">
                    <Avatar
                        src={delivery.user?.avatar}
                        size="md"
                        className={`border-2 shadow-sm ${
                            isPending
                                ? 'border-warning-300'
                                : isApproved
                                  ? 'border-success-300'
                                  : 'border-danger-300'
                        }`}
                    />
                </div>

                {/* Content Column */}
                <div className="flex-1 pb-4">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-text-default">
                                {delivery.user?.displayName}
                            </span>
                            <span className="text-xs text-text-subdued">
                                {dateFormatter(delivery.createdAt, {
                                    format: 'longDateTime',
                                })}
                            </span>
                        </div>
                        <Chip
                            size="sm"
                            variant={isPending ? 'solid' : 'flat'}
                            color={
                                isPending
                                    ? 'warning'
                                    : isApproved
                                      ? 'success'
                                      : 'danger'
                            }
                            className="font-medium tracking-wide uppercase text-[10px]"
                        >
                            {delivery.status}
                        </Chip>
                    </div>

                    {/* Delivery Bubble */}
                    <div
                        className={`rounded-2xl rounded-tl-none p-4 shadow-sm border ${
                            isPending
                                ? 'bg-warning-50/50 border-warning-100'
                                : 'bg-background border-border-default'
                        }`}
                    >
                        {/* Note */}
                        {delivery.note && (
                            <div className="flex gap-2 text-text-default mb-4">
                                <MessageSquareQuote
                                    size={16}
                                    className="text-text-subdued shrink-0 mt-0.5"
                                />
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {delivery.note}
                                </p>
                            </div>
                        )}

                        {/* Attachments Section */}
                        {delivery.files && delivery.files.length > 0 && (
                            <div className="bg-default-100/50 rounded-xl p-3 border border-border-default/50 space-y-3">
                                <span className="text-xs font-medium text-text-subdued tracking-wider flex items-center gap-1.5">
                                    <CornerDownRight size={14} />
                                    Deliverables
                                </span>

                                <div className="flex flex-wrap gap-2">
                                    {delivery.files.map(
                                        (file: TJobDeliverFile) => (
                                            <ButtonGroup
                                                key={file.id}
                                                size="sm"
                                                className="group"
                                            >
                                                {/* Primary Action: View File */}
                                                <Button
                                                    as="a"
                                                    href={file.webUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    startContent={
                                                        <FileText
                                                            size={14}
                                                            className="text-primary"
                                                        />
                                                    }
                                                    className="font-medium text-text-default group-hover:text-primary transition-colors"
                                                >
                                                    {file.fileName}
                                                </Button>

                                                {/* Split Action Dropdown: Download / View */}
                                                <Dropdown placement="bottom-end">
                                                    <DropdownTrigger>
                                                        <Button
                                                            isIconOnly
                                                            className="border-l border-border-default/50 group-hover:border-primary/30"
                                                            aria-label="File actions"
                                                        >
                                                            <ChevronDown
                                                                size={14}
                                                                className="text-text-subdued group-hover:text-primary"
                                                            />
                                                        </Button>
                                                    </DropdownTrigger>
                                                    <DropdownMenu
                                                        aria-label={`Actions for ${file.fileName}`}
                                                    >
                                                        <DropdownItem
                                                            key="view"
                                                            href={file.webUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            startContent={
                                                                <ExternalLink
                                                                    size={16}
                                                                    className="text-default-500"
                                                                />
                                                            }
                                                        >
                                                            View Document
                                                        </DropdownItem>
                                                        <DropdownItem
                                                            key="download"
                                                            href={file.webUrl}
                                                            download={
                                                                file.fileName
                                                            }
                                                            startContent={
                                                                <DownloadCloud
                                                                    size={16}
                                                                    className="text-default-500"
                                                                />
                                                            }
                                                        >
                                                            Download
                                                        </DropdownItem>
                                                    </DropdownMenu>
                                                </Dropdown>
                                            </ButtonGroup>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {/* --- PENDING ACTION AREA --- */}
                        {isPending && (
                            <div className="mt-4 pt-4 border-t border-border-default/60">
                                {!isRejecting ? (
                                    <div className="flex gap-3">
                                        <Button
                                            color="success"
                                            variant="flat"
                                            className="font-semibold"
                                            startContent={
                                                <CheckCircle2 size={18} />
                                            }
                                            onPress={onOpenApproveDeliveryModal}
                                        >
                                            Approve Work
                                        </Button>
                                        <Button
                                            color="default"
                                            variant="light"
                                            className="text-danger font-medium hover:bg-danger-50"
                                            startContent={<XCircle size={18} />}
                                            onPress={() => setIsRejecting(true)}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center gap-2 mb-2 text-danger-600 font-bold text-sm">
                                            <AlertTriangle size={16} />
                                            Rejection Feedback
                                        </div>
                                        <Textarea
                                            placeholder="Explain what needs to be fixed..."
                                            className="mb-3"
                                            variant="bordered"
                                            minRows={2}
                                            color="danger"
                                            value={rejectReason}
                                            onValueChange={setRejectReason}
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                size="sm"
                                                variant="light"
                                                onPress={() =>
                                                    setIsRejecting(false)
                                                }
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                color="danger"
                                                isDisabled={!rejectReason}
                                                onPress={() =>
                                                    onReject(
                                                        delivery.id,
                                                        rejectReason
                                                    )
                                                }
                                            >
                                                Confirm Rejection
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- HISTORICAL FEEDBACK --- */}
                        {isRejected && delivery.adminFeedback && (
                            <div className="mt-4 p-3 bg-danger-50 border border-danger-200 rounded-xl flex items-start gap-2">
                                <XCircle
                                    size={16}
                                    className="text-danger-500 mt-0.5 shrink-0"
                                />
                                <div>
                                    <span className="text-sm font-bold text-danger-800 block">
                                        Reason for rejection:
                                    </span>
                                    <p className="text-sm text-danger-700 mt-0.5">
                                        {delivery.adminFeedback}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
