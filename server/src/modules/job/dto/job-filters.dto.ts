import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsArray, IsISO8601, IsOptional, IsString } from 'class-validator'
import { Prisma } from '../../../generated/prisma'

/**
 * Data Transfer Object for filtering Job listings.
 * * This DTO handles query parameters for searching, sorting, and filtering jobs.
 * It includes transformations for handling comma-separated lists (e.g. `?status=OPEN,PENDING`)
 * and date range filtering.
 *  ===========================================================================
 *  FILTER MAPPING REFERENCE
 *  ===========================================================================
 *  DTO Field          | Prisma Field / Relation       | Logic
 *  -------------------|-------------------------------|-----------------------
 *  clientName         | clientName                    | contains (insensitive)
 *  type               | type.code                     | in: [...]
 *  status             | status.code                   | in: [...]
 *  assignee           | assignee.username             | in: [...]
 *  paymentChannel     | paymentChannel.displayName    | in: [...] (insensitive)
 *  [Dates]            | [Date Fields]                 | gte / lte
 *  [Costs]            | [Cost Fields]                 | gte / lte
 *  ===========================================================================
 */
export class JobFiltersDto {
	/**
	 * Filter by the client's name.
	 * Usually supports partial matching (case-insensitive).
	 * * @example "Acme Corp"
	 */
	@ApiProperty({
		description: 'Filter by client name',
		required: false,
		type: String,
	})
	@IsOptional()
	@IsString()
	@Transform(({ value }) => {
		if (!value) return undefined
		return value.trim()
	})
	clientName?: string

