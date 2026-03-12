import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { SHAREPOINT_FLOW, SHAREPOINT_QUEUE } from './sharepoint.constants'
import { SharePointController } from './sharepoint.controller'
import { SharePointProcessor } from './sharepoint.processor'
import { SharePointService } from './sharepoint.service'
import { HttpModule } from '@nestjs/axios'

@Module({
	imports: [
		BullModule.registerQueue({
			name: SHAREPOINT_QUEUE,
		}),
		BullBoardModule.forFeature({
			name: SHAREPOINT_QUEUE,
			adapter: BullMQAdapter,
		}),
		BullModule.registerFlowProducer({
			name: SHAREPOINT_FLOW,
		}),
		HttpModule
	],
	controllers: [SharePointController],
	providers: [SharePointService, SharePointProcessor],
	exports: [SharePointService],
})
export class SharePointModule { }
