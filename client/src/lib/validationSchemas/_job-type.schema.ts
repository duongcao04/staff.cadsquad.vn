import { z } from "zod";
import { JobSchema } from "./_job.schema";

// --- Domain / Response Schema ---
// Used for validating data coming out of the DB or for your JobTypeResponseDto
export const JobTypeSchema= z.object({
	id: z.string().uuid().catch('N/A'),
	code: z.string().min(1, "Code is required").catch('UNKNOWN'),
	displayName: z.string().min(1, "Display name is required").catch('Unknown Type'),
	sharepointFolderId: z.string().optional(), // string | null | undefined
	hexColor: z.string()
		.regex(/^#([0-9A-F]{3}|[0-9A-F]{6})$/i, "Invalid hex color")
		.nullable()
		.default(null),

	// Relations & Aggregates
	jobs: z.array(z.lazy(() => JobSchema)).default([]),
	_count: z.record(z.string(), z.union([z.string(), z.number()])).default({}),

	createdAt: z.coerce.date().catch(new Date()),
	updatedAt: z.coerce.date().catch(new Date()),
});

// --- Input Schemas (For NestJS Body Validation) ---

/**
 * Create Schema: Picks only the fields required for insertion
 */
export const CreateJobTypeSchema = JobTypeSchema.pick({
	code: true,
	displayName: true,
	sharepointFolderId: true,
	hexColor: true,
});

/**
 * Update Schema: Makes all create fields optional
 */
export const UpdateJobTypeSchema = CreateJobTypeSchema.partial();

// --- Derived Types ---
export type TCreateJobTypeInput = z.infer<typeof CreateJobTypeSchema>;
export type TUpdateJobTypeInput = z.infer<typeof UpdateJobTypeSchema>;