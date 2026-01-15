import { Module } from '@nestjs/common';
import { PaymentChannelService } from './payment-channel.service';
import { PaymentChannelController } from './payment-channel.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PaymentChannelController],
  providers: [PaymentChannelService],
  exports: [PaymentChannelService],
})
export class PaymentChannelModule { }
