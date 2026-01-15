import { addToast, Divider, User } from '@heroui/react'
import dayjs from 'dayjs'
import { useFormik } from 'formik'
import { useEffect, useMemo, useState } from 'react'
import { currencyFormatter, optimizeCloudinary } from '@/lib'
import { useJobTypes, usePaymentChannels, useUsers } from '@/lib/queries'
import { CreateJobSchema, type TCreateJobInput } from '@/lib/validationSchemas'
import lodash from 'lodash'
import { BriefcaseIcon, CircleAlertIcon } from 'lucide-react'
import AssignMemberField from '../../../../shared/components/form-fields/AssignMemberField'
import JobAttachmentsField from '../../../../shared/components/form-fields/JobAttachmentsField'
import { JobNoField } from '../JobNoField'
import { PaymentChannelSelect } from '../../../../shared/components/form-fields/PaymentChannelSelect'
import { HeroButton } from '../../../../shared/components/ui/hero-button'
import { HeroDateRangePicker } from '../../../../shared/components/ui/hero-date-picker'
import { HeroInput } from '../../../../shared/components/ui/hero-input'
import { HeroNumberInput } from '../../../../shared/components/ui/hero-number-input'
import HeroRowsStep from '../../../../shared/components/ui/hero-rows-steps'
import { HeroTooltip } from '../../../../shared/components/ui/hero-tooltip'
import {
    ScrollArea,
    ScrollBar,
} from '../../../../shared/components/ui/scroll-area'

