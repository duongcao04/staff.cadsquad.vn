import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { CreateSystemSettingDto } from './dtos/create-system-setting.dto';
import { SystemSettingResponseDto } from './dtos/system-setting-response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('system-settings')
export class SystemSettingsController {
	constructor(private readonly settingsService: SystemSettingsService) { }

	@Post()
	async updateSetting(
		@Body() dto: CreateSystemSettingDto,
		@Body('userId') userId: string // Assuming userId comes from a guard/request in real scenarios
	) {
		const setting = await this.settingsService.upsertSetting(dto, userId);
		return plainToInstance(SystemSettingResponseDto, setting, { excludeExtraneousValues: true });
	}

	@Get(':key')
	async getOne(@Param('key') key: string) {
		const setting = await this.settingsService.getSetting(key);
		return plainToInstance(SystemSettingResponseDto, setting, { excludeExtraneousValues: true });
	}

	@Get()
	async getAll() {
		const settings = await this.settingsService.getAllSettings();
		return plainToInstance(SystemSettingResponseDto, settings, { excludeExtraneousValues: true });
	}
}