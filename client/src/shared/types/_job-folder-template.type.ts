import { TJob } from "./_job.type";

export interface TJobFolderTemplate {
	/**
	 * The unique identifier for the job folder template.
	 * @type {string}
	 */
	id: string;

	/**
	 * The display name of the job folder template.
	 * @type {string}
	 */
	displayName: string;

	/**
	 * The folder ID from the storage system.
	 * @type {string}
	 */
	folderId: string;

	/**
	 * The folder name.
	 * @type {string}
	 */
	folderName: string;

	/**
	 * The size of the folder in bytes.
	 * @type {number}
	 */
	size: number;

	/**
	 * The web URL to access the folder.
	 * @type {string}
	 */
	webUrl: string;

	jobs: TJob[]

	/**
	 * The timestamp when the job folder template was created.
	 * @type {Date}
	 */
	createdAt: Date;

	/**
	 * The timestamp when the job folder template was last updated.
	 * @type {Date}
	 */
	updatedAt: Date;
}