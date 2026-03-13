import { z, ZodType } from 'zod';
import { TJobDeliverFile, TJobDelivery } from '../../shared/types';
import { UserSchema } from './_user.schema';


export const JobDeliverFileSchema: ZodType<TJobDeliverFile> = z.lazy(() => z.object({
	id: z.string().default('N/A'),
	fileName: z.string().default('Unknown file'),
	webUrl: z.string().default(''),
	sharepointId: z.string().optional(),

	createdAt: z.coerce.date().catch(new Date()),
	updatedAt: z.coerce.date().catch(new Date()),
}));

export const JobDeliverySchema: ZodType<TJobDelivery> = z.lazy(() => z.object({
	id: z.string().default('N/A'),
	jobId: z.string().default('N/A'),

	userId: z.string().default('N/A'),

	// Zod mapping cho relation User
	user: z.lazy(() => UserSchema),

	note: z.string().optional(),

	// Tự động map mảng files, nếu null/undefined sẽ trả về mảng rỗng
	files: z.array(JobDeliverFileSchema).default([]),

	status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING'),
	adminFeedback: z.string().nullable(),

	createdAt: z.coerce.date().catch(new Date()),
	updatedAt: z.coerce.date().catch(new Date()),
}));