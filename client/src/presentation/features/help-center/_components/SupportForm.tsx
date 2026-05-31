import {
	addToast,
	Button,
	Card,
	CardBody,
	CardHeader,
	Divider,
	Input,
	Select,
	SelectItem,
	Textarea,
} from '@heroui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { Send } from 'lucide-react'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import { SupportHelper } from '../../../lib/helpers'
import {
	createSupportTicketOptions,
	supportQueryKeys,
} from '../../../lib/queries/options/support-queries'
import { CreateTicketSchema } from '../../../lib/validationSchemas'

export function SupportForm() {
    const queryClient = useQueryClient()

    const { mutate, isPending } = useMutation({
        ...createSupportTicketOptions,
        onSuccess: () => {
            addToast({ title: 'Ticket submitted!', color: 'success' })
            formik.resetForm()
            queryClient.invalidateQueries({
                queryKey: supportQueryKeys.lists(),
            })
        },
    })

    const formik = useFormik({
        initialValues: {
            subject: '',
            category: '',
            description: '',
        },
        validationSchema: toFormikValidationSchema(CreateTicketSchema),
        onSubmit: (values) => {
            mutate({
                ...values,
                category: values.category.toUpperCase() as any,
            })
        },
    })

    return (
        <Card className="border shadow-md border-border-default">
            <CardHeader className="flex-col items-start px-6 py-4">
                <h3 className="text-lg font-bold text-text-default">
                    Still need help?
                </h3>
                <p className="text-sm text-text-subdued">
                    Submit a ticket and our team will get back to you.
                </p>
            </CardHeader>
            <Divider className="bg-border-default" />
            <CardBody className="gap-4 p-6">
                <form
                    onSubmit={formik.handleSubmit}
                    className="flex flex-col gap-4"
                >
                    <Input
                        isRequired
                        name="subject"
                        label="Subject"
                        placeholder="Brief summary of the issue"
                        labelPlacement="outside"
                        variant="bordered"
                        value={formik.values.subject}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={
                            !!formik.errors.subject && formik.touched.subject
                        }
                        errorMessage={formik.errors.subject}
                    />

                    <Select
                        isRequired
                        name="category"
                        label="Category"
                        placeholder="Select a topic"
                        labelPlacement="outside"
                        variant="bordered"
                        selectedKeys={
                            formik.values.category
                                ? [formik.values.category]
                                : []
                        }
                        onSelectionChange={(keys) =>
                            formik.setFieldValue(
                                'category',
                                Array.from(keys)[0]
                            )
                        }
                        onBlur={() => formik.setFieldTouched('category', true)}
                        isInvalid={
                            !!formik.errors.category && formik.touched.category
                        }
                        errorMessage={formik.errors.category}
                    >
                        {SupportHelper.getCategories().map((it) => (
                            <SelectItem
                                key={it.key}
                                startContent={<it.icon size={16} />}
                            >
                                {it.title}
                            </SelectItem>
                        ))}
                    </Select>

                    <Textarea
                        name="description"
                        label="Description"
                        placeholder="Please describe the issue in detail..."
                        labelPlacement="outside"
                        variant="bordered"
                        minRows={4}
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={
                            !!formik.errors.description &&
                            formik.touched.description
                        }
                        errorMessage={formik.errors.description}
                    />

                    <Button
                        type="submit"
                        color="primary"
                        className="w-full font-bold"
                        isLoading={isPending}
                        startContent={!isPending && <Send size={18} />}
                    >
                        Submit Ticket
                    </Button>
                </form>
            </CardBody>
        </Card>
    )
}
