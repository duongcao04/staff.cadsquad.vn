import { workbenchDataOptions } from '@/lib/queries'
import { JobMobileCard } from '@/shared/components'
import { HeroCard, HeroCardBody } from '@/shared/components/ui/hero-card'
import { HeroInput } from '@/shared/components/ui/hero-input'
import { Pagination, Skeleton } from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import lodash from 'lodash'
import { useMemo } from 'react'

type Props = {
    currentPage: number
    search?: string
    onPageChange: (newPage: number) => void
    onSearchChange: (newSearch?: string) => void
}
export function WorkbenchMobileContent({
    currentPage,
    search,
    onPageChange,
    onSearchChange,
}: Props) {
    const debouncedSearchChange = useMemo(
        () => lodash.debounce((value: string) => onSearchChange(value), 500),
        [onSearchChange]
    )
    const {
        data: { jobs, paginate },
    } = useSuspenseQuery({
        ...workbenchDataOptions({
            page: currentPage,
            search: search,
        }),
    })
    return (
        <div className="md:hidden space-y-4 pb-20">
            {/* Search/Sort Controls for Mobile */}
            <div className="flex flex-col gap-3 mb-4">
                <HeroInput
                    placeholder="Search jobs..."
                    isClearable
                    onValueChange={(val) => {
                        if (!val)
                            onSearchChange(undefined) // Instant reset on clear
                        else debouncedSearchChange(val)
                    }}
                />
            </div>
            {jobs.map((job) => (
                <JobMobileCard key={job.no} job={job} />
            ))}

            {/* Mobile Pagination */}
            <div className="flex justify-center pt-4">
                <Pagination
                    total={paginate?.totalPages ?? 1}
                    page={currentPage}
                    onChange={onPageChange}
                />
            </div>
        </div>
    )
}

export function WorkbenchMobileSkeleton() {
    return (
        <div className="space-y-4">
            {/* Giả lập 3-4 cards đang load */}
            {[...Array(3)].map((_, i) => (
                <HeroCard key={i} className="border border-divider shadow-sm">
                    <HeroCardBody className="gap-3 p-4">
                        <div className="flex justify-between items-start">
                            <Skeleton className="w-20 h-6 rounded-lg" />
                            <Skeleton className="w-16 h-6 rounded-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="w-3/4 h-5 rounded-lg" />
                            <Skeleton className="w-1/2 h-4 rounded-lg" />
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <Skeleton className="w-24 h-4 rounded-lg" />
                            <Skeleton className="w-16 h-8 rounded-full" />
                        </div>
                    </HeroCardBody>
                </HeroCard>
            ))}
        </div>
    )
}
