import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullModule } from '@nestjs/bullmq'
import { Global, Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor'
import { AuditLogController } from './audit-log.controller'
import { AuditLogProcessor } from './audit-log.processor'
import { AuditLogService } from './audit-log.service'

@Global()
@Module({
    imports: [
        BullModule.registerQueue({
            name: 'audit-logs',
        }),
        BullBoardModule.forFeature({
            name: 'audit-logs',
            adapter: BullMQAdapter,
        }),
    ],
    controllers: [AuditLogController],
    providers: [
        AuditLogService,
        AuditLogProcessor,
        {
            provide: APP_INTERCEPTOR,
            useClass: AuditLogInterceptor,
        },
    ],
})
export class AuditLogModule { }

