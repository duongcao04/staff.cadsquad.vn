import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { CpuHealthIndicator } from './indicators/cpu.health';
import { PrismaClient } from '../../generated/prisma';
import { PrismaHealthIndicator } from './indicators/prisma.health';
import { DbTableHealthIndicator } from './indicators/db-table.health';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private http: HttpHealthIndicator,
    private cpu: CpuHealthIndicator,
    private prismaHealth: PrismaHealthIndicator,
    private dbTableHealth: DbTableHealthIndicator,
  ) { }

  // Liveness: app còn sống (heap/memory + event loop/basic)
  @Get()
  @HealthCheck()
  liveness() {
    return this.health.check([
      // 1. Check Database
      () => this.prismaHealth.isHealthy('database'),
      // 3. Check Memory (Nếu RAM dùng quá 700MB thì báo động)
      () => this.memory.checkHeap('memory_heap', 700 * 1024 * 1024),
      // rss limit
      () => this.memory.checkRSS('memory_rss', 1000 * 1024 * 1024),
      // custom threshold
      () => this.cpu.checkCpuUsage('cpu', 2.0),
      // 4. Check Disk (Nếu ổ cứng đầy quá 80% thì báo động - quan trọng cho upload file)
      () => this.disk.checkStorage('storage', { path: require('path').parse(process.cwd()).root, thresholdPercent: 0.8 }),
      // 5. Check Custom Module Logic
      () => this.dbTableHealth.isHealthy('critical_tables')
    ]);
  }
}
