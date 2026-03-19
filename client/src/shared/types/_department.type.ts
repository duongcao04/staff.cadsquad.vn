import { TUser } from './_user.type'

export type TDepartment = {
	/**
	 * The unique identifier for the department.
	 * @type {string}
	 */
	id: string

	/**
	* A unique code or abbreviation for the department (e.g., "HR", "ENG").
	* @type {string}
	*/
	code: string

	/**
	* The human-readable name of the department (e.g., "Human Resources", "Engineering").
	* @type {string}
	*/
	displayName: string

	/**
	 * A list of users who are members of this department.
	 * @type {TUser[]}
	 */
	users: TUser[]

	/**
	 * A color for department. Hex code like #000000
	 * @type {string | null}
	 */
	hexColor: string | null

	/**
	 * Optional notes or a description for the department.
	 * @type {string}
	 */
	notes: string | null

	/**
	 * The timestamp when the department was created.
	 * @type {Date}
	 */
	createdAt: string | Date

	/**
	 * The timestamp when the department was last updated.
	 * @type {Date}
	 */
	updatedAt: string | Date

	// Cấu trúc nested cho _count
	_count: {
		users?: number
	}
}
