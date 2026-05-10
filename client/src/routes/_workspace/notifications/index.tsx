import {
    NotificationCard,
    NotificationItemData,
    NotificationToolbar,
} from '@/features/notifications'
import { Button } from '@heroui/react'
import { createFileRoute } from '@tanstack/react-router'
import { Info, Settings } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_workspace/notifications/')({
    component: NotificationsPage,
})

const MOCK_NOTIFICATIONS: NotificationItemData[] = [
    {
        id: '1',
        type: 'comment',
        user: {
            name: 'Rúben Rocha',
            avatar: 'https://i.pravatar.cc/150?u=ruben',
        },
        message: (
            <span>
                <strong>Rúben Rocha</strong> commented on{' '}
                <strong>Process 99827373</strong>
            </span>
        ),
        subMessage:
            '"Oh, I finished de-bugging the phones, but the system\'s compiling for eighteen minutes, or twenty. So, some minor systems may go on and off for a while..."',
        timestamp: '9:42 AM',
        dateGroup: 'Today',
        isUnread: false,
    },
    {
        id: '2',
        type: 'error',
        message: (
            <span>
                <strong>Process 09200939</strong> has exceeded the retry limit
                on the Liveness step.
            </span>
        ),
        timestamp: '9:42 AM',
        dateGroup: 'Today',
        isUnread: true,
    },
    {
        id: '3',
        type: 'warning',
        message: (
            <span>
                <strong>Process 09200939</strong> is reaching the limit to
                terminate its process.
            </span>
        ),
        subMessage: 'Want to send an alert to the customer to notify?',
        actions: [
            { label: 'Go to process', variant: 'solid', color: 'primary' },
            { label: 'Discard', variant: 'bordered', color: 'default' },
        ],
        timestamp: '9:42 AM',
        dateGroup: 'Today',
        isUnread: false,
    },
    {
        id: '4',
        type: 'success',
        message: (
            <span>
                <strong>Process 09200939</strong> has been completed
                successfully.
            </span>
        ),
        timestamp: '9:42 AM',
        dateGroup: 'Yesterday',
        isUnread: false,
    },
    {
        id: '5',
        type: 'info',
        message: (
            <span>
                Your next call with <strong>Process 0000</strong> starts in 5
                minutes.
            </span>
        ),
        timestamp: '9:42 AM',
        dateGroup: 'Yesterday',
        isUnread: true,
    },
    {
        id: '6',
        type: 'review',
        user: {
            name: 'Rúben Rocha',
            avatar: 'https://i.pravatar.cc/150?u=ruben',
        },
        message: (
            <span>
                <strong>Rúben Rocha</strong> asks you to review{' '}
                <strong>Process 99827373</strong>
            </span>
        ),
        actions: [
            { label: 'Go to process', variant: 'solid', color: 'primary' },
            { label: 'Discard', variant: 'bordered', color: 'default' },
        ],
        timestamp: '9:42 AM',
        dateGroup: 'Yesterday',
        isUnread: false,
    },
]

export default function NotificationsPage() {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    // Group notifications by dateGroup
    const groupedNotifications = MOCK_NOTIFICATIONS.reduce(
        (acc, curr) => {
            if (!acc[curr.dateGroup]) acc[curr.dateGroup] = []
            acc[curr.dateGroup].push(curr)
            return acc
        },
        {} as Record<string, NotificationItemData[]>
    )

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) newSet.delete(id)
        else newSet.add(id)
        setSelectedIds(newSet)
    }

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Header */}
            <div className="px-6 py-4 border-b border-default-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-default-900">
                        Notifications
                    </h1>
                    <Info size={16} className="text-default-400 mt-1" />
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="light"
                        color="primary"
                        className="font-semibold"
                    >
                        Mark all as read
                    </Button>
                    <Button isIconOnly variant="light">
                        <Settings size={20} className="text-default-600" />
                    </Button>
                </div>
            </div>

            <NotificationToolbar />

            {/* Main Content / Timeline */}
            <div className="px-6 pb-20 max-w-5xl">
                {Object.entries(groupedNotifications).map(
                    ([groupName, items]) => (
                        <div key={groupName} className="mb-6">
                            {/* Timeline Divider */}
                            <div className="flex items-center py-4">
                                <div className="flex-grow h-px bg-default-200"></div>
                                <span className="px-4 text-xs font-semibold text-default-500 uppercase tracking-wider bg-white">
                                    {groupName}
                                </span>
                                <div className="flex-grow h-px bg-default-200"></div>
                            </div>

                            {/* Notification List */}
                            <div className="flex flex-col gap-2">
                                {items.map((item) => (
                                    <NotificationCard
                                        key={item.id}
                                        data={item}
                                        isSelected={selectedIds.has(item.id)}
                                        onToggle={() =>
                                            toggleSelection(item.id)
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    )
}
