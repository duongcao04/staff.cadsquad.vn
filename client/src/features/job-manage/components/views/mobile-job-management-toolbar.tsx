import { jobStatusesListOptions, RouteUtil } from '@/lib'
import { TManageJobsParams } from '@/routes/_administrator/mgmt/jobs'
import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    useDisclosure,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { debounce } from 'lodash'
import { Filter, RefreshCw, SearchIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getDueInPresets } from './JobManagementTable'
import { JobManagementTabs } from './JobManagementTabs'

interface MobileJobManagementToolbarProps {
    onRefetch: () => void
    searchParams: TManageJobsParams
    isLoadingData: boolean
}

export function MobileJobManagementToolbar({
    onRefetch,
    searchParams,
    isLoadingData,
}: MobileJobManagementToolbarProps) {
    const {
        search: searchValue,
        status: currentStatus,
        dueIn: currentDueIn,
    } = searchParams
    const inputRef = useRef<HTMLInputElement>(null)
    const dueInPresets = getDueInPresets()
    const { isOpen, onOpen, onClose } = useDisclosure() // For Mobile Filter Drawer

    const {
        data: { jobStatuses },
    } = useSuspenseQuery({
        ...jobStatusesListOptions(),
    })

    const [inputValue, setInputValue] = useState(searchValue || '')

    useEffect(() => {
        setInputValue(searchValue || '')
    }, [searchValue])

    const debounceSearch = useMemo(
        () =>
            debounce((value?: string) => {
                RouteUtil.updateParams({
                    search: value || undefined,
                    page: 1,
                })
            }, 500),
        []
    )

    useEffect(() => {
        return () => debounceSearch.cancel()
    }, [debounceSearch])

    const handleInputChange = (val: string) => {
        setInputValue(val)
        debounceSearch(val)
    }

    const handleClearSearch = () => {
        setInputValue('')
        debounceSearch.cancel()
        RouteUtil.updateParams({ search: undefined, page: 1 })
    }

    // Determine if any filters are active to show a badge on the Filter button
    const hasActiveFilters = !!currentStatus || !!currentDueIn

    return (
        <div className="flex flex-col gap-3 px-1">
            <JobManagementTabs activeViewTab={searchParams.tab} />

            {/* 2. Search & Actions Row */}
            <div className="flex items-center gap-2 w-full mt-2">
                <Input
                    isClearable
                    ref={inputRef}
                    classNames={{
                        base: 'flex-1',
                        inputWrapper:
                            'bg-white border-default-200 border h-10 shadow-sm',
                    }}
                    variant="bordered"
                    size="sm"
                    placeholder="Search jobs..."
                    startContent={
                        <SearchIcon className="text-default-400" size={16} />
                    }
                    value={inputValue}
                    onClear={handleClearSearch}
                    onValueChange={handleInputChange}
                />

                <Button
                    isIconOnly
                    variant="flat"
                    color={hasActiveFilters ? 'primary' : 'default'}
                    className={`h-10 w-10 shrink-0 shadow-sm ${hasActiveFilters ? 'bg-primary-50' : 'bg-white border border-default-200'}`}
                    onPress={onOpen}
                >
                    <div className="relative">
                        <Filter
                            size={18}
                            className={
                                hasActiveFilters
                                    ? 'text-primary'
                                    : 'text-default-700'
                            }
                        />
                        {hasActiveFilters && (
                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500 border border-white"></span>
                            </span>
                        )}
                    </div>
                </Button>

                <Button
                    isIconOnly
                    variant="flat"
                    className="h-10 w-10 shrink-0 bg-white border border-default-200 shadow-sm text-default-700"
                    onPress={onRefetch}
                >
                    <RefreshCw
                        size={18}
                        className={`${isLoadingData ? 'animate-spin-smooth' : ''}`}
                    />
                </Button>
            </div>

            {/* 3. Mobile Filter Modal (Bottom Sheet style) */}
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                placement="bottom"
                className="m-0 rounded-b-none sm:m-auto sm:rounded-xl"
                motionProps={{
                    variants: {
                        enter: {
                            y: 0,
                            opacity: 1,
                            transition: { duration: 0.3, ease: 'easeOut' },
                        },
                        exit: {
                            y: 20,
                            opacity: 0,
                            transition: { duration: 0.2, ease: 'easeIn' },
                        },
                    },
                }}
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1 border-b border-default-100 px-6 py-4">
                        <div className="flex justify-between items-center w-full">
                            <span className="text-lg font-bold">Filters</span>
                            {(currentStatus || currentDueIn) && (
                                <Button
                                    size="sm"
                                    variant="light"
                                    color="danger"
                                    className="px-2"
                                    onPress={() => {
                                        RouteUtil.updateParams({
                                            status: undefined,
                                            dueIn: undefined,
                                            page: 1,
                                        })
                                    }}
                                >
                                    Clear All
                                </Button>
                            )}
                        </div>
                    </ModalHeader>

                    <ModalBody className="py-6 px-6 flex flex-col gap-5">
                        {/* Status Filter */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-default-900">
                                Job Status
                            </label>
                            <Select
                                selectionMode="multiple"
                                className="w-full"
                                size="lg"
                                variant="bordered"
                                placeholder="Any Status"
                                selectedKeys={
                                    currentStatus
                                        ? currentStatus.split(',')
                                        : []
                                }
                                onSelectionChange={(value) =>
                                    RouteUtil.updateParams({
                                        status: Array.from(value).length
                                            ? Array.from(value).join(',')
                                            : undefined,
                                        page: 1,
                                    })
                                }
                                renderValue={(items) => (
                                    <div className="flex flex-wrap gap-1">
                                        {items.map((item) => (
                                            <span
                                                key={item.key}
                                                className="text-sm font-medium"
                                            >
                                                {item.data?.displayName}
                                                {items.length > 1 &&
                                                item !== items[items.length - 1]
                                                    ? ', '
                                                    : ''}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            >
                                {jobStatuses.map((js) => (
                                    <SelectItem
                                        key={js.code}
                                        textValue={js.displayName}
                                    >
                                        <div className="flex items-center gap-3 py-1">
                                            <div
                                                className="w-3 h-3 rounded-full border border-black/10"
                                                style={{
                                                    backgroundColor:
                                                        js.hexColor || '#000',
                                                }}
                                            />
                                            <span className="font-medium text-base">
                                                {js.displayName}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        {/* Due Date Filter */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-default-900">
                                Due Timeline
                            </label>
                            <Select
                                className="w-full"
                                size="lg"
                                variant="bordered"
                                placeholder="Any Time"
                                selectedKeys={
                                    currentDueIn ? [currentDueIn] : []
                                }
                                onSelectionChange={(value) => {
                                    RouteUtil.updateParams({
                                        dueIn: value.currentKey
                                            ? value.currentKey
                                            : undefined,
                                        page: 1,
                                    })
                                }}
                            >
                                {dueInPresets.map((d) => (
                                    <SelectItem key={d.key} textValue={d.label}>
                                        <div className="flex flex-col py-1">
                                            <span className="font-medium text-base">
                                                {d.label}
                                            </span>
                                            <span className="text-xs text-default-400">
                                                {d.dateStr}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                    </ModalBody>

                    <ModalFooter className="border-t border-default-100 px-6 py-4">
                        <Button
                            color="primary"
                            className="w-full font-bold"
                            size="lg"
                            onPress={onClose}
                        >
                            Apply Filters
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    )
}
