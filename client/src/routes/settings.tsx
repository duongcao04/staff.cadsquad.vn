import SettingsSidebar from '@/features/settings/components/SettingsSidebar'
import { Header, PageWithHeaderContainer } from '@/shared/components'
import MobileHeader from '@/shared/components/layouts/Header/MobileHeader'
import { AuthGuard } from '@/shared/guards'
import { useDevice } from '@/shared/hooks'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/settings')({
    component: SettingsLayout,
})

function SettingsLayout() {
    const { isSmallView } = useDevice()

    return (
        <AuthGuard>
            <PageWithHeaderContainer
                header={<Header />}
                mobileHeader={<MobileHeader />}
            >
                <div
                    className="size-full max-w-7xl mx-auto"
                    style={{ marginBlock: !isSmallView ? '24px' : '' }}
                >
                    {!isSmallView && (
                        <div className="fixed top-20 px-3">
                            <h2 className="text-2xl font-bold text-text-default">
                                Settings
                            </h2>
                            <p className="text-sm text-text-subdued">
                                Manage your account preferences
                            </p>
                        </div>
                    )}
                    <div className="size-full grid grid-cols-1 md:grid-cols-[260px_1fr] gap-2 items-start">
                        {/* Sticky Sidebar */}
                        {!isSmallView && (
                            <div className="fixed top-38 w-70">
                                <SettingsSidebar />
                            </div>
                        )}
                        <div />

                        {/* Main Content Area */}
                        <main className="size-full px-1 flex-1 bg-background-muted">
                            <div
                                className="px-6"
                                style={{
                                    paddingBottom: isSmallView ? '80px' : '',
                                }}
                            >
                                <Outlet />
                            </div>
                        </main>
                    </div>
                </div>
            </PageWithHeaderContainer>
        </AuthGuard>
    )
}
