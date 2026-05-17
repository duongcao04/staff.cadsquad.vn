import dayjs from 'dayjs'

export class NotificationHelper {
    /**
     * Xác định tên nhóm (Label) và Trọng số sắp xếp (Order)
     * Order càng nhỏ thì càng hiển thị ở trên cùng.
     */
    private static getGroupInfo(dateInput: string | Date): {
        label: string
        order: number
    } {
        const itemDate = dayjs(dateInput)
        const now = dayjs()

        // 1. Các mốc cố định gần đây
        if (itemDate.isSame(now, 'day')) return { label: 'Today', order: 0 }
        if (itemDate.isSame(now.subtract(1, 'day'), 'day'))
            return { label: 'Yesterday', order: 1 }
        if (itemDate.isAfter(now.subtract(7, 'day'), 'day'))
            return { label: 'Last 7 Days', order: 2 }

        // 2. Tính toán khoảng cách (Diff)
        const diffMonths = now.diff(itemDate, 'month')
        const diffYears = now.diff(itemDate, 'year')

        // 3. Phân loại theo NĂM (1 đến 6 năm)
        if (diffYears >= 1) {
            if (diffYears <= 6) {
                return {
                    label: `${diffYears} Year${diffYears > 1 ? 's' : ''} Ago`,
                    order: 100 + diffYears, // Order từ 101 -> 106
                }
            }
            return { label: 'Older', order: 999 } // Lớn hơn 6 năm
        }

        // 4. Phân loại theo THÁNG (1 đến 11 tháng)
        if (diffMonths >= 1) {
            return {
                label: `${diffMonths} Month${diffMonths > 1 ? 's' : ''} Ago`,
                order: 10 + diffMonths, // Order từ 11 -> 21
            }
        }

        // 5. Fallback: Cho những ngày lớn hơn 7 ngày nhưng chưa đủ 1 tháng tròn (ví dụ 20 ngày trước)
        return { label: 'Earlier This Month', order: 3 }
    }

    /**
     * Nhóm danh sách Notifications theo thời gian động.
     */
    public static groupNotifications<T extends { createdAt: string | Date }>(
        notifications: T[]
    ): { groupName: string; items: T[] }[] {
        // Sử dụng Map để gom nhóm động
        const groupsMap = new Map<string, { order: number; items: T[] }>()

        // Phân loại từng notification
        for (const notif of notifications) {
            const { label, order } = this.getGroupInfo(notif.createdAt)

            if (!groupsMap.has(label)) {
                groupsMap.set(label, { order, items: [] })
            }
            groupsMap.get(label)!.items.push(notif)
        }

        // Chuyển Map thành Array và SẮP XẾP theo thứ tự thời gian (từ mới nhất đến cũ nhất)
        return Array.from(groupsMap.entries())
            .sort((a, b) => a[1].order - b[1].order)
            .map(([groupName, data]) => ({
                groupName,
                items: data.items,
            }))
    }
}
