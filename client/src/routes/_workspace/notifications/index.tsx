import { NotificationCard, NotificationToolbar } from '@/features/notifications'
import { notificationsListOptions } from '@/lib'
import { NotificationHelper } from '@/lib/helpers'
import { Button } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Info, Settings } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_workspace/notifications/')({
    component: NotificationsPage,
})
export default function NotificationsPage() {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    // Fetch data từ API
    const { data } = useQuery(notificationsListOptions())
    const notifications = data?.notifications ?? []

    // Sử dụng Helper mới để tự động gom nhóm & Sắp xếp (Sort) theo thời gian
    const groupedNotifications =
        NotificationHelper.groupNotifications(notifications)

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

            {/* Bộ lọc (Search, Date, Type...) */}
            <NotificationToolbar />

            {/* Main Content / Timeline */}
            <div className="px-6 pb-20 max-w-5xl">
                {/* * LƯU Ý: Vì groupedNotifications giờ là Mảng (Array),
                 * chúng ta dùng thẳng .map() thay vì Object.entries()
                 */}
                {groupedNotifications.map((group) => (
                    <div key={group.groupName} className="mb-6">
                        {/* Timeline Divider */}
                        <div className="flex items-center py-4">
                            <div className="grow h-px bg-default-200"></div>
                            <span className="px-4 text-xs font-semibold text-default-500 uppercase tracking-wider bg-white">
                                {group.groupName}
                            </span>
                            <div className="grow h-px bg-default-200"></div>
                        </div>

                        {/* Notification List */}
                        <div className="flex flex-col gap-2">
                            {group.items.map((item) => (
                                <NotificationCard
                                    key={item.id}
                                    data={item}
                                    isSelected={selectedIds.has(item.id)}
                                    onToggle={() => toggleSelection(item.id)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
