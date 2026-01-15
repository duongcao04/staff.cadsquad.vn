import { clientDetailsByNameOptions } from '@/lib/queries'
import { clientSchema, TClientInput } from '@/lib/validationSchemas'
import {
    Button,
    Divider,
    Input,
    Select,
    SelectItem,
    Skeleton,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useFormik } from 'formik'
import {
    BuildingIcon,
    CreditCardIcon,
    GlobeIcon,
    HashIcon,
    MailIcon,
    MapPinIcon,
    PhoneIcon,
    UserIcon,
} from 'lucide-react'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useUpdateClientMutation } from '../../../../lib/queries/useClient'
import {
    HeroModal,
    HeroModalBody,
    HeroModalContent,
    HeroModalFooter,
    HeroModalHeader,
} from '../../../../shared/components/ui/hero-modal'
import { ScrollArea, ScrollBar } from '../../../../shared/components/ui/scroll-area'

interface EditClientModalProps {
    isOpen: boolean
    onClose: () => void
    afterSubmit?: (data: TClientInput) => void
    clientName: string
}

export const EditClientModal = ({
    isOpen,
    onClose,
    afterSubmit,
    clientName,
}: EditClientModalProps) => {
    return (
        <HeroModal
            isOpen={isOpen}
            onClose={onClose}
            placement="center"
            size="2xl"
        >
            <HeroModalContent>
                <ErrorBoundary
                    fallback={
                        <div className="p-10 text-center text-danger">
                            <p className="font-bold text-lg">
                                Failed to load client data
                            </p>
                            <p className="text-sm">Please try again later.</p>
                        </div>
                    }
                >
                    <Suspense fallback={<EditClientSkeleton />}>
                        {isOpen && (
                            <EditClientFormContent
                                clientName={clientName}
                                afterSubmit={(data) => {
                                    afterSubmit?.(data)
                                }}
                                onClose={onClose}
                            />
                        )}
                    </Suspense>
                </ErrorBoundary>
            </HeroModalContent>
        </HeroModal>
    )
}

