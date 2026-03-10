import { ZodType, z } from "zod";
import { TJobComment } from "../../shared/types";

export const JobCommentSchema: ZodType<TJobComment> = z.lazy(() => z.object({
	id: z.string().catch('N/A'),

	content: z.string().catch('No content available'),

	jobId: z.string().catch(''),

	userId: z.string().catch(''),

	// ParentId có thể null (comment cấp 1)
	parentId: z.string().nullable().catch(null),

	// Sử dụng z.lazy để xử lý mảng các câu trả lời (replies)
	replies: z.array(z.lazy(() => JobCommentSchema)).default([]),

	// Tự động rào dữ liệu User và Job nếu có đính kèm
	user: z.any().optional(),
	job: z.any().optional(),

	// Tự động convert string ISO từ API sang Date object
	createdAt: z.coerce.date().catch(new Date()),
	updatedAt: z.coerce.date().catch(new Date()),
}) as any);