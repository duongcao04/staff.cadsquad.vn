import * as yup from 'yup'
import { z } from 'zod'

export const CreateJobStatusInputSchema = yup.object({
  displayName: yup.string().required('Display name is required'),
  thumbnailUrl: yup.string().url().optional(),
  hexColor: yup.string().matches(/^#([0-9A-Fa-f]{6})$/, 'Must be a valid hex color').required('Hex color is required'),
  order: yup.number().integer().required('Order is required'),
  code: yup.string().optional(),
  icon: yup.string().optional(),
  nextStatusOrder: yup.number().integer().optional(),
  prevStatusOrder: yup.number().integer().optional(),
})
export type TCreateJobStatusInput = yup.InferType<typeof CreateJobStatusInputSchema>

export const changeStatusInputSchema = z.object({
  // Code of current status
  currentStatus: z.string(),
  // Code of new target status
  newStatus: z.string(),
});
export type TChangeStatusInput = z.infer<typeof changeStatusInputSchema>;

export const UpdateJobStatusInputSchema = CreateJobStatusInputSchema.partial()
export type TUpdateJobStatusInput = yup.InferType<typeof UpdateJobStatusInputSchema>
