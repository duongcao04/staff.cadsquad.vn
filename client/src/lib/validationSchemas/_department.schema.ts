import { z, ZodType } from 'zod';
import { TDepartment } from "../../shared/types";
import { COLORS } from "../utils";
import { UserSchema } from "./_user.schema";

export const DepartmentSchema: ZodType<TDepartment> = z.lazy(() => z.object({
	id: z.string().default('N/A'),
	code: z.string().default('UNKNOWN'),
	displayName: z.string().default('Unknown department'),

	// Zod sẽ tự động map và rào từng user trong mảng này
	users: z.array(UserSchema).default([]),

	hexColor: z.string().nullable().default(COLORS.white),
	notes: z.string().nullable(),

	_count: z.object({
		users: z.number().default(0)
	}).optional().default({ users: 0 }),

	createdAt: z.coerce.date().catch(new Date()),
	updatedAt: z.coerce.date().catch(new Date()),
}));

export const CreateDepartmentSchema = z.object({
	displayName: z
		.string("Display name is required")
		.min(1, "Display name is required"),

	notes: z
		.string()
		.nullish(),

	code: z
		.string("Code is required")
		.min(1, "Code is required"),

	hexColor: z
		.string()
		.nullish(),
})

export type TCreateDepartmentInput = z.infer<typeof CreateDepartmentSchema>

export const UpdateDepartmentSchema = CreateDepartmentSchema.partial()

export type TUpdateDepartmentInput = z.infer<typeof UpdateDepartmentSchema>
