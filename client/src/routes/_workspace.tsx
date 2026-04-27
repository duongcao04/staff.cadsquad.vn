import { Header, PageWithHeaderContainer, Sidebar } from '@/shared/components'
import { AppLoading } from '@/shared/components'
import MobileHeader from '@/shared/components/layouts/Header/MobileHeader'
import { AuthGuard } from '@/shared/guards'
import { useDevice } from '@/shared/hooks'
import { appStore, ESidebarStatus } from '@/shared/stores'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'

export const Route = createFileRoute('/_workspace')({
    pendingComponent: AppLoading,
    component: WorkspaceLayout,
})

function WorkspaceLayout() {
    const sidebarStatus = useStore(appStore, (state) => state.sidebarStatus)
    const { isSmallView } = useDevice()

    const topOffset = isSmallView ? '44px' : '56px'

    const leftMargin = isSmallView
        ? '0px'
        : sidebarStatus === ESidebarStatus.COLLAPSE
          ? '64px'
          : '300px'

    return (
        <AuthGuard>
            <PageWithHeaderContainer
                header={<Header />}
                mobileHeader={<MobileHeader />}
            >
                <main className="size-full relative flex items-start justify-start">
                    {!isSmallView && (
                        <div className="fixed z-50" style={{ top: topOffset }}>
                            <Sidebar />
                        </div>
                    )}

                    <div
                        className="size-full bg-background"
                        style={{
                            marginLeft: leftMargin,
                            transition:
                                'margin 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                    >
                        <Outlet />
                    </div>
                </main>
            </PageWithHeaderContainer>
        </AuthGuard>
    )
}
