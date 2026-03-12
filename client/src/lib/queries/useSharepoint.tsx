import { sharepointApi } from '@/lib/api'
import { addToast } from '@heroui/react'
import { useMutation } from '@tanstack/react-query'
import { onErrorToast } from './helper'

// =============================================================================
// MUTATIONS (Write Operations)
// =============================================================================

/**
 * Upload file to SharePoint
 */
export const useUploadSharepointFileMutation = (
    onSuccess?: (res: any) => void
) => {
    return useMutation({
        mutationKey: ['uploadSharepointFile'],
        mutationFn: async ({
            parentId,
            file,
        }: {
            parentId: string
            file: File
        }) => {
            return sharepointApi.uploadFile(parentId, file)
        },
        onSuccess: (res) => {
            addToast({
                title: 'File uploaded successfully',
                color: 'success',
            })
            onSuccess?.(res)
        },
        onError: (err) => onErrorToast(err, 'Upload File Failed'),
    })
}

/**
 * Copy folder or item in SharePoint
 */
export const useCopySharepointItemMutation = (
    onSuccess?: (res: any) => void
) => {
    return useMutation({
        mutationKey: ['copySharepointItem'],
        mutationFn: async ({
            itemId,
            destinationFolderId,
            newName,
        }: {
            itemId: string
            destinationFolderId: string
            newName?: string
        }) => {
            return sharepointApi.copyItem(itemId, destinationFolderId, newName)
        },
        onSuccess: (res) => {
            addToast({
                title: 'Item copied successfully',
                color: 'success',
            })
            onSuccess?.(res)
        },
        onError: (err) => onErrorToast(err, 'Copy Item Failed'),
    })
}
