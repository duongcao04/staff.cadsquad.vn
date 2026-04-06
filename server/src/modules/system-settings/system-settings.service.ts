import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSystemSettingDto } from './dtos/create-system-setting.dto';
import { PrismaService } from '../../providers/prisma/prisma.service';

@Injectable()
export class SystemSettingsService {
	constructor(private prisma: PrismaService) { }

	async upsertSetting(dto: CreateSystemSettingDto, userId: string) {
		return this.prisma.systemSetting.upsert({
			where: { key: dto.key },
			update: {
				value: dto.value,
				modifierById: userId
			},
			create: {
				key: dto.key,
				value: dto.value,
				modifierById: userId
			},
		});
	}

	async getSetting(key: string) {
		const setting = await this.prisma.systemSetting.findUnique({
			where: { key },
		});
		if (!setting) throw new NotFoundException(`Setting with key ${key} not found`);
		return setting;
	}

	async getAllSettings() {
		return this.prisma.systemSetting.findMany();
	}
}