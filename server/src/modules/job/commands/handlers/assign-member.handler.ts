import { ActivityType } from '@/generated/prisma';
import { UserService } from '@/modules/user/user.service';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { APP_PERMISSIONS } from '@/utils';
import { JobActionEvent } from '../../events/job-action.event';
import { AssignMemberCommand } from '../impl/assign-member.command';

@CommandHandler(AssignMemberCommand)
export class AssignMemberHandler implements ICommandHandler<AssignMemberCommand> {
	constructor(
		private readonly prisma: PrismaService,
		private readonly userService: UserService,
		private readonly eventEmitter: EventEmitter2,
	) { }

	async execute(command: AssignMemberCommand) {
		const { modifierId, jobId, dto } = command;
		const { memberId, staffCost } = dto;

		// 1. Kiểm tra User tồn tại
		const existingMember = await this.userService.findById(memberId);
		if (!existingMember) throw new NotFoundException('Member not exist');

		// 2. Thực thi Database Transaction
		const jobUpdated = await this.prisma.$transaction(async (tx) => {
			const job = await tx.job.findUnique({ where: { id: jobId } });
			if (!job) throw new NotFoundException('Job not found');

			try {
				// Thêm assignment mới
				await tx.jobAssignment.create({
					data: { jobId, userId: memberId, staffCost },
				});
			} catch (e) {
				// Thường lỗi do Unique constraint (jobId_userId)
				throw new BadRequestException('User is already assigned to this job');
			}

			// Tính toán lại tổng chi phí (Staff Cost)
			const aggregate = await tx.jobAssignment.aggregate({
				where: { jobId },
				_sum: { staffCost: true },
			});

			// Cập nhật Job
			const updated = await tx.job.update({
				where: { id: jobId },
				data: { totalStaffCost: aggregate._sum.staffCost || 0 },
				include: {
					status: true,
					assignments: { include: { user: true } },
					client: true,
				},
			});

			// Ghi Activity Log
			await tx.jobActivityLog.create({
				data: {
					jobId,
					modifiedById: modifierId,
					activityType: ActivityType.ASSIGN_MEMBER,
					fieldName: 'jobAssignments',
					currentValue: memberId,
					requiredPermissionCode: APP_PERMISSIONS.JOB.READ_INCOME,
					notes: `[${updated.no}] Assigned ${existingMember.displayName} to this job`,
					metadata: {
						assignedUser: existingMember.displayName,
						savedCost: staffCost,
					},
				},
			});

			return updated;
		});

		// 3. Bắn Event sau khi Transaction thành công
		this.eventEmitter.emit(
			'job.action',
			new JobActionEvent(
				ActivityType.ASSIGN_MEMBER,
				jobId,
				modifierId,
				{
					memberId,
					userEmail: existingMember.email,
					userPersonalEmail: existingMember.personalEmail,
					userDisplayName: existingMember.displayName,
				},
				jobUpdated
			)
		);

		return jobUpdated;
	}
}