import { TriangleAlert, User, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
    Alert,
    AlertContent,
    AlertDescription,
    AlertIcon,
    AlertTitle,
} from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import {
    type FileWithPreview,
    formatBytes,
    useFileUpload,
} from '@/shared/hooks/use-file-upload'

interface AvatarUploadProps {
    maxSize?: number
    className?: string
    imgClassName?: string
    iconClassName?: string
    onFileChange?: (file: FileWithPreview | null) => void
    onRemoveFile?: () => void
    defaultAvatar?: string
}

export default function AvatarUpload({
    maxSize = 2 * 1024 * 1024, // 2MB
    className,
    imgClassName,
    iconClassName,
    onFileChange,
    onRemoveFile,
    defaultAvatar,
}: AvatarUploadProps) {
    const [
        { files, isDragging, errors },
        {
            removeFile,
            handleDragEnter,
            handleDragLeave,
            handleDragOver,
            handleDrop,
            openFileDialog,
            getInputProps,
        },
    ] = useFileUpload({
        maxFiles: 1,
        maxSize,
        accept: 'image/*',
        multiple: false,
        onFilesChange: (files) => {
            onFileChange?.(files[0] || null)
        },
    })

    const currentFile = files[0]
    const previewUrl = currentFile?.preview || defaultAvatar

    const handleRemove = () => {
        if (currentFile) {
            removeFile(currentFile.id)
            onRemoveFile?.()
        }
    }

    return (
        <div className={cn('flex flex-col items-center gap-4', className)}>
            {/* Avatar Preview */}
            <div className="relative">
                <div
                    className={cn(
                        'group/avatar relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border border-dashed transition-colors',
                        isDragging
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/25 hover:border-muted-foreground/20',
                        previewUrl && 'border-solid',
                        imgClassName
                    )}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={openFileDialog}
                >
                    <input {...getInputProps()} className="sr-only" />

                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <User
                                className={cn(
                                    'size-6 text-muted-foreground',
                                    iconClassName
                                )}
                                strokeWidth="1.2"
                            />
                        </div>
                    )}
                </div>

                {/* Remove Button - only show when file is uploaded */}
                {currentFile && (
                    <Button
                        size="icon"
                        variant="outline"
                        onClick={handleRemove}
                        className="size-6 absolute end-0 top-0 rounded-full"
                        aria-label="Remove avatar"
                    >
                        <X className="size-3.5" />
                    </Button>
                )}
            </div>

            {/* Upload Instructions */}
            <div className="text-center space-y-0.5">
                <p className="text-sm font-medium">
                    {currentFile ? 'Avatar uploaded' : 'Upload avatar'}
                </p>
                <p className="text-xs text-muted-foreground">
                    PNG, JPG up to {formatBytes(maxSize)}
                </p>
            </div>

            {/* Error Messages */}
            {errors.length > 0 && (
                <Alert
                    variant="destructive"
                    appearance="light"
                    className="mt-5"
                >
                    <AlertIcon>
                        <TriangleAlert />
                    </AlertIcon>
                    <AlertContent>
                        <AlertTitle>File upload error(s)</AlertTitle>
                        <AlertDescription>
                            {errors.map((error, index) => (
                                <p key={index} className="last:mb-0">
                                    {error}
                                </p>
                            ))}
                        </AlertDescription>
                    </AlertContent>
                </Alert>
            )}
        </div>
    )
}
