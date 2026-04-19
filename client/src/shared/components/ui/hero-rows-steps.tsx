import type { ButtonProps } from '@heroui/react'
import { cn } from '@heroui/react'
import { useControlledState } from '@react-stately/utils'
import { domAnimation, LazyMotion, m } from 'framer-motion'
import { type ComponentProps, forwardRef } from 'react'
import { useDevice } from '../../hooks'

// --- Types ---

export type RowStepProps = {
    title?: React.ReactNode
    description?: React.ReactNode
    icon?: React.ReactNode
    /** Optional: Disable specific step */
    disabled?: boolean
}

export type HeroStepSlots = {
    base?: string
    list?: string
    step?: string
    button?: string
    indicator?: string // The circle
    label?: string // The text wrapper
    title?: string
    description?: string
    connector?: string // The progress line
}

export interface HeroRowsStepProps extends Omit<
    React.HTMLAttributes<HTMLButtonElement>,
    'title' | 'onChange'
> {
    /**
     * An array of steps.
     */
    steps?: RowStepProps[]
    /**
     * The color theme.
     */
    color?: ButtonProps['color']
    /**
     * The current step index.
     */
    currentStep?: number
    /**
     * The default step index.
     */
    defaultStep?: number
    /**
     * Whether to hide the progress bars/connectors.
     */
    hideProgressBars?: boolean
    /**
     * Custom class names for specific slots.
     */
    classNames?: HeroStepSlots
    /**
     * Callback function when the step index changes.
     */
    onStepChange?: (stepIndex: number) => void
    /**
     * Custom render function for the icon/number inside the circle.
     */
    renderIcon?: (props: {
        step: RowStepProps
        index: number
        status: 'active' | 'inactive' | 'complete'
    }) => React.ReactNode
}

// --- Internal Components ---

function DefaultCheckIcon(props: ComponentProps<'svg'>) {
    return (
        <svg
            {...props}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
        >
            <m.path
                animate={{ pathLength: 1 }}
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                strokeLinecap="round"
                strokeLinejoin="round"
                transition={{
                    delay: 0.1,
                    type: 'tween',
                    ease: 'easeOut',
                    duration: 0.3,
                }}
            />
        </svg>
    )
}

// --- Main Component ---

