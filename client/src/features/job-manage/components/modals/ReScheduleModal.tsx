import { addToast, Button } from '@heroui/react'
import dayjs, { Dayjs } from 'dayjs'
import { useState } from 'react'

import { useRescheduleMutation } from '@/lib/queries'
import type { TJob } from '@/shared/types'

import { HeroDatePicker } from '../../../../shared/components/ui/hero-date-picker'
import {
    HeroModal,
    HeroModalBody,
    HeroModalContent,
    HeroModalFooter,
    HeroModalHeader,
} from '../../../../shared/components/ui/hero-modal'

type ReScheduleModalProps = {
    job: TJob
    isOpen: boolean
    onClose: () => void
}

export default function ReScheduleModal({
    job,
    isOpen,
    onClose,
}: ReScheduleModalProps) {
    const [date, setDate] = useState<Dayjs | null>(dayjs(job.dueAt))

    const rescheduleMutation = useRescheduleMutation((res) => {
        addToast({
            title: 'Job Rescheduled',
            description: `Reschedule for job ${res.result?.no} successfully`,
            color: 'success',
        })
        onClose()
    })

    const onReschedule = async () => {
        await rescheduleMutation.mutateAsync({
            jobId: job.id,
            data: {
                fromDate: dayjs(job.dueAt).toISOString(),
                toDate: dayjs(date).toISOString(),
            },
        })
    }

    const onCancel = () => {
        setDate(null)
        onClose()
    }

    return (
        <HeroModal
            isOpen={isOpen}
            onClose={onCancel}
            placement="center"
            hideCloseButton
            isDismissable
            classNames={{
                base: '!p-0',
            }}
            size="lg"
        >
            <HeroModalContent className="p-2">
                <HeroModalHeader
                    style={{
                        backgroundColor: 'var(--color-primary)',
                    }}
                >
                    <div>
                        <p className="font-medium text-lg text-white">
                            Reschedule for #{job.no}
                        </p>
                        <p className="text-sm text-text-5">
                            Changing the deadline may affect the workflow.
                        </p>
                    </div>
                </HeroModalHeader>
                <HeroModalBody>
                    <div className="pt-2.5 px-0 space-y-4">
                        <p className="text-sm font-medium">
                            Choose a new deadline
                        </p>
                        <HeroDatePicker
                            value={date}
                            showMonthAndYearPickers
                            onChange={(date) => {
                                setDate(date)
                            }}
                        />
                    </div>
                </HeroModalBody>
                <HeroModalFooter>
                    <Button variant="light" onPress={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        isLoading={rescheduleMutation.isPending}
                        onPress={() => onReschedule()}
                    >
                        Confirm
                    </Button>
                </HeroModalFooter>
            </HeroModalContent>
        </HeroModal>
    )
}
