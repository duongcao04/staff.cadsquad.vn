import {
    Button,
    Card,
    CardBody,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    SharedSelection,
    Skeleton,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'
import { useMemo, startTransition } from 'react'
import { adminJobStatsOptions } from '../../../../lib'
import { Route } from '../../../../routes/_administrator/mgmt/jobs/index'
import dayjs, { Dayjs } from 'dayjs'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import updateLocale from 'dayjs/plugin/updateLocale'
import { useDevice } from '../../../../shared/hooks'

dayjs.extend(quarterOfYear)
dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
    weekStart: 1,
})

const formatRange = (start: Dayjs, end: Dayjs) => {
    const startFormat = start.format('D MMM')
    const endFormat = end.format('D MMM, YYYY')
    return `${startFormat} - ${endFormat}`
}
export const getDateRangeOptions = () => {
    const now = dayjs()
    return [
        {
            key: 'this_week',
            label: 'This week',
            from: now.startOf('week'),
            to: now.endOf('week'),
            dateStr: formatRange(now.startOf('week'), now.endOf('week')),
        },
        {
            key: 'this_month',
            label: 'This month',
            from: now.startOf('month'),
            to: now.endOf('month'),
            dateStr: formatRange(now.startOf('month'), now.endOf('month')),
        },
        {
            key: 'this_quarter',
            label: 'This quarter',
            from: now.startOf('quarter'),
            to: now.endOf('quarter'),
            dateStr: formatRange(now.startOf('quarter'), now.endOf('quarter')),
        },
        {
            key: 'this_year',
            label: 'This year',
            from: now.startOf('year'),
            to: now.endOf('year'),
            dateStr: formatRange(now.startOf('year'), now.endOf('year')),
        },
        {
            key: 'last_week',
            label: 'Last week',
            from: now.subtract(1, 'week').startOf('week'),
            to: now.subtract(1, 'week').endOf('week'),
            dateStr: formatRange(
                now.subtract(1, 'week').startOf('week'),
                now.subtract(1, 'week').endOf('week')
            ),
        },
        {
            key: 'last_month',
            label: 'Last month',
            from: now.subtract(1, 'month').startOf('month'),
            to: now.subtract(1, 'month').endOf('month'),
            dateStr: formatRange(
                now.subtract(1, 'month').startOf('month'),
                now.subtract(1, 'month').endOf('month')
            ),
        },
        {
            key: 'last_quarter',
            label: 'Last quarter',
            from: now.subtract(1, 'quarter').startOf('quarter'),
            to: now.subtract(1, 'quarter').endOf('quarter'),
            dateStr: formatRange(
                now.subtract(1, 'quarter').startOf('quarter'),
                now.subtract(1, 'quarter').endOf('quarter')
            ),
        },
        {
            key: 'last_year',
            label: 'Last year',
            from: now.subtract(1, 'year').startOf('year'),
            to: now.subtract(1, 'year').endOf('year'),
            dateStr: formatRange(
                now.subtract(1, 'year').startOf('year'),
                now.subtract(1, 'year').endOf('year')
            ),
        },
        {
            key: 'all_time',
            label: 'All time',
            from: null,
            to: now,
            dateStr: 'Beginning - Present',
        },
    ]
}
// --- Stats Skeleton Component ---
export function JobManagementStatsSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Skeleton className="w-48 h-5 rounded-md" />
                <Skeleton className="w-32 h-8 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {[...Array(5)].map((_, idx) => (
                    <Card
                        key={idx}
                        shadow="none"
                        className="bg-white border border-border-default"
                    >
                        <CardBody className="flex flex-col gap-3 p-4">
                            <div className="flex items-center gap-2">
                                <Skeleton className="w-2.5 h-2.5 rounded-full" />
                                <Skeleton className="w-20 h-3 rounded" />
                            </div>
                            <Skeleton className="w-16 h-8 rounded" />
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    )
}

