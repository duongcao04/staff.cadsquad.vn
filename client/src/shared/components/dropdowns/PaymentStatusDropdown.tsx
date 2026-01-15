import {
    addToast,
    Button,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@heroui/react'
import { ChevronDown } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { useMarkPaidMutation, useProfile } from '@/lib'
import { darkenHexColor, lightenHexColor, PAID_STATUS_COLOR } from '@/lib/utils'
import type { TJob } from '@/shared/types'
import { PaidChip } from '../chips/PaidChip'

type Props = {
    jobData: TJob
    afterChangeStatus?: () => void
}
export default function PaymentStatusDropdown({
    jobData,
    afterChangeStatus,
}: Props) {
    const [isOpen, setOpen] = useState(false)
    const { isAdmin, isAccounting } = useProfile()
    const { resolvedTheme } = useTheme()

    const markAsPaidMutation = useMarkPaidMutation()

    const getBackgroundColor = (statusTitle: 'paid' | 'unpaid') => {
        return resolvedTheme === 'light'
            ? lightenHexColor(
                  PAID_STATUS_COLOR[statusTitle]?.hexColor
                      ? PAID_STATUS_COLOR[statusTitle].hexColor
                      : '#ffffff',
                  90
              )
            : darkenHexColor(
                  PAID_STATUS_COLOR[statusTitle]?.hexColor
                      ? PAID_STATUS_COLOR[statusTitle].hexColor
                      : '#000000',
                  70
              )
    }

    const handleMarkAsPaid = async () => {
        if (jobData?.id) {
            await markAsPaidMutation.mutateAsync(jobData.id, {
                onSuccess() {
                    setOpen(false)
                    afterChangeStatus?.()
                },
            })
        }
    }

    const statusTitle = jobData.isPaid ? 'paid' : 'unpaid'

    const changeStatusTitle = !jobData.isPaid ? 'paid' : 'unpaid'

    const canChangeStatus = (isAdmin || isAccounting) && !jobData.isPaid

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
            showArrow={true}
            isOpen={isOpen}
            onOpenChange={setOpen}
        >
            <PopoverTrigger className="opacity-100">
                {canChangeStatus ? (
                    <button className="cursor-pointer">
                        <PaidChip
                            status={statusTitle}
                            classNames={{
                                base: '!w-[100px]',
                                content: '!w-[100px] text-center',
                            }}
                            childrenRender={(paidStatus) => {
                                return (
                                    <div className="flex items-center justify-between gap-2">
                                        <p>{paidStatus.title}</p>
                                        <ChevronDown size={14} />
                                    </div>
                                )
                            }}
                        />
                    </button>
                ) : (
                    <PaidChip
                        status={statusTitle}
                        classNames={{
                            base: '!w-[100px]',
                            content: '!w-[100px] text-center',
                        }}
                        childrenRender={(paidStatus) => {
                            return (
                                <div className="flex items-center justify-between gap-2">
                                    <p>{paidStatus.title}</p>
                                </div>
                            )
                        }}
                    />
                )}
            </PopoverTrigger>
            <PopoverContent aria-label="Change payment status action">
                <div className="size-full space-y-2.5">
                    <Button
                        className="w-full"
                        style={{
                            backgroundColor:
                                getBackgroundColor(changeStatusTitle),
                        }}
                        onPress={() => {
                            if (!jobData.isPaid) {
                                handleMarkAsPaid()
                            } else {
                                addToast({
                                    title: 'Job is already paid',
                                    color: 'danger',
                                })
                            }
                        }}
                    >
                        <div className="flex items-center justify-start gap-2">
                            <div
                                className="size-2 rounded-full"
                                style={{
                                    backgroundColor: PAID_STATUS_COLOR[
                                        changeStatusTitle
                                    ].hexColor
                                        ? PAID_STATUS_COLOR[changeStatusTitle]
                                              .hexColor
                                        : '#ffffff',
                                }}
                            />
                            <p
                                className="font-semibold"
                                style={{
                                    color: PAID_STATUS_COLOR[changeStatusTitle]
                                        .hexColor
                                        ? PAID_STATUS_COLOR[changeStatusTitle]
                                              .hexColor
                                        : '#ffffff',
                                }}
                            >
                                {PAID_STATUS_COLOR[changeStatusTitle].title}
                            </p>
                        </div>
                    </Button>
                </div>

                <p className="mt-2.5 border-t-1 border-text-muted pt-1.5 w-full text-center text-text-muted">
                    <span className="font-bold">#{jobData?.no}</span> / Update
                    payment status
                </p>
            </PopoverContent>
        </Popover>
    )
}
