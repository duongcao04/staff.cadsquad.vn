import { Controller, Get, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';
import { ResponseMessage } from './common/decorators/responseMessage.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('')
  @HttpCode(200)
  @ResponseMessage('Server is running')
  getServerHealth(): string {
    return this.appService.checkHealth();
  }
}
