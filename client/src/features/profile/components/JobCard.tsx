import { currencyFormatter, INTERNAL_URLS } from '@/lib'
import { JobStatusChip } from '@/shared/components'
import CountdownTimer from '@/shared/components/ui/countdown-timer'
import { HeroCopyButton } from '@/shared/components/ui/hero-copy-button'
import { useDevice } from '@/shared/hooks'
import type { TJob } from '@/shared/types'
import { Skeleton } from '@heroui/react'
import { Link, useRouter } from '@tanstack/react-router'
import { Image } from 'antd'
import dayjs from 'dayjs'
import { Clock2 } from 'lucide-react'
import React from 'react'

type Props = {
    data: TJob
    onPress?: () => void
}
function JobCard({ data, onPress }: Props) {
    const router = useRouter()
    const { isMobile, isTablet } = useDevice()

    const targetDate = dayjs(data.dueAt)

    const clickable = isMobile || isTablet

    return (
        <div
            className="min-w-full w-fit grid grid-cols-[250px_1fr_1fr_1fr] md:grid-cols-[300px_1fr_1fr_1fr] lg:grid-cols-[300px_1fr_1fr_1fr_1fr_40px] gap-3 items-center border-1 rounded-lg px-6 pt-3 pb-5 border-border-default bg-background hover:bg-background-muted"
            style={{
                cursor: clickable ? 'pointer' : 'default',
            }}
            onClick={() => {
                if (clickable) {
                    router.navigate({
                        href: INTERNAL_URLS.jobDetail(data.no),
                    })
                    onPress?.()
                }
            }}
        >
            <div className="flex items-center justify-start gap-4">
                <Image
                    src={data.status.thumbnailUrl}
                    alt={data.displayName}
                    rootClassName="size-16! rounded-full aspect-square!"
                    className="size-full! rounded-full aspect-square!"
                    preview={false}
                />
                <div>
                    <div className="flex items-center justify-start gap-1">
                        <p className="text-sm font-medium line-clamp-1">
                            #{data.no}
                        </p>
                        <HeroCopyButton textValue={data.no} />
                    </div>
                    <Link
                        to={INTERNAL_URLS.jobDetail(data.no)}
                        className="mt-0.5 block font-medium line-clamp-1! hover:underline"
                        title="View detail"
                    >
                        {data.displayName}
                    </Link>
                </div>
            </div>
            <div className="hidden lg:flex flex-col items-center justify-center gap-1">
                <p className="text-xs text-text-subdued">Client name</p>
                <p className="text-sm font-medium text-center">
                    {data.client?.name ?? 'Unknown client'}
                </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
                <p className="text-xs text-text-subdued">Staff cost</p>
                {data.staffCost ? (
                    <p className="font-bold text-currency">
                        {currencyFormatter(data.staffCost, 'Vietnamese')}
                    </p>
                ) : (
                    <p className="text-xs italic text-text-subdued text-right">
                        Not assigned
                    </p>
                )}
            </div>
            <div className="flex flex-col items-center justify-center gap-0.5">
                <p className="text-xs  text-text-subdued">Due on</p>
                <div className="font-medium text-sm flex items-center justify-center">
                    <Clock2 size={14} className="text-text-subdued mr-2" />
                    <CountdownTimer
                        targetDate={targetDate}
                        hiddenUnits={['second', 'year']}
                    />
                </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
                <p className="text-xs  text-text-subdued">Status</p>
                <JobStatusChip data={data.status} />
            </div>
            <Link
                to={INTERNAL_URLS.jobDetail(data.no)}
                className="hidden lg:block text-sm font-medium hover:underline! underline-offset-2 text-end text-link!"
            >
                View
            </Link>
        </div>
    )
}
export default React.memo(JobCard)

export function JobCardSkeleton() {
    return (
        <div className="max-w-full grid grid-cols-[250px_1fr] md:grid-cols-[300px_1fr_1fr] lg:grid-cols-[300px_1fr_1fr_1fr] xl:grid-cols-[300px_1fr_1fr_1fr_1fr_40px] gap-3 items-center border rounded-lg px-6 pt-3 pb-5 border-text-muted bg-background">
            {/* Left: avatar + code + title */}
            <div className="flex items-center justify-start gap-4">
                <Skeleton className="size-16! rounded-full aspect-square!" />
                <div className="space-y-1">
                    <div className="flex items-center gap-1">
                        <Skeleton className="h-4 w-16 rounded-md" />{' '}
                        {/* #code */}
                        <Skeleton className="h-4 w-4 rounded-md" />{' '}
                        {/* copy btn */}
                    </div>
                    <Skeleton className="h-5 w-48 rounded-md" />{' '}
                    {/* job title */}
                </div>
            </div>

            {/* Client (xl only) */}
            <div className="hidden lg:flex flex-col items-center justify-center gap-1">
                <Skeleton className="h-3 w-24 rounded-md" /> {/* label */}
                <Skeleton className="h-5 w-28 rounded-md" /> {/* value */}
            </div>

            {/* Staff cost */}
            <div className="hidden md:flex flex-col items-center justify-center gap-1">
                <Skeleton className="h-3 w-24 rounded-md" /> {/* label */}
                <Skeleton className="h-5 w-24 rounded-md" /> {/* value */}
            </div>

            {/* Due at */}
            <div className="hidden xl:flex flex-col items-center justify-center gap-1">
                <Skeleton className="h-3 w-20 rounded-md" /> {/* label */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-md" />{' '}
                    {/* clock icon box */}
                    <Skeleton className="h-5 w-28 rounded-md" />{' '}
                    {/* due value */}
                </div>
            </div>

            {/* Status chip */}
            <div className="hidden md:flex flex-col items-center justify-center gap-1">
                <Skeleton className="h-3 w-16 rounded-md" /> {/* label */}
                <Skeleton className="h-6 w-24 rounded-full" /> {/* chip */}
            </div>

            {/* View link (xl only) */}
            <div className="hidden xl:flex items-center justify-end">
                <Skeleton className="h-5 w-10 rounded-md" />
            </div>
        </div>
    )
}
