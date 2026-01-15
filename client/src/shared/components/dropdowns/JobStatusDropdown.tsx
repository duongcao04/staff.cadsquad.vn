import {
    addToast,
    Button,
    Divider,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Tab,
    Tabs,
} from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'

import {
    useChangeStatusMutation,
    useJobStatuses,
    useProfile,
} from '@/lib/queries'
import { statusByOrderOptions } from '@/lib/queries/options/job-status-queries'
import { darkenHexColor, JOB_STATUS_CODES, lightenHexColor } from '@/lib/utils'
import type { TJob, TJobStatus } from '@/shared/types'

import { JobStatusSystemTypeEnum } from '../../enums'
import { JobStatusChip } from '../chips/JobStatusChip'

type JobStatusDropdownProps = {
    jobData: TJob
    statusData: TJobStatus
    afterChangeStatus?: () => void
}
export default function JobStatusDropdown({
    jobData,
    statusData,
    afterChangeStatus,
}: JobStatusDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)

    const { resolvedTheme } = useTheme()

    const { isAdmin } = useProfile()

    const changeStatusMutation = useChangeStatusMutation((res) => {
        addToast({
            title: 'Job status updated',
            description: `Job ${res.result?.no} has been successfully updated`,
            color: 'success',
        })
    })

    const { data: nextStatus } = useQuery({
        // If nextStatusOrder is null/undefined, pass -1 (or 0) to satisfy TS.
        // The query won't run because of 'enabled' below.
        ...statusByOrderOptions(statusData.nextStatusOrder ?? -1),

        // Only fetch if nextStatusOrder exists
        enabled:
            isOpen &&
            !!statusData.nextStatusOrder &&
            statusData.nextStatusOrder !== null,
    })

    const { data: prevStatus } = useQuery({
        // If prevStatusOrder is null/undefined, pass -1 (or 0) to satisfy TS.
        // The query won't run because of 'enabled' below.
        ...statusByOrderOptions(statusData.prevStatusOrder ?? -1),

        // Only fetch if prevStatusOrder exists
        enabled:
            isOpen &&
            !!statusData.prevStatusOrder &&
            statusData.prevStatusOrder !== null,
    })

    const { data: jobStatuses } = useJobStatuses()

    const canClickable =
        isAdmin && statusData.systemType !== JobStatusSystemTypeEnum.TERMINATED

    const handleChangeStatus = async (nextStatus: TJobStatus) => {
        await changeStatusMutation.mutateAsync(
            {
                jobId: jobData.id,
                data: {
                    currentStatus: statusData.code,
                    newStatus: nextStatus.code,
                },
            },
            {
                onSuccess() {
                    afterChangeStatus?.()
                    setIsOpen(false)
                },
            }
        )
    }

    const actions: { key: string; data?: TJobStatus; action: () => void }[] = [
        {
            key: 'nextStatusOrder',
            data: isAdmin
                ? nextStatus
                : nextStatus?.code === JOB_STATUS_CODES.delivered
                  ? nextStatus
                  : undefined,
            action: () => {
                handleChangeStatus(nextStatus as TJobStatus)
            },
        },
        {
            key: 'prevStatusOrder',
            data: isAdmin
                ? prevStatus
                : prevStatus?.code === JOB_STATUS_CODES.delivered
                  ? prevStatus
                  : undefined,
            action: () => {
                handleChangeStatus(prevStatus as TJobStatus)
            },
        },
    ]
    const dropdownActions = actions.filter(
        (item) => typeof item.data !== 'undefined'
    )

    const getBackgroundColor = (data?: TJobStatus) => {
        return resolvedTheme === 'light'
            ? data
                ? lightenHexColor(
                      data?.hexColor ? data.hexColor : '#ffffff',
                      90
                  )
                : '#ffffff'
            : data
              ? darkenHexColor(data?.hexColor ? data.hexColor : '#000000', 70)
              : '#000000'
    }

    return (
        <Popover
            placement="bottom-start"
            size="sm"
            classNames={{
                base: '!z-0',
                content: '!z-0 py-2 w-[300px]',
                backdrop: '!z-0',
                trigger: '!z-0',
            }}
            isOpen={isOpen}
            showArrow={true}
            onOpenChange={setIsOpen}
        >
            <PopoverTrigger className="opacity-100">
                {canClickable ? (
                    <button className="cursor-pointer">
                        <JobStatusChip
                            data={statusData}
                            classNames={{
                                base: '!w-[120px]',
                                content:
                                    'uppercase text-xs font-semibold font-saira !w-[120px] text-nowrap line-clamp-1',
                            }}
                            childrenRender={(statusData) => {
                                return (
                                    <div className="flex items-center justify-between gap-2">
                                        <p>{statusData.displayName}</p>
                                        <ChevronDown size={14} />
                                    </div>
                                )
                            }}
                        />
                    </button>
                ) : (
                    <JobStatusChip
                        data={statusData}
                        classNames={{
                            base: '!w-[120px]',
                            content:
                                'uppercase text-xs font-semibold font-saira !w-[120px] text-nowrap line-clamp-1',
                        }}
                    />
                )}
            </PopoverTrigger>
            <PopoverContent aria-label="Change status action">
                <Tabs
                    aria-label="Job status change tabs"
                    fullWidth
                    classNames={{
                        base: 'size-full',
                        panel: 'size-full',
                    }}
                >
                    <Tab key="quick" title="Quick change">
                        <div className="size-full space-y-2.5">
                            {!dropdownActions.length ? (
                                <p className="py-3 font-medium text-center text-text-muted">
                                    Cannot quick change
                                </p>
                            ) : (
                                dropdownActions.map((item) => {
                                    return (
                                        <Button
                                            key={item.key}
                                            className="w-full"
                                            style={{
                                                backgroundColor:
                                                    getBackgroundColor(
                                                        item.data
                                                    ),
                                            }}
                                            onPress={item.action}
                                        >
                                            {item.data && (
                                                <div className="flex items-center justify-start gap-2">
                                                    <div
                                                        className="size-2 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                item.data
                                                                    ?.hexColor
                                                                    ? item.data
                                                                          ?.hexColor
                                                                    : '#ffffff',
                                                        }}
                                                    />
                                                    <p
                                                        className="font-semibold"
                                                        style={{
                                                            color: item.data
                                                                ?.hexColor
                                                                ? item.data
                                                                      ?.hexColor
                                                                : '#ffffff',
                                                        }}
                                                    >
                                                        {item.data.displayName}
                                                    </p>
                                                </div>
                                            )}
                                        </Button>
                                    )
                                })
                            )}
                        </div>
                    </Tab>
                    {isAdmin && (
                        <Tab key="force" title="Force change">
                            {!jobStatuses ? (
                                <p className="text-xs text-center">
                                    Không tìm thấy danh sách trạng thái
                                </p>
                            ) : (
                                <div className="size-full space-y-2.5">
                                    {jobStatuses.map((item) => {
                                        return (
                                            <Button
                                                key={item.id}
                                                className="w-full"
                                                style={{
                                                    backgroundColor:
                                                        getBackgroundColor(
                                                            item
                                                        ),
                                                }}
                                                onPress={() => {
                                                    handleChangeStatus(item)
                                                }}
                                                isDisabled={
                                                    item.code ===
                                                    statusData.code
                                                }
                                            >
                                                {item && (
                                                    <div className="flex items-center justify-start gap-2">
                                                        <div
                                                            className="size-2 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    item?.hexColor
                                                                        ? item?.hexColor
                                                                        : '#ffffff',
                                                            }}
                                                        />
                                                        <p
                                                            className="font-semibold"
                                                            style={{
                                                                color: item?.hexColor
                                                                    ? item?.hexColor
                                                                    : '#ffffff',
                                                            }}
                                                        >
                                                            {item.displayName}
                                                        </p>
                                                    </div>
                                                )}
                                            </Button>
                                        )
                                    })}
                                </div>
                            )}
                        </Tab>
                    )}
                </Tabs>

                <Divider className="bg-text-muted" />

                <p className="text-xs pt-1.5 w-full text-center text-text-subdued">
                    <span className="font-semibold">#{jobData?.no}</span>
                    <span className="px-0.5">/</span>
                    <span>Update status</span>
                </p>
            </PopoverContent>
        </Popover>
    )
}
