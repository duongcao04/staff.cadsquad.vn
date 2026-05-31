import {
	Button,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Select,
	SelectItem
} from '@heroui/react'
import { useFormik } from 'formik'
import {
	Mail,
	Phone
} from 'lucide-react'

export const ClientFormModal = ({
    isOpen,
    onClose,
    client,
}: {
    isOpen: boolean
    onClose: () => void
    client: any
}) => {
    const isEditing = !!client

    const formik = useFormik({
        initialValues: {
            code: client?.code || '',
            name: client?.name || '',
            type: client?.type || 'COMPANY',
            email: client?.email || '',
            phoneNumber: client?.phoneNumber || '',
            billingEmail: client?.billingEmail || '',
            country: client?.country || '',
            region: client?.region || '',
            currency: client?.currency || 'USD',
            paymentTerms: client?.paymentTerms || 30,
            taxId: client?.taxId || '',
        },
        enableReinitialize: true,
        onSubmit: async (values) => {
            console.log(
                isEditing ? 'Updating client:' : 'Creating client:',
                values
            )
            // Call API to save Client
            onClose()
            formik.resetForm()
        },
    })

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="3xl"
            scrollBehavior="inside"
        >
            <ModalContent>
                <form onSubmit={formik.handleSubmit}>
                    <ModalHeader className="flex flex-col gap-1 border-b border-divider pb-4">
                        <span className="text-xl font-bold">
                            {isEditing
                                ? 'Edit Client Details'
                                : 'Register New Client'}
                        </span>
                        <p className="text-sm text-default-500">
                            Fill in the client's operational and financial
                            profiles.
                        </p>
                    </ModalHeader>

                    <ModalBody className="py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column: General Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-text-default border-b border-default-200 pb-2">
                                    General Profile
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        isRequired
                                        name="code"
                                        label="Client Code"
                                        placeholder="e.g. CUST-001"
                                        variant="bordered"
                                        labelPlacement="outside"
                                        value={formik.values.code}
                                        onChange={formik.handleChange}
                                    />
                                    <Select
                                        isRequired
                                        name="type"
                                        label="Client Type"
                                        variant="bordered"
                                        labelPlacement="outside"
                                        selectedKeys={[formik.values.type]}
                                        onChange={formik.handleChange}
                                    >
                                        <SelectItem
                                            key="COMPANY"
                                            textValue="Company"
                                        >
                                            Corporate / Company
                                        </SelectItem>
                                        <SelectItem
                                            key="INDIVIDUAL"
                                            textValue="Individual"
                                        >
                                            Individual / Freelancer
                                        </SelectItem>
                                    </Select>
                                </div>

                                <Input
                                    isRequired
                                    name="name"
                                    label="Company / Full Name"
                                    variant="bordered"
                                    labelPlacement="outside"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        name="country"
                                        label="Country"
                                        placeholder="e.g. USA"
                                        variant="bordered"
                                        labelPlacement="outside"
                                        value={formik.values.country}
                                        onChange={formik.handleChange}
                                    />
                                    <Input
                                        name="region"
                                        label="Region"
                                        placeholder="e.g. North America"
                                        variant="bordered"
                                        labelPlacement="outside"
                                        value={formik.values.region}
                                        onChange={formik.handleChange}
                                    />
                                </div>

                                <Input
                                    name="phoneNumber"
                                    label="Phone Number"
                                    variant="bordered"
                                    labelPlacement="outside"
                                    value={formik.values.phoneNumber}
                                    onChange={formik.handleChange}
                                    startContent={
                                        <Phone
                                            size={14}
                                            className="text-text-subdued"
                                        />
                                    }
                                />
                            </div>

                            {/* Right Column: Financial & Billing */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-text-default border-b border-default-200 pb-2">
                                    Billing & Financials
                                </h3>

                                <Input
                                    isRequired
                                    name="email"
                                    label="Primary Email"
                                    type="email"
                                    variant="bordered"
                                    labelPlacement="outside"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    startContent={
                                        <Mail
                                            size={14}
                                            className="text-text-subdued"
                                        />
                                    }
                                />

                                <Input
                                    name="billingEmail"
                                    label="Billing / Accounts Email"
                                    type="email"
                                    description="Invoices will be CC'd here."
                                    variant="bordered"
                                    labelPlacement="outside"
                                    value={formik.values.billingEmail}
                                    onChange={formik.handleChange}
                                />

                                <Input
                                    name="taxId"
                                    label="Tax ID / VAT Number"
                                    variant="bordered"
                                    labelPlacement="outside"
                                    value={formik.values.taxId}
                                    onChange={formik.handleChange}
                                />

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <Select
                                        isRequired
                                        name="currency"
                                        label="Default Currency"
                                        variant="bordered"
                                        labelPlacement="outside"
                                        selectedKeys={[formik.values.currency]}
                                        onChange={formik.handleChange}
                                    >
                                        <SelectItem
                                            key="USD"
                                            textValue="USD ($)"
                                        >
                                            USD ($)
                                        </SelectItem>
                                        <SelectItem
                                            key="EUR"
                                            textValue="EUR (€)"
                                        >
                                            EUR (€)
                                        </SelectItem>
                                        <SelectItem
                                            key="GBP"
                                            textValue="GBP (£)"
                                        >
                                            GBP (£)
                                        </SelectItem>
                                        <SelectItem
                                            key="SGD"
                                            textValue="SGD ($)"
                                        >
                                            SGD ($)
                                        </SelectItem>
                                        <SelectItem
                                            key="VND"
                                            textValue="VND (₫)"
                                        >
                                            VND (₫)
                                        </SelectItem>
                                    </Select>

                                    <Input
                                        isRequired
                                        name="paymentTerms"
                                        label="Payment Terms (Days)"
                                        type="number"
                                        description="e.g. 30 for NET30"
                                        variant="bordered"
                                        labelPlacement="outside"
                                        value={formik.values.paymentTerms.toString()}
                                        onChange={formik.handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </ModalBody>

                    <ModalFooter className="border-t border-divider pt-4">
                        <Button variant="flat" onPress={onClose}>
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            type="submit"
                            className="font-bold"
                        >
                            {isEditing ? 'Save Changes' : 'Register Client'}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    )
}
