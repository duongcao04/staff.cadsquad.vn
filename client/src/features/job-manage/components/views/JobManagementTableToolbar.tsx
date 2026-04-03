import { Button, Divider, Input, Select, SelectItem } from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { debounce } from 'lodash'
import { RefreshCw, SearchIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { jobStatusesListOptions, RouteUtil } from '@/lib'
import { TManageJobsParams } from '@/routes/_administrator/mgmt/jobs'
import { getDueInPresets } from './JobManagementTable'
import { JobManagementTabs } from './JobManagementTabs'

interface JobManagementTableToolbarProps {
    onRefetch: () => void
    searchParams: TManageJobsParams
    isLoadingData: boolean
}
export function JobManagementTableToolbar({
    onRefetch,
    searchParams,
    isLoadingData,
}: JobManagementTableToolbarProps) {
    const { search: searchValue } = searchParams
    const inputRef = useRef<HTMLInputElement>(null)
    const dueInPresets = getDueInPresets()

    const {
        data: { jobStatuses },
    } = useSuspenseQuery({
        ...jobStatusesListOptions(),
    })

    // 1. Thêm Local State để UI phản hồi chữ ngay lập tức khi user gõ
    const [inputValue, setInputValue] = useState(searchValue || '')

    // 2. Đồng bộ inputValue nếu `searchValue` từ URL thay đổi (VD: user click nút back/forward)
    useEffect(() => {
        setInputValue(searchValue || '')
    }, [searchValue])

    // 3. Khởi tạo hàm thực thi debounce update URL
    const debounceSearch = useMemo(
        () =>
            debounce((value?: string) => {
                RouteUtil.updateParams({
                    search: value || undefined,
                    page: 1,
                })
                setTimeout(() => {
                    inputRef.current?.focus()
                }, 50)
            }, 500),
        []
    )

    // 4. Dọn dẹp (cleanup) khi component unmount
    useEffect(() => {
        return () => debounceSearch.cancel()
    }, [debounceSearch])

    // 5. Hàm xử lý thay đổi text
    const handleInputChange = (val: string) => {
        setInputValue(val)
        debounceSearch(val)
    }

    // 6. Hàm xử lý clear text
    const handleClear = () => {
        setInputValue('')
        debounceSearch.cancel()
        RouteUtil.updateParams({ search: undefined, page: 1 })
    }
    return (
        <div className="flex flex-col gap-4">
            <JobManagementTabs activeViewTab={searchParams.tab} />
            {/* Filters & Search */}
            <div className="flex justify-between gap-3 items-end">
                <div>
                    <div className="flex gap-3 items-center">
                        <Input
                            isClearable
                            ref={inputRef}
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
                            value={inputValue}
                            onClear={handleClear}
                            onValueChange={handleInputChange}
                        />

                        <Divider orientation="vertical" className="h-5" />

                        <Button
                            startContent={
                                <RefreshCw
                                    size={14}
                                    className={`text-small ${isLoadingData ? 'animate-spin-smooth' : ''}`}
                                />
                            }
                            className="border-1"
                            variant="bordered"
                            size="sm"
                            onPress={onRefetch}
                        >
                            Refresh
                        </Button>
                    </div>
                </div>

                <div className="flex gap-3 items-center">
                    <Select
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
                            RouteUtil.updateParams({
                                status: undefined,
                                page: 1,
                            })
                        }
                        onSelectionChange={(value) =>
                            RouteUtil.updateParams({
                                status: Array.from(value).join(','),
                                page: 1,
                            })
                        }
                        renderValue={(items) => (
                            <p className="text-text-7">
                                {items.length} status
                                {items.length > 1 ? 'es' : ''}
                            </p>
                        )}
                    >
                        {jobStatuses.map((js) => (
                            <SelectItem key={js.code}>
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
                            </SelectItem>
                        ))}
                    </Select>

                    {/* Due Date Filter */}
                    <Select
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
                            if (!value.currentKey) {
                                RouteUtil.updateParams({
                                    dueIn: undefined,
                                    page: 1,
                                })
                            } else {
                                RouteUtil.updateParams({
                                    dueIn: value.currentKey,
                                    page: 1,
                                })
                            }
                        }}
                        renderValue={(items) => (
                            <p className="text-text-7">{items[0]?.textValue}</p>
                        )}
                    >
                        {dueInPresets.map((d) => (
                            <SelectItem key={d.key}>{d.label}</SelectItem>
                        ))}
                    </Select>
                </div>
            </div>
        </div>
    )
}
