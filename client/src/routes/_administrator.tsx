import {
    AdminMobileBottomNav,
    AppLoading,
    MobileLeftSidebar,
    PageWithHeaderLayout,
    ScrollArea,
    ScrollBar,
} from '@/shared/components'
import { DashboardRightPanel } from '@/shared/components/admin/DashboardRightPanel'
import { AdminSidebar } from '@/shared/components/admin/layouts/AdminSidebar'
import { useDevice } from '@/shared/hooks'
import { appStore, ESidebarStatus } from '@/shared/stores'
import { useDisclosure } from '@heroui/react'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { Suspense } from 'react'
import PushMobileLayout from '../shared/components/layouts/push-mobile-layout'

export const Route = createFileRoute('/_administrator')({
    component: AdminLayout,
})

function AdminLayout() {
    const { isSmallView } = useDevice()
    const adminLeftSidebar = useStore(
        appStore,
        (state) => state.adminLeftStatus
    )
    const adminRightSidebar = useStore(
        appStore,
        (state) => state.adminRightStatus
    )

    // Calculate margins for the central content
    const leftMargin = isSmallView
        ? '0px'
        : adminLeftSidebar === ESidebarStatus.COLLAPSE
          ? '80px'
          : '231px'

    const rightMargin = isSmallView
        ? '0px'
        : adminRightSidebar === ESidebarStatus.COLLAPSE
          ? '64px'
          : '290px'

    const IS_SHOW_HEADER = false
    const topOffset = IS_SHOW_HEADER ? (isSmallView ? '44px' : '56px') : 0

    const { isOpen, onOpenChange, onClose } = useDisclosure()

    return (
        <PushMobileLayout
            sidebarContent={<MobileLeftSidebar onHidden={onClose} />}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            <PageWithHeaderLayout header={<></>} showHeader={false}>
                <div className="relative w-full h-full flex items-start justify-start">
                    {/* Left Sidebar */}
                    {!isSmallView && (
                        <div
                            className="fixed left-0 z-40 space-y-6 h-full border-r border-border-muted bg-background"
                            style={{
                                top: topOffset,
                                width:
                                    adminLeftSidebar === ESidebarStatus.COLLAPSE
                                        ? '80px'
                                        : '231px',
                                transition:
                                    'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                            <AdminSidebar
                                isCollapsed={
                                    adminLeftSidebar === ESidebarStatus.COLLAPSE
                                }
                            />
                        </div>
                    )}

                    {/* Central Scroll Area */}
                    <Suspense fallback={<AppLoading />}>
                        <ScrollArea
                            className="size-full bg-background-muted"
                            style={{
                                marginLeft: leftMargin,
                                marginRight: rightMargin,
                                transition:
                                    'margin 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                            <ScrollBar orientation="horizontal" />
                            <ScrollBar orientation="vertical" />
                            <Outlet />
                        </ScrollArea>
                    </Suspense>

                    {/* Right Sidebar */}
                    {!isSmallView && (
                        <div
                            className="fixed right-0 z-40 border-l border-border-muted h-full space-y-6 bg-background"
                            style={{
                                top: topOffset,
                                width:
                                    adminRightSidebar ===
                                    ESidebarStatus.COLLAPSE
                                        ? '64px'
                                        : '290px',
                                transition:
                                    'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                            <DashboardRightPanel
                                isCollapsed={
                                    adminRightSidebar ===
                                    ESidebarStatus.COLLAPSE
                                }
                            />
                        </div>
                    )}
                </div>

                {isSmallView && <AdminMobileBottomNav />}
            </PageWithHeaderLayout>
        </PushMobileLayout>
    )
}
