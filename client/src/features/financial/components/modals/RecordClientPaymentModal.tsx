import {
    addToast,
    Button,
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
import { useMutation, useQuery } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { ArrowDownRight } from 'lucide-react'
import { paymentChannelsListOptions } from '@/lib'
import { createTransactionOptions } from '@/lib/queries/options/_financial-queries'
import {
    CreateTransactionInputSchema,
    ETransactionType,
    TCreateTransactionInput,
    TJobReceivable,
} from '@/lib/validationSchemas'
import { toFormikValidationSchema } from 'zod-formik-adapter'

export const RecordClientPaymentModal = ({
    isOpen,
    onClose,
    job,
    onSuccess,
}: {
    isOpen: boolean
    onClose: () => void
    job: TJobReceivable
    onSuccess: () => void
}) => {
    // --- 3. Mutation để lưu giao dịch xuống DB ---
    const { mutate: recordPayment, isPending } = useMutation(
        createTransactionOptions
    )

    const { data } = useQuery({
        ...paymentChannelsListOptions(),
        enabled: isOpen,
    })
    const paymentChannels = data?.paymentChannels || []

    const formik = useFormik<TCreateTransactionInput>({
        initialValues: {
            amount: job?.financial?.remainingAmount || 0,
            paymentChannelId: undefined,
            referenceNo: undefined,
            note: undefined,
            jobId: job.id,
            type: ETransactionType.INCOME,
            clientId: job.client.id,
            evidenceUrl: undefined,
        },
        enableReinitialize: true,
        validationSchema: toFormikValidationSchema(
            CreateTransactionInputSchema
        ),
        onSubmit: (values) => {
            recordPayment(
                {
                    amount: values.amount,
                    type: ETransactionType.INCOME,
                    jobId: job.id,
                    clientId: job.clientId,
                    paymentChannelId: values.paymentChannelId,
                    ...(values.referenceNo && {
                        referenceNo: values.referenceNo,
                    }),
                    note: values.note,
                },
                {
                    onSuccess: () => {
                        addToast({
                            title: 'Payment recorded successfully!',
                            color: 'success',
                        })
                        onSuccess()
                        onClose()
                    },
                }
            )
        },
    })

    console.log(formik.errors)

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalContent>
                <form onSubmit={formik.handleSubmit}>
                    <ModalHeader className="flex flex-col gap-1 pb-4 border-b border-divider">
                        <div className="flex items-center gap-2 text-success-600">
                            <ArrowDownRight size={22} />
                            <span className="text-xl font-bold">
                                Record Income
                            </span>
                        </div>
                        <p className="text-sm text-default-500">
                            Confirm payment received for{' '}
                            <strong className="text-default-900">
                                {job?.client?.name}
                            </strong>
                        </p>
                    </ModalHeader>

                    <ModalBody className="py-6 space-y-4">
                        <div className="flex items-center justify-between p-4 border bg-default-50 rounded-xl border-default-200">
                            <span className="text-sm font-medium text-default-600">
                                Remaining Balance:
                            </span>
                            <span className="text-lg font-bold text-default-900">
                                $
                                {job?.financial?.remainingAmount.toLocaleString()}
                            </span>
                        </div>

                        <Input
                            isRequired
                            name="amount"
                            label="Actual Amount Received"
                            type="number"
                            value={formik.values.amount.toString()}
                            onChange={formik.handleChange}
                            startContent={
                                <span className="text-default-400">$</span>
                            }
                            isInvalid={
                                Boolean(formik.touched.amount) &&
                                Boolean(formik.errors.amount)
                            }
                            errorMessage={
                                Boolean(formik.touched.amount) &&
                                formik.errors.amount
                            }
                            variant="bordered"
                            labelPlacement="outside"
                        />

                        <Select
                            isRequired
                            name="paymentChannelId"
                            label="Deposited Into"
                            variant="bordered"
                            labelPlacement="outside-top"
                            placeholder="Select one payment channel"
                            selectedKeys={
                                formik.values.paymentChannelId
                                    ? [formik.values.paymentChannelId]
                                    : []
                            }
                            onChange={formik.handleChange}
                            disallowEmptySelection
                        >
                            {paymentChannels.map((it) => {
                                return (
                                    <SelectItem
                                        key={it.id}
                                        textValue={it.displayName}
                                    >
                                        {it.displayName}
                                    </SelectItem>
                                )
                            })}
                        </Select>

                        <Input
                            name="referenceNo"
                            label="Bank / TXN Reference No."
                            placeholder="e.g. VCB-123456789"
                            variant="bordered"
                            labelPlacement="outside"
                            value={formik.values.referenceNo || ''}
                            onChange={formik.handleChange}
                        />

                        <Textarea
                            name="note"
                            label="Internal Notes"
                            placeholder="Add details..."
                            variant="bordered"
                            labelPlacement="outside"
                            value={formik.values.note}
                            onChange={formik.handleChange}
                        />
                    </ModalBody>

                    <ModalFooter className="pt-4 border-t border-divider">
                        <Button
                            variant="flat"
                            onPress={onClose}
                            isDisabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="success"
                            type="submit"
                            isLoading={isPending}
                            className="px-6 font-bold text-white"
                        >
                            Confirm Receipt
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    )
}
