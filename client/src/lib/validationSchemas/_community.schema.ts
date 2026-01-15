import { z } from 'zod'
// Validation Schema
export const createCommunitySchema = z.object({
	name: z
		.string()
		.min(3, 'Community name must be at least 3 characters')
		.max(50, 'Community name must be less than 50 characters'),
	description: z
		.string()
		.max(250, 'Description cannot exceed 250 characters')
		.optional(),
	color: z.string(),
	privacy: z.enum(['public', 'private']),
})

// Infer the type from the schema for type safety
export type TCreateCommunityInput = z.infer<typeof createCommunitySchema>