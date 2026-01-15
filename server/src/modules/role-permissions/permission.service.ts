import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../providers/prisma/prisma.service'
import { EntityEnum } from '../../generated/prisma'

@Injectable()
export class PermissionService {
	constructor(private prisma: PrismaService) {}

	/**
	 * Get all permissions flat list
	 */
	async findAll() {
		const result = await this.prisma.permission.findMany({
			orderBy: { entityAction: 'asc' },
		})
		return {
			permissions: result,
			total: result.length,
		}
	}

	/**
	 * Get permissions grouped by PermissionGroup (UI Optimized)
	 * Returns:
	 * {
	 * groups: [
	 * { id: '...', name: 'Recruitment', permissions: [...] },
	 * { id: '...', name: 'Finance', permissions: [...] }
	 * ],
	 * others: [ ... ] // Permissions not assigned to any group
	 * }
	 */
	async findAllGrouped() {
		// 1. Fetch defined Groups with their permissions
		const groups = await this.prisma.permissionGroup.findMany({
			orderBy: { order: 'asc' },
			include: {
				permissions: {
					orderBy: { code: 'asc' },
				},
			},
		})

		// 2. Fetch 'Orphan' permissions (those with permissionGroupId = null)
		const orphans = await this.prisma.permission.findMany({
			where: { permissionGroupId: null },
			orderBy: { entity: 'asc' },
		})

		// 3. Transform to clean UI structure
		return {
			groups: groups.map((g) => ({
				id: g.id,
				name: g.displayName,
				code: g.code,
				permissions: g.permissions,
			})),
			others: orphans,
		}
	}

	/**
	 * Create a new permission (System Admin only)
	 * Automatically generates the 'entityAction' (e.g. 'job.read')
	 */
	async create(data: {
		displayName: string
		code: string
		entity: EntityEnum
		action: string
		description?: string
		permissionGroupId?: string // Optional: Assign to group immediately
	}) {
		const entityAction = `${data.entity.toLowerCase()}.${data.action.toLowerCase()}`

		// Check for duplicate entityAction
		const existing = await this.prisma.permission.findUnique({
			where: { entityAction },
		})

		if (existing) {
			throw new BadRequestException(
				`Permission ${entityAction} already exists.`
			)
		}

		// Check for duplicate Code
		const existingCode = await this.prisma.permission.findUnique({
			where: { code: data.code },
		})
		if (existingCode) {
			throw new BadRequestException(
				`Permission Code ${data.code} is already used.`
			)
		}

		return this.prisma.permission.create({
			data: {
				displayName: data.displayName,
				code: data.code,
				entity: data.entity,
				action: data.action,
				description: data.description,
				entityAction, // Auto-generated
				permissionGroupId: data.permissionGroupId, // Link to group if provided
			},
		})
	}
}
