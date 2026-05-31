import { z } from 'zod'

export const createTopicSchema = z.object({
	title: z
		.string()
		.min(3, 'Title must be at least 3 characters')
		.max(100, 'Title must be less than 100 characters'),
	description: z
		.string()
		.max(500, 'Description cannot exceed 500 characters')
		.optional(),
})

// Infer type from schema
export type TCreateTopicInput = z.infer<typeof createTopicSchema>