	/**
	 * Filter by one or more job type codes/IDs.
	 * Accepts a single value or a comma-separated list of values.
	 * * @example "TYPE_A"
	 * @example "TYPE_A,TYPE_B"
	 */
	@ApiProperty({
		description: 'Filter by job type code. Can be a comma-separated list.',
		required: false,
		type: String,
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@Transform(({ value }) => {
		if (!value) return undefined
		return Array.isArray(value)
			? value
			: value.split(',').map((v: string) => v.trim())
	})
	type?: string[]

	/**
	 * Filter by one or more job statuses.
	 * Accepts a single value or a comma-separated list of values.
	 * * @example "OPEN,IN_PROGRESS"
	 */
	@ApiProperty({
		description:
			'Filter by job status code. Can be a comma-separated list.',
		required: false,
		type: String,
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@Transform(({ value }) => {
		if (!value) return undefined
		return Array.isArray(value)
			? value
			: value.split(',').map((v: string) => v.trim())
	})
	status?: string[]

	/**
	 * Filter by the username(s) of the assignee.
	 * Accepts a single username or a comma-separated list.
	 * * @example "johnDoe"
	 * @example "johnDoe,janeDoe"
	 */
	@ApiProperty({
		description:
			'Filter by assignee username. Can be a comma-separated list.',
		required: false,
		type: String,
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@Transform(({ value }) => {
		if (!value) return undefined
		return Array.isArray(value)
			? value
			: value.split(',').map((v: string) => v.trim())
	})
	assignee?: string[]

	/**
	 * Filter by payment channel codes.
	 * Accepts a single code or a comma-separated list.
	 * * @example "BANK_TRANSFER,PAYPAL"
	 */
	@ApiProperty({
		description:
			'Filter by payment channel code. Can be a comma-separated list.',
		required: false,
		type: String,
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@Transform(({ value }) => {
		if (!value) return undefined
		return Array.isArray(value)
			? value
			: value.split(',').map((v) => v.trim())
	})
	paymentChannel?: string[]

	/**
	 * The start date for the creation date range filter.
	 * Expects an ISO 8601 date string.
	 * * @example "2023-01-01T00:00:00Z"
	 */
	@ApiProperty({
		description: 'Filter by creation date (from)',
		required: false,
	})
	@IsOptional()
	@IsISO8601()
	createdAtFrom?: string

	/**
	 * The end date for the creation date range filter.
	 * Expects an ISO 8601 date string.
	 * * @example "2023-12-31T23:59:59Z"
	 */
	@ApiProperty({
		description: 'Filter by creation date (to)',
		required: false,
	})
	@IsOptional()
	@IsISO8601()
	createdAtTo?: string

	/**
	 * The start date for the due date range filter.
	 * Expects an ISO 8601 date string.
	 */
	@ApiProperty({ description: 'Filter by due date (from)', required: false })
	@IsOptional()
	@IsISO8601()
	dueAtFrom?: string

	/**
	 * The end date for the due date range filter.
	 * Expects an ISO 8601 date string.
	 */
	@ApiProperty({ description: 'Filter by due date (to)', required: false })
	@IsOptional()
	@IsISO8601()
	dueAtTo?: string

	/**
	 * The start date for the completion date range filter.
	 * Expects an ISO 8601 date string.
	 */
	@ApiProperty({
		description: 'Filter by completion date (from)',
		required: false,
	})
	@IsOptional()
	@IsISO8601()
	completedAtFrom?: string

	/**
	 * The end date for the completion date range filter.
	 * Expects an ISO 8601 date string.
	 */
	@ApiProperty({
		description: 'Filter by completion date (to)',
		required: false,
	})
	@IsOptional()
	@IsISO8601()
	completedAtTo?: string

	/**
	 * The start date for the finish date range filter.
	 * Expects an ISO 8601 date string.
	 */
	@ApiProperty({
		description: 'Filter by finish date (from)',
		required: false,
	})
	@IsOptional()
	@IsISO8601()
	finishedAtFrom?: string

	/**
	 * The end date for the finish date range filter.
	 * Expects an ISO 8601 date string.
	 */
	@ApiProperty({ description: 'Filter by finish date (to)', required: false })
	@IsOptional()
	@IsISO8601()
	finishedAtTo?: string

	/**
	 * Minimum income cost filter.
	 * Represents the lower bound for the income cost search.
	 * * @example "1000"
	 */
	@ApiProperty({ description: 'Minimum income cost', required: false })
	@IsOptional()
	@IsString()
	incomeCostMin?: string

	/**
	 * Maximum income cost filter.
	 * Represents the upper bound for the income cost search.
	 * * @example "5000"
	 */
	@ApiProperty({ description: 'Maximum income cost', required: false })
	@IsOptional()
	@IsString()
	incomeCostMax?: string

	/**
	 * Minimum staff cost filter.
	 * Represents the lower bound for the staff cost search.
	 */
	@ApiProperty({ description: 'Minimum staff cost', required: false })
	@IsOptional()
	@IsString()
	staffCostMin?: string

	/**
	 * Maximum staff cost filter.
	 * Represents the upper bound for the staff cost search.
	 */
	@ApiProperty({ description: 'Maximum staff cost', required: false })
	@IsOptional()
	@IsString()
	staffCostMax?: string
}

export class JobFiltersBuilder {
	/**
	 * Main entry point: Converts DTO to Prisma WhereInput
	 */
	static build(filters: JobFiltersDto): Prisma.JobWhereInput {
		const where: Prisma.JobWhereInput = {}

		// 1. Client Name (Partial Match)
		// if (filters.clientName) {
		//   where.clientName = { contains: filters.clientName, mode: 'insensitive' }
		// }

		// 2. Job Type (Relation)
		if (filters.type?.length) {
			where.type = { code: { in: filters.type } }
		}

		// 3. Status (Relation)
		if (filters.status?.length) {
			where.status = { code: { in: filters.status } }
		}

		// 4. Assignee (Relation -> List)
		if (filters.assignee?.length) {
			// Note: Using 'some' assuming Assignee is a List relation (Job has many Assignees)
			where.assignments = {
				some: { user: { username: { in: filters.assignee } } },
			}
		}

		// 5. Payment Channel (Relation)
		if (filters.paymentChannel?.length) {
			where.paymentChannel = {
				displayName: {
					in: filters.paymentChannel,
					mode: 'insensitive',
				},
			}
		}

		// 6. Date Ranges
		if (filters.createdAtFrom || filters.createdAtTo) {
			where.createdAt = this.mapDateRange(
				filters.createdAtFrom,
				filters.createdAtTo
			)
		}
		if (filters.dueAtFrom || filters.dueAtTo) {
			where.dueAt = this.mapDateRange(filters.dueAtFrom, filters.dueAtTo)
		}
		if (filters.completedAtFrom || filters.completedAtTo) {
			where.completedAt = this.mapDateRange(
				filters.completedAtFrom,
				filters.completedAtTo
			)
		}
		if (filters.finishedAtFrom || filters.finishedAtTo) {
			where.finishedAt = this.mapDateRange(
				filters.finishedAtFrom,
				filters.finishedAtTo
			)
		}

		// 7. Cost Ranges
		if (filters.incomeCostMin || filters.incomeCostMax) {
			where.incomeCost = this.mapNumberRange(
				filters.incomeCostMin,
				filters.incomeCostMax
			)
		}

		// if (filters.staffCostMin || filters.staffCostMax) {
		//   where.staffCost = this.mapNumberRange(filters.staffCostMin, filters.staffCostMax)
		// }

		return where
	}

	/**
	 * Helper: Map Date Strings to Prisma Date Filter
	 */
	private static mapDateRange(
		from?: string,
		to?: string
	): Prisma.DateTimeFilter | undefined {
		if (!from && !to) return undefined
		const range: Prisma.DateTimeFilter = {}
		if (from) range.gte = new Date(from)
		if (to) range.lte = new Date(to)
		return range
	}

	/**
	 * Helper: Map Number Strings to Prisma Number Filter
	 */
	private static mapNumberRange(
		min?: string,
		max?: string
	): Prisma.IntFilter | undefined {
		if (!min && !max) return undefined
		const range: Prisma.IntFilter = {} // Change to FloatFilter if costs are decimals
		if (min) range.gte = parseFloat(min)
		if (max) range.lte = parseFloat(max)
		return range
	}
}
