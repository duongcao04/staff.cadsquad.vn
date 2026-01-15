import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma/prisma.service';

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) { }

  async findAll(userId: string) {
    return this.prisma.community.findMany({
      include: {
        topics: true,
        _count: { select: { members: true, topics: true } },
        members: {
          where: { userId },
          select: { role: true }
        }
      },
      orderBy: { 'displayName': "asc" }
    });
  }

  async findByCode(code: string) {
    const community = await this.prisma.community.findUnique({
      where: { code },
      include: {
        topics: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    if (!community) throw new NotFoundException('Community not found');
    return community;
  }

  async joinCommunity(userId: string, communityId: string) {
    const exists = await this.prisma.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId } }
    });

    if (exists) throw new ConflictException('Already a member');

    return this.prisma.communityMember.create({
      data: { userId, communityId, role: 'MEMBER' }
    });
  }

  async findTopicsByCommunity(communityCode: string) {
    return this.prisma.topic.findMany({
      where: { community: { code: communityCode } },
      include: { _count: { select: { posts: true } } }
    });
  }

  async findAllPostsByCommunity(code: string, page = 1, limit = 20) {
    // 1. Verify community exists first
    const community = await this.prisma.community.findUnique({
      where: { code },
      select: { id: true }
    });

    if (!community) throw new NotFoundException('Community not found');

    // 2. Query posts through the topic -> community relationship
    const posts = await this.prisma.post.findMany({
      where: {
        topic: {
          communityId: community.id
        }
      },
      // Pagination logic
      skip: (page - 1) * limit,
      take: limit,
      // Sorting: Pinned posts at top, then by most recent
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ],
      // Include relations for the UI
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            username: true
          }
        },
        topic: {
          select: {
            id: true,
            title: true,
            code: true
          }
        },
      }
    });

    return posts;
  }

  async findTopicDetails(communityCode: string, topicCode: string) {
    const topic = await this.prisma.topic.findFirst({
      where: {
        code: topicCode,
        community: {
          code: communityCode,
        },
      },
      include: {
        posts: true,
        community: {
          select: {
            displayName: true,
            code: true,
            color: true,
          },
        },
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!topic) {
      throw new NotFoundException(
        `Topic '${topicCode}' not found in community '${communityCode}'`,
      );
    }

    return topic;
  }
}