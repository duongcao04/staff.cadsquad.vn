import {
    addToast,
    Card,
    CardBody,
    Divider,
    Input,
    Select,
    SelectItem,
    Switch,
} from '@heroui/react'
import { useQueries, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { FormikProvider, useFormik } from 'formik'
import HTMLReactParser from 'html-react-parser/lib/index'
import lodash from 'lodash'
import { BriefcaseIcon, Folder, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import {
    CreateJobFormSchema,
    currencyFormatter,
    flattenErrors,
    jobFolderTemplatesListOptions,
    jobTypesListOptions,
    optimizeCloudinary,
    paymentChannelsListOptions,
    sharepointFolderItemsOptions,
    SystemSettingHelper,
    systemSettingsListOptions,
    TCreateJobFormValues,
    usersListOptions,
} from '../../../lib'
import {
    HeroButton,
    HeroNumberInput,
    PaymentChannelSelect,
    ScrollArea,
    ScrollBar,
} from '../../../shared/components'
import AssignMemberField from '../../../shared/components/form-fields/AssignMemberField'
import JobAttachmentsField from '../../../shared/components/form-fields/JobAttachmentsField'
import { JobNoField } from '../components/JobNoField'
import { DeliveryField } from '../components/forms/CreateJobForm'

const steps = [
    { key: 1, title: 'Job Details', description: "Basic Job's information" },
    { key: 2, title: 'Documents', description: "Job's Attachments" },
    { key: 3, title: 'Assignees', description: 'Costs per Member' },
    { key: 4, title: 'Folder Options', description: "Job Folder's options" },
]
export const CreateJobPage = () => {
    const [currentStep, setCurrentStep] = useState(0)
    const [rootSharepointFolderId, setRootSharepointFolderId] = useState<
        string | null
    >(null)

    const [folderPath, setFolderPath] = useState<
        Array<{ id: string; name: string }>
    >([])
    const [
        { data: dataUsers },
        { data: dataJobTypes, isLoading: loadingJobTypes },
        { data: dataPaymentChannels, isLoading: loadingPaymentChannels },
        { data: dataFolderTemplates },
    ] = useQueries({
        queries: [
            usersListOptions(),
            jobTypesListOptions(),
            paymentChannelsListOptions(),
            jobFolderTemplatesListOptions(),
        ],
    })

    const users = useMemo(() => dataUsers?.users || [], [dataUsers])
    const jobTypes = useMemo(() => dataJobTypes?.jobTypes || [], [dataJobTypes])
    const paymentChannels = useMemo(
        () => dataPaymentChannels?.paymentChannels || [],
        [dataPaymentChannels]
    )
    const jobFolderTemplates = useMemo(
        () => dataFolderTemplates?.jobFolderTemplates || [],
        [dataFolderTemplates]
    )

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
    const {
        data: { settings },
    } = useSuspenseQuery(systemSettingsListOptions())
    const defaultAssignment = useMemo(() => {
        const defaultAssignees = SystemSettingHelper.getSettingByKey(
            settings,
            'defaultAssigneeIds'
        )
        return defaultAssignees.map((it) => ({
            userId: it,
            staffCost: 0,
        }))
    }, [settings])

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
                jobAssignments: defaultAssignment,
                totalStaffCost: 0, // Initialize with 0
                incomeCost: 0,
                folderTemplateId: null,
                paymentChannelId: null,
                isCreateSharepointFolder: true, // or false
                sharepointTemplateId: '',
                sharepointFolderId: '',
                useExistingSharepointFolder: false,
            },
            validationSchema: toFormikValidationSchema(CreateJobFormSchema),
            onSubmit: async (values) => {
                console.log(values)
            },
        }
    )
    const { data } = useQuery({
        ...sharepointFolderItemsOptions(rootSharepointFolderId ?? '-1'),
        enabled: !!rootSharepointFolderId,
    })

    // Safely access items
    const existingSharepointFolders = data?.items ?? []

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
        <FormikProvider value={formik}>
            <div className="flex gap-2 mt-2">
                {steps.map((it) => {
                    return (
                        <div
                            key={it.key}
                            className={`h-1.5 w-12 rounded-full transition-all duration-300 ${currentStep + 1 >= it.key ? 'bg-primary' : 'bg-default-200'}`}
                        />
                    )
                })}
            </div>

            <Card shadow="none" className="border border-border-default">
                <CardBody className="p-4 space-y-6">
                    {/* STEP 0: JOB DETAILS */}
                    {currentStep === 0 && (
                        <div className="space-y-5 duration-300 animate-in fade-in slide-in-from-right-4">
                            <JobNoField
                                jobTypes={jobTypes}
                                isLoading={loadingJobTypes}
                                defaultSelectedKey={jobTypes[0]?.id}
                                onSelectionChange={(key, jobNoResult) => {
                                    formik.setFieldValue('typeId', key)
                                    formik.setFieldValue('no', jobNoResult)

                                    const selectedJobType = jobTypes.find(
                                        (it) => it.id === key
                                    )

                                    if (selectedJobType?.sharepointFolderId) {
                                        setRootSharepointFolderId(
                                            selectedJobType.sharepointFolderId
                                        )
                                        setFolderPath([
                                            {
                                                id: selectedJobType.sharepointFolderId,
                                                name: 'Project Center',
                                            },
                                            {
                                                id: selectedJobType.sharepointFolderId,
                                                name: selectedJobType.displayName,
                                            },
                                        ])
                                    }
                                }}
                            />
                            {/* Job Name */}
                            <Input
                                isRequired
                                variant="bordered"
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
                            <Input
                                isRequired
                                id="clientName"
                                variant="bordered"
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
                                    startedAt: Boolean(formik.touched.startedAt)
                                        ? (formik.errors.startedAt as string)
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
                                            <div className="flex items-center pointer-events-none">
                                                <span className="text-default-400 text-small px-0.5">
                                                    $
                                                </span>
                                            </div>
                                        }
                                        isInvalid={
                                            Boolean(
                                                formik.touched.incomeCost
                                            ) &&
                                            Boolean(formik.errors.incomeCost)
                                        }
                                        errorMessage={
                                            Boolean(
                                                formik.touched.incomeCost
                                            ) && formik.errors.incomeCost
                                        }
                                    />
                                    <PaymentChannelSelect
                                        channels={paymentChannels}
                                        isLoading={loadingPaymentChannels}
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
                                                formik.touched.paymentChannelId
                                            ) &&
                                            Boolean(
                                                formik.errors.paymentChannelId
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 1: DOCUMENTS */}
                    {currentStep === 1 && (
                        <div className="duration-300 animate-in fade-in slide-in-from-right-4">
                            <JobAttachmentsField
                                defaultAttachments={
                                    formik.values.attachmentUrls
                                }
                                onChange={(urls) =>
                                    formik.setFieldValue('attachmentUrls', urls)
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
                        <div className="duration-300 animate-in fade-in slide-in-from-right-4">
                            <div className="px-5 py-3">
                                <p className="pb-1 pl-1 text-sm font-medium">
                                    Search member
                                </p>
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
                            </div>

                            <Divider className="w-[calc(100%-32px)] mx-auto bg-text-muted" />

                            <div className="relative mt-4">
                                <div className="pr-6 space-y-3 pl-7">
                                    <p className="text-sm font-medium">
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
                                                    className="flex items-center gap-4 p-3 border bg-default-50 rounded-xl border-divider group"
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
                                                                    ).touched &&
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
                                                            className="transition-opacity opacity-0 group-hover:opacity-100" // Show on hover
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
                                </div>

                                <div className="sticky bottom-0 z-10 px-3">
                                    <div className="bottom-0 flex items-center justify-between p-4 mt-6 border bg-primary-50 rounded-xl border-primary-100">
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
                        </div>
                    )}

                    {/* STEP 2: ASSIGNEES & COSTS */}
                    {/* STEP 3: FOLDER OPTIONS */}
                    {currentStep === 3 && (
                        <div className="duration-300 animate-in fade-in slide-in-from-right-4">
                            <p className="px-6 py-3 text-sm font-medium">
                                SharePoint Integration
                            </p>
                            <div className="px-5">
                                <div className="flex flex-col gap-6 p-5 border bg-default-50 rounded-xl border-divider">
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
                                            // clear existing mode/selection when toggling
                                            if (val) {
                                                formik.setFieldValue(
                                                    'useExistingSharepointFolder',
                                                    false
                                                )
                                                formik.setFieldValue(
                                                    'sharepointFolderId',
                                                    ''
                                                )
                                            }
                                            // Optional: reset template if turned off
                                            if (!val)
                                                formik.setFieldValue(
                                                    'sharepointTemplateId',
                                                    ''
                                                )
                                        }}
                                        color="primary"
                                    >
                                        <div className="flex flex-col gap-1 mt-1 ml-2">
                                            <p className="text-sm font-bold text-default-800">
                                                Create folder in SharePoint
                                            </p>
                                            <p className="text-xs text-default-500">
                                                Automatically generate a
                                                structured workspace for this
                                                job after creation.
                                            </p>
                                        </div>
                                    </Switch>

                                    <Switch
                                        isSelected={
                                            formik.values
                                                .useExistingSharepointFolder
                                        }
                                        onValueChange={(val) => {
                                            formik.setFieldValue(
                                                'useExistingSharepointFolder',
                                                val
                                            )
                                            if (val) {
                                                formik.setFieldValue(
                                                    'isCreateSharepointFolder',
                                                    false
                                                )
                                                formik.setFieldValue(
                                                    'sharepointTemplateId',
                                                    ''
                                                )
                                            } else {
                                                formik.setFieldValue(
                                                    'sharepointFolderId',
                                                    ''
                                                )
                                            }
                                        }}
                                        color="primary"
                                    >
                                        <div className="flex flex-col gap-1 mt-1 ml-2">
                                            <p className="text-sm font-bold text-default-800">
                                                Choose Existing SharePoint
                                                Folder
                                            </p>
                                            <p className="text-xs text-default-500">
                                                Link to a folder you already
                                                created under the job templates
                                                root.
                                            </p>
                                        </div>
                                    </Switch>

                                    {/* 2. Folder Template Select (Conditional) */}
                                    {formik.values.isCreateSharepointFolder && (
                                        <div className="duration-300 animate-in fade-in slide-in-from-top-2">
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
                                                onSelectionChange={(keys) => {
                                                    const selected = Array.from(
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
                                                            key={template.id}
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

                                    {/* existing-folder picker (conditional) - hierarchical navigation */}
                                    {formik.values
                                        .useExistingSharepointFolder && (
                                        <div className="duration-300 animate-in fade-in slide-in-from-top-2">
                                            {/* Breadcrumb navigation */}
                                            {folderPath.length > 1 && (
                                                <div className="flex items-center gap-1 mb-3 text-sm">
                                                    <p className="text-primary">
                                                        Project Center
                                                    </p>
                                                    {folderPath
                                                        .slice(1)
                                                        .map((item, idx) => (
                                                            <div
                                                                key={item.id}
                                                                className="flex items-center gap-1"
                                                            >
                                                                <span className="text-default-400">
                                                                    /
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setRootSharepointFolderId(
                                                                            item.id
                                                                        )
                                                                        setFolderPath(
                                                                            folderPath.slice(
                                                                                0,
                                                                                idx +
                                                                                    2
                                                                            )
                                                                        )
                                                                        formik.setFieldValue(
                                                                            'sharepointFolderId',
                                                                            ''
                                                                        )
                                                                    }}
                                                                    className="cursor-pointer text-primary hover:underline"
                                                                >
                                                                    {item.name}
                                                                </button>
                                                            </div>
                                                        ))}
                                                </div>
                                            )}

                                            {!formik.values
                                                .sharepointFolderId && (
                                                <Select
                                                    label="Navigate & Select Folder"
                                                    labelPlacement="outside"
                                                    placeholder="Choose a folder or double-click to enter"
                                                    variant="bordered"
                                                    selectedKeys={
                                                        formik.values
                                                            .sharepointFolderId
                                                            ? [
                                                                  formik.values
                                                                      .sharepointFolderId,
                                                              ]
                                                            : []
                                                    }
                                                    onSelectionChange={(
                                                        keys
                                                    ) => {
                                                        const selected =
                                                            Array.from(
                                                                keys
                                                            )[0] as string
                                                        const selectedFolder =
                                                            existingSharepointFolders.find(
                                                                (f) =>
                                                                    f.id ===
                                                                    selected
                                                            )

                                                        if (
                                                            selectedFolder?.isFolder
                                                        ) {
                                                            formik.setFieldValue(
                                                                'sharepointFolderId',
                                                                selected
                                                            )
                                                            // Navigate into folder
                                                            setRootSharepointFolderId(
                                                                selected
                                                            )
                                                            setFolderPath([
                                                                ...folderPath,
                                                                {
                                                                    id: selected,
                                                                    name: selectedFolder.name,
                                                                },
                                                            ])
                                                        } else {
                                                            // Select file/folder as final destination
                                                            formik.setFieldValue(
                                                                'sharepointFolderId',
                                                                selected
                                                            )
                                                        }
                                                    }}
                                                    isInvalid={
                                                        Boolean(
                                                            formik.touched
                                                                .sharepointFolderId
                                                        ) &&
                                                        Boolean(
                                                            formik.errors
                                                                .sharepointFolderId
                                                        )
                                                    }
                                                    errorMessage={
                                                        Boolean(
                                                            formik.touched
                                                                .sharepointFolderId
                                                        ) &&
                                                        (formik.errors
                                                            .sharepointFolderId as string)
                                                    }
                                                    disallowEmptySelection
                                                >
                                                    {(
                                                        existingSharepointFolders ??
                                                        []
                                                    ).map((item) => (
                                                        <SelectItem
                                                            key={item.id}
                                                            textValue={
                                                                item.name
                                                            }
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {item.isFolder ? (
                                                                    <>
                                                                        <Folder
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                        <span>
                                                                            {
                                                                                item.name
                                                                            }
                                                                        </span>
                                                                        <span className="ml-1 text-xs text-default-400">
                                                                            (click
                                                                            to
                                                                            enter)
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <span>
                                                                            📄
                                                                        </span>
                                                                        <span>
                                                                            {
                                                                                item.name
                                                                            }
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </Select>
                                            )}

                                            {formik.values
                                                .sharepointFolderId && (
                                                <div className="p-2 mt-3 text-sm border rounded bg-success-50 border-success-200 text-success-700">
                                                    <p className="font-medium">
                                                        ✓ Selected folder
                                                    </p>
                                                    <p className="text-xs text-success-600">
                                                        ID:{' '}
                                                        {formik.values.sharepointFolderId.slice(
                                                            0,
                                                            8
                                                        )}
                                                        ...
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>

            <div className="flex items-center justify-between pt-4 pb-2 bg-background px-7">
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
                    <HeroButton color="primary" type="submit">
                        Create Job
                    </HeroButton>
                )}
            </div>
        </FormikProvider>
    )
}
