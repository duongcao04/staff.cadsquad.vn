import { addToast, Button, Textarea, useDisclosure } from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useFormik } from 'formik'
import lodash from 'lodash'
import { BookUserIcon, Briefcase, Save } from 'lucide-react'
import { z } from 'zod'
import { toFormikValidate } from 'zod-formik-adapter'
import {
    clientsListOptions,
    useUpdateJobGeneralInfoMutation,
} from '../../../../lib'
import {
    HeroAutocomplete,
    HeroAutocompleteItem,
    HeroInput,
    HeroTooltip,
} from '../../../../shared/components'
import { TJob } from '../../../../shared/types'
import { EditClientModal } from '../../../client-manage'

const EditGeneralDetailFromSchema = z.object({
    displayName: z
        .string('Display name is required')
        .min(1, 'Display name is required'),
    description: z.string().optional(),
    clientName: z
        .string('Client name is required')
        .min(1, 'Client name is required'),
})
export type TEditGeneralDetailFromValues = z.infer<
    typeof EditGeneralDetailFromSchema
>

export function GeneralDetailForm({ job }: { job: TJob }) {
    const updateJobGeneralInfoMutation = useUpdateJobGeneralInfoMutation()

    const {
        data: { clients },
    } = useSuspenseQuery(clientsListOptions())

    const formik = useFormik<TEditGeneralDetailFromValues>({
        initialValues: {
            displayName: job?.displayName || '',
            clientName: job?.client?.name || '',
            description: job?.description || '',
        },
        enableReinitialize: true,
        validationSchema: toFormikValidate(EditGeneralDetailFromSchema),
        onSubmit: async (values) => {
            await updateJobGeneralInfoMutation.mutateAsync({
                jobId: job.id,
                data: {
                    clientName: values.clientName,
                    displayName: values.displayName,
                    description: values.description,
                },
            })
        },
    })

    const editClientModal = useDisclosure({
        id: 'EditClientModal',
    })

    return (
        <>
            {editClientModal.isOpen && (
                <EditClientModal
                    isOpen={editClientModal.isOpen}
                    onClose={editClientModal.onClose}
                    clientName={formik.values.clientName}
                />
            )}
            <div className="space-y-6 animate-in fade-in">
                {/* --- FORM HEADER & TOOLTIP --- */}
                <div className="flex items-center justify-between pb-4 border-b border-border-default">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold text-text-default">
                                General Details
                            </h1>
                            <HeroTooltip
                                placement="right"
                                content={
                                    <div className="px-1 py-1 max-w-62.5 text-tiny text-text-subdued">
                                        Changes made here will immediately
                                        update the job board and be visible to
                                        all assigned team members.
                                    </div>
                                }
                            >
                                <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-border-default hover:bg-default-300 text-[10px] font-bold text-default-600 cursor-help transition-colors">
                                    !
                                </div>
                            </HeroTooltip>
                        </div>
                        <p className="text-sm text-text-subdued">
                            Manage the job’s main details, including client and
                            scope
                        </p>
                    </div>

                    <div className="flex items-center justify-end">
                        <Button
                            color="primary"
                            startContent={<Save size={18} />}
                            onPress={() => formik.handleSubmit()}
                            isLoading={formik.isSubmitting}
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
                    <div className="md:col-span-2">
                        <HeroInput
                            isRequired
                            name="displayName"
                            label="Job name"
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
                            classNames={{ label: 'font-medium' }}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <HeroAutocomplete
                            isRequired
                            name="clientName"
                            label="Client"
                            labelPlacement="outside"
                            placeholder="Client Company"
                            value={formik.values.clientName}
                            defaultSelectedKey={formik.values.clientName}
                            classNames={{ base: 'font-medium' }}
                            onChange={formik.handleChange}
                            isInvalid={
                                !!formik.errors.clientName &&
                                formik.touched.clientName
                            }
                            errorMessage={
                                formik.touched.clientName &&
                                (formik.errors.clientName as string)
                            }
                            variant="bordered"
                            allowsCustomValue={true} // Crucial: allows typing new names
                            onSelectionChange={(val) =>
                                formik.setFieldValue('clientName', val)
                            }
                            onInputChange={(val) =>
                                formik.setFieldValue('clientName', val)
                            }
                            startContent={
                                <Briefcase
                                    size={16}
                                    className="text-text-subdued"
                                />
                            }
                            endContent={
                                <HeroTooltip content="More details">
                                    <Button
                                        startContent={
                                            <BookUserIcon size={16} />
                                        }
                                        variant="light"
                                        size="sm"
                                        onPress={() => {
                                            console.log(
                                                lodash.isEmpty(
                                                    formik.values.clientName
                                                )
                                            )

                                            if (
                                                lodash.isEmpty(
                                                    formik.values.clientName
                                                )
                                            ) {
                                                addToast({
                                                    title: 'Client name is required',
                                                    color: 'danger',
                                                })
                                                return
                                            }

                                            editClientModal.onOpen()
                                        }}
                                        isIconOnly
                                    ></Button>
                                </HeroTooltip>
                            }
                        >
                            {clients.map((c) => (
                                <HeroAutocompleteItem
                                    key={c.name}
                                    textValue={c.name}
                                >
                                    {c.name}
                                </HeroAutocompleteItem>
                            ))}
                        </HeroAutocomplete>
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
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
