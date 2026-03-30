import { NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ActivityType } from "../../../../generated/prisma";
import { PrismaService } from "../../../../providers/prisma/prisma.service";
import { ActivityLogService } from "../../activity-log.service";
import { JobActionEvent } from "../../events/job-action.event";
import { JobHelpersService } from "../../job-helpers.service";
import { UpdateJobCommand } from "../impl/update-job.command";

@CommandHandler(UpdateJobCommand)
export class UpdateJobHandler implements ICommandHandler<UpdateJobCommand> {
	constructor(
		private readonly prisma: PrismaService,
		private readonly activityLogService: ActivityLogService,
		private readonly eventEmitter: EventEmitter2,
		private readonly helper: JobHelpersService,

	) { }

	async execute(command: UpdateJobCommand) {
		const { modifierId, jobId, dto } = command;

		// 1. Lấy dữ liệu trước khi update
		const jobBefore = await this.prisma.job.findUnique({
			where: { id: jobId },
			include: { client: true, status: true },
		});
		if (!jobBefore) throw new NotFoundException('Job not found');

		return await this.prisma.$transaction(async (tx) => {
			const updateTasks: Promise<any>[] = [];
			let clientId: string | undefined = undefined;

			// --- A. Logic Xử lý Client Name ---
			if (dto.clientName && dto.clientName.trim() !== jobBefore.client?.name) {
				const existingClient = await tx.client.findFirst({
					where: { name: { equals: dto.clientName.trim(), mode: 'insensitive' } },
				});
				if (existingClient) {
					clientId = existingClient.id;
				} else {
					const code = await this.helper.generateClientCode(dto.clientName, tx);
					const newClient = await tx.client.create({
						data: { name: dto.clientName.trim(), code },
					});
					clientId = newClient.id;
				}
			}

			// --- B. Logic Xử lý Attachments (nếu có) ---
			let finalAttachments = jobBefore.attachmentUrls as string[] || [];
			if (dto.attachments) {
				const { action, files } = dto.attachments;
				if (action === 'add') {
					finalAttachments = [...new Set([...finalAttachments, ...files])];
					updateTasks.push(this.createLog(tx, jobId, modifierId, ActivityType.UPDATE_ATTACHMENTS, 'Files', `Added ${files.length} files`));
				} else {
					finalAttachments = finalAttachments.filter(url => !files.includes(url));
					updateTasks.push(this.createLog(tx, jobId, modifierId, ActivityType.UPDATE_ATTACHMENTS, 'Files', `Removed ${files.length} files`));
				}
			}

			// --- C. Thực hiện Update Job ---
			const updatedJob = await tx.job.update({
				where: { id: jobId },
				data: {
					displayName: dto.displayName,
					clientId: clientId,
					startedAt: dto.startedAt,
					dueAt: dto.dueAt,
					description: dto.description,
					attachmentUrls: finalAttachments,
				},
				include: { client: true, status: true },
			});

			// --- D. So sánh ghi log cho các Field chung ---
			const trackableFields = [
				{ key: 'displayName', label: 'Title', type: ActivityType.UPDATE_GENERAL_INFORMATION },
				{ key: 'description', label: 'Description', type: ActivityType.UPDATE_GENERAL_INFORMATION },
				{ key: 'dueAt', label: 'Deadline', type: ActivityType.RESCHEDULE },
			];

			for (const field of trackableFields) {
				const newValue = updatedJob[field.key as keyof typeof updatedJob];
				const oldValue = jobBefore[field.key as keyof typeof jobBefore];
				if (newValue?.toString() !== oldValue?.toString()) {
					updateTasks.push(this.activityLogService.create({
						jobId, modifiedById: modifierId,
						activityType: field.type,
						fieldName: field.label,
						currentValue: newValue?.toString() || 'N/A',
						metadata: { rawOld: oldValue, rawNew: newValue }
					}, tx));
				}
			}

			await Promise.all(updateTasks);

			// --- E. Bắn Event (Side effects) ---
			this.eventEmitter.emit('job.action', new JobActionEvent(
				ActivityType.UPDATE_GENERAL_INFORMATION, jobId, modifierId, { dto }, updatedJob
			));

			return { id: updatedJob.id, no: updatedJob.no, attachments: finalAttachments };
		});
	}

	private createLog(tx: any, jobId: string, modId: string, type: any, field: string, note: string) {
		return this.activityLogService.create({
			jobId, modifiedById: modId, activityType: type, fieldName: field, notes: note
		}, tx);
	}
}