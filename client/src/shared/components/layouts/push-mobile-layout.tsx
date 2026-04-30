import { ScrollShadow } from '@heroui/react'

export default function PushMobileLayout({
    sidebarContent,
    children: mainContent,
    isOpen: isOpenSidebar,
    onOpenChange: onOpenChangeSidebar,
}: {
    sidebarContent: React.ReactNode
    children: React.ReactNode
    isOpen: boolean
    onOpenChange: (state: boolean) => void
}) {
    // Định nghĩa độ rộng của sidebar (Ví dụ: 85% màn hình mobie, tối đa 350px)
    // Cần match class này ở cả 2 nơi để hiệu ứng đẩy khớp nhau
    const SIDEBAR_WIDTH_CLASS = 'w-[85vw] sm:w-[350px]'
    const PUSH_TRANSLATE_CLASS = 'translate-x-[85vw] sm:translate-x-[350px]'

    return (
        // Wrapper ngoài cùng phải ẩn overflow trục X để không xuất hiện thanh cuộn ngang khi đẩy
        <div className="relative flex h-screen w-full overflow-x-hidden bg-background">
            {/* ============================== */}
            {/* 1. LEFT SIDEBAR                */}
            {/* ============================== */}
            <div
                className={`absolute left-0 top-0 z-10 h-full ${SIDEBAR_WIDTH_CLASS} border-r border-default-200 transition-transform duration-300 ease-in-out ${
                    isOpenSidebar ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <ScrollShadow className="h-full w-full" hideScrollBar>
                    {sidebarContent}
                </ScrollShadow>
            </div>

            {/* ============================== */}
            {/* 2. MAIN CONTENT (BỊ ĐẨY)       */}
            {/* ============================== */}
            <div
                className={`relative z-20 flex h-full w-full flex-col bg-default-50 shadow-[-10px_0_20px_rgba(0,0,0,0.05)] transition-transform duration-300 ease-in-out ${
                    isOpenSidebar ? PUSH_TRANSLATE_CLASS : 'translate-x-0'
                }`}
            >
                {/* Lớp overlay vô hình trên Content chính để bấm vào là đóng menu (UX giống các app native) */}
                {isOpenSidebar && (
                    <div
                        className="absolute inset-0 z-50 cursor-pointer bg-black/5 transition-opacity"
                        onClick={() => onOpenChangeSidebar(false)}
                        aria-hidden="true"
                    />
                )}
                {/* Nội dung trang hiện tại */}
                <main className="flex-1 overflow-y-auto">
                    <>{mainContent}</>
                </main>
            </div>
        </div>
    )
}