function EditClientFormContent({
    clientName,
    afterSubmit,
    onClose,
}: {
    clientName: string
    afterSubmit: (data: TClientInput) => void
    onClose: () => void
}) {
    const { data: client } = useSuspenseQuery({
        ...clientDetailsByNameOptions(clientName),
    })

    const updateClientMutation = useUpdateClientMutation()

    // Helper to close modal and reset form
    const handleClose = () => {
        formik.resetForm()
        onClose()
    }
    // --- 2. Formik Setup ---
    const formik = useFormik<TClientInput>({
        // Automatically update form when 'client' prop changes
        enableReinitialize: true,
        initialValues: {
            name: client?.name || '',
            code: client?.code || '',
            type: client?.type,
            email: client?.email || '',
            billingEmail: client?.billingEmail || '',
            phoneNumber: client?.phoneNumber || '',
            address: client?.address || '',
            country: client?.country || '',
            taxId: client?.taxId || '',
            currency: client?.currency || 'USD',
            paymentTerms: client?.paymentTerms || 30,
        },
        validationSchema: clientSchema,
        onSubmit: async (values) => {
            await updateClientMutation.mutateAsync(
                {
                    clientId: client.id,
                    data: values,
                },
                {
                    onSuccess: () => {
                        afterSubmit(values)
                        handleClose()
                    },
                }
            )
        },
    })

    return (
        <>
            <HeroModalHeader className="flex flex-col gap-1 pb-1">
                Edit Client
                <span className="text-small font-normal text-text-subdued">
                    {client?.name} (#{client?.code})
                </span>
            </HeroModalHeader>

            <HeroModalBody className="px-0">
                <ScrollArea className="h-125 px-6 pt-1 pb-2">
                    <ScrollBar orientation="horizontal" />
                    <ScrollBar orientation="vertical" />
                    <form
                        id="edit-client-form"
                        className="flex flex-col gap-6"
                        onSubmit={formik.handleSubmit}
                    >
                        {/* --- Section 1: Identity --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                name="name"
                                label="Client Name"
                                placeholder="Company or Person Name"
                                variant="bordered"
                                classNames={{
                                    inputWrapper: 'border-1',
                                }}
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={
                                    Boolean(formik.touched.name) &&
                                    Boolean(formik.errors.name)
                                }
                                errorMessage={
                                    Boolean(formik.touched.name) &&
                                    formik.errors.name
                                }
                                isRequired
                                startContent={
                                    <BuildingIcon
                                        className="text-default-400"
                                        size={16}
                                    />
                                }
                            />
                            <Input
                                name="code"
                                label="Client Code"
                                placeholder="e.g. CUST-001"
                                variant="bordered"
                                classNames={{
                                    inputWrapper: 'border-1',
                                }}
                                value={formik.values.code}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={
                                    Boolean(formik.touched.code) &&
                                    Boolean(formik.errors.code)
                                }
                                errorMessage={
                                    Boolean(formik.touched.code) &&
                                    formik.errors.code
                                }
                                isRequired
                                startContent={
                                    <HashIcon
                                        className="text-default-400"
                                        size={16}
                                    />
                                }
                            />
                            <Select
                                name="type"
                                label="Client Type"
                                variant="bordered"
                                classNames={{
                                    trigger: 'border-1',
                                }}
                                selectedKeys={
                                    formik.values.type
                                        ? [formik.values.type]
                                        : []
                                }
                                isInvalid={
                                    Boolean(formik.touched.type) &&
                                    Boolean(formik.errors.type)
                                }
                                disallowEmptySelection
                                errorMessage={
                                    formik.touched.type &&
                                    (formik.errors.type as string)
                                }
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                startContent={
                                    <UserIcon
                                        className="text-default-400"
                                        size={16}
                                    />
                                }
                            >
                                <SelectItem key="COMPANY">Company</SelectItem>
                                <SelectItem key="INDIVIDUAL">
                                    Individual
                                </SelectItem>
                            </Select>
                        </div>

                        <Divider />

                        {/* --- Section 2: Contact Info --- */}
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-bold text-text-subdued">
                                Contact Details
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    name="email"
                                    label="Email Address"
                                    type="email"
                                    variant="bordered"
                                    classNames={{
                                        inputWrapper: 'border-1',
                                    }}
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={
                                        Boolean(formik.touched.email) &&
                                        Boolean(formik.errors.email)
                                    }
                                    errorMessage={
                                        Boolean(formik.touched.email) &&
                                        formik.errors.email
                                    }
                                    startContent={
                                        <MailIcon
                                            className="text-default-400"
                                            size={16}
                                        />
                                    }
                                />
                                <Input
                                    name="phoneNumber"
                                    label="Phone Number"
                                    type="tel"
                                    variant="bordered"
                                    classNames={{
                                        inputWrapper: 'border-1',
                                    }}
                                    value={formik.values.phoneNumber}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    startContent={
                                        <PhoneIcon
                                            className="text-default-400"
                                            size={16}
                                        />
                                    }
                                    isInvalid={
                                        Boolean(formik.touched.phoneNumber) &&
                                        Boolean(formik.errors.phoneNumber)
                                    }
                                    errorMessage={
                                        Boolean(formik.touched.phoneNumber) &&
                                        formik.errors.phoneNumber
                                    }
                                />
                                <Input
                                    name="address"
                                    label="Address"
                                    variant="bordered"
                                    classNames={{
                                        inputWrapper: 'border-1',
                                    }}
                                    className="md:col-span-2"
                                    value={formik.values.address}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={
                                        Boolean(formik.touched.address) &&
                                        Boolean(formik.errors.address)
                                    }
                                    errorMessage={
                                        Boolean(formik.touched.address) &&
                                        formik.errors.address
                                    }
                                    startContent={
                                        <MapPinIcon
                                            className="text-default-400"
                                            size={16}
                                        />
                                    }
                                />
                                <Input
                                    name="country"
                                    label="Country/Region"
                                    variant="bordered"
                                    classNames={{
                                        inputWrapper: 'border-1',
                                    }}
                                    value={formik.values.country}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={
                                        Boolean(formik.touched.country) &&
                                        Boolean(formik.errors.country)
                                    }
                                    errorMessage={
                                        Boolean(formik.touched.country) &&
                                        formik.errors.country
                                    }
                                    startContent={
                                        <GlobeIcon
                                            className="text-default-400"
                                            size={16}
                                        />
                                    }
                                />
                            </div>
                        </div>

                        <Divider />

                        {/* --- Section 3: Financials --- */}
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-bold text-text-subdued">
                                Financial Settings
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    name="taxId"
                                    label="Tax ID / VAT"
                                    variant="bordered"
                                    classNames={{
                                        inputWrapper: 'border-1',
                                    }}
                                    value={formik.values.taxId}
                                    isInvalid={
                                        Boolean(formik.touched.taxId) &&
                                        Boolean(formik.errors.taxId)
                                    }
                                    errorMessage={
                                        Boolean(formik.touched.taxId) &&
                                        formik.errors.taxId
                                    }
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                <Select
                                    name="currency"
                                    label="Currency"
                                    variant="bordered"
                                    classNames={{
                                        trigger: 'border-1',
                                    }}
                                    selectedKeys={[formik.values.currency]}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={
                                        Boolean(formik.touched.currency) &&
                                        Boolean(formik.errors.currency)
                                    }
                                    errorMessage={
                                        Boolean(formik.touched.currency) &&
                                        formik.errors.currency
                                    }
                                    startContent={
                                        <CreditCardIcon
                                            className="text-default-400"
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
                                    type="number"
                                    variant="bordered"
                                    classNames={{
                                        inputWrapper: 'border-1',
                                    }}
                                    isInvalid={
                                        Boolean(formik.touched.paymentTerms) &&
                                        Boolean(formik.errors.paymentTerms)
                                    }
                                    errorMessage={
                                        Boolean(formik.touched.paymentTerms) &&
                                        formik.errors.paymentTerms
                                    }
                                    value={String(formik.values.paymentTerms)}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    description="e.g., 30 days net"
                                />
                                <Input
                                    name="billingEmail"
                                    label="Billing Email"
                                    type="email"
                                    variant="bordered"
                                    classNames={{
                                        inputWrapper: 'border-1',
                                    }}
                                    className="md:col-span-3"
                                    value={formik.values.billingEmail}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isInvalid={
                                        Boolean(formik.touched.billingEmail) &&
                                        Boolean(formik.errors.billingEmail)
                                    }
                                    errorMessage={
                                        Boolean(formik.touched.billingEmail) &&
                                        formik.errors.billingEmail
                                    }
                                    placeholder="Where invoices should be sent"
                                />
                            </div>
                        </div>
                    </form>
                </ScrollArea>
            </HeroModalBody>

            <HeroModalFooter>
                <Button
                    color="danger"
                    variant="flat"
                    onPress={handleClose}
                    isDisabled={updateClientMutation.isPending}
                >
                    Cancel
                </Button>
                <Button
                    color="primary"
                    type="submit"
                    form="edit-client-form"
                    isLoading={updateClientMutation.isPending}
                >
                    Save Changes
                </Button>
            </HeroModalFooter>
        </>
    )
}
function EditClientSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <div className="space-y-2">
                <Skeleton className="w-1/3 h-7 rounded-lg" />
                <Skeleton className="w-1/4 h-3 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
            </div>
            <Divider />
            <div className="space-y-4">
                <Skeleton className="w-full h-12 rounded-xl" />
                <Skeleton className="w-full h-12 rounded-xl" />
            </div>
            <div className="flex justify-end gap-3 mt-4">
                <Skeleton className="w-24 h-10 rounded-xl" />
                <Skeleton className="w-32 h-10 rounded-xl" />
            </div>
        </div>
    )
}
