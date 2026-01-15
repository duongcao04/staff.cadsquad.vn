import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
    '/_workspace/project-center/' as unknown as undefined
)({
    // beforeLoad chạy trước khi component được render
    beforeLoad: () => {
        // Ngay lập tức redirect sang tab mặc định (ví dụ: priority)
        throw redirect({
            to: '/project-center/$tab',
            params: { tab: 'active' },
            replace: true, // Quan trọng: thay thế history để nút Back hoạt động đúng
        })
    },
    // Component này sẽ không bao giờ kịp hiển thị vì bị redirect ngay lập tức
    component: () => null,
})
