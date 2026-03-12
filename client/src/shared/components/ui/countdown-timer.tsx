'use client'

import dayjs, { Dayjs } from 'dayjs'
import React, { useEffect, useMemo, useState } from 'react'

import { cn } from '../../../lib'

// --- Types ---
export type TimeUnit = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'
export type DisplayMode = 'box' | 'text' | 'compact'

interface CountdownTimerProps {
    targetDate: string | Date | Dayjs

    /** Các đơn vị muốn ẩn hẳn khỏi logic tính toán (sẽ cộng dồn vào đơn vị nhỏ hơn) */
    hiddenUnits?: TimeUnit[]

    /** * Tự động ẩn đơn vị hiển thị nếu giá trị bằng 0.
     * @default true
     */
    autoHideZeroes?: boolean

    mode?: DisplayMode
    paused?: boolean
    fallback?: React.ReactNode
    className?: string
    itemClass?: string
    onFinish?: () => void
}

interface TimeLeft {
    year: number
    month: number
    day: number
    hour: number
    minute: number
    second: number
}

// --- Logic Tính Toán (Không đổi) ---
const calculateTimeLeft = (
    target: Dayjs,
    hiddenUnits: TimeUnit[] = []
): TimeLeft | null => {
    const now = dayjs()
    if (now.isAfter(target)) return null

    let cursor = now.clone()
    const result: TimeLeft = {
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0,
    }

    const processUnit = (unit: TimeUnit) => {
        if (!hiddenUnits.includes(unit)) {
            const diff = target.diff(cursor, unit)
            result[unit] = diff
            cursor = cursor.add(diff, unit)
        }
    }

    processUnit('year')
    processUnit('month')
    processUnit('day')
    processUnit('hour')
    processUnit('minute')
    if (!hiddenUnits.includes('second')) {
        result.second = target.diff(cursor, 'second')
    }

    return result
}

// --- Config Label ---
const LABELS: Record<DisplayMode, Partial<Record<TimeUnit, string>>> = {
    box: {
        year: 'Năm',
        month: 'Tháng',
        day: 'Ngày',
        hour: 'Giờ',
        minute: 'Phút',
        second: 'Giây',
    },
    text: {
        year: ' năm',
        month: ' tháng',
        day: ' ngày',
        hour: ' giờ',
        minute: ' phút',
        second: ' giây',
    },
    compact: {
        year: 'y',
        month: 'mo',
        day: 'd',
        hour: 'h',
        minute: 'm',
        second: 's',
    },
}

// --- Component Chính ---
const CountdownTimer: React.FC<CountdownTimerProps> = ({
    targetDate,
    hiddenUnits = [],
    autoHideZeroes = true, // Mặc định là ẩn
    mode = 'compact',
    paused = false,
    fallback = "Time's up",
    className = '',
    itemClass = '',
    onFinish,
}) => {
    const target = useMemo(() => dayjs(targetDate), [targetDate])

    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
        calculateTimeLeft(target, hiddenUnits)
    )

    useEffect(() => {
        const initial = calculateTimeLeft(target, hiddenUnits)
        setTimeLeft(initial)
        if (!initial && onFinish) onFinish()

        if (paused || !initial) return

        const timer = setInterval(() => {
            const calculated = calculateTimeLeft(target, hiddenUnits)
            setTimeLeft(calculated)

            if (!calculated) {
                clearInterval(timer)
                if (onFinish) onFinish()
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [target, hiddenUnits, paused, onFinish])

    // Fallback khi hết giờ
    if (!timeLeft) {
        return (
            <div className={cn('text-danger text-xs font-medium', className)}>
                {fallback}
            </div>
        )
    }

    // --- Logic Lọc Unit để hiển thị ---
    const allUnits: TimeUnit[] = [
        'year',
        'month',
        'day',
        'hour',
        'minute',
        'second',
    ]

    const unitsToShow = allUnits.filter((unit) => {
        // 1. Nếu bị ẩn trong cấu hình hiddenUnits -> Loại bỏ
        if (hiddenUnits.includes(unit)) return false

        // 2. Nếu autoHideZeroes bật VÀ giá trị bằng 0 -> Loại bỏ
        if (autoHideZeroes && timeLeft[unit] === 0) return false

        return true
    })

    // Nếu autoHideZeroes ẩn hết tất cả (ví dụ còn 0s nhưng chưa null), hiển thị unit nhỏ nhất còn lại (thường là giây)
    // hoặc có thể return null tùy nhu cầu. Ở đây mình để render trống hoặc fallback.
    if (unitsToShow.length === 0) {
        // Trường hợp hiếm gặp: chưa hết giờ (mili giây) nhưng giây = 0.
        // Tốt nhất hiển thị giây = 0 hoặc fallback.
        return null
    }

    // --- Helper Render từng mode ---

    // 1. MODE BOX
    if (mode === 'box') {
        return (
            <div className={`flex flex-wrap gap-3 items-center ${className}`}>
                {unitsToShow.map((unit) => (
                    <div
                        key={unit}
                        className={`flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 p-2 rounded-md shadow-sm min-w-15 ${itemClass}`}
                    >
                        <span className="text-2xl font-bold text-gray-800 dark:text-gray-100 leading-none">
                            {String(timeLeft[unit]).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-medium mt-1">
                            {LABELS.box[unit]}
                        </span>
                    </div>
                ))}
            </div>
        )
    }

    // 2. MODE TEXT & COMPACT
    return (
        <div
            className={`font-medium text-gray-800 dark:text-gray-200 ${className}`}
        >
            {unitsToShow.map((unit, index) => (
                <React.Fragment key={unit}>
                    <span className={itemClass}>
                        {String(timeLeft[unit]).padStart(1, '0')}
                        {LABELS[mode][unit]}
                    </span>
                    {index < unitsToShow.length - 1 && <span> </span>}
                </React.Fragment>
            ))}
        </div>
    )
}

export default CountdownTimer
