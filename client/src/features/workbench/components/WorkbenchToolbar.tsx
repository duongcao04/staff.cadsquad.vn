import { jobStatusesListOptions } from '@/lib/queries'
import { DUE_DATE_PRESETS, getDueDateRange, RouteUtil } from '@/lib/utils'
import { Button, Divider, Input, Select, SelectItem } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import { Columns3Cog, RefreshCwIcon, SearchIcon } from 'lucide-react'

type Props = {
    onSearchChange: (newSearch?: string) => void
    isLoadingData: boolean
    onRefresh: () => void
    openViewColDrawer: () => void
}

export function WorkbenchToolbar({
    onSearchChange,
    isLoadingData,
    onRefresh,
    openViewColDrawer,
}: Props) {
    const { search } = useSearch({ from: '/_workspace/_workbench/' })

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
                <Button
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
                </Button>

                <Button
                    startContent={<Columns3Cog size={14} />}
                    variant="bordered"
                    size="sm"
                    className="border-1 font-medium"
                    onPress={openViewColDrawer}
                >
                    Columns
                </Button>
            </div>

            <Divider orientation="vertical" className="h-5" />

            {/* Filters */}
            <div className="flex gap-3 items-center">
                <Select
                    selectionMode="multiple"
                    className="min-w-34"
                    size="sm"
                    variant="bordered"
                    classNames={{
                        trigger:
                            'shadow-none hover:shadow-SM border-border-default border cursor-pointer',
                        popoverContent: 'w-[200px]!',
                    }}
                    placeholder="Status"
                    isClearable
                    onClear={() =>
                        RouteUtil.updateParams({ status: undefined })
                    }
                    onSelectionChange={(value) =>
                        RouteUtil.updateParams({
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
                            <SelectItem key={jobStatus.code}>
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
                            </SelectItem>
                        ))}
                </Select>

                <Select
                    className="min-w-34"
                    size="sm"
                    variant="bordered"
                    classNames={{
                        trigger:
                            'shadow-none hover:shadow-SM border-border-default border cursor-pointer',
                        popoverContent: 'w-[200px]!',
                    }}
                    placeholder="Due in"
                    isClearable
                    onSelectionChange={(value) => {
                        const { dueAtFrom, dueAtTo } = getDueDateRange(
                            value.currentKey
                        )
                        RouteUtil.updateParams({
                            dueAtFrom: dueAtFrom?.split('T')[0],
                            dueAtTo: dueAtTo?.split('T')[0],
                        })
                    }}
                    renderValue={(items) => (
                        <p className="text-text-7">{items[0]?.textValue}</p>
                    )}
                >
                    {DUE_DATE_PRESETS.map((dueIn) => (
                        <SelectItem key={dueIn.key}>{dueIn.label}</SelectItem>
                    ))}
                </Select>
            </div>
        </div>
    )
}
