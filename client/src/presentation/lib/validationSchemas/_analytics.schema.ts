import * as yup from 'yup';

// Regex to match ISO 8601 (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)
const iso8601Regex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:?\d{2})?)?$/;

export const analyticsOverviewSchema = yup.object({
	startDate: yup
		.string()
		.matches(iso8601Regex, 'startDate must be a valid ISO 8601 date string')
		.optional(),

	endDate: yup
		.string()
		.matches(iso8601Regex, 'endDate must be a valid ISO 8601 date string')
		.optional(),

	period: yup
		.string()
		.oneOf(['7d', '1m', '1y'])
		.optional(),
});

// Helper type to extract the interface from the schema
export type TAnalyticsOverviewInput = yup.InferType<typeof analyticsOverviewSchema>;