type DataUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB';

/**
 * Converts a digital storage value from one unit to another.
 * Uses base 1024 (1 KB = 1024 B).
 * * @param value The amount to convert
 * @param fromUnit The starting unit
 * @param toUnit The target unit
 * @param decimals Optional: Number of decimal places to keep (e.g., 2)
 */
export function convertStorage(
	value: number,
	fromUnit: DataUnit,
	toUnit: DataUnit,
	decimals?: number // <-- New optional parameter
): number {
	const units: Record<DataUnit, number> = {
		'B': 0,
		'KB': 1,
		'MB': 2,
		'GB': 3,
		'TB': 4
	};

	const fromIndex = units[fromUnit];
	const toIndex = units[toUnit];

	if (fromIndex === undefined || toIndex === undefined) {
		throw new Error('Invalid unit. Allowed units are: B, KB, MB, GB, TB.');
	}

	const exponentDifference = fromIndex - toIndex;
	const result = value * Math.pow(1024, exponentDifference);

	// If a decimals value is provided, round the result
	if (decimals !== undefined && decimals >= 0) {
		return Number(result.toFixed(decimals));
	}

	return result;
}