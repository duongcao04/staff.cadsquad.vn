import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'
import { PrismaModule } from '../../providers/prisma/prisma.module'
import { HealthController } from './health.controller'
import { CpuHealthIndicator } from './indicators/cpu.health'
import { HttpModule } from '@nestjs/axios'
import { PrismaHealthIndicator } from './indicators/prisma.health'
import { DbTableHealthIndicator } from './indicators/db-table.health'

@Module({
    imports: [TerminusModule, PrismaModule, HttpModule],
    controllers: [HealthController],
    providers: [
        CpuHealthIndicator,
        PrismaHealthIndicator,
        DbTableHealthIndicator,
    ],
})
export class HealthModule {}
