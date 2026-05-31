export const flattenErrors: (error: any) => any = (error) => {
	if (!error) return [];
	if (typeof error === 'string') return [error]; // Standard case: just a string
	if (Array.isArray(error)) return error.flatMap(flattenErrors); // Special case: Array
	if (typeof error === 'object') return Object.values(error).flatMap(flattenErrors); // Special case: Object
	return [];
};