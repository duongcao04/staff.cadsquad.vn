import { Button, Card, CardBody, cn } from '@heroui/react'
import {
    addDays,
    addWeeks,
    format,
    isSameDay,
    isToday,
    startOfWeek,
    subWeeks,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react' // Icons
import { useState } from 'react'

import { toggleAdminRightSidebar } from '../../stores'
import { HeroButton } from '../ui/hero-button'

export default function WeekCalendar({
    onChangeDate,
    isCollapsed,
}: {
    onChangeDate: (date: Date) => void
    isCollapsed: boolean
}) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())

    // Calculate the start of the current week (Sunday)
    // Use { weekStartsOn: 1 } for Monday start
    const startDate = startOfWeek(currentDate, { weekStartsOn: 0 })

    const weekDays = Array.from({ length: 7 }).map((_, i) => {
        const day = addDays(startDate, i)
        return day
    })

    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1))
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1))
    const handleToday = () => {
        const today = new Date()
        setCurrentDate(today)
        setSelectedDate(today)
        onChangeDate(today)
    }

    return (
        <div className="w-full flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <HeroButton
                    onPress={toggleAdminRightSidebar}
                    isIconOnly
                    size="sm"
                    variant="bordered"
                    className="border-1"
                    color="default"
                >
                    {isCollapsed ? (
                        <ChevronLeft size={18} />
                    ) : (
                        <ChevronRight size={18} />
                    )}
                </HeroButton>
            </div>
            <div className="w-full flex items-center justify-between">
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={handlePrevWeek}
                >
                    <ChevronLeft size={20} />
                </Button>
                <Button size="sm" variant="light" onPress={handleToday}>
                    <span className="tracking-wider text-text-default">Today</span>
                </Button>
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={handleNextWeek}
                >
                    <ChevronRight size={20} />
                </Button>
            </div>

            {/* Week Grid */}
            <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, index) => {
                    const isSelected = isSameDay(day, selectedDate)
                    const isCurrentDay = isToday(day)

                    return (
                        <div
                            key={index}
                            className="flex flex-col items-center gap-3"
                        >
                            <p className="text-xs text-text-subdued">
                                {format(day, 'EEEEE')}
                            </p>
                            <Card
                                isPressable
                                onPress={() => {
                                    setSelectedDate(day)
                                    onChangeDate(day)
                                }}
                                className={cn(
                                    'border-none transition-all',
                                    isSelected
                                        ? 'bg-primary text-primary-foreground'
                                        : '',
                                    isCurrentDay && !isSelected
                                        ? 'border-2 border-primary'
                                        : ''
                                )}
                                shadow="none"
                            >
                                <CardBody className="size-9! overflow-hidden! flex items-center justify-center">
                                    <span className="text-sm font-bold">
                                        {format(day, 'd')}
                                    </span>
                                </CardBody>
                            </Card>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
