import { ActivityType } from '@/generated/prisma';

export class JobActionEvent {
	constructor(
		public readonly actionType: ActivityType,
		public readonly jobId: string,
		public readonly modifierId: string,
		public readonly payload: any, // Chứa data phụ (VD: isApproved, oldStatus, changedFiles)
		public readonly jobContext: any // Chứa data Job sau khi đã update (kèm Assignments, Status, Client)
	) { }
}