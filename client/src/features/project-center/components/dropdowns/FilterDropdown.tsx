import {
    Button,
    Chip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Input,
    Popover,
    PopoverContent,
    PopoverTrigger,
    ScrollShadow,
    Select,
    SelectItem,
    SelectProps,
} from '@heroui/react'
// HeroUI requires these types for the DatePicker state
import { getLocalTimeZone, parseAbsoluteToLocal } from '@internationalized/date'
import { useSuspenseQueries } from '@tanstack/react-query'
import dayjs from 'dayjs' // Import Dayjs
import { AlertCircle, ChevronDown, Filter, Plus, Trash2 } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'

import {
    jobStatusesListOptions,
    jobTypesListOptions,
    usersListOptions,
} from '@/lib/queries'
import { jobFiltersSchema, TJobFilters } from '@/lib/validationSchemas'

import { HeroDateRangePicker } from '../../../../shared/components/ui/hero-date-picker'

// --- Types ---
type FilterType = 'text' | 'select' | 'date_range' | 'number_range'

interface FieldDef {
    key: string
    label: string
    dtoKeys: (keyof TJobFilters)[]
}

interface FilterConfig {
    key: string
    label: string
    type: FilterType
    fields?: FieldDef[]
    dtoKeys?: (keyof TJobFilters)[]
    options?: { label: string; value: string }[]
}

interface ActiveFilter {
    id: string
    configKey: string
    fieldKey?: string
    value: any
}

interface FilterBuilderProps {
    defaultFilters?: Partial<TJobFilters>
    onApply: (filters: TJobFilters) => void
    className?: string
}

