import {
    Alert,
    Button,
    Divider,
    Listbox,
    ListboxItem,
    User,
} from '@heroui/react'
import dayjs from 'dayjs'
import { AlertCircle, Banknote, CheckCircle2, CreditCard } from 'lucide-react'
import React, { useState } from 'react'
import { TJob } from '@/shared/types'
import { currencyFormatter, IMAGES, optimizeCloudinary } from '../../../../lib'
import {
    HeroModal,
    HeroModalBody,
    HeroModalContent,
    HeroModalFooter,
    HeroModalHeader,
} from '../../../../shared/components/ui/hero-modal'
import { Image } from 'antd'

interface ConfirmPaymentModalProps {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    job: TJob | null
    onConfirm: (jobId: string) => Promise<void>
}

export const ConfirmPaymentModal: React.FC<ConfirmPaymentModalProps> = ({
    isOpen,
    onOpenChange,
    job,
    onConfirm,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!job) return null

    const handleConfirm = async () => {
        setIsSubmitting(true)
        try {
            await onConfirm(job.id)
            onOpenChange(false)
        } catch (error) {
            console.error('Payment confirmation failed', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <HeroModal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
            <HeroModalContent>
                {(onClose) => (
                    <>
                        <HeroModalHeader className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Banknote className="text-success" size={20} />
                                <span>Confirm Staff Payout</span>
                            </div>
                        </HeroModalHeader>

                        <HeroModalBody className="py-6">
                            <div className="flex flex-col gap-4">
                                {/* Job Info Summary */}
                                <div className="flex justify-between items-start bg-default-50 p-3 rounded-xl border border-default-100">
                                    <div>
                                        <p className="text-[10px] text-default-400 uppercase font-bold tracking-wider">
                                            Job Number
                                        </p>
                                        <p className="text-sm font-mono font-bold text-primary">
                                            {job.no}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-default-400 uppercase font-bold tracking-wider">
                                            Completed At
                                        </p>
                                        <p className="text-xs font-medium">
                                            {dayjs(job.completedAt).format(
                                                'DD MMM YYYY'
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Staff List */}
                                <div>
                                    <p className="text-xs font-semibold mb-2 text-default-500">
                                        Payable To:
                                    </p>
                                    <div className="flex flex-col items-start gap-2">
                                        <Listbox aria-label="Assignments">
                                            {job.assignments.map((ass) => (
                                                <ListboxItem key={ass.user.id}>
                                                    <User
                                                        name={
                                                            ass.user.displayName
                                                        }
                                                        description={`@${ass.user.username}`}
                                                        avatarProps={{
                                                            src: optimizeCloudinary(
                                                                ass.user.avatar
                                                            ),
                                                            size: 'sm',
                                                        }}
                                                    />
                                                </ListboxItem>
                                            ))}
                                        </Listbox>
                                    </div>
                                </div>

                                <Divider />

                                {/* Payment Details */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <CreditCard
                                                size={14}
                                                className="text-default-400"
                                            />
                                            <span className="text-sm text-default-500">
                                                Payment Channel
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold">
                                                {job.paymentChannel
                                                    ?.displayName ||
                                                    'Default Method'}
                                            </span>
                                            <Image
                                                preview={false}
                                                src={optimizeCloudinary(
                                                    job.paymentChannel
                                                        ?.logoUrl ??
                                                        IMAGES.loadingPlaceholder
                                                )}
                                                rootClassName="size-6! object-cover rounded-full"
                                                className="size-full object-cover rounded-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-success-50 rounded-lg">
                                        <span className="text-sm font-bold text-success-700">
                                            Total Payout
                                        </span>
                                        <span className="text-xl font-mono font-black text-success-700">
                                            {currencyFormatter(
                                                job.totalStaffCost,
                                                'Vietnamese'
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <Alert
                                    color="warning"
                                    title="Accounting Notice"
                                    variant="flat"
                                    className="text-xs"
                                    startContent={<AlertCircle size={16} />}
                                >
                                    Confirming this will move the job to
                                    "Finished" and notify staff. This action
                                    cannot be undone.
                                </Alert>
                            </div>
                        </HeroModalBody>

                        <HeroModalFooter>
                            <Button
                                variant="light"
                                onPress={onClose}
                                isDisabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="success"
                                onPress={handleConfirm}
                                isLoading={isSubmitting}
                                className="font-bold text-white"
                                startContent={
                                    !isSubmitting && <CheckCircle2 size={18} />
                                }
                            >
                                Confirm & Pay
                            </Button>
                        </HeroModalFooter>
                    </>
                )}
            </HeroModalContent>
        </HeroModal>
    )
}
