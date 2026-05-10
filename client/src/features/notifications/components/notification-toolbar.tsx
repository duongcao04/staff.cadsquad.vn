import { Button, Select, SelectItem } from '@heroui/react'
import { FilterIcon } from 'lucide-react'

export const NotificationToolbar = () => {
    return (
        <div className="px-6 py-4 flex flex-wrap items-center gap-3">
            <Select
                placeholder="Type"
                size="sm"
                className="w-32"
                variant="bordered"
                aria-label="Filter by Type"
            >
                <SelectItem key="all">All Types</SelectItem>
                <SelectItem key="alerts">System Alerts</SelectItem>
                <SelectItem key="comments">Comments</SelectItem>
                <SelectItem key="requests">Requests</SelectItem>
            </Select>

            <Select
                placeholder="Date"
                size="sm"
                className="w-32"
                variant="bordered"
                aria-label="Filter by Date"
            >
                <SelectItem key="today">Today</SelectItem>
                <SelectItem key="yesterday">Yesterday</SelectItem>
                <SelectItem key="last7">Last 7 Days</SelectItem>
            </Select>

            <Button
                size="sm"
                variant="flat"
                color="primary"
                className="bg-primary-50 text-primary-600 font-semibold"
                startContent={<FilterIcon size={14} />}
            >
                Add filter
            </Button>

            <Button
                size="sm"
                variant="light"
                className="text-default-500 font-medium"
            >
                Clear all
            </Button>
        </div>
    )
}
