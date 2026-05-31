import { TJob } from "./_job.type";
import { TUser } from "./_user.type";

export type TJobComment = {
	id: string;
	content: string;
	jobId: string;
	userId: string;
	parentId: string | null;
	// Relations
	user?: TUser; // Có thể thay bằng TUser nếu đã có Schema
	job?: TJob;  // Có thể thay bằng TJob nếu đã có Schema
	replies: TJobComment[]; // Đệ quy
	// Timestamps
	createdAt: string | Date;
	updatedAt: string | Date;
}