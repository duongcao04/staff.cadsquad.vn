import JobDueModal from '@/features/job-manage/components/modals/JobDueModal'
import { Calendar } from '@/shared/components/ui/calendar'
import { useDisclosure } from '@heroui/react'
import DayButton from './DayButton'
import { useSuspenseQuery } from '@tanstack/react-query'
import { profileScheduleOptions } from '../../../../lib/queries/options/profile-queries'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { isSameDay } from 'date-fns'

export default function TaskCalendar() {
    const { isOpen, onClose, onOpen } = useDisclosure({ id: 'JobDueModal' })
    const [date, setDate] = useState<Date | undefined>(undefined)

    const { month, year } = useMemo(() => {
        // 1. Wrap the input date once
        const d = dayjs(date)

        return {
            // 2. Use .month() method (Returns 0-11)
            // If your API expects 1-12, change this to: d.month() + 1
            month: d.month() + 1,

            // 3. Use .year() method
            year: d.year(),
        }
    }, [date]) // 4. Added date to dependency array

    const {
        data: { jobsSchedule },
    } = useSuspenseQuery({
        ...profileScheduleOptions(year, month),
    })

    const getJobsForDay = (date: Date) => {
        return jobsSchedule.filter((job) =>
            isSameDay(new Date(job.dueAt), date)
        )
    }

    // const isToday = dayjs(today).isSame('2025-11-10', 'date')
    // console.log(isToday)

    return (
        <>
            {date && (
                <JobDueModal
                    isOpen={isOpen}
                    onClose={onClose}
                    currentDate={date}
                />
            )}
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-lg size-full md:[--cell-size:--spacing(4)] text-text-default!"
                buttonVariant="ghost"
                animate={false}
                components={{
                    DayButton: ({ day }) => {
                        const dayJobs = getJobsForDay(day.date)
                        console.log(dayJobs)

                        const isHighlight = dayJobs.length > 0
                        return (
                            <DayButton
                                calendarDay={day}
                                openModal={onOpen}
                                selectedDate={date}
                                setSelectedDate={setDate}
                                isHighlight={isHighlight}
                            />
                        )
                    },
                }}
            />
        </>
    )
}
