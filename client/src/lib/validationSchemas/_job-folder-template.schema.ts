import * as yup from "yup"
import { z, ZodType } from 'zod'
import { TJobFolderTemplate } from "../../shared/types"

export const JobFolderTemplateSchema: ZodType<TJobFolderTemplate> = z.lazy(() => z.object({
	id: z.string().catch('N/A'),
	displayName: z.string().catch(''),
	folderId: z.string().catch(''),
	folderName: z.string().catch(''),
	size: z.number().catch(0),
	webUrl: z.string().catch(''),
	createdAt: z.coerce.date().catch(new Date()),
	updatedAt: z.coerce.date().catch(new Date()),
}))

export const CreateJobFolderTemplateSchema = yup.object({
	displayName: yup.string().required("Display name is required"),
	folderId: yup.string().required("Folder ID is required"),
	folderName: yup.string().required("Folder name is required"),
	size: yup.number().required("Size is required").min(0, "Size must be positive"),
	webUrl: yup.string().required("Web URL is required").url("Must be a valid URL"),
})

export type TCreateJobFolderTemplateInput = yup.InferType<typeof CreateJobFolderTemplateSchema>

export const UpdateJobFolderTemplateSchema = CreateJobFolderTemplateSchema.partial()
export type TUpdateJobFolderTemplateInput = yup.InferType<typeof UpdateJobFolderTemplateSchema>