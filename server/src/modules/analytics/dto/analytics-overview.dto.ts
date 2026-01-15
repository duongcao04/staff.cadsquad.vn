import { IsOptional, IsDateString, IsEnum, IsISO8601 } from 'class-validator';

export class AnalyticsOverviewDto {
	@IsOptional()
	@IsISO8601() // Validates YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ
	startDate?: string;

	@IsOptional()
	@IsISO8601()
	endDate?: string;

	@IsOptional()
	@IsEnum(['7d', '1m', '1y'])
	period?: '7d' | '1m' | '1y';
}