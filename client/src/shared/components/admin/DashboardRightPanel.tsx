import {
    dateFormatter,
    getGradientColor,
    INTERNAL_URLS,
    lightenHexColor,
    optimizeCloudinary,
} from '@/lib'
import { jobsDueOnDateOptions } from '@/lib/queries'
import { Avatar, AvatarGroup } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
    Calendar as CalendarIcon,
    CalendarX,
    ChevronLeft,
    RefreshCw,
} from 'lucide-react'
import { useState } from 'react'
import { toggleAdminRightSidebar } from '../../stores'
import { HeroButton } from '../ui/hero-button'
import WeekCalendar from './WeekCalendar'

export const DashboardRightPanel = ({
    isCollapsed = false,
}: {
    isCollapsed?: boolean
}) => {
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split('T')[0]
    )

    const {
        data: jobs,
        refetch,
        isFetching: isLoadingJobs,
    } = useQuery({
        ...jobsDueOnDateOptions(selectedDate),
        enabled: !isCollapsed,
    })

    return (
        <div
            className={`
                hidden xl:flex flex-col transition-all duration-300 ease-in-out sticky top-0 right-0
                ${isCollapsed ? 'w-20 py-4 px-2' : 'w-80 p-6'}
            `}
        >
            {/* Calendar Section */}
            {!isCollapsed ? (
                // EXPANDED: Full Calendar
                <div className="mb-8">
                    <WeekCalendar
                        onChangeDate={(date) =>
                            setSelectedDate(date.toISOString().split('T')[0])
                        }
                        isCollapsed={isCollapsed}
                    />
                </div>
            ) : (
                // COLLAPSED: Simple Icon
                <div className="flex flex-col items-center mb-8 gap-2">
                    <HeroButton
                        onPress={toggleAdminRightSidebar}
                        isIconOnly
                        size="sm"
                        variant="bordered"
                        className="border-1"
                        color="default"
                    >
                        <ChevronLeft size={18} />
                    </HeroButton>
                    <div className="mt-2 w-10 h-10 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center">
                        <CalendarIcon size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-text-default">
                        {dateFormatter(selectedDate, {
                            format: 'dateMonth',
                        })}
                    </span>
                </div>
            )}

            {/* Schedule Section */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <div
                    className={`flex items-center mb-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                >
                    {!isCollapsed && (
                        <div className="w-full flex items-end justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-text-subdued">
                                    Events for{' '}
                                </h3>
                                <h4 className="text-base font-medium text-text-7">
                                    {dateFormatter(selectedDate, {
                                        format: 'longDate',
                                    })}
                                </h4>
                            </div>
                            <HeroButton
                                size="sm"
                                onPress={refetch}
                                variant="bordered"
                                color="default"
                                isIconOnly
                                className="border-1"
                                startContent={
                                    <RefreshCw
                                        size={16}
                                        className={`${
                                            isLoadingJobs
                                                ? 'animate-spin-smooth'
                                                : ''
                                        } text-text-7`}
                                    />
                                }
                            />
                        </div>
                    )}
                </div>

                {!isCollapsed && (
                    <div className="space-y-4">
                        {isLoadingJobs && (
                            <JobSkeleton count={3} isCollapsed={isCollapsed} />
                        )}
                        {!isLoadingJobs && jobs && jobs.length === 0 ? (
                            <div className="border border-text-subdued py-6 rounded-lg flex flex-col items-center justify-center gap-1 text-text-subdued">
                                <CalendarX size={32} strokeWidth={1.2} />
                                <p className="text-sm mt-2">
                                    No events scheduled for this day.
                                </p>
                            </div>
                        ) : (
                            jobs?.map((item, index) => {
                                const borderLeftColor = getGradientColor(
                                    index * 30
                                )
                                const borderColor = lightenHexColor(
                                    getGradientColor(index * 30),
                                    50
                                )
                                const backgroundColor = lightenHexColor(
                                    getGradientColor(index * 30),
                                    96
                                )
                                const collapseBackground = lightenHexColor(
                                    getGradientColor(index * 30),
                                    90
                                )

                                return (
                                    <Link
                                        key={item.id}
                                        className="block"
                                        to={INTERNAL_URLS.getJobDetailUrl(
                                            item.no
                                        )}
                                        target="_blank"
                                    >
                                        <div
                                            className={`
                                    relative group transition-all cursor-pointer hover:shadow-sm
                                    ${
                                        isCollapsed
                                            ? 'w-10 h-10 rounded-full flex items-center justify-center mx-auto'
                                            : `p-4 rounded-xl border-l-6 hover:bg-white border-1`
                                    }
                                `}
                                            style={{
                                                borderColor: borderColor,
                                                borderLeftColor:
                                                    borderLeftColor,
                                                backgroundColor: isCollapsed
                                                    ? collapseBackground
                                                    : backgroundColor,
                                            }}
                                        >
                                            {!isCollapsed ? (
                                                // EXPANDED: Detailed Card
                                                <>
                                                    <h5 className="font-bold text-slate-800 text-sm mb-1 truncate">
                                                        {item.displayName}
                                                    </h5>
                                                    <p className="text-xs text-slate-500 mb-3">
                                                        {dateFormatter(
                                                            item.dueAt
                                                        )}
                                                    </p>
                                                    <div className="flex">
                                                        <AvatarGroup
                                                            isBordered
                                                            max={3}
                                                            size="sm"
                                                        >
                                                            {item.assignments.map(
                                                                (
                                                                    ass,
                                                                    index
                                                                ) => (
                                                                    <Avatar
                                                                        key={
                                                                            index
                                                                        }
                                                                        src={optimizeCloudinary(
                                                                            ass
                                                                                .user
                                                                                .avatar
                                                                        )}
                                                                        classNames={{
                                                                            base: 'size-7! opacity-100!',
                                                                        }}
                                                                        alt="avatar"
                                                                        isDisabled
                                                                    />
                                                                )
                                                            )}
                                                        </AvatarGroup>
                                                    </div>
                                                </>
                                            ) : (
                                                // COLLAPSED: Simple Dot indicator with tooltip behavior
                                                <div
                                                    className={`w-3 h-3 rounded-full bg-blue-500`}
                                                    title={item.displayName}
                                                ></div>
                                            )}
                                        </div>
                                    </Link>
                                )
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

interface JobSkeletonProps {
    count?: number
    isCollapsed?: boolean
}

const JobSkeleton = ({ count = 3, isCollapsed = false }: JobSkeletonProps) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="block animate-pulse mb-3" // Add margin bottom if your list needs spacing
                >
                    <div
                        className={`
              relative transition-all 
              ${
                  isCollapsed
                      ? 'w-10 h-10 rounded-full mx-auto bg-slate-100 flex items-center justify-center'
                      : 'p-4 rounded-xl border-l-6 border-slate-200 bg-white border-1'
              }
            `}
                    >
                        {!isCollapsed ? (
                            // EXPANDED SKELETON
                            <div className="w-full">
                                {/* Title Line */}
                                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>

                                {/* Date Line */}
                                <div className="h-3 bg-slate-100 rounded w-1/3 mb-3"></div>

                                {/* Avatars */}
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="w-6 h-6 rounded-full border-2 border-white bg-slate-200"
                                        ></div>
                                    ))}
                                    {/* Extra count bubble */}
                                    <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white"></div>
                                </div>
                            </div>
                        ) : (
                            // COLLAPSED SKELETON
                            <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                        )}
                    </div>
                </div>
            ))}
        </>
    )
}
