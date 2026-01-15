import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'

import { ScrollArea, ScrollBar } from '../shared/components'
import { DashboardRightPanel } from '../shared/components/admin/DashboardRightPanel'
import { AdminHeader } from '../shared/components/admin/layouts/AdminHeader'
import { AdminSidebar } from '../shared/components/admin/layouts/AdminSidebar'
import { AdministratorGuard } from '../shared/guards'
import { appStore, ESidebarStatus } from '../shared/stores'
import { useDevice } from '../shared/hooks'
import MobileHeader from '../shared/components/layouts/Header/MobileHeader'

// Lưu ý: path là id ảo, không xuất hiện trên URL
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

    return (
        <AdministratorGuard>
            <div id="admin-page">
                <div className="fixed top-0 w-full z-50">
                    {!isSmallView ? <AdminHeader /> : <MobileHeader />}
                </div>
                {/* Height for header */}
                <div className={!isSmallView ? 'h-14' : 'h-11'} />
                <div className="relative w-full h-full flex items-start justify-start">
                    {!isSmallView && (
                        <div
                            className="fixed left-0 z-50 space-y-6 border-r border-border-default h-full bg-background"
                            style={{
                                top: !isSmallView ? '57px' : '45px',
                            }}
                        >
                            <AdminSidebar
                                isCollapsed={
                                    adminLeftSidebar === ESidebarStatus.COLLAPSE
                                }
                            />
                        </div>
                    )}
                    <ScrollArea
                        className="size-full bg-background-muted"
                        style={{
                            height: !isSmallView
                                ? 'calc(100vh-57px)'
                                : 'calc(100vh-44px)',
                            marginLeft: isSmallView
                                ? ''
                                : adminLeftSidebar === 'collapse'
                                  ? '80px'
                                  : '256px',
                            marginRight: isSmallView
                                ? ''
                                : adminRightSidebar === 'collapse'
                                  ? '100px'
                                  : '320px',
                            transition:
                                'margin 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                    >
                        <ScrollBar orientation="horizontal" />
                        <ScrollBar orientation="vertical" />
                        <div
                            style={{
                                paddingTop: isSmallView ? '80px' : '32px',
                                paddingBottom: isSmallView ? '80px' : '',
                                paddingInline: isSmallView ? '32px' : '',
                            }}
                        >
                            <Outlet />
                        </div>
                    </ScrollArea>
                    <div
                        className="fixed right-0 z-50 border-l border-border-default h-full space-y-6 bg-background"
                        style={{
                            top: !isSmallView ? '57px' : '45px',
                        }}
                    >
                        <DashboardRightPanel
                            isCollapsed={
                                adminRightSidebar === ESidebarStatus.COLLAPSE
                            }
                        />
                    </div>
                </div>
            </div>
        </AdministratorGuard>
    )
}