const HeroRowsStep = forwardRef<HTMLButtonElement, HeroRowsStepProps>(
    (
        {
            color = 'primary',
            steps = [],
            defaultStep = 0,
            onStepChange,
            currentStep: currentStepProp,
            hideProgressBars = false,
            classNames = {},
            className,
            renderIcon,
            ...props
        },
        ref
    ) => {
        const { isMobile, isTablet } = useDevice()
        const [currentStep, setCurrentStep] = useControlledState(
            currentStepProp,
            defaultStep,
            onStepChange
        )

        // Map color props to Tailwind colors for the Framer Motion variants
        // You can extend this logic or move it to CSS variables if preferred
        const getColorVar = (c: string) => {
            switch (c) {
                case 'primary':
                    return 'var(--heroui-primary)'
                case 'secondary':
                    return 'var(--heroui-secondary)'
                case 'success':
                    return 'var(--heroui-success)'
                case 'warning':
                    return 'var(--heroui-warning)'
                case 'danger':
                    return 'var(--heroui-error)'
                default:
                    return 'var(--heroui-default-foreground)'
            }
        }

        const activeColor = `hsl(${getColorVar(color)})`
        const inactiveColor = 'hsl(var(--heroui-default-300))'

        return (
            <nav
                aria-label="Progress"
                className={cn(
                    'max-w-fit overflow-x-auto py-4',
                    classNames.base,
                    className
                )}
            >
                <ol
                    className={cn(
                        'flex flex-row flex-nowrap gap-x-3',
                        classNames.list
                    )}
                >
                    {steps?.map((step, stepIdx) => {
                        const status =
                            currentStep === stepIdx
                                ? 'active'
                                : currentStep < stepIdx
                                  ? 'inactive'
                                  : 'complete'
                        const isLast = stepIdx === steps.length - 1

                        return (
                            <li
                                key={stepIdx}
                                className={cn(
                                    'relative flex w-full items-center pr-12',
                                    isLast && 'pr-0',
                                    classNames.step
                                )}
                                data-status={status}
                            >
                                <button
                                    ref={ref}
                                    disabled={step.disabled}
                                    aria-current={
                                        status === 'active' ? 'step' : undefined
                                    }
                                    className={cn(
                                        'group flex w-full cursor-pointer flex-row items-center justify-center gap-x-3 py-2.5 rounded-large focus:outline-none focus-visible:ring-2 ring-primary',
                                        step.disabled &&
                                            'opacity-50 cursor-not-allowed',
                                        classNames.button
                                    )}
                                    style={{
                                        flexDirection:
                                            isMobile || isTablet
                                                ? 'column'
                                                : 'row',
                                    }}
                                    onClick={() =>
                                        !step.disabled &&
                                        setCurrentStep(stepIdx)
                                    }
                                    {...props}
                                >
                                    {/* Indicator (Circle) */}
                                    <div className="relative flex items-center">
                                        <LazyMotion features={domAnimation}>
                                            <m.div
                                                className={cn(
                                                    'relative flex h-[34px] w-[34px] items-center justify-center rounded-full border-medium text-large font-medium transition-colors duration-300',
                                                    // Default colors based on status
                                                    status === 'inactive' &&
                                                        'border-default-300 text-default-300',
                                                    status === 'active' &&
                                                        `text-${color} border-${color}`,
                                                    status === 'complete' &&
                                                        `bg-${color} border-${color} text-${color}-foreground`,
                                                    classNames.indicator
                                                )}
                                                initial={false}
                                                animate={status}
                                                transition={{ duration: 0.25 }}
                                                variants={{
                                                    inactive: {
                                                        borderColor:
                                                            inactiveColor,
                                                        color: inactiveColor,
                                                        backgroundColor:
                                                            'transparent',
                                                    },
                                                    active: {
                                                        borderColor:
                                                            activeColor,
                                                        color: activeColor,
                                                        backgroundColor:
                                                            'transparent',
                                                    },
                                                    complete: {
                                                        borderColor:
                                                            activeColor,
                                                        color: 'hsl(var(--heroui-primary-foreground))',
                                                        backgroundColor:
                                                            activeColor,
                                                    },
                                                }}
                                            >
                                                {/* Render Logic for Icon/Number */}
                                                {renderIcon ? (
                                                    renderIcon({
                                                        step,
                                                        index: stepIdx,
                                                        status,
                                                    })
                                                ) : (
                                                    <div className="flex items-center justify-center">
                                                        {status ===
                                                        'complete' ? (
                                                            <DefaultCheckIcon className="h-5 w-5" />
                                                        ) : (
                                                            <span>
                                                                {stepIdx + 1}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </m.div>
                                        </LazyMotion>
                                    </div>

                                    {/* Text Label */}
                                    <div
                                        className={cn(
                                            'max-w-full flex-1 text-start',
                                            classNames.label
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'text-small font-medium transition-[color,opacity] duration-300 group-active:opacity-80',
                                                status === 'inactive'
                                                    ? 'text-default-500'
                                                    : 'text-default-foreground',
                                                classNames.title
                                            )}
                                        >
                                            {step.title}
                                        </div>
                                        {!isMobile &&
                                            !isTablet &&
                                            step.description && (
                                                <div
                                                    className={cn(
                                                        'text-tiny text-default-400',
                                                        classNames.description
                                                    )}
                                                >
                                                    {step.description}
                                                </div>
                                            )}
                                    </div>

                                    {/* Connector Bar */}
                                    {!isLast && !hideProgressBars && (
                                        <div
                                            aria-hidden="true"
                                            className={cn(
                                                'pointer-events-none absolute right-0 w-10 flex-none items-center',
                                                classNames.connector
                                            )}
                                            style={{
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                            }}
                                        >
                                            <div
                                                className={cn(
                                                    'relative h-0.5 w-full bg-default-300 transition-colors duration-300',
                                                    // Status logic for connector
                                                    stepIdx < currentStep &&
                                                        `bg-${color}`
                                                )}
                                            >
                                                {/* Optional: Add an animated filler inside the bar if needed, 
                             but simply changing the bg color of the main bar is usually cleaner for steps */}
                                            </div>
                                        </div>
                                    )}
                                </button>
                            </li>
                        )
                    })}
                </ol>
            </nav>
        )
    }
)

HeroRowsStep.displayName = 'HeroRowsStep'

export default HeroRowsStep