type CreateJobFormProps = {
    onSubmit?: (values: TCreateJobInput) => void
    afterSubmit?: (values?: TCreateJobInput) => void
    isSubmitting?: boolean
}
export default function CreateJobForm({
    onSubmit,
    isSubmitting = false,
    afterSubmit,
}: CreateJobFormProps) {
    const { data: users = [] } = useUsers()
    const { data: jobTypes = [] } = useJobTypes()
    const { data: paymentChannels = [] } = usePaymentChannels()

    const [currentStep, setCurrentStep] = useState(0)

    const steps = [
        { title: 'Job Details', description: 'Basic info' },
        { title: 'Documents', description: 'Attachments' },
        { title: 'Assignees', description: 'Costs per Member' },
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
        ['jobAssignments'], // Fixed field name
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
            totalStaffCost: 0, // Initialize with 0
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

    // Memoized Total Calculation
    const calculatedTotal = useMemo(
        () =>
            formik.values.jobAssignments?.reduce(
                (sum, a) => sum + (a.staffCost || 0),
                0
            ) || 0,
        [formik.values.jobAssignments]
    )

    // Sync totalStaffCost to Formik state whenever assignments change
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
            <div className="flex justify-center">
                <HeroRowsStep
                    currentStep={currentStep}
                    onStepChange={setCurrentStep}
                    className="w-full"
                    steps={steps.map((s, i) => ({
                        ...s,
                        disabled: i > currentStep,
                    }))}
                />
            </div>

            <Divider className="bg-border-default" />

            <form
                onSubmit={formik.handleSubmit}
                className="size-full flex flex-col justify-between"
            >
                <ScrollArea className="size-full h-[60vh] pl-7 pr-2">
                    <ScrollBar orientation="horizontal" />
                    <ScrollBar orientation="vertical" />
                    <div className="space-y-6 pr-4 py-5">
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
                                {/* Job Name */}
                                <HeroInput
                                    isRequired
                                    id="displayName"
                                    name="displayName"
                                    label="Job name"
                                    labelPlacement="outside-top"
                                    placeholder="e.g. 3D Modeling"
                                    value={formik.values.displayName}
                                    onChange={formik.handleChange}
                                    isInvalid={
                                        Boolean(formik.touched.displayName) &&
                                        Boolean(formik.errors.displayName)
                                    }
                                    errorMessage={
                                        Boolean(formik.touched.displayName) &&
                                        (formik.errors.displayName as string)
                                    }
                                />

                                {/* Client Name */}
                                <HeroInput
                                    isRequired
                                    id="clientName"
                                    name="clientName"
                                    label="Client name"
                                    placeholder="e.g. Tom Jain"
                                    value={formik.values.clientName}
                                    onChange={formik.handleChange}
                                    labelPlacement="outside-top"
                                    isInvalid={
                                        Boolean(formik.touched.clientName) &&
                                        Boolean(formik.errors.clientName)
                                    }
                                    errorMessage={
                                        Boolean(formik.touched.clientName) &&
                                        (formik.errors.clientName as string)
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
                                        startedAt:
                                            Boolean(formik.touched.startedAt) &&
                                            Boolean(formik.errors.startedAt),
                                        dueAt:
                                            Boolean(formik.touched.dueAt) &&
                                            Boolean(formik.errors.dueAt),
                                    }}
                                    errorMessages={{
                                        startedAt: Boolean(
                                            formik.touched.startedAt
                                        )
                                            ? (formik.errors
                                                  .startedAt as string)
                                            : undefined,
                                        dueAt: Boolean(formik.touched.dueAt)
                                            ? (formik.errors.dueAt as string)
                                            : undefined,
                                    }}
                                />
                                <div>
                                    <p className="text-base font-medium">
                                        Financial Details
                                    </p>
                                    <div className="mt-8 space-y-4">
                                        <HeroNumberInput
                                            isRequired
                                            id="incomeCost"
                                            name="incomeCost"
                                            label="Income"
                                            placeholder="0"
                                            type="number"
                                            labelPlacement="outside"
                                            allowNegative={false}
                                            notNull
                                            hideStepper
                                            value={formik.values.incomeCost}
                                            onChange={(value) =>
                                                formik.setFieldValue(
                                                    'incomeCost',
                                                    value
                                                )
                                            }
                                            startContent={
                                                <div className="pointer-events-none flex items-center">
                                                    <span className="text-default-400 text-small px-0.5">
                                                        $
                                                    </span>
                                                </div>
                                            }
                                            isInvalid={
                                                Boolean(
                                                    formik.touched.incomeCost
                                                ) &&
                                                Boolean(
                                                    formik.errors.incomeCost
                                                )
                                            }
                                            errorMessage={
                                                Boolean(
                                                    formik.touched.incomeCost
                                                ) && formik.errors.incomeCost
                                            }
                                        />
                                        <PaymentChannelSelect
                                            channels={paymentChannels}
                                            onSelectionChange={(key) => {
                                                const value = key
                                                formik.setFieldValue(
                                                    'paymentChannelId',
                                                    value
                                                )
                                            }}
                                            selectedKey={
                                                formik.values.paymentChannelId
                                            }
                                            isInvalid={
                                                Boolean(
                                                    formik.touched
                                                        .paymentChannelId
                                                ) &&
                                                Boolean(
                                                    formik.errors
                                                        .paymentChannelId
                                                )
                                            }
                                        />
                                    </div>
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
                                        formik.setFieldValue(
                                            'attachmentUrls',
                                            urls
                                        )
                                    }
                                />
                            </div>
                        )}

                        {/* STEP 2: ASSIGNEES & COSTS */}
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

                                <div className="mt-4 space-y-3">
                                    <p className="text-sm font-semibold text-default-600">
                                        Cost Distribution
                                    </p>
                                    {formik.values.jobAssignments?.map(
                                        (assignment, index) => {
                                            const user = users.find(
                                                (u) =>
                                                    u.id === assignment.userId
                                            )
                                            return (
                                                <div
                                                    key={assignment.userId}
                                                    className="flex items-center gap-4 p-3 bg-default-50 rounded-xl border border-divider group"
                                                >
                                                    <div className="flex-1">
                                                        <User
                                                            avatarProps={{
                                                                src: optimizeCloudinary(
                                                                    user?.avatar ??
                                                                        '',
                                                                    {
                                                                        width: 256,
                                                                        height: 256,
                                                                    }
                                                                ),
                                                            }}
                                                            name={
                                                                <p className="text-sm font-bold">
                                                                    {
                                                                        user?.displayName
                                                                    }
                                                                </p>
                                                            }
                                                            description={
                                                                <div className="flex items-center justify-start gap-1 text-text-subdued">
                                                                    <BriefcaseIcon
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                    <p className="text-xs">
                                                                        {
                                                                            user
                                                                                ?.department
                                                                                ?.displayName
                                                                        }
                                                                    </p>
                                                                </div>
                                                            }
                                                        />
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <div className="w-32">
                                                            <HeroNumberInput
                                                                size="sm"
                                                                label="Cost"
                                                                labelPlacement={
                                                                    'inside'
                                                                }
                                                                value={
                                                                    assignment.staffCost
                                                                }
                                                                onValueChange={(
                                                                    val
                                                                ) => {
                                                                    formik.setFieldValue(
                                                                        `jobAssignments[${index}].staffCost`,
                                                                        val
                                                                    )
                                                                }}
                                                                endContent={
                                                                    <span className="text-text-subdued">
                                                                        đ
                                                                    </span>
                                                                }
                                                                allowNegative={
                                                                    false
                                                                }
                                                                notNull
                                                                hideStepper
                                                            />
                                                        </div>

                                                        {/* ADD THIS BUTTON HERE */}
                                                        <HeroButton
                                                            isIconOnly
                                                            size="sm"
                                                            variant="flat"
                                                            color="danger"
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity" // Show on hover
                                                            onPress={() => {
                                                                if (
                                                                    formik
                                                                        .values
                                                                        .jobAssignments
                                                                        .length <=
                                                                    1
                                                                ) {
                                                                    addToast({
                                                                        title: 'At least one member is required',
                                                                        color: 'warning',
                                                                    })
                                                                    return
                                                                }
                                                                const remaining =
                                                                    formik.values.jobAssignments?.filter(
                                                                        (
                                                                            _,
                                                                            i
                                                                        ) =>
                                                                            i !==
                                                                            index
                                                                    )
                                                                formik.setFieldValue(
                                                                    'jobAssignments',
                                                                    remaining
                                                                )
                                                            }}
                                                        >
                                                            <span className="text-lg">
                                                                ×
                                                            </span>
                                                        </HeroButton>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    )}

                                    <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100 flex justify-between items-center">
                                        <p className="text-sm font-bold text-primary-700">
                                            Total Staff Cost
                                        </p>
                                        <p className="text-lg font-bold text-primary">
                                            {currencyFormatter(
                                                formik.values.totalStaffCost,
                                                'Vietnamese'
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="bg-background flex items-center justify-between px-7 pt-4 pb-2">
                    <HeroButton
                        variant="light"
                        color="default"
                        onPress={handleBack}
                        isDisabled={currentStep === 0}
                    >
                        Back
                    </HeroButton>

                    {currentStep < steps.length - 1 && (
                        <HeroButton
                            type="button"
                            color="primary"
                            onPress={handleNext}
                        >
                            Next Step
                        </HeroButton>
                    )}
                    {currentStep === steps.length - 1 && (
                        <HeroButton
                            color="primary"
                            type="submit"
                            isLoading={isSubmitting}
                        >
                            Create Job
                        </HeroButton>
                    )}
                </div>
            </form>
        </div>
    )
}
type DeliveryFieldProps = {
    value:
        | {
              start: string | dayjs.Dayjs

              end: dayjs.Dayjs | string
          }
        | null
        | undefined

    onValueChange: (range: { start: dayjs.Dayjs; end: dayjs.Dayjs }) => void

    isInvalid?: {
        startedAt?: boolean

        dueAt?: boolean
    }

    errorMessages?: {
        startedAt?: string

        dueAt?: string
    }
}
function DeliveryField({
    value,
    onValueChange,
    isInvalid,
    errorMessages,
}: DeliveryFieldProps) {
    return (
        <HeroDateRangePicker
            label={
                <div className="flex items-center justify-start w-fit gap-2">
                    <div className="relative pr-2.5">
                        <p className="absolute top-0 right-0 text-danger">*</p>
                        <p>Project Timeline (Start to Deadline)</p>
                    </div>
                    <HeroTooltip content="The default project timeline is set to 7 days.">
                        <HeroButton isIconOnly size="xs" variant="light">
                            <CircleAlertIcon
                                size={12}
                                className="text-text-subdued"
                            />
                        </HeroButton>
                    </HeroTooltip>
                </div>
            }
            labelPlacement="outside"
            value={value}
            variant="bordered"
            isInvalid={isInvalid?.startedAt || isInvalid?.dueAt}
            errorMessage={
                isInvalid?.startedAt || isInvalid?.dueAt ? (
                    <div>
                        {errorMessages?.startedAt && (
                            <p>{errorMessages.startedAt}</p>
                        )}
                        {errorMessages?.dueAt && <p>{errorMessages.dueAt}</p>}
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
