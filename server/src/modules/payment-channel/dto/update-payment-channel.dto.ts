import { PartialType } from '@nestjs/swagger';
import { CreatePaymentChannelDto } from './create-payment-channel.dto';

export class UpdatePaymentChannelDto extends PartialType(CreatePaymentChannelDto) {}
