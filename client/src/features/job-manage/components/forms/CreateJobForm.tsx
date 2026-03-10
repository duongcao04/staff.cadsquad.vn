import {
    currencyFormatter,
    jobFolderTemplatesListOptions,
    jobTypesListOptions,
    optimizeCloudinary,
    paymentChannelsListOptions,
    usersListOptions,
} from '@/lib'
import {
    CreateJobFormSchema,
    type TCreateJobFormValues,
} from '@/lib/validationSchemas'
import AssignMemberField from '@/shared/components/form-fields/AssignMemberField'
import JobAttachmentsField from '@/shared/components/form-fields/JobAttachmentsField'
import { PaymentChannelSelect } from '@/shared/components/form-fields/PaymentChannelSelect'
import { HeroButton } from '@/shared/components/ui/hero-button'
import { HeroDateRangePicker } from '@/shared/components/ui/hero-date-picker'
import { HeroInput } from '@/shared/components/ui/hero-input'
import { HeroNumberInput } from '@/shared/components/ui/hero-number-input'
import HeroRowsStep from '@/shared/components/ui/hero-rows-steps'
import { HeroTooltip } from '@/shared/components/ui/hero-tooltip'
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area'
import {
    addToast,
    Divider,
    Select,
    SelectItem,
    Switch,
    User,
} from '@heroui/react'
import { useSuspenseQueries } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useFormik } from 'formik'
import lodash from 'lodash'
import { BriefcaseIcon, CircleAlertIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import { JobNoField } from '../JobNoField'
import HTMLReactParser from 'html-react-parser/lib/index'
import { flattenErrors } from '../../../../lib/formik'

type CreateJobFormProps = {
    onSubmit?: (values: TCreateJobFormValues) => void
    afterSubmit?: (values?: TCreateJobFormValues) => void
    isSubmitting?: boolean
}
export default function CreateJobForm({
    onSubmit,
    isSubmitting = false,
    afterSubmit,
}: CreateJobFormProps) {
    const [
        {
            data: { users },
        },
        {
            data: { jobTypes },
        },
        {
            data: { paymentChannels },
        },
        {
            data: { jobFolderTemplates },
        },
    ] = useSuspenseQueries({
        queries: [
            usersListOptions(),
            jobTypesListOptions(),
            paymentChannelsListOptions(),
            jobFolderTemplatesListOptions(),
        ],
    })
    const [currentStep, setCurrentStep] = useState(0)

    const steps = [
        { title: 'Job Details', description: "Basic Job's information" },
        { title: 'Documents', description: "Job's Attachments" },
        { title: 'Assignees', description: 'Costs per Member' },
        { title: 'Folder Options', description: "Job Folder's options" },
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

    const formik = useFormik<TCreateJobFormValues & { totalStaffCost: number }>(
        {
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
                isCreateSharepointFolder: true, // or false
                sharepointTemplateId: '',
            },
            validationSchema: toFormikValidationSchema(CreateJobFormSchema),
            onSubmit: async (values) => {
                onSubmit?.(values)
                if (afterSubmit) {
                    afterSubmit?.(values)
                    formik.resetForm()
                }
            },
        }
    )

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
        const stepErrorMessages = currentFields
            .flatMap((field) => {
                const rawError = lodash.get(errors, field)
                return flattenErrors(rawError)
            })
            .filter(Boolean) // Removes undefined/nulls

        const stepHasErrors = stepErrorMessages.length > 0

        if (stepHasErrors) {
            console.log(stepErrorMessages)

            addToast({
                title: 'Please fix the errors below',
                // 2. Format the messages nicely (e.g., joining them with a bullet point or comma)
                description: HTMLReactParser(
                    ' • ' + stepErrorMessages.join('<br/> • ')
                ),
                color: 'danger',
            })
            return
        }

        setCurrentStep((prev) => prev + 1)
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
                <ScrollArea className="size-full h-[60vh]">
                    <ScrollBar orientation="horizontal" />
                    <ScrollBar orientation="vertical" />
                    <div className="space-y-6">
                        {/* STEP 0: JOB DETAILS */}
                        {currentStep === 0 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300 pl-7 pr-6 py-5">
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
                                    classNames={{
                                        header: 'px-5 pt-3 pb-2',
                                        body: 'pl-7 pr-6 py-5',
                                    }}
                                />
                            </div>
                        )}

                        {/* STEP 2: ASSIGNEES & COSTS */}
                        {currentStep === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="px-5 py-3">
                                    <p className="font-semibold text-sm pb-1 pl-1">
                                        Search member
                                    </p>
                                    <AssignMemberField
                                        users={users}
                                        assignees={formikAssignees}
                                        onSelectMember={(userIds) => {
                                            const updatedAssignments =
                                                userIds.map((id) => {
                                                    const existing =
                                                        formik.values.jobAssignments?.find(
                                                            (a) =>
                                                                a.userId === id
                                                        )
                                                    return (
                                                        existing || {
                                                            userId: id,
                                                            staffCost: 0,
                                                        }
                                                    )
                                                })
                                            formik.setFieldValue(
                                                'jobAssignments',
                                                updatedAssignments
                                            )
                                        }}
                                    />
                                </div>

                                <Divider className="w-[calc(100%-32px)] mx-auto bg-text-muted" />

                                <div className="relative mt-4">
                                    <div className="pl-7 pr-6 space-y-3">
                                        <p className="font-semibold text-sm">
                                            Cost Distribution
                                        </p>
                                        {formik.values.jobAssignments?.map(
                                            (assignment, index) => {
                                                const user = users.find(
                                                    (u) =>
                                                        u.id ===
                                                        assignment.userId
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
                                                                    size="lg"
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
                                                                    isInvalid={Boolean(
                                                                        formik.getFieldMeta(
                                                                            `jobAssignments[${index}].staffCost`
                                                                        )
                                                                            .touched &&
                                                                        formik.getFieldMeta(
                                                                            `jobAssignments[${index}].staffCost`
                                                                        ).error
                                                                    )}
                                                                    endContent={
                                                                        <span className="text-text-subdued">
                                                                            VND
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
                                                                        addToast(
                                                                            {
                                                                                title: 'At least one member is required',
                                                                                color: 'warning',
                                                                            }
                                                                        )
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
                                    </div>

                                    <div className="sticky bottom-0 px-3 z-10">
                                        <div className="bottom-0 mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100 flex justify-between items-center">
                                            <p className="text-sm font-bold text-primary-700">
                                                Total Staff Cost
                                            </p>
                                            <p className="text-lg font-bold text-primary">
                                                {currencyFormatter(
                                                    formik.values
                                                        .totalStaffCost,
                                                    'Vietnamese'
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: ASSIGNEES & COSTS */}
                        {/* STEP 3: FOLDER OPTIONS */}
                        {currentStep === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <p className="text-sm font-semibold px-6 py-3">
                                    SharePoint Integration
                                </p>
                                <div className="px-5">
                                    <div className="flex flex-col gap-6 p-5 bg-default-50 rounded-xl border border-divider">
                                        {/* 1. Toggle for SharePoint Folder Creation */}
                                        <Switch
                                            isSelected={
                                                formik.values
                                                    .isCreateSharepointFolder
                                            }
                                            onValueChange={(val) => {
                                                formik.setFieldValue(
                                                    'isCreateSharepointFolder',
                                                    val
                                                )
                                                // Optional: reset template if turned off
                                                if (!val)
                                                    formik.setFieldValue(
                                                        'sharepointTemplateId',
                                                        ''
                                                    )
                                            }}
                                            color="primary"
                                        >
                                            <div className="flex flex-col gap-1 ml-2 mt-1">
                                                <p className="text-sm font-bold text-default-800">
                                                    Create folder in SharePoint
                                                </p>
                                                <p className="text-xs text-default-500">
                                                    Automatically generate a
                                                    structured workspace for
                                                    this job after creation.
                                                </p>
                                            </div>
                                        </Switch>

                                        {/* 2. Folder Template Select (Conditional) */}
                                        {formik.values
                                            .isCreateSharepointFolder && (
                                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                <Select
                                                    label="Folder Template"
                                                    labelPlacement="outside"
                                                    placeholder="Select a template structure"
                                                    variant="bordered"
                                                    selectedKeys={
                                                        formik.values
                                                            .sharepointTemplateId
                                                            ? [
                                                                  formik.values
                                                                      .sharepointTemplateId,
                                                              ]
                                                            : []
                                                    }
                                                    disallowEmptySelection
                                                    onSelectionChange={(
                                                        keys
                                                    ) => {
                                                        const selected =
                                                            Array.from(
                                                                keys
                                                            )[0] as string
                                                        formik.setFieldValue(
                                                            'sharepointTemplateId',
                                                            selected
                                                        )
                                                    }}
                                                    isInvalid={
                                                        Boolean(
                                                            formik.touched
                                                                .sharepointTemplateId
                                                        ) &&
                                                        Boolean(
                                                            formik.errors
                                                                .sharepointTemplateId
                                                        )
                                                    }
                                                    errorMessage={
                                                        Boolean(
                                                            formik.touched
                                                                .sharepointTemplateId
                                                        ) &&
                                                        (formik.errors
                                                            .sharepointTemplateId as string)
                                                    }
                                                >
                                                    {jobFolderTemplates.map(
                                                        (template) => (
                                                            <SelectItem
                                                                key={
                                                                    template.id
                                                                }
                                                                textValue={
                                                                    template.displayName
                                                                }
                                                            >
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-sm font-medium">
                                                                        {
                                                                            template.displayName
                                                                        }
                                                                    </span>
                                                                    <span className="text-xs text-default-500">
                                                                        {
                                                                            template.folderName
                                                                        }{' '}
                                                                        (
                                                                        {
                                                                            template.size
                                                                        }{' '}
                                                                        bytes)
                                                                    </span>
                                                                </div>
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </Select>
                                            </div>
                                        )}
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