// --- Stats Component ---
export function JobManagementStats() {
    const navigate = useNavigate({ from: Route.fullPath })
    const searchParams = Route.useSearch()
    const currentRangeKey = searchParams.dateRange || 'this_year'

    const dateRangeOptions = useMemo(() => getDateRangeOptions(), [])
    const dateRangeOption = useMemo(
        () => dateRangeOptions.find((it) => currentRangeKey === it.key),
        [currentRangeKey, dateRangeOptions]
    )

    const currentLabel = dateRangeOption?.label || 'Custom range'

    // Fetch ONLY stats here
    const { data: stats } = useSuspenseQuery(
        adminJobStatsOptions({
            from: dateRangeOption?.from?.toISOString(),
            to: dateRangeOption?.to?.toISOString(),
        })
    )

    const handleRangeChange = (keys: SharedSelection) => {
        const selected = Array.from(keys)[0] as string
        if (!selected) return

        startTransition(() => {
            navigate({
                search: (old) => ({
                    ...old,
                    dateRange: selected,
                }),
                replace: true,
            })
        })
    }

    const STATS_DATA = [
        {
            title: `Total Jobs ${searchParams.dateRange || 'this_year'}`,
            count: stats.total,
            color: 'bg-primary-500',
        },
        {
            title: 'Ongoing Jobs',
            count: stats.ongoing,
            color: 'bg-warning-500',
        },
        {
            title: 'Delivered Jobs',
            count: stats.delivered,
            color: 'bg-secondary-500',
        },
        { title: 'Late Jobs', count: stats.late, color: 'bg-danger-500' },
        {
            title: 'Finished Jobs',
            count: stats.finished,
            color: 'bg-success-500',
        },
    ]

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-text-subdued">
                    The stats are displayed for
                </span>
                <Dropdown
                    placement="bottom-start"
                    classNames={{ content: 'min-w-[320px]' }}
                >
                    <DropdownTrigger>
                        <Button
                            variant="bordered"
                            size="sm"
                            endContent={
                                <ChevronDown
                                    size={14}
                                    className="text-text-subdued"
                                />
                            }
                            className="border-1 bg-background"
                        >
                            <p className="font-medium">{currentLabel}</p>
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label="Date Range Selection"
                        selectedKeys={new Set([currentRangeKey])}
                        selectionMode="single"
                        onSelectionChange={handleRangeChange}
                        itemClasses={{
                            base: 'data-[hover=true]:bg-default-100',
                        }}
                    >
                        <DropdownSection
                            title="DATA RANGE"
                            classNames={{
                                heading:
                                    'text-xs font-bold text-default-400 tracking-wider',
                            }}
                        >
                            {dateRangeOptions.map((range) => (
                                <DropdownItem
                                    key={range.key}
                                    endContent={
                                        <span className="text-xs text-default-500">
                                            {range.dateStr}
                                        </span>
                                    }
                                    className={
                                        currentRangeKey === range.key
                                            ? 'bg-default-100'
                                            : ''
                                    }
                                >
                                    {range.label}
                                </DropdownItem>
                            ))}
                        </DropdownSection>
                        <DropdownSection
                            classNames={{
                                group: 'border-t border-default-200 pt-1 mt-1',
                            }}
                        >
                            <DropdownItem
                                key="custom"
                                endContent={
                                    <ChevronDown
                                        size={14}
                                        className="-rotate-90 text-default-400"
                                    />
                                }
                            >
                                Custom range
                            </DropdownItem>
                        </DropdownSection>
                    </DropdownMenu>
                </Dropdown>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {STATS_DATA.map((stat, idx) => (
                    <Card
                        key={idx}
                        shadow="none"
                        className="bg-white border border-border-default"
                    >
                        <CardBody className="flex flex-col gap-2 p-4">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`w-2.5 h-2.5 rounded-full ${stat.color}`}
                                />
                                <span className="text-xs font-medium tracking-wider truncate text-text-subdued">
                                    {stat.title}
                                </span>
                            </div>
                            <span className="text-2xl font-bold text-text-default">
                                {stat.count}
                            </span>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    )
}
