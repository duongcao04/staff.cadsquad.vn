import * as yup from "yup"

export const CreatePaymentChannelSchema = yup.object({
    displayName: yup
        .string()
        .required("Display name is required"),

    hexColor: yup
        .string()
        .matches(/^#([0-9A-Fa-f]{6})$/, "hexColor must be a valid hex color code (e.g. #FFFFFF)")
        .optional(),

    logoUrl: yup
        .string()
        .url("logoUrl must be a valid URL")
        .optional(),

    ownerName: yup
        .string()
        .optional(),

    cardNumber: yup
        .string()
        .optional(),
})
export type TCreatePaymentChannelInput = yup.InferType<typeof CreatePaymentChannelSchema>

export const UpdatePaymentChannelInputSchema = CreatePaymentChannelSchema.partial()
export type TUpdatePaymentChannelInput = yup.InferType<typeof UpdatePaymentChannelInputSchema>