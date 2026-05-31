import { JobStatusSystemTypeEnum } from '../enums';
import { TJob } from './_job.type';

export interface TJobStatus {
	id: string;
	code: string;
	displayName: string;
	hexColor: string;
	systemType: JobStatusSystemTypeEnum;
	jobs: TJob[];
	order: number;
	icon: string | null;
	nextStatusOrder: number | null;
	prevStatusOrder: number | null;
	thumbnailUrl: string;
	createdAt: string | Date;
	updatedAt: string | Date;
}