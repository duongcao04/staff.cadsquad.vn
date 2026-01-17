import { jobStatusesListOptions } from '@/lib/queries'
import { DUE_DATE_PRESETS, getDueDateRange } from '@/lib/utils'
import { TJobFilters } from '@/lib/validationSchemas'
import { HeroButton, HeroSelect, HeroSelectItem } from '@/shared/components'
import { Divider, Input } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { Columns3Cog, RefreshCwIcon, SearchIcon } from 'lucide-react'

type Props = {
    search?: string
    onSearchChange: (newSearch?: string) => void
    isLoadingData: boolean
    onRefresh: () => void
    filters: TJobFilters
    onFiltersChange: (newFilters: TJobFilters) => void
    openViewColDrawer: () => void
}

export function WorkbenchToolbar({
    search,
    onSearchChange,
    isLoadingData,
    onRefresh,
    filters,
    onFiltersChange,
    openViewColDrawer,
}: Props) {
    const { data } = useQuery({ ...jobStatusesListOptions() })
    const jobStatuses = data?.jobStatuses || []

    return (
        <div className="flex items-center justify-start gap-4">
            {/* Search */}
            <Input
                isClearable
                classNames={{
                    base: 'w-[450px]',
                    mainWrapper: 'w-[450px]',
                    inputWrapper:
                        'hover:shadow-SM bg-background border-border-default border-1',
                }}
                variant="bordered"
                size="sm"
                placeholder="Search by job no, job name..."
                startContent={<SearchIcon className="text-text-6" size={14} />}
                value={search}
                onClear={() => onSearchChange(undefined)}
                onValueChange={(value) => onSearchChange(value)}
            />

            <Divider orientation="vertical" className="h-5" />

            <div className="flex gap-3 items-center">
                <HeroButton
                    className="border-1"
                    variant="bordered"
                    size="sm"
                    onPress={onRefresh}
                    startContent={
                        <RefreshCwIcon
                            size={14}
                            className={
                                isLoadingData ? 'animate-spin-smooth' : ''
                            }
                        />
                    }
                >
                    Refresh
                </HeroButton>

                <HeroButton
                    startContent={<Columns3Cog size={14} />}
                    variant="bordered"
                    size="sm"
                    className="border-1 font-medium"
                    onPress={openViewColDrawer}
                >
                    Columns
                </HeroButton>
            </div>

            <Divider orientation="vertical" className="h-5" />

            {/* Filters */}
            <div className="flex gap-3 items-center">
                <HeroSelect
                    selectionMode="multiple"
                    className="min-w-34"
                    size="sm"
                    classNames={{
                        trigger:
                            'hover:shadow-SM border-border-default border cursor-pointer',
                        popoverContent: 'w-[200px]!',
                    }}
                    placeholder="Status"
                    isClearable
                    onClear={() =>
                        onFiltersChange({ ...filters, status: undefined })
                    }
                    onSelectionChange={(value) =>
                        onFiltersChange?.({
                            ...filters,
                            status: Array.from(value).join(','),
                        })
                    }
                    renderValue={(items) => (
                        <p className="text-text-7">
                            {items.length} status
                            {items.length > 1 ? 'es' : ''}
                        </p>
                    )}
                >
                    {jobStatuses
                        .filter((it) => it.systemType !== 'TERMINATED')
                        .map((jobStatus) => (
                            <HeroSelectItem key={jobStatus.code}>
                                <div className="flex items-center justify-start gap-2">
                                    <div
                                        className="size-2 rounded-full"
                                        style={{
                                            backgroundColor:
                                                jobStatus.hexColor || '#000000',
                                        }}
                                    />
                                    <p>{jobStatus.displayName}</p>
                                </div>
                            </HeroSelectItem>
                        ))}
                </HeroSelect>

                <HeroSelect
                    className="min-w-34"
                    size="sm"
                    classNames={{
                        trigger:
                            'hover:shadow-SM border-border-default border cursor-pointer',
                        popoverContent: 'w-[200px]!',
                    }}
                    placeholder="Due in"
                    isClearable
                    onSelectionChange={(value) => {
                        const { dueAtFrom, dueAtTo } = getDueDateRange(
                            value.currentKey
                        )
                        onFiltersChange?.({
                            ...filters,
                            dueAtFrom: dueAtFrom?.split('T')[0],
                            dueAtTo: dueAtTo?.split('T')[0],
                        })
                    }}
                    renderValue={(items) => (
                        <p className="text-text-7">{items[0]?.textValue}</p>
                    )}
                >
                    {DUE_DATE_PRESETS.map((dueIn) => (
                        <HeroSelectItem key={dueIn.key}>
                            {dueIn.label}
                        </HeroSelectItem>
                    ))}
                </HeroSelect>
            </div>
        </div>
    )
}
