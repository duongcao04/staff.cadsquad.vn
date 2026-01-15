import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator'
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator'
import { PermissionsGuard } from '../../common/guards/permissions.guard'
import { APP_PERMISSIONS } from '../../utils/_app-permissions'
import { JwtGuard } from '../auth/jwt.guard'
import { CreatePaymentChannelDto } from './dto/create-payment-channel.dto'
import { PaymentChannelResponseDto } from './dto/payment-channel-response.dto'
import { UpdatePaymentChannelDto } from './dto/update-payment-channel.dto'
import { PaymentChannelService } from './payment-channel.service'

@ApiTags('Payment Channels')
@Controller('payment-channels')
@UseGuards(JwtGuard)
export class PaymentChannelController {
    constructor(
        private readonly paymentChannelService: PaymentChannelService
    ) {}

    @Post()
    @HttpCode(201)
    @ResponseMessage('Insert new payment channel successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new payment channel' })
    @ApiResponse({
        status: 201,
        description: 'The payment channel has been successfully created.',
        type: PaymentChannelResponseDto,
    })
    @UseGuards(PermissionsGuard)
    @RequirePermissions(APP_PERMISSIONS.PAYMENT_CHANNEL.CREATE)
    async create(@Body() createPaymentChannelDto: CreatePaymentChannelDto) {
        return this.paymentChannelService.create(createPaymentChannelDto)
    }

    @Get()
    @HttpCode(200)
    @ResponseMessage('Get list of payment channel successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all payment channels' })
    @ApiResponse({
        status: 200,
        description: 'Return a list of payment channels.',
        type: [PaymentChannelResponseDto],
    })
    async findAll() {
        return this.paymentChannelService.findAll()
    }

    @Get(':id')
    @HttpCode(200)
    @ResponseMessage('Get payment channel detail successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a payment channel by its ID' })
    @ApiResponse({
        status: 200,
        description: 'Return a single payment channel.',
        type: PaymentChannelResponseDto,
    })
    async findOne(@Param('id') id: string) {
        return this.paymentChannelService.findById(id)
    }

    @Patch(':id')
    @HttpCode(200)
    @ResponseMessage('Update payment channel successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a payment channel' })
    @ApiResponse({
        status: 200,
        description: 'The payment channel has been successfully updated.',
        type: PaymentChannelResponseDto,
    })
    @UseGuards(PermissionsGuard)
    @RequirePermissions(APP_PERMISSIONS.PAYMENT_CHANNEL.UPDATE)
    async update(
        @Param('id') id: string,
        @Body() updatePaymentChannelDto: UpdatePaymentChannelDto
    ) {
        return this.paymentChannelService.update(id, updatePaymentChannelDto)
    }

    @Delete(':id')
    @HttpCode(200)
    @ResponseMessage('Update payment channel successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a payment channel' })
    @ApiResponse({
        status: 200,
        description: 'The payment channel has been successfully deleted.',
    })
    @UseGuards(PermissionsGuard)
    @RequirePermissions(APP_PERMISSIONS.PAYMENT_CHANNEL.DELETE)
    async remove(@Param('id') id: string) {
        return this.paymentChannelService.delete(id)
    }
}
