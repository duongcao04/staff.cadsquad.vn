import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../providers/prisma/prisma.service'
import { PaymentChannel } from '../../generated/prisma'
import { plainToInstance } from 'class-transformer'
import { CreatePaymentChannelDto } from './dto/create-payment-channel.dto'
import { UpdatePaymentChannelDto } from './dto/update-payment-channel.dto'
import { PaymentChannelResponseDto } from './dto/payment-channel-response.dto'

@Injectable()
export class PaymentChannelService {
  constructor(private readonly prismaService: PrismaService) { }

  /**
   * Create a new payment channel.
   */
  async create(data: CreatePaymentChannelDto): Promise<PaymentChannel> {
    const channel = await this.prismaService.paymentChannel.create({ data })
    return plainToInstance(PaymentChannelResponseDto, channel, {
      excludeExtraneousValues: true,
    }) as unknown as PaymentChannel
  }

  /**
   * Retrieve all payment channels.
   */
  async findAll(): Promise<PaymentChannel[]> {
    const channels = await this.prismaService.paymentChannel.findMany()
    return channels.map((c) =>
      plainToInstance(PaymentChannelResponseDto, c, { excludeExtraneousValues: true })
    ) as unknown as PaymentChannel[]
  }

  /**
   * Find a payment channel by ID.
   */
  async findById(id: string): Promise<PaymentChannel> {
    const channel = await this.prismaService.paymentChannel.findUnique({
      where: { id },
    })
    if (!channel) throw new NotFoundException('Payment channel not found')

    return plainToInstance(PaymentChannelResponseDto, channel, {
      excludeExtraneousValues: true,
    }) as unknown as PaymentChannel
  }

  /**
   * Update a payment channel by ID.
   */
  async update(id: string, data: UpdatePaymentChannelDto): Promise<PaymentChannel> {
    try {
      const updated = await this.prismaService.paymentChannel.update({
        where: { id },
        data,
      })
      return plainToInstance(PaymentChannelResponseDto, updated, {
        excludeExtraneousValues: true,
      }) as unknown as PaymentChannel
    } catch (error) {
      throw new NotFoundException('Payment channel not found')
    }
  }

  /**
   * Delete a payment channel by ID.
   */
  async delete(id: string): Promise<PaymentChannel> {
    try {
      return await this.prismaService.paymentChannel.delete({
        where: { id },
      })
    } catch (error) {
      throw new NotFoundException('Payment channel not found')
    }
  }
}
