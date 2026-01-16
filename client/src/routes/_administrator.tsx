import {
    PageWithHeaderContainer,
    ScrollArea,
    ScrollBar,
} from '@/shared/components'
import { DashboardRightPanel } from '@/shared/components/admin/DashboardRightPanel'
import { AdminHeader } from '@/shared/components/admin/layouts/AdminHeader'
import { AdminSidebar } from '@/shared/components/admin/layouts/AdminSidebar'
import MobileHeader from '@/shared/components/layouts/Header/MobileHeader'
import { AdministratorGuard } from '@/shared/guards'
import { useDevice } from '@/shared/hooks'
import { appStore, ESidebarStatus } from '@/shared/stores'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'

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
          : '256px'

    const rightMargin = isSmallView
        ? '0px'
        : adminRightSidebar === ESidebarStatus.COLLAPSE
          ? '64px'
          : '290px'

    const topOffset = isSmallView ? '44px' : '56px'

    return (
        <AdministratorGuard>
            <PageWithHeaderContainer
                header={<AdminHeader />}
                mobileHeader={<MobileHeader />}
                scrollable={false}
            >
                <div className="relative w-full h-full flex items-start justify-start">
                    {/* Left Sidebar */}
                    {!isSmallView && (
                        <div
                            className="fixed left-0 z-40 space-y-6 border-r border-border-default h-full bg-background"
                            style={{
                                top: topOffset,
                                width:
                                    adminLeftSidebar === ESidebarStatus.COLLAPSE
                                        ? '80px'
                                        : '256px',
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
                        <div
                            style={{
                                paddingTop: isSmallView ? '12px' : '20px',
                                paddingBottom: isSmallView ? '80px' : '32px',
                                paddingInline: isSmallView ? '20px' : '20px',
                            }}
                        >
                            <Outlet />
                        </div>
                    </ScrollArea>

                    {/* Right Sidebar */}
                    {!isSmallView && (
                        <div
                            className="fixed right-0 z-40 border-l border-border-default h-full space-y-6 bg-background"
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
            </PageWithHeaderContainer>
        </AdministratorGuard>
    )
}
