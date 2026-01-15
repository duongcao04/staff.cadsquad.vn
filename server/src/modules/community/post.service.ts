import { Injectable, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../providers/prisma/prisma.service";

@Injectable()
export class PostService {
	constructor(private prisma: PrismaService) { }

	async createPost(userId: string, topicId: string, content: string) {
		// 1. Verify Membership first
		const topic = await this.prisma.topic.findUnique({
			where: { id: topicId },
			select: { communityId: true }
		});

		if (!topic) {
			throw new Error("Not found")
		}

		const isMember = await this.prisma.communityMember.findUnique({
			where: { userId_communityId: { userId, communityId: topic.communityId } }
		});

		if (!isMember) throw new ForbiddenException('Must be a member to post');

		// 2. Create Post
		return this.prisma.post.create({
			data: { content, authorId: userId, topicId },
			include: { author: true }
		});
	}

	async getFeed(topicId: string, page = 1, limit = 20) {
		return this.prisma.post.findMany({
			where: { topicId },
			orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
			skip: (page - 1) * limit,
			take: limit,
			include: {
				author: { select: { displayName: true, avatar: true } },
			}
		});
	}
}