import {
    clientsListOptions,
    jobQueryKeys,
    updateJobGeneralInfoOptions,
} from '@/lib'
import { HeroCopyButton, HeroTooltip } from '@/shared/components'
import HtmlReactParser from '@/shared/components/ui/html-react-parser'
import { TJob } from '@/shared/types'
import {
    addToast,
    Autocomplete,
    AutocompleteItem,
    Button,
    Input,
    Kbd,
    Textarea,
    useDisclosure,
} from '@heroui/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useFormik } from 'formik'
import {
    AlignLeft,
    BookUserIcon,
    Briefcase,
    Building2,
    FileText,
    Hash,
    Pencil,
    Save,
    Tag,
    X,
} from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import { ModifyClientModal } from '../../../client-manage'
import { queryClient } from '../../../../main'

const EditGeneralDetailFromSchema = z.object({
    displayName: z
        .string('Display name is required')
        .min(1, 'Display name is required'),
    description: z.string().optional(),
    clientId: z.string('Client is required').min(1, 'Client is required'),
})

export type TEditGeneralDetailFromValues = z.infer<
    typeof EditGeneralDetailFromSchema
>

export function GeneralDetailForm({ job }: { job: TJob }) {
    const [clientName, setClientName] = useState(job.client?.name)
    // --- State for toggling View/Edit modes ---
    const [isEditing, setIsEditing] = useState(false)

    const updateJobGeneralInfoMutation = useMutation(
        updateJobGeneralInfoOptions
    )

    const {
        data: { clients },
    } = useSuspenseQuery(clientsListOptions())

    const formik = useFormik<TEditGeneralDetailFromValues>({
        initialValues: {
            displayName: job?.displayName || '',
            clientId: job?.client?.id || '',
            description: job?.description || '',
        },
        enableReinitialize: true,
        validationSchema: toFormikValidationSchema(EditGeneralDetailFromSchema),
        onSubmit: async (values) => {
            await updateJobGeneralInfoMutation.mutateAsync(
                {
                    jobId: job.id,
                    data: {
                        clientId: values.clientId,
                        displayName: values.displayName,
                        description: values.description,
                    },
                },
                {
                    onSuccess() {
                        addToast({
                            title: 'Successfully',
                            description: 'Update general details successfully',
                            color: 'success',
                        })
                        queryClient.refetchQueries({
                            queryKey: jobQueryKeys.detailByNo(job.no),
                        })
                    },
                }
            )
            setIsEditing(false)
        },
    })

    const modifyClientModalState = useDisclosure({
        id: 'ModifyClientModalState',
    })

    const handleCancelEdit = () => {
        formik.resetForm()
        setIsEditing(false)
    }

    return (
        <>
            {modifyClientModalState.isOpen && (
                <ModifyClientModal
                    isOpen={modifyClientModalState.isOpen}
                    onClose={modifyClientModalState.onClose}
                    clientId={formik.values.clientId}
                    initialValues={
                        formik.values.clientId
                            ? {}
                            : {
                                  name: clientName,
                              }
                    }
                />
            )}

            <div className="animate-in fade-in duration-300">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-border-default">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold text-text-default flex items-center gap-2">
                                <FileText size={18} />
                                General Details
                            </h1>
                        </div>
                        <p className="text-sm text-text-subdued">
                            {isEditing
                                ? "Update the job's main details and scope."
                                : 'View the primary information and metadata for this job.'}
                        </p>
                    </div>

                    {/* --- ACTION BUTTONS --- */}
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <Button
                                    variant="flat"
                                    onPress={handleCancelEdit}
                                    isDisabled={formik.isSubmitting}
                                    startContent={<X size={16} />}
                                    className="font-medium"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    startContent={<Save size={16} />}
                                    onPress={() => formik.handleSubmit()}
                                    isLoading={formik.isSubmitting}
                                    className="font-bold shadow-sm"
                                >
                                    Save Changes
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="light"
                                startContent={<Pencil size={14} />}
                                onPress={() => setIsEditing(true)}
                            >
                                <span className="font-medium">Edit</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* --- CONTENT AREA --- */}
                {isEditing ? (
                    /* ==========================================
                        EDIT MODE 
                       ========================================== */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-1">
                        <div className="md:col-span-2">
                            <Input
                                isRequired
                                name="displayName"
                                label="Job Name"
                                labelPlacement="outside"
                                placeholder="e.g. Website Redesign"
                                value={formik.values.displayName}
                                onChange={formik.handleChange}
                                isInvalid={
                                    !!formik.errors.displayName &&
                                    formik.touched.displayName
                                }
                                errorMessage={
                                    formik.touched.displayName &&
                                    (formik.errors.displayName as string)
                                }
                                variant="bordered"
                                classNames={{
                                    label: 'font-semibold text-text-default',
                                }}
                            />
                        </div>

                        <div className="md:col-span-2 flex justify-between gap-2 items-end">
                            <Autocomplete
                                isRequired
                                name="clientId"
                                label="Client"
                                labelPlacement="outside"
                                placeholder="Select client"
                                value={formik.values.clientId}
                                defaultItems={clients}
                                classNames={{
                                    base: 'font-medium',
                                }}
                                onValueChange={(value) => {
                                    formik.handleChange(value)
                                    setClientName(value)
                                }}
                                onSelectionChange={(value) => {
                                    formik.setFieldValue('clientId', value)
                                }}
                                isInvalid={
                                    !!formik.errors.clientId &&
                                    formik.touched.clientId
                                }
                                listboxProps={{
                                    emptyContent: (
                                        <div>
                                            No results found. Press
                                            <Kbd keys="enter" className="mx-2">
                                                <span className="pl-1">
                                                    Enter
                                                </span>
                                            </Kbd>
                                            to create new
                                        </div>
                                    ),
                                }}
                                errorMessage={
                                    formik.touched.clientId &&
                                    (formik.errors.clientId as string)
                                }
                                variant="bordered"
                                allowsCustomValue={true}
                                onInputChange={formik.handleChange}
                                onKeyDown={(e) => {
                                    if (e.code === 'Enter') {
                                        modifyClientModalState.onOpen()
                                        formik.setFieldValue(
                                            'clientId',
                                            clientName
                                        )
                                    }
                                }}
                                startContent={
                                    <Briefcase
                                        size={16}
                                        className="text-text-subdued"
                                    />
                                }
                            >
                                {clients.map((c) => (
                                    <AutocompleteItem
                                        key={c.id}
                                        textValue={c.name}
                                    >
                                        {c.name}
                                    </AutocompleteItem>
                                ))}
                            </Autocomplete>
                            {clients.findIndex(
                                (it) => it.name === clientName
                            ) !== -1 && (
                                <HeroTooltip content="Edit Client Details">
                                    <Button
                                        startContent={
                                            <BookUserIcon size={16} />
                                        }
                                        onPress={modifyClientModalState.onOpen}
                                        isIconOnly
                                    />
                                </HeroTooltip>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <Textarea
                                name="description"
                                label="Description / Scope of Work"
                                labelPlacement="outside"
                                placeholder="Describe the job details..."
                                minRows={6}
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                variant="bordered"
                                classNames={{
                                    label: 'font-semibold text-text-default',
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    /* ==========================================
                                     VIEW MODE 
                       ========================================== */
                    <div className="space-y-6">
                        {/* Top Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2 p-4 bg-primary-50 rounded-xl border border-primary-200 shadow-sm relative overflow-hidden">
                                {/* Subtle decorative background element */}
                                <div className="absolute -right-4 -bottom-4 opacity-10">
                                    <Hash
                                        size={80}
                                        className="text-primary-600"
                                    />
                                </div>
                                <div className="relative z-10 flex flex-col gap-1">
                                    <span className="text-xs font-bold text-primary-600 uppercase tracking-wider flex items-center gap-1.5">
                                        <Hash size={14} /> Job No.
                                    </span>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="font-mono font-black text-primary-700 text-2xl tracking-tight">
                                            {job.no}
                                        </span>
                                        <HeroCopyButton
                                            textValue={job.no}
                                            className="text-primary-600 bg-white shadow-sm border border-primary-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col justify-center gap-1.5 p-4 bg-default-50 rounded-xl border border-default-200">
                                <span className="text-xs font-bold text-default-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Tag size={14} /> Job Type
                                </span>
                                <span className="font-bold text-default-900 text-base">
                                    {job.type?.displayName || 'Standard'}
                                </span>
                            </div>

                            <div className="flex flex-col justify-center gap-1.5 p-4 bg-default-50 rounded-xl border border-default-200">
                                <span className="text-xs font-bold text-default-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Building2 size={14} /> Client
                                </span>
                                <span
                                    className="font-bold text-default-900 text-base truncate"
                                    title={
                                        job.client?.name ||
                                        'Internal / Unassigned'
                                    }
                                >
                                    {job.client?.name ||
                                        'Internal / Unassigned'}
                                </span>
                            </div>

                            <div className="flex flex-col justify-center gap-1.5 p-4 bg-default-50 rounded-xl border border-default-200">
                                <span className="text-xs font-bold text-default-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <FileText size={14} /> Job Name
                                </span>
                                <span
                                    className="font-bold text-default-900 text-base truncate"
                                    title={job.displayName}
                                >
                                    {job.displayName}
                                </span>
                            </div>
                        </div>

                        {/* Description Box */}
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-bold text-default-500 uppercase tracking-wider flex items-center gap-1.5 px-1">
                                <AlignLeft size={14} /> Description
                            </span>
                            <div className="p-4 bg-default-50 rounded-xl border border-default-100 min-h-30 text-sm text-text-default whitespace-pre-wrap leading-relaxed">
                                {job.description ? (
                                    <HtmlReactParser
                                        htmlString={job.description}
                                    />
                                ) : (
                                    <span className="italic text-default-400">
                                        No description provided.
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
