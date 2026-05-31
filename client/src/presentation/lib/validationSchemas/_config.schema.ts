import * as yup from 'yup'

export const CreateConfigInputSchema = yup.object({
  displayName: yup.string().required('Display name is required'),
  code: yup.string().required('Code is required'),
  value: yup.string().required('Value is required'),
})

export type TCreateUserConfigInput = yup.InferType<typeof CreateConfigInputSchema>

export const UpdateConfigInputSchema = CreateConfigInputSchema.partial()

export type TUpdateUserConfigInput = yup.InferType<typeof UpdateConfigInputSchema>
