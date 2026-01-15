import { Injectable } from '@nestjs/common'
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus'
import * as os from 'os'

@Injectable()
export class CpuHealthIndicator extends HealthIndicator {
	/**
	 * Checks CPU load average and returns health status
	 * @param key name of indicator
	 * @param maxLoadAvg max allowed load average (1-minute)
	 */
	async checkCpuUsage(
		key: string = 'cpu',
		maxLoadAvg = 1.5
	): Promise<HealthIndicatorResult> {
		const [load1] = os.loadavg() // 1-minute load average

		const isHealthy = load1 < maxLoadAvg

		return this.getStatus(key, isHealthy, {
			loadAvg1: load1,
			maxAllowed: maxLoadAvg,
			cores: os.cpus().length
		})
	}
}
