import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { CreateBrowserSubscribeDto } from './dto/create-browser-subscribe.dto';
import { UpdateBrowserSubscribeDto } from './dto/update-browser-subscribe.dto';
import { BrowserSubscribes } from '../../generated/prisma';

@Injectable()
export class BrowserSubscribesService {
  constructor(private prisma: PrismaService) { }

  /**
   * Creates a new browser subscription record.
   * @param createBrowserSubscribeDto - The data for the new subscription.
   * @returns The created subscription.
   */
  async create(
    createBrowserSubscribeDto: CreateBrowserSubscribeDto,
  ): Promise<BrowserSubscribes> {
    return this.prisma.browserSubscribes.create({
      data: createBrowserSubscribeDto,
    });
  }

  /**
   * Retrieves all browser subscriptions.
   * @returns A list of all subscriptions.
   */
  async findAll(): Promise<BrowserSubscribes[]> {
    return this.prisma.browserSubscribes.findMany();
  }

  /**
   * Retrieves a single browser subscription by its ID.
   * @param id - The unique ID of the subscription.
   * @returns The found subscription.
   * @throws {NotFoundException} if no subscription with the given ID is found.
   */
  async findOne(id: string): Promise<BrowserSubscribes> {
    const subscription = await this.prisma.browserSubscribes.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID "${id}" not found`);
    }

    return subscription;
  }

  /**
   * Updates a browser subscription.
   * @param id - The ID of the subscription to update.
   * @param updateBrowserSubscribeDto - The data to update.
   * @returns The updated subscription.
   */
  async update(
    id: string,
    updateBrowserSubscribeDto: UpdateBrowserSubscribeDto,
  ): Promise<BrowserSubscribes> {
    // First, check if the subscription exists
    await this.findOne(id);

    return this.prisma.browserSubscribes.update({
      where: { id },
      data: updateBrowserSubscribeDto,
    });
  }

  /**
     * Removes a browser subscription by its endpoint.
     * @param endpoint 
     * @returns The removed subscription.
     */
  async removeByEndpoint(endpoint: string): Promise<BrowserSubscribes> {
    const subscribe = await this.prisma.browserSubscribes.findFirst({
      where: { endpoint }
    })
    return this.prisma.browserSubscribes.delete({
      where: { id: subscribe?.id },
    });
  }

  /**
   * Removes a browser subscription by its ID.
   * @param id - The ID of the subscription to remove.
   * @returns The removed subscription.
   */
  async remove(id: string): Promise<BrowserSubscribes> {
    // First, check if the subscription exists
    await this.findOne(id);

    return this.prisma.browserSubscribes.delete({
      where: { id },
    });
  }
}