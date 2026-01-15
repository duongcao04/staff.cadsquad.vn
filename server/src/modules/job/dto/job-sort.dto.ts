import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsOptional, IsString } from 'class-validator'
import { Prisma } from '../../../generated/prisma'

export class JobSortDto {
	@ApiProperty({
		description:
			'Sort criteria. Format: "field:order". Example: "createdAt:desc,status.name:asc"',
		required: false,
		example: 'createdAt:desc',
		oneOf: [
			{ type: 'string' },
			{ type: 'array', items: { type: 'string' } },
		],
	})
	@IsOptional()
	@Transform(({ value }) => {
		if (Array.isArray(value)) {
			return value // Already an array (e.g., ?sort=a:asc&sort=b:desc)
		}
		if (typeof value === 'string') {
			return value.split(',') // Split comma-separated string
		}
		return value
	})
	@IsString({ each: true }) // Validate each item in the array
	sort?: string[] = ['displayName:asc'] // Default value
}
export class JobSortBuilder {
	static build(
		sortInput?: string | string[] | null // <--- Fix 1: Accept optional/null input
	): Prisma.JobOrderByWithRelationInput[] {
		// 1. Safe guard against null/undefined
		if (!sortInput) return []

		// 2. Ensure input is an array
		const sorts = Array.isArray(sortInput) ? sortInput : [sortInput]

		// 3. Map over items
		return sorts.flatMap((item) => {
			if (!item) return []

			const [field, orderValue] = item.trim().split(':')
			const sortOrder = (
				orderValue?.toLowerCase() === 'asc' ? 'asc' : 'desc'
			) as Prisma.SortOrder

			// Case A: Relation Sort (e.g., "status.name:asc")
			if (field.includes('.')) {
				const parts = field.split('.')
				const buildNested = (keys: string[]): any => {
					const key = keys.shift()
					if (!key) return sortOrder
					return { [key]: buildNested(keys) }
				}
				// Fix 2: Cast as 'any' or specific type because TS cannot infer dynamic keys match Prisma Schema
				return buildNested(parts) as Prisma.JobOrderByWithRelationInput
			}

			// Case B: Standard Sort (e.g., "createdAt:desc")
			// Fix 3: Cast as specific type
			return { [field]: sortOrder } as Prisma.JobOrderByWithRelationInput
		})
	}
}