// --- Main Component ---
export const FilterBuilder: React.FC<FilterBuilderProps> = ({
    onApply,
    defaultFilters,
    className,
}) => {
    console.log(defaultFilters)

    const [isOpen, setIsOpen] = useState(false)
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
    const [errors, setErrors] = useState<string[]>([])

    // --- 1. Data Fetching ---
    const [
        {
            data: { jobStatuses },
        },
        {
            data: { jobTypes },
        },
        {
            data: { users },
        },
    ] = useSuspenseQueries({
        queries: [
            jobStatusesListOptions(),
            jobTypesListOptions(),
            usersListOptions(),
        ],
    })

    // --- 2. Configuration ---
    const FILTER_CONFIG: FilterConfig[] = useMemo(() => {
        // Thêm giá trị mặc định "" hoặc lọc bỏ nếu displayName/code bị thiếu
        const statusOptions = jobStatuses.map((i) => ({
            label: i.displayName ?? 'Unknown Status', // Sử dụng Nullish coalescing
            value: i.code ?? '',
        }))

        const typeOptions = jobTypes.map((i) => ({
            label: i.displayName ?? 'Unknown Type',
            value: i.code ?? '',
        }))

        const assigneeOptions = users.map((u) => ({
            label: u.displayName || u.username || 'Unknown User',
            value: u.username || '',
        }))

        // Ép kiểu array này là FilterConfig[] để TS không tự suy luận kiểu hẹp hơn
        const config: FilterConfig[] = [
            {
                key: 'clientName',
                label: 'Client Name',
                type: 'text',
                dtoKeys: ['clientName'],
            },
            {
                key: 'assignee',
                label: 'Assignee',
                type: 'select',
                dtoKeys: ['assignee'],
                options: assigneeOptions,
            },
            {
                key: 'status',
                label: 'Status',
                type: 'select',
                dtoKeys: ['status'],
                options: statusOptions,
            },
            {
                key: 'type',
                label: 'Job Type',
                type: 'select',
                dtoKeys: ['type'],
                options: typeOptions,
            },
            {
                key: 'date_group',
                label: 'Date',
                type: 'date_range',
                fields: [
                    {
                        key: 'createdAt',
                        label: 'Date Created',
                        dtoKeys: ['createdAtFrom', 'createdAtTo'],
                    },
                    {
                        key: 'dueAt',
                        label: 'Date Due',
                        dtoKeys: ['dueAtFrom', 'dueAtTo'],
                    },
                    {
                        key: 'completedAt',
                        label: 'Date Completed',
                        dtoKeys: ['completedAtFrom', 'completedAtTo'],
                    },
                    {
                        key: 'finishedAt',
                        label: 'Date Finished',
                        dtoKeys: ['finishedAtFrom', 'finishedAtTo'],
                    },
                ],
            },
            {
                key: 'cost_group',
                label: 'Cost',
                type: 'number_range',
                fields: [
                    {
                        key: 'incomeCost',
                        label: 'Income Cost',
                        dtoKeys: ['incomeCostMin', 'incomeCostMax'],
                    },
                    {
                        key: 'staffCost',
                        label: 'Staff Cost',
                        dtoKeys: ['staffCostMin', 'staffCostMax'],
                    },
                ],
            },
        ]
        return config
    }, [jobStatuses, jobTypes, users])

    // --- 3. Initialization (Using Day.js) ---
    useEffect(() => {
        if (!isOpen || !defaultFilters) return

        const newActiveFilters: ActiveFilter[] = []

        FILTER_CONFIG.forEach((config) => {
            // A. Grouped Fields
            if (config.fields) {
                config.fields.forEach((field) => {
                    const [k1, k2] = field.dtoKeys
                    const hasData =
                        defaultFilters[k1] !== undefined ||
                        (k2 && defaultFilters[k2] !== undefined)

                    if (hasData) {
                        let value: any = null

                        // Parse Dates using Day.js
                        if (config.type === 'date_range') {
                            const s = defaultFilters[k1] as string
                            const e = defaultFilters[k2!] as string

                            if (s && e) {
                                const startDay = dayjs(s)
                                const endDay = dayjs(e)

                                if (startDay.isValid() && endDay.isValid()) {
                                    // Convert Day.js -> ISO String -> ZonedDateTime (Required by HeroUI)
                                    try {
                                        value = {
                                            start: parseAbsoluteToLocal(
                                                startDay.toISOString()
                                            ),
                                            end: parseAbsoluteToLocal(
                                                endDay.toISOString()
                                            ),
                                        }
                                    } catch (err) {
                                        console.error(
                                            'Date parsing failed',
                                            err
                                        )
                                    }
                                }
                            }
                        } else if (config.type === 'number_range') {
                            value = {
                                min: defaultFilters[k1],
                                max: defaultFilters[k2!],
                            }
                        }

                        if (value) {
                            newActiveFilters.push({
                                id: crypto.randomUUID(),
                                configKey: config.key,
                                fieldKey: field.key,
                                value,
                            })
                        }
                    }
                })
            }
            // B. Simple Fields
            else if (config.dtoKeys) {
                const k1 = config.dtoKeys[0]
                const val = defaultFilters[k1]
                if (val !== undefined && val !== null) {
                    let finalValue = val
                    if (config.type === 'select') {
                        finalValue = new Set(
                            Array.isArray(val) ? val : [val]
                        ) as unknown as string
                    }
                    newActiveFilters.push({
                        id: crypto.randomUUID(),
                        configKey: config.key,
                        value: finalValue,
                    })
                }
            }
        })

        setActiveFilters(newActiveFilters)
    }, [isOpen, defaultFilters, FILTER_CONFIG])

    // --- 4. Logic Helpers ---
    const availableFilters = useMemo(() => {
        return FILTER_CONFIG.filter((config) => {
            if (config.fields) {
                const usedFieldKeys = activeFilters
                    .filter((f) => f.configKey === config.key)
                    .map((f) => f.fieldKey)
                return config.fields.some((f) => !usedFieldKeys.includes(f.key))
            }
            return !activeFilters.some((f) => f.configKey === config.key)
        })
    }, [activeFilters, FILTER_CONFIG])

    // --- 5. Actions ---
    const addFilter = (configKey: string) => {
        const config = FILTER_CONFIG.find((c) => c.key === configKey)
        if (!config) return

        let fieldKey = undefined
        if (config.fields) {
            const usedFields = activeFilters
                .filter((f) => f.configKey === configKey)
                .map((f) => f.fieldKey)
            const nextAvailable = config.fields.find(
                (f) => !usedFields.includes(f.key)
            )
            fieldKey = nextAvailable?.key
        }

        setActiveFilters((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                configKey,
                fieldKey,
                value: null,
            },
        ])
    }

    const removeFilter = (id: string) => {
        setActiveFilters((prev) => prev.filter((f) => f.id !== id))
    }

    const updateFilterValue = (id: string, value: any) => {
        setActiveFilters((prev) =>
            prev.map((f) => (f.id === id ? { ...f, value } : f))
        )
    }

    const updateFilterField = (id: string, newFieldKey: string) => {
        setActiveFilters((prev) =>
            prev.map((f) =>
                f.id === id ? { ...f, fieldKey: newFieldKey, value: null } : f
            )
        )
    }

    const onClearAll = () => {
        const clearPayload: any = {}
        FILTER_CONFIG.forEach((c) => {
            if (c.dtoKeys)
                c.dtoKeys.forEach((k) => (clearPayload[k] = undefined))
            if (c.fields)
                c.fields.forEach((f) =>
                    f.dtoKeys.forEach((k) => (clearPayload[k] = undefined))
                )
        })

        onApply(clearPayload)
        setActiveFilters([])
        setIsOpen(false)
    }

    const handleApply = () => {
        setErrors([])
        const rawData: Record<string, any> = {}

        activeFilters.forEach((filter) => {
            const config = FILTER_CONFIG.find((c) => c.key === filter.configKey)
            if (!config || !filter.value) return

            let keys: (keyof TJobFilters)[] = []
            if (config.fields && filter.fieldKey) {
                const field = config.fields.find(
                    (f) => f.key === filter.fieldKey
                )
                if (field) keys = field.dtoKeys
            } else if (config.dtoKeys) {
                keys = config.dtoKeys
            }

            if (!keys.length) return

            // --- PAYLOAD GENERATION WITH DAYJS ---
            if (
                config.type === 'date_range' &&
                filter.value.start &&
                filter.value.end
            ) {
                const tz = getLocalTimeZone()

                // 1. ZonedDateTime -> Native JS Date
                const jsDateStart = filter.value.start.toDate(tz)
                const jsDateEnd = filter.value.end.toDate(tz)

                // 2. Native JS Date -> Dayjs -> ISO String
                if (keys[0])
                    rawData[keys[0]] = dayjs(jsDateStart)
                        .toISOString()
                        .split('T')[0]
                if (keys[1])
                    rawData[keys[1]] = dayjs(jsDateEnd)
                        .toISOString()
                        .split('T')[0]
            } else if (config.type === 'number_range') {
                if (filter.value.min && keys[0])
                    rawData[keys[0]] = filter.value.min
                if (filter.value.max && keys[1])
                    rawData[keys[1]] = filter.value.max
            } else if (config.type === 'select') {
                const val =
                    filter.value instanceof Set
                        ? Array.from(filter.value)
                        : filter.value
                if (keys[0] && val?.length > 0) rawData[keys[0]] = val
            } else {
                if (keys[0]) rawData[keys[0]] = filter.value
            }
        })

        // Validate
        const result = jobFiltersSchema.safeParse(rawData)
        if (!result.success) {
            console.log(result.error)
            // setErrors(
            //     result.error.errors.map(
            //         (e) => `${e.path.join('.')}: ${e.message}`
            //     )
            // )
        } else {
            // Build Reset Object to clear removed filters
            const resetObj: any = {}
            FILTER_CONFIG.forEach((c) => {
                const checkAndReset = (keys: string[]) => {
                    keys.forEach((k) => {
                        if (!(k in rawData)) resetObj[k] = undefined
                    })
                }
                if (c.dtoKeys) checkAndReset(c.dtoKeys)
                if (c.fields) c.fields.forEach((f) => checkAndReset(f.dtoKeys))
            })

            onApply({ ...resetObj, ...result.data })
            setIsOpen(false)
        }
    }

    return (
        <Popover
            isOpen={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open)
                if (!open) setErrors([])
            }}
            placement="bottom-start"
            offset={10}
            classNames={{ content: 'w-[680px] p-0 bg-content1' }}
        >
            <PopoverTrigger>
                <Button
                    size="sm"
                    variant="bordered"
                    className={className}
                    startContent={<Filter className="text-small" size={14} />}
                    endContent={
                        <ChevronDown
                            className="text-small opacity-50"
                            size={14}
                        />
                    }
                >
                    Filter
                </Button>
            </PopoverTrigger>

            <PopoverContent>
                {/* Header */}
                <div className="w-full px-4 py-3 flex justify-between items-center bg-default-50/50 border-b border-default-100">
                    <span className="text-small font-semibold text-text-default">
                        Conditions
                        {activeFilters.length > 0 && (
                            <Chip size="sm" color="warning" className="ml-2">
                                {activeFilters.length} active
                            </Chip>
                        )}
                    </span>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={onClearAll}
                            isDisabled={activeFilters.length === 0}
                        >
                            Clear all
                        </Button>
                        <Button size="sm" color="primary" onPress={handleApply}>
                            Apply Filters
                        </Button>
                    </div>
                </div>

                {/* Errors */}
                {errors.length > 0 && (
                    <div className="mx-4 mt-3 bg-danger-50 border border-danger-200 rounded-md p-2 flex items-start gap-2">
                        <AlertCircle
                            className="text-danger-500 mt-0.5 shrink-0"
                            size={16}
                        />
                        <div className="text-xs text-danger-600">
                            <p className="font-semibold">Validation Error</p>
                            <ul className="list-disc list-inside mt-1">
                                {errors.map((e, i) => (
                                    <li key={i}>{e}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Body */}
                <ScrollShadow className="w-full max-h-[60vh] p-4 flex flex-col gap-3">
                    {activeFilters.length === 0 ? (
                        <div className="text-center py-8 text-default-400 border-2 border-dashed border-default-200 rounded-lg">
                            <p className="text-sm font-medium text-default-600">
                                No filters active
                            </p>
                            <p className="text-xs mt-1">
                                Add a condition below to narrow down your
                                results.
                            </p>
                        </div>
                    ) : (
                        activeFilters.map((filter, index) => (
                            <FilterRow
                                key={filter.id}
                                index={index}
                                filter={filter}
                                activeFilters={activeFilters}
                                config={
                                    FILTER_CONFIG.find(
                                        (c) => c.key === filter.configKey
                                    )!
                                }
                                onRemove={() => removeFilter(filter.id)}
                                onChange={(val) =>
                                    updateFilterValue(filter.id, val)
                                }
                                onFieldChange={(key) =>
                                    updateFilterField(filter.id, key)
                                }
                            />
                        ))
                    )}

                    {/* Add Button */}
                    <div className="mt-2">
                        <Dropdown>
                            <DropdownTrigger>
                                <Button
                                    startContent={
                                        <Plus
                                            className="text-default-500"
                                            size={16}
                                        />
                                    }
                                    variant="ghost"
                                    size="sm"
                                    className="justify-start text-default-500 font-normal"
                                    isDisabled={availableFilters.length === 0}
                                >
                                    Add condition
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                aria-label="Add Filter"
                                onAction={(key) => addFilter(key as string)}
                                variant="faded"
                                items={availableFilters}
                            >
                                {(config) => (
                                    <DropdownItem
                                        key={config.key}
                                        description={`Filter by ${config.label}`}
                                        startContent={
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                        }
                                    >
                                        {config.label}
                                    </DropdownItem>
                                )}
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </ScrollShadow>
            </PopoverContent>
        </Popover>
    )
}

// --- Sub-Components (Unchanged from previous version, included for completeness) ---

interface FilterRowProps {
    index: number
    filter: ActiveFilter
    activeFilters: ActiveFilter[]
    config: FilterConfig
    onRemove: () => void
    onChange: (value: any) => void
    onFieldChange: (fieldKey: string) => void
}

const FilterRow: React.FC<FilterRowProps> = ({
    index,
    filter,
    activeFilters,
    config,
    onRemove,
    onChange,
    onFieldChange,
}) => {
    if (!config) return null
    const isGroup = !!config.fields

    const getOperatorLabel = () => {
        switch (config.type) {
            case 'text':
                return 'contains'
            case 'select':
                return 'is any of'
            case 'date_range':
            case 'number_range':
                return 'is between'
            default:
                return 'is'
        }
    }

    const disabledKeys = isGroup
        ? activeFilters
              .filter((f) => f.configKey === config.key && f.id !== filter.id)
              .map((f) => f.fieldKey)
        : []

    return (
        <div className="flex items-center gap-2 text-sm animate-appearance-in group">
            <div className="w-11.25 shrink-0 text-right font-medium text-default-400 select-none text-xs">
                {index === 0 ? 'Where' : 'And'}
            </div>

            <div className="grow flex items-center gap-1 pl-1 pr-1 py-1 rounded-medium border border-default-200 bg-content2/40 hover:bg-content2 transition-colors hover:border-default-300">
                {isGroup ? (
                    <Select
                        aria-label="Select Field"
                        size="sm"
                        variant="bordered"
                        classNames={{
                            trigger:
                                'h-6 min-h-6 border-none shadow-none bg-default-100 rounded data-[hover=true]:bg-default-200 mr-1 w-auto min-w-42',
                            mainWrapper: 'w-42!',
                            base: 'w-42!',
                            value: 'text-text-default font-medium text-xs group-data-[has-value=true]:text-text-default',
                            innerWrapper: 'w-auto',
                            selectorIcon: 'text-default-400',
                        }}
                        selectedKeys={filter.fieldKey ? [filter.fieldKey] : []}
                        onSelectionChange={(keys) =>
                            onFieldChange(Array.from(keys)[0] as string)
                        }
                        disallowEmptySelection
                        disabledKeys={
                            disabledKeys as SelectProps['disabledKeys']
                        }
                        renderValue={(items) =>
                            items.map((item) => item.textValue)
                        }
                    >
                        {(config.fields || []).map((f) => (
                            <SelectItem key={f.key} textValue={f.label}>
                                {f.label}
                            </SelectItem>
                        ))}
                    </Select>
                ) : (
                    <div className="flex items-center gap-2 mr-1 py-1 px-2.5 bg-default-100 border border-transparent rounded text-text-default font-medium text-xs whitespace-nowrap">
                        {config.label}
                    </div>
                )}

                <span className="text-default-400 text-xs whitespace-nowrap mr-2">
                    {getOperatorLabel()}
                </span>

                <div className="grow min-w-50">
                    <FilterInput
                        config={config}
                        value={filter.value}
                        onChange={onChange}
                    />
                </div>

                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    className="text-default-300 data-[hover=true]:text-danger min-w-7 w-7 h-7"
                    onPress={onRemove}
                >
                    <Trash2 size={14} />
                </Button>
            </div>
        </div>
    )
}

const FilterInput = ({
    config,
    value,
    onChange,
}: {
    config: FilterConfig
    value: any
    onChange: (val: any) => void
}) => {
    if (config.type === 'text') {
        return (
            <Input
                size="sm"
                variant="bordered"
                classNames={{
                    inputWrapper:
                        'h-7 min-h-0 border-none shadow-none bg-transparent group-data-[focus=true]:bg-default-100',
                    input: 'text-small',
                }}
                placeholder="Type a value..."
                value={value || ''}
                onValueChange={onChange}
            />
        )
    }

    if (config.type === 'select') {
        return (
            <Select
                size="sm"
                variant="bordered"
                classNames={{
                    trigger:
                        'h-7 min-h-0 border-none shadow-none bg-transparent',
                    value: 'text-small',
                }}
                placeholder="Select options"
                selectionMode="multiple"
                selectedKeys={
                    value instanceof Set ? value : new Set(value || [])
                }
                onSelectionChange={(keys) => onChange(keys)}
            >
                {(config.options || []).map((opt) => (
                    <SelectItem key={opt.value} textValue={opt.label}>
                        {opt.label}
                    </SelectItem>
                ))}
            </Select>
        )
    }

    if (config.type === 'date_range') {
        console.log(new Date(value?.start))

        return (
            <HeroDateRangePicker
                size="sm"
                variant="bordered"
                classNames={{
                    inputWrapper:
                        'h-7 min-h-0 border-none shadow-none bg-transparent',
                }}
                hideTimeZone
                value={{
                    start: dayjs(value?.start ?? ''),
                    end: dayjs(value?.end ?? ''),
                }}
                onChange={(range) => {
                    console.log(range)

                    onChange(range)
                }}
                aria-label={config.label}
            />
        )
    }

    if (config.type === 'number_range') {
        return (
            <div className="flex items-center gap-2 px-1">
                <input
                    type="number"
                    className="w-20 bg-transparent text-sm outline-none border-b border-default-300 focus:border-primary placeholder:text-default-300 py-0.5"
                    placeholder="Min"
                    value={value?.min || ''}
                    onChange={(e) =>
                        onChange({ ...value, min: e.target.value })
                    }
                />
                <span className="text-default-400 text-xs">-</span>
                <input
                    type="number"
                    className="w-20 bg-transparent text-sm outline-none border-b border-default-300 focus:border-primary placeholder:text-default-300 py-0.5"
                    placeholder="Max"
                    value={value?.max || ''}
                    onChange={(e) =>
                        onChange({ ...value, max: e.target.value })
                    }
                />
            </div>
        )
    }
    return null
}
