import { Chip, Tooltip, Button, ButtonGroup, Spinner } from '@heroui/react'
import { Check, Ban, Undo2, ShieldCheck, ShieldAlert } from 'lucide-react'
import { PermissionAction } from '../../../../lib/utils/_user-access'

interface PermissionRowProps {
    label: string
    description?: string
    status: PermissionAction // INHERIT | GRANT | DENY
    effectiveValue: boolean // True (Allowed) | False (Denied)
    onChange: (action: PermissionAction) => void
    isLoading?: boolean
}

export const PermissionRow = ({
    label,
    description,
    status,
    effectiveValue,
    onChange,
    isLoading,
}: PermissionRowProps) => {
    return (
        <div className="group flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-divider hover:bg-content2/50 transition-all">
            {/* Left: Info */}
            <div className="flex flex-col gap-1.5 max-w-[60%]">
                <div className="flex items-center gap-2">
                    <span
                        className={`text-sm font-semibold transition-opacity ${effectiveValue ? 'opacity-100' : 'opacity-50'}`}
                    >
                        {label}
                    </span>

                    {/* Status Badges */}
                    {status === 'GRANT' && (
                        <Chip
                            size="sm"
                            color="success"
                            variant="flat"
                            className="h-5 text-[10px] px-1 font-bold"
                        >
                            OVERRIDE: ALLOW
                        </Chip>
                    )}
                    {status === 'DENY' && (
                        <Chip
                            size="sm"
                            color="danger"
                            variant="flat"
                            className="h-5 text-[10px] px-1 font-bold"
                        >
                            OVERRIDE: DENY
                        </Chip>
                    )}
                </div>
                <span className="text-xs text-default-400 line-clamp-1">
                    {description}
                </span>
            </div>

            {/* Right: Controls & Indicator */}
            <div className="flex items-center gap-6">
                {/* Effective Access Indicator */}
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-bold text-default-400 uppercase tracking-wider mb-0.5">
                        Effective
                    </span>
                    {effectiveValue ? (
                        <div className="flex items-center gap-1.5 text-success-600 font-bold text-sm">
                            <ShieldCheck size={16} /> ALLOWED
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-danger-600 font-bold text-sm">
                            <ShieldAlert size={16} /> DENIED
                        </div>
                    )}
                </div>

                {/* 3-State Toggle Buttons */}
                <ButtonGroup
                    size="sm"
                    isDisabled={isLoading}
                    className="shadow-sm"
                >
                    {/* 1. INHERIT BUTTON */}
                    <Tooltip content="Inherit from Role (Reset)" delay={500}>
                        <Button
                            isIconOnly
                            color="default"
                            variant={status === 'INHERIT' ? 'solid' : 'faded'}
                            onPress={() => onChange('INHERIT')}
                            className={
                                status === 'INHERIT'
                                    ? 'bg-default-700 text-white'
                                    : ''
                            }
                        >
                            <Undo2 size={16} />
                        </Button>
                    </Tooltip>

                    {/* 2. GRANT BUTTON */}
                    <Tooltip content="Force Allow (Override)" delay={500}>
                        <Button
                            isIconOnly
                            color="success"
                            variant={status === 'GRANT' ? 'solid' : 'faded'}
                            onPress={() => onChange('GRANT')}
                        >
                            <Check size={16} />
                        </Button>
                    </Tooltip>

                    {/* 3. DENY BUTTON */}
                    <Tooltip content="Force Deny (Override)" delay={500}>
                        <Button
                            isIconOnly
                            color="danger"
                            variant={status === 'DENY' ? 'solid' : 'faded'}
                            onPress={() => onChange('DENY')}
                        >
                            <Ban size={16} />
                        </Button>
                    </Tooltip>
                </ButtonGroup>

                {/* Loading Spinner Placeholder (Width fixed to prevent layout shift) */}
                <div className="w-5 h-5 flex items-center justify-center">
                    {isLoading && <Spinner size="sm" color="current" />}
                </div>
            </div>
        </div>
    )
}
