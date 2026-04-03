import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { systemSettingApi } from '../../api';
import { SystemSettingSchema, TUpsertSystemSettingInput } from '../../validationSchemas';
import { parseData, parseList } from '../../zod';
import { onErrorToast } from '../helper';

// 1. Keys factory
export const systemSettingQueryKeys = {
	resource: ['system-settings'] as const,
	lists: () => [...systemSettingQueryKeys.resource, 'lists'] as const,
	detail: (key: string) => [...systemSettingQueryKeys.resource, 'detail', key] as const,
}

// 2. Fetch options
export const systemSettingsListOptions = () => {
	return queryOptions({
		queryKey: systemSettingQueryKeys.lists(),
		queryFn: async () => {
			return await systemSettingApi.findAll();
		},
		select: (res) => ({
			settings: parseList(SystemSettingSchema, res.result),
		}),
	});
};

export const systemSettingOptions = (key: string) => {
	return queryOptions({
		queryKey: systemSettingQueryKeys.detail(key),
		queryFn: async () => {
			const res = await systemSettingApi.findOne(key);
			return parseData(SystemSettingSchema, res.result);
		},
		select: (setting) => {
			// Helper: Try to parse the JSON value for easy UI consumption
			let parsedValue = null;
			try {
				parsedValue = JSON.parse(setting.value);
			} catch (e) {
				parsedValue = setting.value;
			}
			return {
				...setting,
				data: parsedValue,
			};
		},
	});
};

// 3. Mutation options (Using Upsert for both create/update)
export const upsertSystemSettingMutation = mutationOptions({
	mutationFn: (data: TUpsertSystemSettingInput) =>
		systemSettingApi.upsert(data),
	onError: (err) => onErrorToast(err, 'Failed to save system setting'),
});