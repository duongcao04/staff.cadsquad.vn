import { z, ZodType } from "zod";
import { EntityEnum } from "../../shared/enums";
import { TPermission } from "../../shared/types";
import { RoleSchema } from "./_role.schema";

export const PermissionSchema: ZodType<TPermission> = z.lazy(() => z.object({
	id: z.string().catch('N/A'),

	displayName: z.string().catch('Unknown Permission'),

	code: z.string().catch('UNKNOWN'),

	// Ép kiểu Enum cho Entity, nếu sai fallback về một giá trị an toàn
	entity: z.nativeEnum(EntityEnum).catch(EntityEnum.JOB),

	action: z.string().catch('unknown_action'),

	entityAction: z.string().catch('unknown_entity_action'),

	// Description có thể không có (optional)
	description: z.string().optional(),

	// Quan hệ n-n với Roles: Sử dụng z.lazy để gọi RoleSchema
	roles: z.array(z.lazy(() => RoleSchema)).default([]),

	createdAt: z.coerce.date().catch(new Date()),

	updatedAt: z.coerce.date().catch(new Date()),
}));