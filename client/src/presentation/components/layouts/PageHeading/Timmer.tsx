import React, { useEffect, useState } from 'react'

const Timmer: React.FC = () => {
    const [now, setNow] = useState(new Date())
    // const locale = useLocale()

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date())
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    // Format time as HH:mm:ss
    const timeString = now.toLocaleTimeString()
    // const dateString = now.toLocaleDateString(locale, {
    //     weekday: 'long',
    //     year: 'numeric',
    //     month: 'long',
    //     day: 'numeric',
    // })

    return (
        <div className="font-arial flex flex-col text-right">
            <span className="text-[10px] lg:text-xs text-text-6 font-medium dark:text-text-4">
                Viet Nam
            </span>
            <span
                className="-mt-0.5 text-sm lg:text-lg font-medium"
                suppressHydrationWarning
            >
                {timeString}
            </span>
        </div>
    )
}

export default React.memo(Timmer)
