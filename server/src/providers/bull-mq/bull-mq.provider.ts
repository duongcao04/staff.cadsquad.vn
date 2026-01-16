import { bullConfig } from '@/config'
import {
	BullRootModuleOptions,
	SharedBullConfigurationFactory,
} from '@nestjs/bullmq'
import { Inject, Injectable } from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'

@Injectable()
export class BullConfigProvider implements SharedBullConfigurationFactory {
	constructor(
		@Inject(bullConfig.KEY)
		private readonly config: ConfigType<typeof bullConfig>
	) {}

	createSharedConfiguration(): BullRootModuleOptions {
		// Lúc này this.config đã có đầy đủ type và data từ Zod
		return {
			connection: this.config.connection,
			prefix: this.config.prefix,
			defaultJobOptions: this.config.defaultJobOptions,
		}
	}
}
