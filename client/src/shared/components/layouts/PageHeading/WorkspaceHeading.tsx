import { cn } from '@/lib/utils'
import Timmer from './Timmer'

type Props = {
    title: React.ReactNode
    description?: string
    breadcrumbs?: React.ReactNode
    actions?: React.ReactNode // Added to handle your right-side buttons
    classNames?: {
        wrapper?: string
    }
    showTimmer?: boolean
}

export function WorkspaceHeading({
    title,
    description,
    breadcrumbs,
    actions,
    classNames,
    showTimmer = true,
}: Props) {
    return (
        <div
            className={cn(
                'h-18 pl-6 pr-8 border-b border-default-200 flex items-center justify-between bg-white',
                classNames?.wrapper
            )}
        >
            {/* Left Side: Title, Description, and Breadcrumbs */}
            <div className="flex items-center justify-start">
                <div className="flex flex-col gap-0.5">
                    <h1 className="text-2xl font-bold text-default-900 flex items-center gap-2">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm font-medium text-default-500">
                            {description}
                        </p>
                    )}
                </div>

                {/* Breadcrumbs with vertical divider */}
                {breadcrumbs && (
                    <div className="flex items-center h-full">
                        <div className="w-px h-6 mx-5 bg-default-300"></div>
                        <div className="text-sm font-medium text-default-500 flex items-center">
                            {breadcrumbs}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Side: Actions & Timmer */}
            <div className="flex items-center gap-3">
                {actions && (
                    <div className="flex items-center gap-3">{actions}</div>
                )}

                {/* Optional vertical divider if both actions and timmer exist */}
                {actions && (
                    <div className="w-px h-5 bg-default-200 mx-1 hidden sm:block"></div>
                )}

                {showTimmer && <Timmer />}
            </div>
        </div>
    )
}
