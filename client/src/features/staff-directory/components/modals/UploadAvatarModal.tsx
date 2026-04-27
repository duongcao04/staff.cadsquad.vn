import { Avatar, Button, Slider } from '@heroui/react'
import {
    AlertCircle,
    Crop as CropIcon,
    RotateCcw,
    UploadCloud,
} from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { Area, Point } from 'react-easy-crop'
import Cropper from 'react-easy-crop'
import { z } from 'zod'
import {
    HeroModal,
    HeroModalBody,
    HeroModalContent,
    HeroModalFooter,
    HeroModalHeader,
} from '../../../../shared/components/ui/hero-modal'

// --- Configuration ---
// const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
]

// --- Zod Schema ---
const avatarSchema = z.object({
    file: z
        .instanceof(File, { message: 'File is required' })
        // .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
        .refine(
            (file) => ACCEPTED_IMAGE_TYPES.includes(file.type), 
            'Only .jpg, .png, and .webp formats are supported.'
        ),
})

// --- Canvas Helper to Create Cropped Image ---
const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.setAttribute('crossOrigin', 'anonymous')
        image.src = url
    })

async function getCroppedImg(
    imageSrc: string,
    pixelCrop: Area,
    fileName: string
): Promise<File | null> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) return null

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    )

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            if (!blob) return resolve(null)
            const file = new File([blob], fileName, { type: 'image/jpeg' })
            resolve(file)
        }, 'image/jpeg')
    })
}

interface UploadAvatarModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (file: File) => Promise<void> | void
    currentAvatarUrl?: string
    userName?: string
}

export const UploadAvatarModal = ({
    isOpen,
    onClose,
    onSave,
    currentAvatarUrl,
    userName = 'User',
}: UploadAvatarModalProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    // Crop State
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
        null
    )

    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen) {
            resetState()
        }
    }, [isOpen])

    const resetState = () => {
        setSelectedFile(null)
        setImageSrc(null)
        setError(null)
        setIsUploading(false)
        setZoom(1)
        setCrop({ x: 0, y: 0 })
    }

    const onCropComplete = useCallback(
        (_croppedArea: Area, croppedAreaPixels: Area) => {
            setCroppedAreaPixels(croppedAreaPixels)
        },
        []
    )

    const validateAndSetFile = (file: File) => {
        setError(null)
        const result = avatarSchema.safeParse({ file })

        if (!result.success) {
            const errorMessage =
                result.error.issues?.[0]?.message || 'Invalid file.'
            setError(errorMessage)
            return
        }

        setSelectedFile(file)
        // Read file as Data URL for the Cropper
        const reader = new FileReader()
        reader.addEventListener('load', () => {
            setImageSrc(reader.result?.toString() || null)
        })
        reader.readAsDataURL(file)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) validateAndSetFile(file)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (file) validateAndSetFile(file)
    }

    const handleSubmit = async () => {
        if (!imageSrc || !croppedAreaPixels || !selectedFile) return

        try {
            setIsUploading(true)

            // 1. Generate the cropped file
            const croppedFile = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
                selectedFile.name
            )

            if (!croppedFile) throw new Error('Failed to crop image')

            await onSave(croppedFile)
            onClose()
        } catch (err) {
            console.error('Upload failed', err)
            setError('Failed to upload image. Please try again.')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <HeroModal
            isOpen={isOpen}
            onClose={onClose}
            size={imageSrc ? 'lg' : 'md'}
            hideCloseButton={isUploading}
        >
            <HeroModalContent>
                {(close) => (
                    <>
                        <HeroModalHeader className="flex flex-col gap-1">
                            Change Profile Picture
                        </HeroModalHeader>

                        <HeroModalBody className="py-6">
                            {/* --- VIEW 1: UPLOAD AREA --- */}
                            {!imageSrc ? (
                                <>
                                    <div className="flex justify-center mb-6">
                                        <Avatar
                                            src={currentAvatarUrl}
                                            name={userName.charAt(0)}
                                            className="w-32 h-32 text-4xl border-4 border-slate-50 shadow-lg"
                                        />
                                    </div>

                                    <div
                                        className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors hover:bg-background-hovered hover:border-primary group"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleDrop}
                                    >
                                        <div className="p-3 bg-slate-100 text-text-subdued rounded-full mb-3 group-hover:bg-primary-50 group-hover:text-primary transition-colors">
                                            <UploadCloud size={24} />
                                        </div>
                                        <p className="text-sm font-medium text-slate-700">
                                            <span className="text-primary">
                                                Click to upload
                                            </span>{' '}
                                            or drag & drop
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            SVG, PNG, JPG (max. 5MB)
                                        </p>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept={ACCEPTED_IMAGE_TYPES.join(
                                                ','
                                            )}
                                            onChange={handleFileSelect}
                                        />
                                    </div>
                                </>
                            ) : (
                                /* --- VIEW 2: CROPPER --- */
                                <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
                                    <div className="relative w-full h-75 bg-slate-900 rounded-xl overflow-hidden border border-slate-200">
                                        <Cropper
                                            image={imageSrc}
                                            crop={crop}
                                            zoom={zoom}
                                            aspect={1} // 1:1 Aspect Ratio for Avatars
                                            onCropChange={setCrop}
                                            onCropComplete={onCropComplete}
                                            onZoomChange={setZoom}
                                            cropShape="round" // Shows a circle mask
                                            showGrid={false}
                                        />
                                    </div>

                                    <div className="flex items-center gap-4 px-2">
                                        <span className="text-xs font-medium text-slate-500">
                                            Zoom
                                        </span>
                                        <Slider
                                            aria-label="Zoom"
                                            size="sm"
                                            step={0.1}
                                            minValue={1}
                                            maxValue={3}
                                            value={zoom}
                                            onChange={(v) =>
                                                setZoom(v as number)
                                            }
                                            className="flex-1"
                                        />
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            onPress={resetState}
                                            isDisabled={isUploading}
                                            title="Remove Image"
                                        >
                                            <RotateCcw
                                                size={18}
                                                className="text-slate-400"
                                            />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="flex items-center gap-2 text-danger text-sm bg-danger-50 p-3 rounded-lg border border-danger-100 mt-2 animate-in slide-in-from-top-1">
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}
                        </HeroModalBody>

                        <HeroModalFooter>
                            <Button
                                variant="light"
                                onPress={close}
                                isDisabled={isUploading}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleSubmit}
                                isLoading={isUploading}
                                isDisabled={!selectedFile && !imageSrc}
                                className="font-medium"
                                startContent={
                                    !isUploading && imageSrc ? (
                                        <CropIcon size={16} />
                                    ) : undefined
                                }
                            >
                                {isUploading
                                    ? 'Uploading...'
                                    : imageSrc
                                      ? 'Crop & Save'
                                      : 'Save'}
                            </Button>
                        </HeroModalFooter>
                    </>
                )}
            </HeroModalContent>
        </HeroModal>
    )
}
