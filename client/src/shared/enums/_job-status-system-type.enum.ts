export const JobStatusSystemTypeEnum = {
    STANDARD: 'STANDARD', // Trạng thái bình thường (To do, In Progress...)
    COMPLETED: 'COMPLETED', // Đã làm xong việc (nhưng chưa đóng hồ sơ)
    WAIT_REVIEW: 'WAIT_REVIEW', // Đợi admin duyệt
    TERMINATED: 'TERMINATED', // Kết thúc vòng đời (Finished, Cancelled, Closed...)
} as const
export type JobStatusSystemTypeEnum =
    (typeof JobStatusSystemTypeEnum)[keyof typeof JobStatusSystemTypeEnum]
