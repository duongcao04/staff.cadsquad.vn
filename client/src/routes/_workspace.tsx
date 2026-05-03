import {
    AppLoading,
    Header,
    MobileHeader,
    MobileLeftSidebar,
    PageWithHeaderLayout,
    Sidebar,
} from '@/shared/components'
import { AuthGuard } from '@/shared/guards'
import { useDevice } from '@/shared/hooks'
import { appStore, ESidebarStatus } from '@/shared/stores'
import { useDisclosure } from '@heroui/react'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { MobileBottomNav } from '../shared/components/layouts/mobile-bottom-nav'
import PushMobileLayout from '../shared/components/layouts/push-mobile-layout'
import { useLayout } from '../shared/contexts'

export const Route = createFileRoute('/_workspace')({
    pendingComponent: AppLoading,
    component: WorkspaceLayout,
})

function WorkspaceLayout() {
    const { showHeader } = useLayout()

    const sidebarStatus = useStore(appStore, (state) => state.sidebarStatus)
    const { isSmallView } = useDevice()

    const topOffset = isSmallView ? '44px' : '56px'

    const leftMargin = isSmallView
        ? '0px'
        : sidebarStatus === ESidebarStatus.COLLAPSE
          ? '64px'
          : '300px'

    const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure()

    return (
        <AuthGuard>
            <PushMobileLayout
                sidebarContent={<MobileLeftSidebar onHidden={onClose} />}
                isOpen={isOpen}
                onOpenChange={onOpenChange}
            >
                <PageWithHeaderLayout
                    header={<Header />}
                    mobileHeader={<MobileHeader onOpenMenu={onOpen} />}
                    showHeader={showHeader}
                >
                    <main>
                        {!isSmallView && (
                            <div
                                className="fixed z-50"
                                style={{ top: topOffset }}
                            >
                                <Sidebar />
                            </div>
                        )}

                        <div
                            className="size-full bg-background-muted"
                            style={{
                                marginLeft: leftMargin,
                                transition:
                                    'margin 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                            <Outlet />
                        </div>
                    </main>
                </PageWithHeaderLayout>

                {isSmallView && <MobileBottomNav />}
            </PushMobileLayout>
        </AuthGuard>
    )
}
