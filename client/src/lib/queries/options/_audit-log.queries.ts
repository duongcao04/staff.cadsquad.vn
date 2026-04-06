import { queryOptions } from "@tanstack/react-query";
import { auditLogApi } from "../../api";
import { parseList } from "../../zod";
import { AuditLogSchema } from "../../validationSchemas";

// 1. Keys factory
export const auditLogQueryKeys = {
	resource: ['audit-logs'] as const,
	lists: () => [...auditLogQueryKeys.resource, 'lists'] as const,
}

// 2. Fetch options
export const auditLogsListOptions = () => {
	return queryOptions({
		queryKey: auditLogQueryKeys.lists(),
		queryFn: async () => {
			const res = await auditLogApi.findAll();
			return parseList(AuditLogSchema, res?.result);
		},
		select: (data) => ({
			logs: data,
		}),
	});
};