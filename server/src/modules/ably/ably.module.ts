import { Module, Global } from '@nestjs/common'
import { AblyService } from './ably.service'
import { AblyController } from './ably.controller'

@Global() // (Tùy chọn) Đặt Global để đỡ phải import lại ở nhiều nơi
@Module({
	controllers: [AblyController],
	providers: [AblyService],
	exports: [AblyService],
})
export class AblyModule {}
