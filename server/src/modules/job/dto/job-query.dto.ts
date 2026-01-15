import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
	IsBoolean,
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
	Max,
	Min,
} from 'class-validator'
import dayjs from 'dayjs'
import { JobTabEnum } from '../enums/job-tab.enum'
import { JobFiltersDto } from './job-filters.dto'
import { JobSortDto } from './job-sort.dto'
import { Prisma, JobStatusSystemType } from '../../../generated/prisma'

// 1. Combine Filters and Sorts first
class FiltersAndSorts extends IntersectionType(JobFiltersDto, JobSortDto) {}

// 2. Combine with Base Pagination & Search
export class JobQueryDto extends FiltersAndSorts {
	@ApiPropertyOptional({
		description: 'Tab to filter jobs by',
		enum: JobTabEnum,
		default: JobTabEnum.ACTIVE,
	})
	@IsOptional()
	@IsEnum(JobTabEnum)
	tab?: JobTabEnum = JobTabEnum.ACTIVE

	@ApiPropertyOptional({ description: 'Search keywords' })
	@IsOptional()
	@IsString()
	search?: string

	@ApiPropertyOptional({
		description: 'Hide finished items (1 for true, 0 for false)',
		default: 0,
		type: Number, // Shows as a number in Swagger UI
		example: 1,
	})
	@IsOptional()
	@Transform(({ value }) => {
		// Convert '1', 1, 'true', or true to Boolean TRUE
		return [true, 'true', 1, '1'].indexOf(value) > -1
	})
	@IsBoolean()
	hideFinishItems?: boolean = false // Default to boolean false

	// --- Pagination ---

	@ApiPropertyOptional({
		description: 'Number of items per page',
		default: 10,
	})
	@IsOptional()
	@Type(() => Number) // Standard way to convert Query param string to Number
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number = 10

	@ApiPropertyOptional({ description: 'Page number', default: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1

	@ApiPropertyOptional({
		description:
			'If 1 or true, ignores limit and page to return all records',
		example: 1,
	})
	@IsOptional()
	@Transform(({ value }) => {
		// Treat '1', 1, 'true', or true as TRUE
		return [true, 'true', 1, '1'].indexOf(value) > -1
	})
	@IsBoolean()
	isAll?: boolean
}

export class JobQueryBuilder {
	static buildQueryTab(
		tab: JobTabEnum = JobTabEnum.ACTIVE
	): Prisma.JobWhereInput {
		const today = dayjs().startOf('day').toDate()
		const dayAfterTomorrow = dayjs().add(1, 'week').startOf('day').toDate()

		// 1. Reusable Logic: Exclude finished statuses
		const isNotFinished: Prisma.JobWhereInput = {
			status: {
				systemType: {
					notIn: [
						JobStatusSystemType.COMPLETED,
						JobStatusSystemType.TERMINATED,
					],
				},
			},
		}

		const isCompleted: Prisma.JobWhereInput = {
			status: {
				systemType: {
					in: [
						JobStatusSystemType.COMPLETED,
						JobStatusSystemType.TERMINATED,
					],
				},
			},
		}

		const isNotDeleted: Prisma.JobWhereInput = {
			deletedAt: null,
		}

		switch (tab) {
			case JobTabEnum.PRIORITY:
				return {
					...isNotDeleted,
					dueAt: {
						gt: today,
						lt: dayAfterTomorrow,
					},
					...isNotFinished,
				}

			case JobTabEnum.LATE:
				return {
					...isNotDeleted,
					dueAt: {
						lte: today,
					},
					...isNotFinished,
				}

			case JobTabEnum.ACTIVE:
				return {
					...isNotDeleted,
					dueAt: {
						gt: today,
					},
				}

			case JobTabEnum.COMPLETED:
				return { ...isNotDeleted, ...isCompleted }

			case JobTabEnum.DELIVERED:
				return { ...isNotDeleted, status: { code: 'delivered' } }

			case JobTabEnum.CANCELLED:
				return {
					deletedAt: { not: null },
				}

			default:
				return {
					...isNotDeleted,
					dueAt: { gt: today },
					...isNotFinished,
				}
		}
	}

	static buildSearch(
		search?: string,
		searchableFields: string[] = ['no']
	): Prisma.JobWhereInput {
		if (!search) return {}

		return {
			OR: searchableFields.map((field) => ({
				[field]: { contains: search, mode: 'insensitive' },
			})),
		}
	}
}
