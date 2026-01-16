import { Avatar } from '@heroui/react'
import { Slash } from 'lucide-react'
import { useEffect, useState } from 'react'

import { jobApi } from '@/lib/api'
import type { TJobType } from '@/shared/types'

import {
    HeroAutocomplete,
    HeroAutocompleteItem,
} from '../../../shared/components/ui/hero-autocomplete'
import { useDevice } from '../../../shared/hooks'

type JobNoFieldProps = {
    jobTypes: TJobType[]
    defaultSelectedKey?: string | null
    // Callback trả về cả Key và Result cho Parent
    onSelectionChange: (key: string | null, jobNoResult: string | null) => void
    label?: string
    placeholder?: string
    isLoading?: boolean
    isInvalid?: boolean
    errorMessage?: React.ReactNode
}

export function JobNoField({
    jobTypes,
    defaultSelectedKey,
    onSelectionChange,
    label = 'No.',
    placeholder = 'Select type',
    errorMessage,
    isInvalid,
    isLoading,
}: JobNoFieldProps) {
    const { isSmallView } = useDevice()
    const [selectedKey, setSelectedKey] = useState<string | null>(
        defaultSelectedKey ? defaultSelectedKey : null
    )
    const [jobNoResult, setJobNoResult] = useState<string | null>(null)

    // 1. Handle Selection: Chỉ cập nhật State nội bộ, KHÔNG gọi prop onSelectionChange ở đây
    const handleSelectionChange = (key: React.Key | null) => {
        const newKey = key as string | null
        setSelectedKey(newKey)

        // Reset kết quả cũ ngay lập tức để UI không hiển thị số của loại cũ
        setJobNoResult(null)

        // (Optional) Nếu bạn muốn Parent biết ngay là Key đã đổi (nhưng chưa có số):
        // onSelectionChange(newKey, null)
    }

    // 2. UseEffect: Chịu trách nhiệm gọi API và báo kết quả về cho Parent
    useEffect(() => {
        let isCancelled = false

        const fetchNextNo = async () => {
            // Trường hợp user bỏ chọn (Clear input)
            if (!selectedKey) {
                setJobNoResult(null)
                onSelectionChange(null, null) // Báo về parent để clear form
                return
            }

            try {
                setJobNoResult('...') // Hiển thị loading nhẹ

                const res = await jobApi.getNextNo(selectedKey)

                if (!isCancelled && res?.result) {
                    const newNo = res?.result

                    // Cập nhật UI nội bộ
                    setJobNoResult(newNo)

                    // QUAN TRỌNG: Báo về Parent khi đã CÓ dữ liệu thực tế
                    onSelectionChange(selectedKey, newNo)
                }
            } catch (error) {
                console.error('Failed to fetch next job no:', error)
                if (!isCancelled) {
                    setJobNoResult('Error')
                    // Có thể báo lỗi về parent hoặc giữ nguyên null tùy logic form
                    onSelectionChange(selectedKey, null)
                }
            }
        }

        fetchNextNo()

        return () => {
            isCancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedKey]) // Chỉ chạy lại khi selectedKey thay đổi

    return (
        <div
            className={`grid ${isSmallView ? 'grid-cols-2' : 'grid-cols-3'} items-end gap-4`}
        >
            <HeroAutocomplete
                isRequired
                label={label}
                placeholder={placeholder}
                defaultItems={jobTypes}
                selectedKey={selectedKey}
                onSelectionChange={handleSelectionChange}
                isInvalid={isInvalid}
                errorMessage={errorMessage}
                isLoading={isLoading}
                labelPlacement="outside"
                className="max-w-full"
            >
                {(item) => {
                    const jobItem = item as TJobType
                    return (
                        <HeroAutocompleteItem
                            key={jobItem.id}
                            textValue={jobItem.displayName}
                        >
                            <div className="flex gap-3 items-center">
                                <Avatar
                                    alt={jobItem.displayName}
                                    className="shrink-0"
                                    size="sm"
                                    name={jobItem.code}
                                    style={{
                                        backgroundColor:
                                            jobItem.hexColor || undefined,
                                        color: jobItem.hexColor
                                            ? '#fff'
                                            : undefined,
                                    }}
                                />
                                <div className="flex flex-col">
                                    <span className="text-small text-foreground font-medium">
                                        {jobItem.displayName}
                                    </span>
                                    <div className="flex gap-2 text-tiny text-default-400">
                                        <span>Code: {jobItem.code}</span>
                                        {jobItem._count?.jobs && (
                                            <span>
                                                • {jobItem._count.jobs} Jobs
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </HeroAutocompleteItem>
                    )
                }}
            </HeroAutocomplete>

            {/* Display the calculated result */}
            <div className="h-12 flex items-center justify-start gap-3">
                <Slash className="rotate-[-20deg] text-default-300" />
                <p className="text-xl font-semibold text-foreground">
                    {jobNoResult || '...'}
                </p>
            </div>
        </div>
    )
}
