import * as yup from "yup";
import { ZodType, z } from "zod";
import { TJobType } from "../../shared/types";
import { JobSchema } from "./_job.schema";

export const JobTypeSchema: ZodType<TJobType> = z.lazy(() => z.object({
	id: z.string().catch('N/A'),

	code: z.string().catch('UNKNOWN'),

	displayName: z.string().catch('Unknown Type'),

	sharepointFolderId: z.string().optional(),

	// Rào màu sắc, nếu không có thì để undefined hoặc mã màu mặc định
	hexColor: z.string().nullable(),

	// Quan hệ với Jobs: Sử dụng lazy để tránh lỗi khởi tạo vòng
	jobs: z.array(z.lazy(() => JobSchema)).default([]),

	// Xử lý object _count: Đảm bảo luôn là một object, không bị undefined
	_count: z.record(z.string(), z.union([z.string(), z.number()])).default({}),
}));

export const CreateJobTypeSchema = yup.object({
	code: yup
		.string()
		.required("Code is required"),

	displayName: yup
		.string()
		.required("Display name is required"),

	hexColor: yup
		.string()
		.matches(/^#([0-9A-Fa-f]{6})$/, "hexColor must be a valid hex color code (e.g. #FFFFFF)")
		.optional(),
})
export type TCreateJobTypeInput = yup.InferType<typeof CreateJobTypeSchema>

export const UpdateJobTypeInputSchema = CreateJobTypeSchema.partial()

export type TUpdateJobTypeInput = yup.InferType<typeof UpdateJobTypeInputSchema>