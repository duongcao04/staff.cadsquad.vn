import {
    clientOptions,
    createClientOptions,
    updateClientOptions,
} from '@/lib/queries'
import {
    addToast,
    Button,
    Divider,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Skeleton,
    Tooltip,
} from '@heroui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useFormik } from 'formik'
import lodash from 'lodash'
import {
    BuildingIcon,
    CreditCardIcon,
    GlobeIcon,
    HashIcon,
    MailIcon,
    MapPinIcon,
    PhoneIcon,
    Sparkles,
    UserIcon,
} from 'lucide-react'
import { ErrorBoundary } from 'react-error-boundary'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import { EditClientFormSchema, TEditClientFormValues } from '../../../../lib'
import { ScrollArea } from '../../../../shared/components/ui/scroll-area'
import { EClientType } from '../../../../shared/enums'

interface ModifyClientModalProps {
    isOpen: boolean
    onClose: () => void
    afterSubmit?: (data: TEditClientFormValues) => void
    clientId?: string
    initialValues?: Partial<TEditClientFormValues>
}

export const ModifyClientModal = ({
    isOpen,
    onClose,
    afterSubmit,
    clientId,
    initialValues,
}: ModifyClientModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} placement="center" size="2xl">
            <ModalContent>
                <ErrorBoundary
                    fallback={
                        <div className="p-10 text-center text-danger">
                            <p className="font-bold text-lg">
                                Failed to load client form
                            </p>
                            <p className="text-sm">Please try again later.</p>
                        </div>
                    }
                >
                    {isOpen && (
                        <ManageClientFormContent
                            clientId={clientId}
                            initialValues={initialValues}
                            afterSubmit={(data) => {
                                afterSubmit?.(data)
                            }}
                            onClose={onClose}
                        />
                    )}
                </ErrorBoundary>
            </ModalContent>
        </Modal>
    )
}

