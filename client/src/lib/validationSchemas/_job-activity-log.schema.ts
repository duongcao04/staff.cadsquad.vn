import z, { ZodType } from "zod";
import { ActivityTypeEnum } from "../../shared/enums";
import { TJobActivityLog } from "../../shared/types";
import { UserSchema } from "./_user.schema";

export const JobActivityLogSchema: ZodType<TJobActivityLog> = z.lazy(() => z.object({
	id: z.string().catch('N/A'),
	activityType: z.nativeEnum(ActivityTypeEnum).catch(ActivityTypeEnum.PRIVATE),
	metadata: z.any().optional(),
	requiredPermissionCode: z.string().nullable().catch(null),
	previousValue: z.any().nullable().catch(null),
	currentValue: z.any().nullable().catch(null),
	fieldName: z.string().catch('Unknown field'),
	modifiedBy: z.lazy(() => UserSchema).optional(),
	notes: z.string().nullable().catch(null),
	modifiedAt: z.coerce.date().catch(new Date()),
}) as any)