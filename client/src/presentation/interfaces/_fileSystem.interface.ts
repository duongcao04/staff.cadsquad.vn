/**
 * @file Defines the 'FileSystem' interface, representing a file or folder in the virtual file system.
 * @author Your Name (you@example.com)
 * @license MIT
 */

import type { TJob, TUser } from '../types'

/**
 * Represents a file or folder within the application's virtual file system.
 * It includes metadata such as name, type, size, and associations with users and jobs.
 */
export interface FileSystem {
    /**
     * The unique identifier for the file or folder.
     * @type {string}
     */
    id: string

    /**
     * The name of the file or folder.
     * @type {string}
     */
    name: string

    /**
     * The type of the file system entry (e.g., 'folder', 'pdf', 'image').
     * @type {string}
     */
    type: string

    /**
     * The size of the file, typically in a human-readable format (e.g., "1.2 MB").
     * For folders, this may be empty or represent the total size of its contents.
     * @type {string}
     */
    size: string

    /**
     * For folders, the number of items contained within.
     * @type {number | undefined}
     */
    items?: number

    /**
     * An array of strings representing the path to the file or folder.
     * @type {string[]}
     */
    path: string[]

    /**
     * An optional color code (hex) for display purposes, often used for folders.
     * @type {string | undefined}
     */
    color?: string

    /**
     * The ID of the user who created the file or folder.
     * @type {string}
     */
    createdById: string

    /**
     * A reference to the User object who created the entry.
     * @type {TUser}
     */
    createdBy: TUser

    /**
     * A list of users who have visibility or access to this file/folder.
     * @type {TUser[]}
     */
    visibleToUsers: TUser[]

    /**
     * An optional reference to a Job object if the file/folder is associated with a job.
     * @type {Job | undefined}
     */
    job?: TJob

    /**
     * The ID of the job this file/folder is associated with, if any.
     * @type {string | undefined}
     */
    jobId?: string

    /**
     * The timestamp when the file or folder was created.
     * @type {Date}
     */
    createdAt: Date

    /**
     * The timestamp when the file or folder was last updated.
     * @type {Date}
     */
    updatedAt: Date
}
