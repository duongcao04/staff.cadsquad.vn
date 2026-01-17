import { useJobStatuses } from '@/lib/queries'
import { DUE_DATE_PRESETS, getDueDateRange } from '@/lib/utils'
import { TJobFilters } from '@/lib/validationSchemas'
import { HeroButton, HeroSelect, HeroSelectItem } from '@/shared/components'
import { ProjectCenterTabEnum } from '@/shared/enums'
import {
    Divider,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    Input,
} from '@heroui/react'
import {
    ChevronDownIcon,
    Columns3Cog,
    EllipsisVertical,
    RefreshCw,
    SearchIcon,
    Sheet,
    SquareChartGantt,
    SquareKanban,
} from 'lucide-react'
import ProjectCenterTableBulkActions from './dropdowns/ProjectCenterTableBulkActions'
import { FilterBuilder } from './dropdowns/FilterDropdown'

type Props = {
    searchKeywords?: string
    onSearchKeywordsChange: (val?: string) => void
    isLoadingData: boolean
    onRefresh: () => void
    filters: Partial<TJobFilters>
    onFiltersChange: (newFilters: TJobFilters) => void
    openViewColDrawer: () => void
    onDownloadCsv: () => void
    tab: ProjectCenterTabEnum
    selectedKeys: Set<string> | 'all'
}

export function ProjectCenterToolbar({
    searchKeywords,
    onSearchKeywordsChange,
    isLoadingData,
    onRefresh,
    filters,
    onFiltersChange,
    openViewColDrawer,
    onDownloadCsv,
    tab,
    selectedKeys,
}: Props) {
    const { data: jobStatuses } = useJobStatuses()

    const canShowStatusFilter = [
        'active',
        'priority',
        'late',
        'cancelled',
    ].includes(tab)

    return (
        <div className="w-full flex justify-between gap-3 items-end">
            {/* --- Left Side: Search & Actions --- */}
            <div className="flex items-center justify-start gap-4">
                <Input
                    isClearable
                    classNames={{
                        base: 'w-[450px]',
                        mainWrapper: 'w-[450px]',
                        inputWrapper:
                            'hover:shadow-SM bg-background border-border-default border',
                    }}
                    variant="bordered"
                    size="sm"
                    placeholder="Search by name..."
                    startContent={
                        <div className="w-4 flex items-center justify-center">
                            <SearchIcon
                                className="text-small text-text-6"
                                size={14}
                            />
                        </div>
                    }
                    value={searchKeywords}
                    onClear={() => onSearchKeywordsChange('')}
                    onValueChange={onSearchKeywordsChange}
                />

                <Divider orientation="vertical" className="h-5" />

                <div className="flex gap-3">
                    <HeroButton
                        startContent={
                            <RefreshCw
                                size={14}
                                className={`text-small ${isLoadingData ? 'animate-spin-smooth' : ''}`}
                            />
                        }
                        className="border-1"
                        variant="bordered"
                        size="sm"
                        onPress={onRefresh}
                    >
                        <span className="font-medium">Refresh</span>
                    </HeroButton>

                    {/* TODO: */}
                    {false && (
                        <FilterBuilder
                            defaultFilters={filters}
                            onApply={onFiltersChange}
                            className="border-1"
                        />
                    )}

                    {/* View Switcher Dropdown */}
                    <Dropdown placement="bottom-start">
                        <DropdownTrigger className="hidden sm:flex">
                            <HeroButton
                                endContent={
                                    <ChevronDownIcon
                                        className="text-small"
                                        size={14}
                                    />
                                }
                                variant="bordered"
                                size="sm"
                                className="border-1"
                            >
                                <span className="font-medium">View</span>
                            </HeroButton>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="Table Views"
                            selectedKeys={['table_view']}
                            disabledKeys={['gantt_view', 'kanban_view']}
                        >
                            <DropdownItem
                                key="gantt_view"
                                startContent={<SquareChartGantt size={14} />}
                            >
                                Gantt
                            </DropdownItem>
                            <DropdownItem
                                key="kanban_view"
                                startContent={<SquareKanban size={14} />}
                            >
                                Kanban
                            </DropdownItem>
                            <DropdownItem
                                key="table_view"
                                startContent={<Sheet size={14} />}
                            >
                                Table
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>

                    {/* Settings Dropdown */}
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <HeroButton
                                variant="bordered"
                                size="sm"
                                isIconOnly
                                className="border-1"
                            >
                                <EllipsisVertical
                                    className="text-small"
                                    size={14}
                                />
                            </HeroButton>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="View settings dropdown">
                            <DropdownSection title="View settings">
                                <DropdownItem
                                    key="columns"
                                    startContent={
                                        <Columns3Cog
                                            size={16}
                                            className="text-text-default"
                                        />
                                    }
                                    onPress={openViewColDrawer}
                                >
                                    View columns
                                </DropdownItem>
                            </DropdownSection>
                        </DropdownMenu>
                    </Dropdown>
                </div>

                <Divider orientation="vertical" className="h-5" />

                <div className="flex gap-3">
                    {/* Status Filter */}
                    {canShowStatusFilter && (
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
                                onFiltersChange({
                                    ...filters,
                                    status: undefined,
                                })
                            }
                            onSelectionChange={(value) => {
                                onFiltersChange({
                                    ...filters,
                                    status: Array.from(value).join(','),
                                })
                            }}
                            renderValue={(items) => (
                                <p className="text-text-7">
                                    {items.length} status
                                    {items.length > 1 ? 'es' : ''}
                                </p>
                            )}
                        >
                            {jobStatuses.map((js) => (
                                <HeroSelectItem key={js.code}>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="size-2 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    js.hexColor || '#000',
                                            }}
                                        />
                                        <p>{js.displayName}</p>
                                    </div>
                                </HeroSelectItem>
                            ))}
                        </HeroSelect>
                    )}

                    {/* Due Date Filter */}
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
                            onFiltersChange({
                                ...filters,
                                dueAtFrom: dueAtFrom?.split('T')[0],
                                dueAtTo: dueAtTo?.split('T')[0],
                            })
                        }}
                        renderValue={(items) => (
                            <p className="text-text-7">{items[0]?.textValue}</p>
                        )}
                    >
                        {DUE_DATE_PRESETS.map((d) => (
                            <HeroSelectItem key={d.key}>
                                {d.label}
                            </HeroSelectItem>
                        ))}
                    </HeroSelect>
                </div>

                {/* Bulk Actions */}

                <Divider orientation="vertical" className="h-5" />
                {(selectedKeys === 'all' || selectedKeys.size > 0) && (
                    <div className="flex items-center justify-start gap-3">
                        <p className="text-sm">
                            {selectedKeys === 'all'
                                ? 'All items selected'
                                : `${selectedKeys.size} selected`}
                        </p>
                        <ProjectCenterTableBulkActions keys={selectedKeys} />
                    </div>
                )}
            </div>

            {/* TODO: */}
            {/* --- Right Side: Export --- */}
            {false && (
                <div>
                    <HeroButton
                        startContent={
                            <Sheet className="text-small" size={14} />
                        }
                        variant="flat"
                        size="sm"
                        className="shadow-SM"
                        onPress={onDownloadCsv}
                    >
                        <span className="font-medium">Download as .csv</span>
                    </HeroButton>
                </div>
            )}
        </div>
    )
}
