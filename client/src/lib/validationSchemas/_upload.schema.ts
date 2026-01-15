import * as yup from 'yup'

export const CreateUploadInputSchema = yup.object({})

export type CreateUploadInput = yup.InferType<typeof CreateUploadInputSchema>

export const UpdateUploadInputSchema = CreateUploadInputSchema.partial()

export type UpdateUploadInput = yup.InferType<typeof UpdateUploadInputSchema>
