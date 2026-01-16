import JobScheduleModal from '@/features/schedules/components/modals/JobScheduleModal'
import ScheduleCalendarView, {
    CalendarSkeleton,
} from '@/features/schedules/components/views/ScheduleCalendarView'
import ScheduleListView from '@/features/schedules/components/views/ScheduleListView'
import { getPageTitle } from '@/lib'
import { jobScheduleOptions } from '@/lib/queries/options/job-queries'
import { AdminPageHeading } from '@/shared/components'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import { Button, Divider, Tab, Tabs, useDisclosure } from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { addMonths, format, subMonths } from 'date-fns'
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    List as ListIcon,
    Plus,
} from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'

// --- 1. DEFINE SEARCH PARAMS SCHEMA ---
const scheduleSearchSchema = z.object({
    month: z.number().catch(() => new Date().getMonth() + 1),
    year: z.number().catch(() => new Date().getFullYear()),
    view: z.enum(['calendar', 'list']).catch('calendar'), // New 'view' param
})

export const Route = createFileRoute('/_administrator/admin/schedule')({
    validateSearch: (search) => scheduleSearchSchema.parse(search),
    loaderDeps: ({ search }) => ({
        month: search.month,
        year: search.year,
    }),
    head: () => ({
        meta: [{ title: getPageTitle('Schedule') }],
    }),
    loader: async ({ context, deps }) => {
        return context.queryClient.ensureQueryData(
            jobScheduleOptions(deps.month, deps.year)
        )
    },
    pendingComponent: () => (
        <ScheduleLayout>
            <CalendarSkeleton />
        </ScheduleLayout>
    ),
    errorComponent: ({ error }) => (
        <div className="p-10 text-center text-danger">
            Error loading schedule: {error.message}
        </div>
    ),
    component: () => (
        <ScheduleLayout>
            <SchedulePage />
        </ScheduleLayout>
    ),
})

function ScheduleLayout({ children }: { children: React.ReactNode }) {
    const searchParams = Route.useSearch()
    const navigate = useNavigate({ from: Route.fullPath })
    // Derived Date State
    const currentDate = new Date(searchParams.year, searchParams.month - 1, 1)

    // Helper: Update URL Params
    const updateParams = (updates: Partial<typeof searchParams>) => {
        navigate({
            search: (old) => ({ ...old, ...updates }),
            replace: true,
        })
    }

    const handleDateChange = (newDate: Date) => {
        updateParams({
            month: newDate.getMonth() + 1,
            year: newDate.getFullYear(),
        })
    }
    return (
        <>
            <AdminPageHeading
                classNames={{
                    base: 'grid grid-cols-[300px_1fr_300px]',
                }}
                title="Schedule"
                actions={
                    <>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {/* Month Navigator */}
                            <div className="flex items-center bg-background-hovered rounded-xl border border-border-default p-1 shadow-sm">
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    onPress={() =>
                                        handleDateChange(
                                            subMonths(currentDate, 1)
                                        )
                                    }
                                >
                                    <ChevronLeft size={18} />
                                </Button>
                                <div className="px-4 font-bold text-text-default min-w-35 text-center">
                                    {format(currentDate, 'MMMM yyyy')}
                                </div>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    onPress={() =>
                                        handleDateChange(
                                            addMonths(currentDate, 1)
                                        )
                                    }
                                >
                                    <ChevronRight size={18} />
                                </Button>
                            </div>

                            <Button
                                variant="flat"
                                onPress={() => handleDateChange(new Date())}
                            >
                                Today
                            </Button>
                        </div>

                        <div className="flex items-center gap-3 ml-auto">
                            {/* View Switcher */}
                            <Tabs
                                aria-label="View options"
                                selectedKey={searchParams.view}
                                onSelectionChange={(key) =>
                                    updateParams({
                                        view: key as 'calendar' | 'list',
                                    })
                                }
                                size="sm"
                                radius="sm"
                                color="primary"
                            >
                                <Tab
                                    key="calendar"
                                    title={
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon size={14} />{' '}
                                            <span>Calendar</span>
                                        </div>
                                    }
                                />
                                <Tab
                                    key="list"
                                    title={
                                        <div className="flex items-center gap-2">
                                            <ListIcon size={14} />{' '}
                                            <span>List</span>
                                        </div>
                                    }
                                />
                            </Tabs>

                            <Divider orientation="vertical" className="h-6" />

                            <Button
                                color="primary"
                                startContent={<Plus size={16} />}
                            >
                                New Job
                            </Button>
                        </div>
                    </>
                }
            />
            <AdminContentContainer className="mt-1 flex flex-col h-[calc(100vh-180px)]">
                {children}
            </AdminContentContainer>
        </>
    )
}

function SchedulePage() {
    const searchParams = Route.useSearch()

    // Derived Date State
    const currentDate = new Date(searchParams.year, searchParams.month - 1, 1)

    const { data: jobsSchedule, isFetching } = useSuspenseQuery(
        jobScheduleOptions(searchParams.month, searchParams.year)
    )

    // Modal State
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
    const { isOpen, onOpen, onClose } = useDisclosure()

    const handleJobClick = (jobNo: string) => {
        setSelectedJobId(jobNo)
        onOpen()
    }

    return (
        <div
            className={`flex flex-col h-full ${isFetching ? 'opacity-70 pointer-events-none' : ''}`}
        >
            {/* --- Content Views --- */}
            <div className="flex-1 overflow-hidden flex flex-col relative">
                {searchParams.view === 'calendar' ? (
                    <ScheduleCalendarView
                        currentDate={currentDate}
                        jobsSchedule={jobsSchedule}
                        onJobClick={handleJobClick}
                    />
                ) : (
                    <ScheduleListView
                        currentDate={currentDate}
                        jobsSchedule={jobsSchedule}
                        onJobClick={handleJobClick}
                    />
                )}
            </div>

            {/* --- Job Details Modal --- */}
            {isOpen && selectedJobId && (
                <JobScheduleModal
                    isOpen={isOpen}
                    onClose={onClose}
                    jobNo={selectedJobId}
                />
            )}
        </div>
    )
}
