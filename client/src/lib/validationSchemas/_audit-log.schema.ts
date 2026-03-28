import { z } from 'zod';
import { UserSchema } from './_user.schema';

export const SystemModuleSchema = z.enum([
	'JOB',
	'DELIVERY',
	'FINANCIAL',
	'SYSTEM',
	'SECURITY',
	'USER_MANAGEMENT',
	'CLIENT',
	'ASSET',
]);

// 2. Main Audit Log Schema
export const AuditLogSchema = z.object({
	id: z.string().uuid().optional(), // Optional if validating before creation

	// WHO: Nullable for system-level actions
	actorId: z.string().uuid().nullable().optional(),
	actor: z.lazy(() => UserSchema).nullish(),

	// WHAT: Action description and Module enum
	action: z.string().min(1, "Action description is required"),
	module: SystemModuleSchema,

	// TO WHAT: Target tracking
	targetId: z.string().uuid().nullable().optional(),
	targetDisplay: z.string().min(1, "Target display string is required"),

	// THE DATA: Validating Json fields
	// Using z.record(z.any()) or z.unknown() for flexible JSON snapshots
	oldValues: z.any().nullable().optional(),
	newValues: z.any().nullable().optional(),
	metadata: z.record(z.string(), z.any()).nullable().optional(),

	// SECURITY: Basic string validation
	ipAddress: z.string().nullable().optional(),
	userAgent: z.string().nullable().optional(),

	createdAt: z.coerce.date().catch(new Date()),
	updatedAt: z.coerce.date().catch(new Date()),
});

// Types for TypeScript safety
