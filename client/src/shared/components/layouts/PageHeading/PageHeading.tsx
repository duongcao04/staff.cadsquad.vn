import { cn } from '@/lib/utils'

import Timmer from './Timmer'

type Props = {
    breadcrumbs?: React.ReactNode
    title: React.ReactNode
    description?: string
    classNames?: {
        wrapper?: string
    }
}
export function PageHeading({
    title,
    classNames,
    breadcrumbs,
    description,
}: Props) {
    return (
        <div className={cn('w-full pt-2 pb-5', classNames?.wrapper)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center justify-start">
                    <div>
                        <h1 className="text-sm lg:text-base align-middle font-semibold text-text-default">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-text-subdued text-xs">
                                {description}
                            </p>
                        )}
                    </div>
                    {breadcrumbs && (
                        <div className="h-full flex items-end justify-start text-text-muted">
                            <div className="w-px h-5 ml-8 mr-6 bg-text-disabled"></div>
                            {breadcrumbs}
                        </div>
                    )}
                </div>
                <Timmer />
            </div>
        </div>
    )
}
