import {
    Avatar,
    Button,
    Card,
    CardBody,
    Chip,
    Textarea,
    useDisclosure,
} from '@heroui/react'
import {
    AlertTriangle,
    CheckCircle2,
    ExternalLink,
    FileText,
    XCircle,
} from 'lucide-react'
import { useState } from 'react'

import { dateFormatter } from '../../../lib'
import { IJobDelivery } from '../../../shared/interfaces'
import ApproveDeliveryModal from './ApproveDeliveryModal'

type AdminDeliveryCardProps = {
    delivery: IJobDelivery
    onApprove: (deliveryId: string) => void
    onReject: (deliveryId: string, feedback: string) => void
    isLoading?: boolean
}

export default function AdminDeliveryCard({
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
    }

    return (
        <div>
            {isOpenApproveDeliveryModal && (
                <ApproveDeliveryModal
                    isOpen={isOpenApproveDeliveryModal}
                    onClose={onCloseApproveDeliveryModal}
                    onConfirm={handleApprove}
                    isLoading={isLoading}
                />
            )}
            <Card
                className={`border shadow-sm mb-4 ${isPending ? 'border-yellow-200 dark:border-yellow-200/50 bg-yellow-50/30 dark:bg-yellow-100/10' : 'border-border-default'}`}
            >
                <CardBody className="p-5">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <Avatar src={delivery.user?.avatar} size="sm" />
                            <div>
                                <p className="text-sm font-bold text-text-default">
                                    {delivery.user?.displayName}
                                </p>
                                <p className="text-[10px] text-text-subdued">
                                    Submitted:{' '}
                                    {dateFormatter(delivery.createdAt)}
                                </p>
                            </div>
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
                        >
                            {delivery.status}
                        </Chip>
                    </div>

                    {/* Content */}
                    <div className="pl-11 space-y-3">
                        <div className="bg-white p-3 rounded-xl border border-slate-100 text-sm text-text-subdued italic">
                            "{delivery.note}"
                        </div>

                        {/* Links & Files */}
                        {delivery.link && (
                            <div className="flex items-center gap-2">
                                <ExternalLink
                                    size={14}
                                    className="text-blue-500"
                                />
                                <a
                                    href={delivery.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-blue-600 hover:underline font-medium"
                                >
                                    Open Project Link
                                </a>
                            </div>
                        )}
                        {delivery.files && (
                            <div className="flex gap-2">
                                {delivery.files.map((f: string) => (
                                    <Chip
                                        key={f}
                                        size="sm"
                                        variant="bordered"
                                        startContent={<FileText size={12} />}
                                    >
                                        {f}
                                    </Chip>
                                ))}
                            </div>
                        )}

                        {/* --- ACTION AREA (Only for Pending) --- */}
                        {isPending && (
                            <div className="pt-4 mt-2 border-t border-border-default/60">
                                {!isRejecting ? (
                                    <div className="flex gap-3">
                                        <Button
                                            color="success"
                                            className="text-white font-semibold shadow-md shadow-green-200"
                                            startContent={
                                                <CheckCircle2 size={18} />
                                            }
                                            onPress={onOpenApproveDeliveryModal}
                                        >
                                            Approve Delivery
                                        </Button>
                                        <Button
                                            color="danger"
                                            variant="flat"
                                            startContent={<XCircle size={18} />}
                                            onPress={() => setIsRejecting(true)}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1">
                                        <div className="flex items-center gap-2 mb-2 text-red-700 font-bold text-sm">
                                            <AlertTriangle size={16} />{' '}
                                            Rejection Feedback
                                        </div>
                                        <Textarea
                                            placeholder="Explain what needs to be fixed..."
                                            className="mb-2 bg-white"
                                            variant="bordered"
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

                        {/* Historical Feedback */}
                        {isRejected && delivery.adminFeedback && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800">
                                <strong>Admin Feedback:</strong>{' '}
                                {delivery.adminFeedback}
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}
