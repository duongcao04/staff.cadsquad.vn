/**
 * @file Defines the 'FileType' type, which enumerates the possible types of files in the system.
 * @author Your Name (you@example.com)
 * @license MIT
 */

/**
 * Represents the type of a file in the file system.
 * This is used to determine how to handle and display the file in the UI.
 *
 * @type {'folder' | 'pdf' | 'image' | 'document' | 'code' | 'other'}
 */
export type FileType =
    | 'folder'
    | 'pdf'
    | 'image'
    | 'document'
    | 'code'
    | 'other'