import { z } from "zod";

// Helper for comma-separated lists or arrays (matches your DTO Transform)
const stringOrArray = z
	.union([z.string(), z.array(z.string())])
	.transform((val) => {
		if (Array.isArray(val)) return val.join(","); // Convert array to "A,B" for URL
		return val;
	})
	.optional();

// Helper for numeric strings (Cost fields are strings in your DTO)
const numericString = z.string().regex(/^\d+$/, "Must be a valid number").optional();

// Helper for ISO Dates
const isoDate = z.string().date({ message: "Invalid ISO date format" }).optional();

export const jobFiltersSchema = z
	.object({
		clientName: z.string().trim().optional(),

		// Arrays / Lists
		type: stringOrArray,
		status: stringOrArray,
		assignee: stringOrArray,
		paymentChannel: stringOrArray,

		// Date Ranges
		createdAtFrom: isoDate,
		createdAtTo: isoDate,
		dueAtFrom: isoDate,
		dueAtTo: isoDate,
		completedAtFrom: isoDate,
		completedAtTo: isoDate,
		finishedAtFrom: isoDate,
		finishedAtTo: isoDate,

		// Cost Ranges
		incomeCostMin: numericString,
		incomeCostMax: numericString,
		staffCostMin: numericString,
		staffCostMax: numericString,
	})
	// --- LOGICAL VALIDATIONS (Cross-field checks) ---
	.refine((data) => !data.incomeCostMin || !data.incomeCostMax || Number(data.incomeCostMin) <= Number(data.incomeCostMax), {
		message: "Min income cost cannot be greater than Max income cost",
		path: ["incomeCostMin"],
	})
	.refine((data) => !data.staffCostMin || !data.staffCostMax || Number(data.staffCostMin) <= Number(data.staffCostMax), {
		message: "Min staff cost cannot be greater than Max staff cost",
		path: ["staffCostMin"],
	})
	.refine((data) => !data.createdAtFrom || !data.createdAtTo || new Date(data.createdAtFrom) <= new Date(data.createdAtTo), {
		message: "Start date cannot be after end date",
		path: ["createdAtFrom"],
	});

// Export the Type derived from Zod
export type TJobFilters = z.infer<typeof jobFiltersSchema>;