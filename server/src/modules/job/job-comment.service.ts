import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../providers/prisma/prisma.service'
import { CreateJobCommentDto } from './dto/job-comment/create-comment.dto'
import { JobComment } from '../../generated/prisma'

@Injectable()
export class JobCommentService {
    constructor(private readonly prismaService: PrismaService) {}
    async createComment(
        jobId: string,
        userId: string,
        dto: CreateJobCommentDto
    ) {
        // 1. Kiểm tra Job tồn tại
        const job = await this.prismaService.job.findUnique({
            where: { id: jobId },
        })
        if (!job) throw new NotFoundException('Job không tồn tại')

        // 2. Nếu là reply, kiểm tra comment cha
        if (dto.parentId) {
            const parentComment =
                await this.prismaService.jobComment.findUnique({
                    where: { id: dto.parentId },
                })

            if (!parentComment)
                throw new NotFoundException('Bình luận cha không tồn tại')
            if (parentComment.jobId !== jobId) {
                throw new BadRequestException(
                    'Bình luận cha không thuộc dự án này'
                )
            }
        }

        // 3. Tạo comment/reply
        const commented = await this.prismaService.jobComment.create({
            data: {
                content: dto.content,
                jobId: jobId,
                userId: userId,
                parentId: dto.parentId || null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        avatar: true,
                    },
                },
            },
        })
        return { id: job.id, no: job.no }
    }
    async findAllByJob(jobId: string) {
        // 1. Kiểm tra Job có tồn tại không
        const jobExists = await this.prismaService.job.findUnique({
            where: { id: jobId },
        })
        if (!jobExists) throw new NotFoundException('Job not found')

        // 2. Lấy danh sách comment
        return this.prismaService.jobComment.findMany({
            where: {
                jobId: jobId,
                parentId: null, // Chỉ lấy các comment gốc trước
            },
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        avatar: true,
                        jobTitle: { select: { displayName: true } },
                    },
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                displayName: true,
                                avatar: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'asc' }, // Reply cũ nhất lên trước
                },
            },
            orderBy: { createdAt: 'desc' }, // Comment mới nhất lên đầu
        })
    }

    async delete(id: string): Promise<JobComment> {
        try {
            return await this.prismaService.jobComment.delete({ where: { id } })
        } catch (error) {
            throw new NotFoundException('Comment not found')
        }
    }
}