function ManageClientFormContent({
    clientId,
    afterSubmit,
    onClose,
    initialValues,
}: {
    clientId?: string
    afterSubmit: (data: TEditClientFormValues) => void
    onClose: () => void
    initialValues?: Partial<TEditClientFormValues>
}) {
    const isEditMode = !!clientId

    console.log(clientId)

    // --- 1. Data Fetching ---
    const { data: client, isLoading: isFetchingClient } = useQuery({
        ...clientOptions(clientId || ''),
        enabled: isEditMode,
    })

    // --- 2. Mutations ---
    const updateClientMutation = useMutation(updateClientOptions)
    const createClientMutation = useMutation(createClientOptions)

    const isPending =
        updateClientMutation.isPending || createClientMutation.isPending

    const handleClose = () => {
        formik.resetForm()
        onClose()
    }

    // --- 3. Formik Setup ---
    const formik = useFormik<TEditClientFormValues>({
        enableReinitialize: true,
        initialValues: {
            name: client?.name || '',
            code: client?.code || '',
            type: client?.type || EClientType.INDIVIDUAL,
            email: client?.email || '',
            billingEmail: client?.billingEmail || '',
            phoneNumber: client?.phoneNumber || '',
            address: client?.address || '',
            country: client?.country || '',
            taxId: client?.taxId || '',
            currency: client?.currency || 'USD',
            paymentTerms: client?.paymentTerms || 30,
            ...initialValues,
        },
        validationSchema: toFormikValidationSchema(EditClientFormSchema),
        onSubmit: async (values) => {
            try {
                if (isEditMode && client?.id) {
                    await updateClientMutation.mutateAsync({
                        clientId: client.id,
                        data: values,
                    })
                    addToast({
                        title: 'Client updated successfully',
                        color: 'success',
                    })
                } else {
                    await createClientMutation.mutateAsync(values)
                    addToast({
                        title: 'Client created successfully',
                        color: 'success',
                    })
                }

                afterSubmit(values)
                handleClose()
            } catch (error) {
                console.error('Form submit error', error)
            }
        },
    })

    // --- 4. Slugify Helper ---
    const handleGenerateCode = () => {
        if (!formik.values.name) {
            addToast({
                title: 'Please enter a Client Name first',
                color: 'warning',
            })
            return
        }
        // Convert "Tech Company 123" -> "TECH-COMPANY-123"
        const slugifiedCode = lodash.kebabCase(formik.values.name).toUpperCase()
        formik.setFieldValue('code', slugifiedCode)
    }

    if (isEditMode && isFetchingClient) {
        return <ModifyClientSkeleton />
    }

    return (
        <>
            <ModalHeader className="flex flex-col gap-1 pb-4 border-b border-divider">
                <span className="text-xl">
                    {isEditMode ? 'Edit Client' : 'Create New Client'}
                </span>
                <span className="text-sm font-normal text-text-subdued">
                    {isEditMode
                        ? `Updating details for ${client?.name}`
                        : 'Fill in the details row by row to register a new client.'}
                </span>
            </ModalHeader>

            <ModalBody className="px-0 py-0">
                <ScrollArea className="h-[60vh] px-6 py-6">
                    <form
                        id="manage-client-form"
                        className="flex flex-col gap-8"
                        onSubmit={formik.handleSubmit}
                    >
                        {/* --- Section 1: Identity --- */}
                        <div className="flex flex-col gap-5">
                            <Input
                                name="name"
                                label="Client Name"
                                labelPlacement="outside"
                                placeholder="Company or Person Name"
                                variant="bordered"
                                classNames={{
                                    inputWrapper: 'border-1',
                                    label: 'font-semibold',
                                }}
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={Boolean(
                                    formik.touched.name && formik.errors.name
                                )}
                                errorMessage={
                                    formik.touched.name && formik.errors.name
                                }
                                isRequired
                                startContent={
                                    <BuildingIcon
                                        className="text-default-400 mr-2"
                                        size={16}
                                    />
                                }
                            />

                            <Input
                                name="code"
                                label="Client Code"
                                labelPlacement="outside"
                                placeholder="e.g. CUST-001"
                                variant="bordered"
                                classNames={{
                                    inputWrapper: 'border-1 pr-1',
                                    label: 'font-semibold',
                                }}
                                value={formik.values.code}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={Boolean(
                                    formik.touched.code && formik.errors.code
                                )}
                                errorMessage={
                                    formik.touched.code && formik.errors.code
                                }
                                isRequired
                                startContent={
                                    <HashIcon
                                        className="text-default-400 mr-2"
                                        size={16}
                                    />
                                }
                                endContent={
                                    <Tooltip content="Auto-generate from name">
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="flat"
                                            color="primary"
                                            className="h-7 w-7 min-w-7"
                                            onPress={handleGenerateCode}
                                        >
                                            <Sparkles size={14} />
                                        </Button>
                                    </Tooltip>
                                }
                            />

                            <Select
                                name="type"
                                label="Client Type"
                                labelPlacement="outside"
                                variant="bordered"
                                classNames={{
                                    trigger: 'border-1',
                                    label: 'font-semibold',
                                }}
                                selectedKeys={
                                    formik.values.type
                                        ? [formik.values.type]
                                        : []
                                }
                                isInvalid={Boolean(
                                    formik.touched.type && formik.errors.type
                                )}
                                errorMessage={
                                    formik.touched.type &&
                                    (formik.errors.type as string)
                                }
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                startContent={
                                    <UserIcon
                                        className="text-default-400 mr-2"
                                        size={16}
                                    />
                                }
                                disallowEmptySelection
                            >
                                <SelectItem key="COMPANY">Company</SelectItem>
                                <SelectItem key="INDIVIDUAL">
                                    Individual
                                </SelectItem>
                            </Select>
                        </div>

                        <Divider />

                        {/* --- Section 2: Contact Info --- */}
                        <div className="flex flex-col gap-5">
                            <Input
                                name="email"
                                label="Email Address"
                                labelPlacement="outside"
                                type="email"
                                placeholder="contact@client.com"
                                variant="bordered"
                                classNames={{
                                    inputWrapper: 'border-1',
                                    label: 'font-semibold',
                                }}
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={Boolean(
                                    formik.touched.email && formik.errors.email
                                )}
                                errorMessage={
                                    formik.touched.email && formik.errors.email
                                }
                                startContent={
                                    <MailIcon
                                        className="text-default-400 mr-2"
                                        size={16}
                                    />
                                }
                            />

                            <Input
                                name="phoneNumber"
                                label="Phone Number"
                                labelPlacement="outside"
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                variant="bordered"
                                classNames={{
                                    inputWrapper: 'border-1',
                                    label: 'font-semibold',
                                }}
                                value={formik.values.phoneNumber}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={Boolean(
                                    formik.touched.phoneNumber &&
                                    formik.errors.phoneNumber
                                )}
                                errorMessage={
                                    formik.touched.phoneNumber &&
                                    formik.errors.phoneNumber
                                }
                                startContent={
                                    <PhoneIcon
                                        className="text-default-400 mr-2"
                                        size={16}
                                    />
                                }
                            />

                            <Input
                                name="address"
                                label="Address"
                                labelPlacement="outside"
                                placeholder="123 Business Rd, Suite 100"
                                variant="bordered"
                                classNames={{
                                    inputWrapper: 'border-1',
                                    label: 'font-semibold',
                                }}
                                value={formik.values.address}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={Boolean(
                                    formik.touched.address &&
                                    formik.errors.address
                                )}
                                errorMessage={
                                    formik.touched.address &&
                                    formik.errors.address
                                }
                                startContent={
                                    <MapPinIcon
                                        className="text-default-400 mr-2"
                                        size={16}
                                    />
                                }
                            />

                            <Input
                                name="country"
                                label="Country / Region"
                                labelPlacement="outside"
                                placeholder="United States"
                                variant="bordered"
                                classNames={{
                                    inputWrapper: 'border-1',
                                    label: 'font-semibold',
                                }}
                                value={formik.values.country}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={Boolean(
                                    formik.touched.country &&
                                    formik.errors.country
                                )}
                                errorMessage={
                                    formik.touched.country &&
                                    formik.errors.country
                                }
                                startContent={
                                    <GlobeIcon
                                        className="text-default-400 mr-2"
                                        size={16}
                                    />
                                }
                            />
                        </div>

                        <Divider />

                        {/* --- Section 3: Financials --- */}
                        <div className="flex flex-col gap-5">
                            <Input
                                name="taxId"
                                label="Tax ID / VAT Number"
                                labelPlacement="outside"
                                placeholder="Optional tax identification"
                                variant="bordered"
                                classNames={{
                                    inputWrapper: 'border-1',
                                    label: 'font-semibold',
                                }}
                                value={formik.values.taxId}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={Boolean(
                                    formik.touched.taxId && formik.errors.taxId
                                )}
                                errorMessage={
                                    formik.touched.taxId && formik.errors.taxId
                                }
                            />

                            <Input
                                name="billingEmail"
                                label="Billing Email"
                                labelPlacement="outside"
                                type="email"
                                placeholder="billing@client.com"
                                variant="bordered"
                                classNames={{
                                    inputWrapper: 'border-1',
                                    label: 'font-semibold',
                                }}
                                value={formik.values.billingEmail}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={Boolean(
                                    formik.touched.billingEmail &&
                                    formik.errors.billingEmail
                                )}
                                errorMessage={
                                    formik.touched.billingEmail &&
                                    formik.errors.billingEmail
                                }
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Select
                                    name="currency"
                                    label="Currency"
                                    labelPlacement="outside"
                                    variant="bordered"
                                    classNames={{
                                        trigger: 'border-1',
                                        label: 'font-semibold',
                                    }}
                                    selectedKeys={[formik.values.currency]}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={Boolean(
                                        formik.touched.currency &&
                                        formik.errors.currency
                                    )}
                                    errorMessage={
                                        formik.touched.currency &&
                                        formik.errors.currency
                                    }
                                    startContent={
                                        <CreditCardIcon
                                            className="text-default-400 mr-1"
                                            size={16}
                                        />
                                    }
                                >
                                    <SelectItem key="USD">USD ($)</SelectItem>
                                    <SelectItem key="EUR">EUR (€)</SelectItem>
                                    <SelectItem key="VND">VND (₫)</SelectItem>
                                </Select>

                                <Input
                                    name="paymentTerms"
                                    label="Payment Terms (Days)"
                                    labelPlacement="outside"
                                    type="number"
                                    placeholder="30"
                                    variant="bordered"
                                    classNames={{
                                        inputWrapper: 'border-1',
                                        label: 'font-semibold',
                                    }}
                                    value={String(formik.values.paymentTerms)}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={Boolean(
                                        formik.touched.paymentTerms &&
                                        formik.errors.paymentTerms
                                    )}
                                    errorMessage={
                                        formik.touched.paymentTerms &&
                                        formik.errors.paymentTerms
                                    }
                                />
                            </div>
                        </div>
                    </form>
                </ScrollArea>
            </ModalBody>

            <ModalFooter className="border-t border-divider py-4">
                <Button
                    color="danger"
                    variant="light"
                    onPress={handleClose}
                    isDisabled={isPending}
                >
                    Cancel
                </Button>
                <Button
                    color="primary"
                    type="submit"
                    form="manage-client-form"
                    isLoading={isPending}
                >
                    {isEditMode ? 'Save Changes' : 'Create Client'}
                </Button>
            </ModalFooter>
        </>
    )
}

function ModifyClientSkeleton() {
    return (
        <>
            <ModalHeader className="flex flex-col gap-2 pb-4 border-b border-divider">
                <Skeleton className="w-1/3 h-6 rounded-lg" />
                <Skeleton className="w-1/2 h-3 rounded-lg" />
            </ModalHeader>
            <ModalBody className="p-6 space-y-8">
                <div className="space-y-6">
                    <Skeleton className="w-1/4 h-4 rounded-lg" />
                    <Skeleton className="w-full h-12 rounded-xl" />
                    <Skeleton className="w-full h-12 rounded-xl" />
                </div>
                <Divider />
                <div className="space-y-6">
                    <Skeleton className="w-1/4 h-4 rounded-lg" />
                    <Skeleton className="w-full h-12 rounded-xl" />
                    <Skeleton className="w-full h-12 rounded-xl" />
                </div>
            </ModalBody>
            <ModalFooter className="border-t border-divider py-4">
                <Skeleton className="w-20 h-10 rounded-xl" />
                <Skeleton className="w-32 h-10 rounded-xl" />
            </ModalFooter>
        </>
    )
}
