'use client'

import { Button } from '@heroui/react'
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    Info,
    Trash2,
} from 'lucide-react'
import { useMemo } from 'react'

import {
    HeroModal,
    HeroModalBody,
    HeroModalContent,
    HeroModalFooter,
    HeroModalHeader,
} from './hero-modal'

type ModalVariant = 'danger' | 'warning' | 'info' | 'success'

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title?: string
    content?: React.ReactNode
    confirmLabel?: string
    variant?: ModalVariant
    isLoading?: boolean
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmation',
    content = 'Are you sure you want to proceed?',
    confirmLabel = 'Confirm',
    variant = 'danger',
    isLoading = false,
}: ConfirmModalProps) {
    // Cấu hình giao diện (Màu sắc & Icon)
    const config = useMemo(() => {
        switch (variant) {
            case 'danger':
                return {
                    color: 'danger' as const,
                    icon: <AlertTriangle className="text-danger" size={24} />,
                    headerColor: 'text-danger',
                }
            case 'warning':
                return {
                    color: 'warning' as const,
                    icon: <AlertCircle className="text-warning" size={24} />,
                    headerColor: 'text-warning',
                }
            case 'success':
                return {
                    color: 'success' as const,
                    icon: <CheckCircle2 className="text-success" size={24} />,
                    headerColor: 'text-success',
                }
            case 'info':
            default:
                return {
                    color: 'primary' as const,
                    icon: <Info className="text-primary" size={24} />,
                    headerColor: 'text-primary',
                }
        }
    }, [variant])

    return (
        <HeroModal isOpen={isOpen} onClose={onClose}>
            <HeroModalContent>
                {(onClose) => (
                    <>
                        <HeroModalHeader className="flex gap-3 items-center">
                            {config.icon}
                            <span className={config.headerColor}>{title}</span>
                        </HeroModalHeader>

                        <HeroModalBody>
                            <div className="text-default-500">{content}</div>
                        </HeroModalBody>

                        <HeroModalFooter>
                            <Button
                                variant="light"
                                onPress={onClose}
                                isDisabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                color={config.color}
                                onPress={onConfirm}
                                isLoading={isLoading}
                                className="font-medium shadow-sm text-white"
                                startContent={
                                    !isLoading && variant === 'danger' ? (
                                        <Trash2 size={18} />
                                    ) : undefined
                                }
                            >
                                {confirmLabel}
                            </Button>
                        </HeroModalFooter>
                    </>
                )}
            </HeroModalContent>
        </HeroModal>
    )
}
