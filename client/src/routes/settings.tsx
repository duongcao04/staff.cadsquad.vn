import { createFileRoute, Outlet } from '@tanstack/react-router'

import { Header, ScrollArea, ScrollBar } from '../shared/components'
import MobileHeader from '../shared/components/layouts/Header/MobileHeader'
import SettingsSidebar from '../features/settings/components/SettingsSidebar'
import { AuthGuard } from '../shared/guards'
import { useDevice } from '../shared/hooks'

export const Route = createFileRoute('/settings')({
    component: SettingsLayout,
})

function SettingsLayout() {
    const { isSmallView } = useDevice()
    return (
        <AuthGuard>
            <div className="fixed top-0 w-full z-50">
                {!isSmallView ? <Header /> : <MobileHeader />}
            </div>
            {/* Height for header */}
            <div className={!isSmallView ? 'h-14' : 'h-11'} />

            <div className="size-full bg-background-muted">
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
                        <main className="size-full px-1 flex-1 min-w-0 bg-background-muted">
                            <ScrollArea
                                className="size-full"
                                style={{
                                    height: !isSmallView
                                        ? 'calc(100vh-57px)'
                                        : 'calc(100vh-44px)',
                                }}
                            >
                                <ScrollBar orientation="horizontal" />
                                <ScrollBar orientation="vertical" />
                                <div
                                    className="px-6"
                                    style={{
                                        paddingBottom: isSmallView
                                            ? '80px'
                                            : '',
                                    }}
                                >
                                    <Outlet />
                                </div>
                            </ScrollArea>
                        </main>
                    </div>
                </div>
            </div>
        </AuthGuard>
    )
}
