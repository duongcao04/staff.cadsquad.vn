export const ProjectCenterTabEnum = {
    /*
     * Toàn bộ jobs
     * Ngày hết hạn / Due at > hôm nay
     * {"dueAt":{"gt":"2025-12-10T17:00:00.000Z"}}
     */
    ACTIVE: 'active',
    /*
     * Xem jobs
     * Ngày hết hạn từ 1 -> 7 ngày tính từ ngày hôm nau
     * isPinned
     * Status: ! ['Completed', 'Finish']
     * {"dueAt":{"gt":"2025-12-10T17:00:00.000Z","lt":"2025-12-17T17:00:00.000Z"},"isPinned":true,"status":{"systemType":{"notIn":["COMPLETED","TERMINATED"]}}}
     */
    PRIORITY: 'priority',

    /*
     * Xem jobs
     *  Đã hết hạn dueAt: Date tim
     * isPinned
     * Status: ! ['Completed', 'Finish']
     * {"dueAt":{"lte":"2025-12-10T17:00:00.000Z"},"status":{"systemType":{"notIn":["COMPLETED","TERMINATED"]}}}
     */
    LATE: 'late',
    /*
     * Xem jobs
     * Status: 'Delivered'
     * {"status":{"code":"delivered"}}
     */
    DELIVERED: 'delivered',
    /*
     * Xem jobs
     * Status: ['Completed','Finish']
     * {"status":{"systemType":{"in":["COMPLETED","TERMINATED"]}}}
     */
    COMPLETED: 'completed',
    /*
     * Xem jobs
     * Đã xóa
     * {"deletedAt":{"not":null}}
     */
    CANCELLED: 'cancelled',
} as const
// 2. Tạo Type từ Object đó (để dùng cho biến/props)
export type ProjectCenterTabEnum =
    (typeof ProjectCenterTabEnum)[keyof typeof ProjectCenterTabEnum]
