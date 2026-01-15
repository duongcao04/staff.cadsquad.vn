import * as Yup from 'yup'

export const clientSchema = Yup.object({
    name: Yup.string().required('Company/Client name is required'),

    code: Yup.string().required('Client code is required'),

    type: Yup.string().required(),

    // Contact Info
    email: Yup.string().email('Invalid email address').optional(),

    billingEmail: Yup.string().email('Invalid email address').optional(),

    phoneNumber: Yup.string().optional(),

    address: Yup.string().optional(),

    // Regional
    country: Yup.string().optional(),

    // Financials
    taxId: Yup.string().optional(),

    currency: Yup.string().default('USD'),

    paymentTerms: Yup.number()
        .typeError('Payment terms must be a number')
        .min(0)
        .default(30),
})

export type TClientInput = Yup.InferType<typeof clientSchema>
