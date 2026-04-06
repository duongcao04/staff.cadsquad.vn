import * as yup from "yup"
import { z, ZodType } from 'zod'
import { TJobTitle } from "../../shared/types"
import { UserSchema } from "./_user.schema"

export const JobTitleSchema: ZodType<TJobTitle> = z.lazy(() => z.object({
	// Sử dụng .catch('N/A') để rào triệt để nếu API trả về null hoặc thiếu field id
	id: z.string().catch('N/A'),

	code: z.string().catch('UNKNOWN'),

	displayName: z.string().catch(''),

	notes: z.string().nullable(),

	_count: z.object({
		users: z.number().default(0)
	}).optional().default({ users: 0 }),
	
	// Đảm bảo users luôn là một mảng, kể cả khi Backend trả về null/undefined
	users: z.array(z.lazy(() => UserSchema)).default([]),

	// Dùng z.coerce.date() để tự động convert ISO String sang đối tượng Date
	// .catch(new Date()) sẽ lấy thời gian hiện tại nếu format ngày tháng bị sai
	createdAt: z.coerce.date().catch(new Date()),
	updatedAt: z.coerce.date().catch(new Date()),
}))

export const CreateJobTitleSchema = yup.object({
	displayName: yup.string().required("Display name is required"),
	notes: yup.string().optional(),
	code: yup.string().required("Code is required"),
})

export type TCreateJobTitleInput = yup.InferType<typeof CreateJobTitleSchema>

export const UpdateJobTitleSchema = CreateJobTitleSchema.partial()
export type TUpdateJobTitleInput = yup.InferType<typeof UpdateJobTitleSchema>
