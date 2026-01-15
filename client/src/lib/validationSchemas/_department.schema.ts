import * as yup from "yup"

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
