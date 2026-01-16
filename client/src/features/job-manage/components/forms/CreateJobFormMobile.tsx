import { currencyFormatter, optimizeCloudinary } from '@/lib'
import { useJobTypes, usePaymentChannels, useUsers } from '@/lib/queries'
import { CreateJobSchema, type TCreateJobInput } from '@/lib/validationSchemas'
import AssignMemberField from '@/shared/components/form-fields/AssignMemberField'
import JobAttachmentsField from '@/shared/components/form-fields/JobAttachmentsField'
import { PaymentChannelSelect } from '@/shared/components/form-fields/PaymentChannelSelect'
import { HeroButton } from '@/shared/components/ui/hero-button'
import { HeroDateRangePicker } from '@/shared/components/ui/hero-date-picker'
import { HeroInput } from '@/shared/components/ui/hero-input'
import { HeroNumberInput } from '@/shared/components/ui/hero-number-input'
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area'
import { addToast, Divider, Progress, User } from '@heroui/react'
import dayjs from 'dayjs'
import { useFormik } from 'formik'
import lodash from 'lodash'
import { BriefcaseIcon, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { JobNoField } from '../JobNoField'

type CreateJobFormProps = {
    onSubmit?: (values: TCreateJobInput) => void
    afterSubmit?: (values?: TCreateJobInput) => void
    isSubmitting?: boolean
}

export default function CreateJobFormMobile({
    onSubmit,
    isSubmitting = false,
    afterSubmit,
}: CreateJobFormProps) {
    const { data: users = [] } = useUsers()
    const { data: jobTypes = [] } = useJobTypes()
    const { data: paymentChannels = [] } = usePaymentChannels()

    const [currentStep, setCurrentStep] = useState(0)

    const steps = [
        { title: 'Details', icon: <BriefcaseIcon size={16} /> },
        { title: 'Files', icon: <Check size={16} /> },
        { title: 'Costs', icon: <Check size={16} /> },
    ]

    const fieldsByStep = [
        [
            'no',
            'typeId',
            'displayName',
            'clientName',
            'incomeCost',
            'paymentChannelId',
            'startedAt',
            'dueAt',
        ],
        ['attachmentUrls'],
        ['jobAssignments'],
    ]

    const formik = useFormik<TCreateJobInput & { totalStaffCost: number }>({
        initialValues: {
            clientName: '',
            typeId: '',
            no: '',
            displayName: '',
            attachmentUrls: [],
            startedAt: dayjs().toISOString(),
            dueAt: dayjs().add(7, 'days').toISOString(),
            jobAssignments: [
                {
                    userId: 'c4d35f1b-9b37-4a3f-804b-373f7b0e1a24',
                    staffCost: 0,
                },
            ],
            totalStaffCost: 0,
            incomeCost: 0,
            paymentChannelId: null,
        },
        validationSchema: CreateJobSchema,
        onSubmit: async (values) => {
            onSubmit?.(values)
            if (afterSubmit) {
                afterSubmit?.(values)
                formik.resetForm()
            }
        },
    })

    const calculatedTotal = useMemo(
        () =>
            formik.values.jobAssignments?.reduce(
                (sum, a) => sum + (a.staffCost || 0),
                0
            ) || 0,
        [formik.values.jobAssignments]
    )

    useEffect(() => {
        formik.setFieldValue('totalStaffCost', calculatedTotal)
    }, [calculatedTotal])

    const handleNext = async () => {
        const currentFields = fieldsByStep[currentStep]
        const touchedFields = currentFields.reduce(
            (acc, field) => ({ ...acc, [field]: true }),
            {}
        )
        await formik.setTouched({ ...formik.touched, ...touchedFields })

        const errors = await formik.validateForm()
        const stepHasErrors = currentFields.some((field) =>
            lodash.get(errors, field)
        )

        if (!stepHasErrors) setCurrentStep((prev) => prev + 1)
        else
            addToast({
                title: 'Please fix errors before proceeding',
                color: 'danger',
            })
    }

    const handleBack = () => setCurrentStep((prev) => prev - 1)

    const formikAssignees = useMemo(
        () =>
            users.filter((u) =>
                formik.values.jobAssignments?.some((a) => a.userId === u.id)
            ),
        [users, formik.values.jobAssignments]
    )

    return (
        <div className="w-full">
            {/* Mobile Step Header */}
            <div className="px-4 py-3 border-b border-divider sticky top-0 bg-background z-10">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-subdued">
                        Step {currentStep + 1} of {steps.length}
                    </span>
                    <span className="text-sm font-bold">
                        {steps[currentStep].title}
                    </span>
                </div>
                <Progress
                    size="sm"
                    value={((currentStep + 1) / steps.length) * 100}
                    color="primary"
                    className="h-1.5"
                />
            </div>

            <form
                onSubmit={formik.handleSubmit}
                className="flex flex-col flex-1 overflow-hidden"
            >
                <ScrollArea className="size-full h-[60vh]">
                    <ScrollBar orientation="horizontal" />
                    <ScrollBar orientation="vertical" />
                    <div className='px-4 pt-6 pb-14'>
                        {/* STEP 0: JOB DETAILS */}
                        {currentStep === 0 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                                <JobNoField
                                    jobTypes={jobTypes}
                                    defaultSelectedKey={jobTypes[0]?.id}
                                    onSelectionChange={(key, jobNoResult) => {
                                        formik.setFieldValue('typeId', key)
                                        formik.setFieldValue('no', jobNoResult)
                                    }}
                                />
                                <HeroInput
                                    isRequired
                                    label="Job name"
                                    placeholder="e.g. 3D Modeling"
                                    value={formik.values.displayName}
                                    onChange={formik.handleChange}
                                    name="displayName"
                                    labelPlacement="outside-top"
                                    isInvalid={Boolean(
                                        formik.touched.displayName &&
                                        formik.errors.displayName
                                    )}
                                    errorMessage={
                                        formik.errors.displayName as string
                                    }
                                />
                                <HeroInput
                                    isRequired
                                    label="Client name"
                                    placeholder="e.g. Tom Jain"
                                    value={formik.values.clientName}
                                    onChange={formik.handleChange}
                                    name="clientName"
                                    labelPlacement="outside-top"
                                    isInvalid={Boolean(
                                        formik.touched.clientName &&
                                        formik.errors.clientName
                                    )}
                                    errorMessage={
                                        formik.errors.clientName as string
                                    }
                                />
                                <DeliveryField
                                    value={{
                                        start: dayjs(formik.values.startedAt),
                                        end: formik.values.dueAt
                                            ? dayjs(formik.values.dueAt)
                                            : dayjs(),
                                    }}
                                    onValueChange={(range) => {
                                        formik.setFieldValue(
                                            'startedAt',
                                            range.start.toISOString()
                                        )
                                        formik.setFieldValue(
                                            'dueAt',
                                            range.end.toISOString()
                                        )
                                    }}
                                    isInvalid={{
                                        startedAt: Boolean(
                                            formik.touched.startedAt &&
                                            formik.errors.startedAt
                                        ),
                                        dueAt: Boolean(
                                            formik.touched.dueAt &&
                                            formik.errors.dueAt
                                        ),
                                    }}
                                    errorMessages={{
                                        startedAt: formik.errors
                                            .startedAt as string,
                                        dueAt: formik.errors.dueAt as string,
                                    }}
                                />
                                <Divider className="my-4" />
                                <div className="space-y-4">
                                    <HeroNumberInput
                                        isRequired
                                        label="Income Cost"
                                        placeholder="0"
                                        labelPlacement="outside-top"
                                        value={formik.values.incomeCost}
                                        onChange={(val) =>
                                            formik.setFieldValue('incomeCost', val)
                                        }
                                        startContent={
                                            <span className="text-default-400 text-small">
                                                $
                                            </span>
                                        }
                                        isInvalid={Boolean(
                                            formik.touched.incomeCost &&
                                            formik.errors.incomeCost
                                        )}
                                        errorMessage={
                                            formik.errors.incomeCost as string
                                        }
                                    />
                                    <PaymentChannelSelect
                                        channels={paymentChannels}
                                        onSelectionChange={(key) =>
                                            formik.setFieldValue(
                                                'paymentChannelId',
                                                key
                                            )
                                        }
                                        selectedKey={formik.values.paymentChannelId}
                                        isInvalid={Boolean(
                                            formik.touched.paymentChannelId &&
                                            formik.errors.paymentChannelId
                                        )}
                                    />
                                </div>
                            </div>
                        )}
    
                        {/* STEP 1: DOCUMENTS */}
                        {currentStep === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <JobAttachmentsField
                                    defaultAttachments={
                                        formik.values.attachmentUrls
                                    }
                                    onChange={(urls) =>
                                        formik.setFieldValue('attachmentUrls', urls)
                                    }
                                />
                            </div>
                        )}
    
                        {/* STEP 2: ASSIGNEES */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <AssignMemberField
                                    users={users}
                                    assignees={formikAssignees}
                                    onSelectMember={(userIds) => {
                                        const updatedAssignments = userIds.map(
                                            (id) => {
                                                const existing =
                                                    formik.values.jobAssignments?.find(
                                                        (a) => a.userId === id
                                                    )
                                                return (
                                                    existing || {
                                                        userId: id,
                                                        staffCost: 0,
                                                    }
                                                )
                                            }
                                        )
                                        formik.setFieldValue(
                                            'jobAssignments',
                                            updatedAssignments
                                        )
                                    }}
                                />
    
                                <div className="space-y-3">
                                    <p className="text-sm font-bold text-default-600">
                                        Distribution
                                    </p>
                                    {formik.values.jobAssignments?.map(
                                        (assignment, index) => {
                                            const user = users.find(
                                                (u) => u.id === assignment.userId
                                            )
                                            return (
                                                <div
                                                    key={assignment.userId}
                                                    className="p-3 bg-default-50 rounded-2xl border border-divider"
                                                >
                                                    <User
                                                        avatarProps={{
                                                            src: optimizeCloudinary(
                                                                user?.avatar ?? '',
                                                                {
                                                                    width: 100,
                                                                    height: 100,
                                                                }
                                                            ),
                                                        }}
                                                        name={
                                                            <p className="text-sm font-bold">
                                                                {user?.displayName}
                                                            </p>
                                                        }
                                                        description={
                                                            <p className="text-xs">
                                                                {
                                                                    user?.department
                                                                        ?.displayName
                                                                }
                                                            </p>
                                                        }
                                                    />
                                                    <div className="mt-3 flex items-center gap-2">
                                                        <HeroNumberInput
                                                            size="sm"
                                                            label="Staff Payout"
                                                            value={
                                                                assignment.staffCost
                                                            }
                                                            onChange={(val) =>
                                                                formik.setFieldValue(
                                                                    `jobAssignments[${index}].staffCost`,
                                                                    val
                                                                )
                                                            }
                                                            endContent={
                                                                <span className="text-tiny">
                                                                    đ
                                                                </span>
                                                            }
                                                            fullWidth
                                                        />
                                                        <HeroButton
                                                            isIconOnly
                                                            size="sm"
                                                            variant="flat"
                                                            color="danger"
                                                            onPress={() => {
                                                                const remaining =
                                                                    formik.values.jobAssignments.filter(
                                                                        (_, i) =>
                                                                            i !==
                                                                            index
                                                                    )
                                                                formik.setFieldValue(
                                                                    'jobAssignments',
                                                                    remaining
                                                                )
                                                            }}
                                                        >
                                                            ×
                                                        </HeroButton>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    )}
                                </div>
    
                                <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex justify-between items-center">
                                    <span className="text-xs font-bold text-primary-700 uppercase">
                                        Total Payout
                                    </span>
                                    <span className="text-lg font-black text-primary">
                                        {currencyFormatter(
                                            formik.values.totalStaffCost
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Mobile Sticky Navigation Footer */}
                <div className="p-4 bg-background border-t border-divider flex gap-3 sticky bottom-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                    <HeroButton
                        variant="flat"
                        className="flex-1"
                        onPress={handleBack}
                        isDisabled={currentStep === 0 || isSubmitting}
                        startContent={<ChevronLeft size={18} />}
                    >
                        Back
                    </HeroButton>

                    {currentStep < steps.length - 1 && (
                        <HeroButton
                            color="primary"
                            className="flex-2 font-bold"
                            onPress={handleNext}
                            endContent={<ChevronRight size={18} />}
                        >
                            Continue
                        </HeroButton>
                    )}
                    {currentStep === steps.length - 1 && (
                        <HeroButton
                            color="primary"
                            className="flex-2 font-bold"
                            type="submit"
                            isLoading={isSubmitting}
                        >
                            Complete Job
                        </HeroButton>
                    )}
                </div>
            </form>
        </div>
    )
}

// --- Helper Components (Keep Logic Same) ---

type DeliveryFieldProps = {
    value:
        | { start: string | dayjs.Dayjs; end: dayjs.Dayjs | string }
        | null
        | undefined
    onValueChange: (range: { start: dayjs.Dayjs; end: dayjs.Dayjs }) => void
    isInvalid?: { startedAt?: boolean; dueAt?: boolean }
    errorMessages?: { startedAt?: string; dueAt?: string }
}

function DeliveryField({
    value,
    onValueChange,
    isInvalid,
    errorMessages,
}: DeliveryFieldProps) {
    return (
        <HeroDateRangePicker
            label="Project Timeline"
            labelPlacement="outside-top"
            value={value}
            variant="bordered"
            isInvalid={isInvalid?.startedAt || isInvalid?.dueAt}
            errorMessage={
                isInvalid?.startedAt || isInvalid?.dueAt ? (
                    <div className="text-tiny">
                        {errorMessages?.startedAt && (
                            <p>Start: {errorMessages.startedAt}</p>
                        )}
                        {errorMessages?.dueAt && (
                            <p>Deadline: {errorMessages.dueAt}</p>
                        )}
                    </div>
                ) : undefined
            }
            onChange={(range) =>
                range
                    ? onValueChange(range)
                    : addToast({
                          title: 'Error selecting date',
                          color: 'danger',
                      })
            }
        />
    )
}
