import {
    Button,
    Checkbox,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from '@heroui/react'
import { Check,DollarSign } from 'lucide-react'
import { useState } from 'react'

interface AccountingFinishModalProps {
    isOpen: boolean
    onClose: () => void
    onFinish: () => void
    job: {
        no: string
        client: string
        totalAmount: number
        staffCost: number
    }
}

export const AccountingFinishModal = ({
    isOpen,
    onClose,
    onFinish,
    job,
}: AccountingFinishModalProps) => {
    const [isPaid, setIsPaid] = useState(false)
    const [confirmText, setConfirmText] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const profit = job.totalAmount - job.staffCost

    const handleFinish = () => {
        setIsLoading(true)
        // Simulate API: Update Job -> isPaid=true, status=FINISHED
        setTimeout(() => {
            onFinish()
            setIsLoading(false)
            onClose()
        }, 1000)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} backdrop="blur" size="md">
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader className="bg-emerald-50/50 border-b border-emerald-100">
                            <div className="flex items-center gap-2 text-emerald-700">
                                <DollarSign size={20} />
                                <span className="text-lg font-bold">
                                    Process Payment & Finish
                                </span>
                            </div>
                        </ModalHeader>

                        <ModalBody className="py-6 space-y-6">
                            {/* Financial Summary */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <p className="text-[10px] uppercase font-bold text-slate-400">
                                        Total Income
                                    </p>
                                    <p className="text-lg font-bold text-slate-800">
                                        ${job.totalAmount}
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <p className="text-[10px] uppercase font-bold text-slate-400">
                                        Staff Cost
                                    </p>
                                    <p className="text-lg font-bold text-orange-600">
                                        -${job.staffCost}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                <span className="font-bold text-emerald-800 text-sm">
                                    Net Profit
                                </span>
                                <span className="font-bold text-emerald-700 text-xl">
                                    +${profit}
                                </span>
                            </div>

                            {/* Confirmation Steps */}
                            <div className="space-y-4">
                                <Checkbox
                                    isSelected={isPaid}
                                    onValueChange={setIsPaid}
                                    classNames={{
                                        label: 'text-sm font-medium text-slate-700',
                                    }}
                                >
                                    I confirm payment has been received from{' '}
                                    {job.client}
                                </Checkbox>

                                {isPaid && (
                                    <div className="animate-in fade-in slide-in-from-top-2">
                                        <Input
                                            label="Type 'CONFIRM' to finish job"
                                            placeholder="CONFIRM"
                                            size="sm"
                                            variant="bordered"
                                            value={confirmText}
                                            onValueChange={setConfirmText}
                                            description="This will close the job permanently."
                                        />
                                    </div>
                                )}
                            </div>
                        </ModalBody>

                        <ModalFooter>
                            <Button variant="light" onPress={close}>
                                Cancel
                            </Button>
                            <Button
                                color="success"
                                className="font-bold text-white"
                                isDisabled={
                                    !isPaid || confirmText !== 'CONFIRM'
                                }
                                isLoading={isLoading}
                                onPress={handleFinish}
                                startContent={!isLoading && <Check size={18} />}
                            >
                                Set Paid & Finish
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
