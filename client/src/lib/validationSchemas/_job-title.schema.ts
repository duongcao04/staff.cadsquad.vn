import * as yup from "yup"

export const CreateJobTitleSchema = yup.object({
	displayName: yup.string().required("Display name is required"),
	notes: yup.string().optional(),
	code: yup.string().required("Code is required"),
})

export type TCreateJobTitleInput = yup.InferType<typeof CreateJobTitleSchema>

export const UpdateJobTitleSchema = CreateJobTitleSchema.partial()
export type TUpdateJobTitleInput = yup.InferType<typeof UpdateJobTitleSchema>
