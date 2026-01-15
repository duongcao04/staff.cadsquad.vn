import { Divider, Slider } from '@heroui/react'
import { Avatar, Image } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import { Handshake, Landmark, Layers2, Loader, UsersRound } from 'lucide-react'
import { useState } from 'react'

import {
    useJobStatuses,
    useJobTypes,
    usePaymentChannels,
    useUsers,
} from '@/lib/queries'
import { PAID_STATUS_ARRAY } from '@/lib/utils'
import { TJobFilters } from '@/lib/validationSchemas'

import { HeroCard, HeroCardBody, HeroCardHeader } from '../../../../shared/components/ui/hero-card'
import { HeroDateRangePicker } from '../../../../shared/components/ui/hero-date-picker'
import { HeroNumberInput } from '../../../../shared/components/ui/hero-number-input'
import { HeroSelect, HeroSelectItem } from '../../../../shared/components/ui/hero-select'

type FilterViewProps = {
    filters: TJobFilters
    onFiltersChange: (filters: TJobFilters) => void
}
export default function FilterView({
    filters: defaultFilters,
}: FilterViewProps) {
    const { data: jobStatuses, isLoading: loadingJobStatuses } =
        useJobStatuses()
    const { data: paymentChannels, isLoading: loadingPaymentChannels } =
        usePaymentChannels()
    const { data: jobTypes, isLoading: loadingJobTypes } = useJobTypes()
    const { data: users, isLoading: loadingUsers } = useUsers()

    const [filters, setFilters] = useState<TJobFilters>(defaultFilters)

    const handleDateChange = (
        key: 'dueAt' | 'createdAt' | 'completedAt' | 'finishedAt',
        val: { start: Dayjs; end: Dayjs } | null
    ) => {
        const start = val ? val.start.format('YYYY-MM-DD') : undefined
        const end = val ? val.end.format('YYYY-MM-DD') : undefined

        setFilters((prev: TJobFilters) => {
            switch (key) {
                case 'dueAt':
                    return { ...prev, dueAtFrom: start, dueAtTo: end }
                case 'createdAt':
                    return { ...prev, createdAtFrom: start, createdAtTo: end }
                case 'completedAt':
                    return {
                        ...prev,
                        completedAtFrom: start,
                        completedAtTo: end,
                    }
                case 'finishedAt':
                    return { ...prev, finishedAtFrom: start, finishedAtTo: end }
                default:
                    return prev
            }
        })
    }

    const handleIncomeMinChange = (val: string) => {
        setFilters((prev: TJobFilters) => ({
            ...prev,
            incomeCostMin: val,
        }))
    }

    const handleIncomeMaxChange = (val: string) => {
        setFilters((prev: TJobFilters) => ({
            ...prev,
            incomeCostMax: val,
        }))
    }

    const handleStaffCostMinChange = (val: string) => {
        setFilters((prev: TJobFilters) => ({ ...prev, staffCostMin: val }))
    }

    const handleStaffCostMaxChange = (val: string) => {
        setFilters((prev: TJobFilters) => ({ ...prev, staffCostMax: val }))
    }

    return (
        <div className="relative size-full">
            <div className="pb-10">
                <HeroCard className="p-0 border-none shadow-none">
                    <HeroCardHeader className="px-1.5">
                        <p className="font-medium text-base">Date range</p>
                    </HeroCardHeader>
                    <HeroCardBody className="pt-0 px-2 space-y-6">
                        <HeroDateRangePicker
                            label="Create at"
                            value={
                                filters.createdAtFrom && filters.createdAtTo
                                    ? {
                                          start: dayjs(filters.createdAtFrom),
                                          end: dayjs(filters.createdAtTo),
                                      }
                                    : null
                            }
                            isClearable
                            onChange={(range) =>
                                handleDateChange('createdAt', range)
                            }
                            variant="bordered"
                            labelPlacement="outside"
                        />
                        <HeroDateRangePicker
                            label="Due in"
                            value={
                                filters.dueAtFrom && filters.dueAtTo
                                    ? {
                                          start: dayjs(filters.dueAtFrom),
                                          end: dayjs(filters.dueAtTo),
                                      }
                                    : null
                            }
                            isClearable
                            onChange={(range) =>
                                handleDateChange('dueAt', range)
                            }
                            variant="bordered"
                            labelPlacement="outside"
                        />
                        <HeroDateRangePicker
                            label="Completed at"
                            value={
                                filters.completedAtFrom && filters.completedAtTo
                                    ? {
                                          start: dayjs(filters.completedAtFrom),
                                          end: dayjs(filters.completedAtTo),
                                      }
                                    : null
                            }
                            isClearable
                            onChange={(range) =>
                                handleDateChange('completedAt', range)
                            }
                            variant="bordered"
                            labelPlacement="outside"
                        />
                        <HeroDateRangePicker
                            label="Finish at"
                            value={
                                filters.finishedAtFrom && filters.finishedAtTo
                                    ? {
                                          start: dayjs(filters.finishedAtFrom),
                                          end: dayjs(filters.finishedAtTo),
                                      }
                                    : null
                            }
                            isClearable
                            onChange={(range) =>
                                handleDateChange('finishedAt', range)
                            }
                            variant="bordered"
                            labelPlacement="outside"
                        />
                    </HeroCardBody>
                </HeroCard>

                <Divider className="my-2" />

                <HeroCard className="p-0 border-none shadow-none">
                    <HeroCardHeader className="px-1.5">
                        <p className="font-medium text-base">Cost range</p>
                    </HeroCardHeader>
                    <HeroCardBody className="pt-0 px-2 space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="font-medium text-text-default text-sm">
                                    Income cost
                                </p>
                                <div>
                                    <button className="link cursor-pointer hover:underline underline-offset-2 transition duration-150">
                                        <p className="font-medium text-text-subdued">
                                            Reset
                                        </p>
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Slider
                                    // 1. FIX: Use Nullish Coalescing (??) to allow '0' as a valid value
                                    value={[
                                        Number(filters.incomeCostMin ?? 0),
                                        Number(
                                            filters.incomeCostMax ?? 9999999
                                        ),
                                    ]}
                                    // 2. FIX: Handle the array value from the slider
                                    onChange={(val) => {
                                        // Ensure val is an array (Range Slider always returns number[])
                                        if (Array.isArray(val)) {
                                            const [newMin, newMax] = val

                                            // Convert to string if your state stores strings (implied by Number() usage)
                                            handleIncomeMinChange(
                                                newMin.toString()
                                            )
                                            handleIncomeMaxChange(
                                                newMax.toString()
                                            )
                                        }
                                    }}
                                    // Keep your formatting and visual props
                                    formatOptions={{
                                        style: 'currency',
                                        currency: 'USD',
                                    }}
                                    maxValue={9999999}
                                    minValue={0}
                                    step={50}
                                    showTooltip
                                    // Inputs inside the slider tracks
                                    startContent={
                                        <HeroNumberInput
                                            value={filters.incomeCostMin}
                                            onValueChange={(val) => {
                                                handleIncomeMinChange(
                                                    val?.toString() ?? ''
                                                )
                                            }}
                                            placeholder="0"
                                            size="sm"
                                            hideStepper
                                        />
                                    }
                                    endContent={
                                        <HeroNumberInput
                                            value={filters.incomeCostMax}
                                            onValueChange={(val) => {
                                                handleIncomeMaxChange(
                                                    val?.toString() ?? ''
                                                )
                                            }}
                                            placeholder="9999999"
                                            size="sm"
                                            hideStepper
                                        />
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="font-medium text-text-default text-sm">
                                    Staff cost
                                </p>
                                <div>
                                    <button className="link cursor-pointer hover:underline underline-offset-2 transition duration-150">
                                        <p className="font-medium text-text-subdued">
                                            Reset
                                        </p>
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Slider
                                    // 1. FIX: Use Nullish Coalescing (??) to allow '0' as a valid value
                                    value={[
                                        Number(filters.staffCostMin ?? 0),
                                        Number(filters.staffCostMax ?? 9999999),
                                    ]}
                                    // 2. FIX: Handle the array value from the slider
                                    onChange={(val) => {
                                        // Ensure val is an array (Range Slider always returns number[])
                                        if (Array.isArray(val)) {
                                            const [newMin, newMax] = val

                                            // Convert to string if your state stores strings (implied by Number() usage)
                                            handleStaffCostMinChange(
                                                newMin.toString()
                                            )
                                            handleStaffCostMaxChange(
                                                newMax.toString()
                                            )
                                        }
                                    }}
                                    // Keep your formatting and visual props
                                    formatOptions={{
                                        style: 'currency',
                                        currency: 'USD',
                                    }}
                                    maxValue={9999999}
                                    minValue={0}
                                    step={50}
                                    showTooltip
                                    // Inputs inside the slider tracks
                                    startContent={
                                        <HeroNumberInput
                                            value={filters.staffCostMin}
                                            onValueChange={(val) => {
                                                handleStaffCostMinChange(
                                                    val?.toString() ?? ''
                                                )
                                            }}
                                            placeholder="0"
                                            size="sm"
                                            hideStepper
                                        />
                                    }
                                    endContent={
                                        <HeroNumberInput
                                            value={filters.staffCostMax}
                                            onValueChange={(val) => {
                                                handleStaffCostMaxChange(
                                                    val?.toString() ?? ''
                                                )
                                            }}
                                            placeholder="9999999"
                                            size="sm"
                                            hideStepper
                                        />
                                    }
                                />
                            </div>
                        </div>
                    </HeroCardBody>
                </HeroCard>

                <Divider className="my-2" />

                <HeroCard className="p-0 border-none shadow-none">
                    <HeroCardHeader className="px-1.5 justify-start">
                        <Landmark size={14} className="text-text-default" />
                        <p className="font-medium text-base">Payment</p>
                    </HeroCardHeader>
                    <HeroCardBody className="pt-0 px-2 space-y-4">
                        <div className="mt-2 space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="font-medium text-text-default">
                                    Payment channel
                                </p>
                                <div>
                                    <button className="link cursor-pointer hover:underline underline-offset-2 transition duration-150">
                                        <p className="font-medium text-text-subdued">
                                            Reset
                                        </p>
                                    </button>
                                </div>
                            </div>
                            <HeroSelect
                                isLoading={loadingPaymentChannels}
                                id="payment channel"
                                name="payment channel"
                                placeholder="Select one or more payment channel"
                                selectionMode="multiple"
                                variant="bordered"
                                size="lg"
                                onChange={() => {
                                    // const value = e.target.value
                                    // formik.setFieldValue('departmentId', value)
                                    // formik.setFieldTouched(
                                    //     'departmentId',
                                    //     true,
                                    //     false
                                    // )
                                }}
                                renderValue={(selectedItems) => {
                                    return (
                                        <ul className="flex line-clamp-1 truncate">
                                            {selectedItems.map(
                                                (paymentChannel) => {
                                                    const item =
                                                        paymentChannels?.find(
                                                            (d) =>
                                                                d.id ===
                                                                paymentChannel.key
                                                        )
                                                    if (!item)
                                                        return (
                                                            <span
                                                                className="text-gray-400"
                                                                key={
                                                                    paymentChannel.key
                                                                }
                                                            >
                                                                Select one
                                                                department
                                                            </span>
                                                        )
                                                    return (
                                                        <p
                                                            key={
                                                                paymentChannel.key
                                                            }
                                                        >
                                                            {item.displayName}
                                                            {item.id !==
                                                                selectedItems[
                                                                    selectedItems.length -
                                                                        1
                                                                ].key && (
                                                                <span className="pr-1">
                                                                    ,
                                                                </span>
                                                            )}
                                                        </p>
                                                    )
                                                }
                                            )}
                                        </ul>
                                    )
                                }}
                            >
                                {paymentChannels?.map((paymentChannel) => (
                                    <HeroSelectItem key={paymentChannel.id}>
                                        <div className="flex items-center justify-start gap-2">
                                            <div
                                                className="size-2 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        paymentChannel.hexColor
                                                            ? paymentChannel.hexColor
                                                            : 'transparent',
                                                }}
                                            />
                                            <p>{paymentChannel.displayName}</p>
                                        </div>
                                    </HeroSelectItem>
                                ))}
                            </HeroSelect>
                        </div>
                        <div className="mt-2 space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="font-medium text-text-default">
                                    Status
                                </p>
                                <div>
                                    <button className="link cursor-pointer hover:underline underline-offset-2 transition duration-150">
                                        <p className="font-medium text-text-subdued">
                                            Reset
                                        </p>
                                    </button>
                                </div>
                            </div>
                            <HeroSelect
                                id="paymentStatus"
                                name="paymentStatus"
                                placeholder="Select payment status"
                                variant="bordered"
                                size="lg"
                                onChange={() => {
                                    // const value = e.target.value
                                    // formik.setFieldValue('departmentId', value)
                                    // formik.setFieldTouched(
                                    //     'departmentId',
                                    //     true,
                                    //     false
                                    // )
                                }}
                                renderValue={(selectedItems) => {
                                    const item = PAID_STATUS_ARRAY?.find(
                                        (d) => d.title === selectedItems[0].key
                                    )
                                    if (!item)
                                        return (
                                            <span className="text-gray-400">
                                                Select payment status
                                            </span>
                                        )
                                    return (
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        item.hexColor ||
                                                        'transparent',
                                                }}
                                            />
                                            <span>{item.title}</span>
                                        </div>
                                    )
                                }}
                            >
                                {PAID_STATUS_ARRAY?.map((pStatus) => (
                                    <HeroSelectItem key={pStatus.title}>
                                        <div className="flex items-center justify-start gap-2">
                                            <div
                                                className="size-2 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        pStatus.hexColor
                                                            ? pStatus.hexColor
                                                            : 'transparent',
                                                }}
                                            />
                                            <p>{pStatus.title}</p>
                                        </div>
                                    </HeroSelectItem>
                                ))}
                            </HeroSelect>
                        </div>
                    </HeroCardBody>
                </HeroCard>

                <Divider className="my-2" />

                <HeroCard className="p-0 border-none shadow-none">
                    <HeroCardBody className="px-2 space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center justify-start gap-1.5">
                                    <Loader
                                        size={14}
                                        className="text-text-default"
                                    />
                                    <p className="font-medium text-base">
                                        Status
                                    </p>
                                </div>
                                <div>
                                    <button className="link cursor-pointer hover:underline underline-offset-2 transition duration-150">
                                        <p className="font-medium text-text-subdued">
                                            Reset
                                        </p>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <HeroSelect
                                    isLoading={loadingJobStatuses}
                                    id="status"
                                    name="status"
                                    placeholder="Select one or more status"
                                    selectionMode="multiple"
                                    size="lg"
                                    onChange={() => {
                                        // const value = e.target.value
                                        // formik.setFieldValue('departmentId', value)
                                        // formik.setFieldTouched(
                                        //     'departmentId',
                                        //     true,
                                        //     false
                                        // )
                                    }}
                                    variant="bordered"
                                    renderValue={(selectedItems) => {
                                        return (
                                            <ul className="flex line-clamp-1 truncate">
                                                {selectedItems.map(
                                                    (jobStatus) => {
                                                        const item =
                                                            jobStatuses?.find(
                                                                (d) =>
                                                                    d.id ===
                                                                    jobStatus.key
                                                            )
                                                        if (!item)
                                                            return (
                                                                <span
                                                                    className="text-gray-400"
                                                                    key={
                                                                        jobStatus.key
                                                                    }
                                                                >
                                                                    Select one
                                                                    job status
                                                                </span>
                                                            )
                                                        return (
                                                            <p
                                                                key={
                                                                    jobStatus.key
                                                                }
                                                            >
                                                                {
                                                                    item.displayName
                                                                }
                                                                {item.id !==
                                                                    selectedItems[
                                                                        selectedItems.length -
                                                                            1
                                                                    ].key && (
                                                                    <span className="pr-1">
                                                                        ,
                                                                    </span>
                                                                )}
                                                            </p>
                                                        )
                                                    }
                                                )}
                                            </ul>
                                        )
                                    }}
                                >
                                    {jobStatuses?.map((jobStatus) => (
                                        <HeroSelectItem key={jobStatus.id}>
                                            <div className="flex items-center justify-start gap-2">
                                                <div
                                                    className="size-2 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            jobStatus.hexColor
                                                                ? jobStatus.hexColor
                                                                : 'transparent',
                                                    }}
                                                />
                                                <p>{jobStatus.displayName}</p>
                                            </div>
                                        </HeroSelectItem>
                                    ))}
                                </HeroSelect>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center justify-start gap-1.5">
                                    <UsersRound
                                        size={14}
                                        className="text-text-default"
                                    />
                                    <p className="font-medium text-base">
                                        Assignees
                                    </p>
                                </div>
                                <div>
                                    <button className="link cursor-pointer hover:underline underline-offset-2 transition duration-150">
                                        <p className="font-medium text-text-subdued">
                                            Reset
                                        </p>
                                    </button>
                                </div>
                            </div>
                            <HeroSelect
                                isLoading={loadingUsers}
                                id="assignee"
                                name="assignee"
                                placeholder="Select one or more assignee"
                                size="lg"
                                selectionMode="multiple"
                                variant="bordered"
                                onChange={() => {
                                    // const value = e.target.value
                                    // const valueArr = value
                                    //     .split(',')
                                    //     .filter((i) => i !== '')
                                    // formik.setFieldValue('userIds', valueArr)
                                    // formik.setFieldTouched('userIds', true, false)
                                }}
                                classNames={{
                                    base: 'overflow-hidden',
                                }}
                                renderValue={(selectedItems) => {
                                    return (
                                        <div className="flex line-clamp-1 truncate gap-1.5">
                                            <Avatar.Group
                                                max={{
                                                    count: 18,
                                                    style: {
                                                        color: '#f56a00',
                                                        backgroundColor:
                                                            '#fde3cf',
                                                    },
                                                }}
                                            >
                                                {selectedItems.map((user) => {
                                                    const item = users?.find(
                                                        (d) => d.id === user.key
                                                    )

                                                    const departmentColor =
                                                        item?.department
                                                            ? item?.department
                                                                  ?.hexColor
                                                            : 'transparent'
                                                    if (!item)
                                                        return (
                                                            <span
                                                                className="text-gray-400"
                                                                key={user.key}
                                                            >
                                                                Select one
                                                                assignee
                                                            </span>
                                                        )
                                                    return (
                                                        <Avatar
                                                            src={
                                                                item.avatar as string
                                                            }
                                                            key={user.key}
                                                            rootClassName="!border-2"
                                                            style={{
                                                                borderColor:
                                                                    departmentColor,
                                                            }}
                                                        />
                                                    )
                                                })}
                                            </Avatar.Group>
                                        </div>
                                    )
                                }}
                            >
                                {users?.map((usr) => {
                                    const departmentColor = usr.department
                                        ? usr.department?.hexColor
                                        : 'transparent'
                                    return (
                                        <HeroSelectItem key={usr.id}>
                                            <div className="flex items-center justify-start gap-4">
                                                <div className="size-9">
                                                    <Image
                                                        src={
                                                            usr.avatar as string
                                                        }
                                                        alt="user avatar"
                                                        rootClassName="!size-10 rounded-full"
                                                        className="size-full! rounded-full p-px border-2 object-cover"
                                                        preview={false}
                                                        style={{
                                                            borderColor:
                                                                departmentColor,
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-normal">
                                                        {usr.displayName}
                                                    </p>
                                                    <p className="text-text-muted">
                                                        {usr.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </HeroSelectItem>
                                    )
                                })}
                            </HeroSelect>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center justify-start gap-1.5">
                                    <Layers2
                                        size={14}
                                        className="text-text-default"
                                    />
                                    <p className="font-medium text-base">
                                        Type
                                    </p>
                                </div>
                                <div>
                                    <button className="link cursor-pointer hover:underline underline-offset-2 transition duration-150">
                                        <p className="font-medium text-text-subdued">
                                            Reset
                                        </p>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <HeroSelect
                                    isLoading={loadingJobTypes}
                                    id="jobTypes"
                                    name="jobTypes"
                                    placeholder="Select one or more type"
                                    selectionMode="multiple"
                                    variant="bordered"
                                    size="lg"
                                    onChange={() => {
                                        // const value = e.target.value
                                        // formik.setFieldValue('departmentId', value)
                                        // formik.setFieldTouched(
                                        //     'departmentId',
                                        //     true,
                                        //     false
                                        // )
                                    }}
                                    renderValue={(selectedItems) => {
                                        return (
                                            <ul className="flex line-clamp-1 truncate">
                                                {selectedItems.map(
                                                    (jobType) => {
                                                        const item =
                                                            jobTypes?.find(
                                                                (d) =>
                                                                    d.id ===
                                                                    jobType.key
                                                            )
                                                        if (!item)
                                                            return (
                                                                <span
                                                                    className="text-gray-400"
                                                                    key={
                                                                        jobType.key
                                                                    }
                                                                >
                                                                    Select one
                                                                    job type
                                                                </span>
                                                            )
                                                        return (
                                                            <p
                                                                key={
                                                                    jobType.key
                                                                }
                                                            >
                                                                {
                                                                    item.displayName
                                                                }
                                                                {item.id !==
                                                                    selectedItems[
                                                                        selectedItems.length -
                                                                            1
                                                                    ].key && (
                                                                    <span className="pr-1">
                                                                        ,
                                                                    </span>
                                                                )}
                                                            </p>
                                                        )
                                                    }
                                                )}
                                            </ul>
                                        )
                                    }}
                                >
                                    {jobTypes?.map((jobType) => (
                                        <HeroSelectItem key={jobType.id}>
                                            <div className="flex items-center justify-start gap-2">
                                                <div
                                                    className="size-2 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            jobType.hexColor
                                                                ? jobType.hexColor
                                                                : 'transparent',
                                                    }}
                                                />
                                                <p>{jobType.displayName}</p>
                                            </div>
                                        </HeroSelectItem>
                                    ))}
                                </HeroSelect>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center justify-start gap-1.5">
                                    <Handshake
                                        size={14}
                                        className="text-text-default"
                                    />
                                    <p className="font-medium text-base">
                                        Client name
                                    </p>
                                </div>
                                <div>
                                    <button className="link cursor-pointer hover:underline underline-offset-2 transition duration-150">
                                        <p className="font-medium text-text-subdued">
                                            Reset
                                        </p>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <HeroSelect
                                    isLoading={loadingJobStatuses}
                                    id="status"
                                    name="status"
                                    placeholder="Select one or more status"
                                    selectionMode="multiple"
                                    variant="bordered"
                                    size="lg"
                                    onChange={() => {
                                        // const value = e.target.value
                                        // formik.setFieldValue('departmentId', value)
                                        // formik.setFieldTouched(
                                        //     'departmentId',
                                        //     true,
                                        //     false
                                        // )
                                    }}
                                    renderValue={(selectedItems) => {
                                        return (
                                            <ul className="flex line-clamp-1 truncate">
                                                {selectedItems.map(
                                                    (jobStatus) => {
                                                        const item =
                                                            jobStatuses?.find(
                                                                (d) =>
                                                                    d.id ===
                                                                    jobStatus.key
                                                            )
                                                        if (!item)
                                                            return (
                                                                <span
                                                                    className="text-gray-400"
                                                                    key={
                                                                        jobStatus.key
                                                                    }
                                                                >
                                                                    Select one
                                                                    job status
                                                                </span>
                                                            )
                                                        return (
                                                            <p
                                                                key={
                                                                    jobStatus.key
                                                                }
                                                            >
                                                                {
                                                                    item.displayName
                                                                }
                                                                {item.id !==
                                                                    selectedItems[
                                                                        selectedItems.length -
                                                                            1
                                                                    ].key && (
                                                                    <span className="pr-1">
                                                                        ,
                                                                    </span>
                                                                )}
                                                            </p>
                                                        )
                                                    }
                                                )}
                                            </ul>
                                        )
                                    }}
                                >
                                    {jobStatuses?.map((jobStatus) => (
                                        <HeroSelectItem key={jobStatus.id}>
                                            <div className="flex items-center justify-start gap-2">
                                                <div
                                                    className="size-2 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            jobStatus.hexColor
                                                                ? jobStatus.hexColor
                                                                : 'transparent',
                                                    }}
                                                />
                                                <p>{jobStatus.displayName}</p>
                                            </div>
                                        </HeroSelectItem>
                                    ))}
                                </HeroSelect>
                            </div>
                        </div>
                    </HeroCardBody>
                </HeroCard>
            </div>
        </div>
    )
}
