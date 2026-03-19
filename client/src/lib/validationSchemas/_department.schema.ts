import * as yup from "yup";
import { z, ZodType } from 'zod';
import { COLORS } from "../utils";
import { UserSchema } from "./_user.schema";
import { TDepartment } from "../../shared/types";

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

export const CreateDepartmentSchema = yup.object({
	displayName: yup
		.string()
		.required("Display name is required"),

	notes: yup
		.string()
		.optional(),

	code: yup
		.string()
		.required("Code is required"),

	hexColor: yup
		.string()
		.matches(/^#([0-9A-Fa-f]{6})$/, "hexColor must be a valid hex color code (e.g. #FFFFFF)")
		.optional(),
})

export type TCreateDepartmentInput = yup.InferType<typeof CreateDepartmentSchema>

export const UpdateDepartmentSchema = CreateDepartmentSchema.partial()

export type TUpdateDepartmentInput = yup.InferType<typeof UpdateDepartmentSchema>
