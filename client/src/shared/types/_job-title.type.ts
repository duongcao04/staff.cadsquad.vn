import { TUser } from './_user.type';

export interface TJobTitle {
	/**
	 * The unique identifier for the job title.
	 * @type {string}
	 */
	id: string;

	/**
		* A unique code or abbreviation for the job title.
		* @type {string}
		*/
	code: string;

	/**
	 * The human-readable name of the job title.
	 * @type {string}
	 */
	displayName: string;

	/**
	 * Optional notes or a description for the job title.
	 * @type {string | null}
	 */
	notes: string | null;

	/**
	 * A list of users who hold this job title.
	 * @type {TUser[]}
	 */
	users: TUser[];

	/**
	 * The timestamp when the job title was created.
	 * @type {Date}
	 */
	createdAt: Date;

	/**
	* The timestamp when the job title was last updated.
	* @type {Date}
	*/
	updatedAt: Date;

	// Cấu trúc nested cho _count
	_count: {
		users?: number
	}
}