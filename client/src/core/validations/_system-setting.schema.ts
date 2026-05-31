import { z } from 'zod';

export const SystemSettingSchema = z.object({
	key: z.string().nullish(),
	value: z.string().nullish(), // This is the stringified JSON from DB
    updatedAt: z.coerce.date().catch(new Date()),
	modifierById: z.string().nullable().optional(),
});

export type TSystemSetting = z.infer<typeof SystemSettingSchema>;
export type TUpsertSystemSettingInput = Pick<TSystemSetting, 'key' | 'value'>;