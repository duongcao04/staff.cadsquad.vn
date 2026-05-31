import { SchedulePage } from '@presentation/features/user-workspace/schedules'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_workspace/schedule')({
    component: SchedulePage,
})
