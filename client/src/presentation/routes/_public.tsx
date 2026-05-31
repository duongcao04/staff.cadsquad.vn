import { Header } from '@presentation/components'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_public')({
    component: PublicLayout,
})

function PublicLayout() {
    return (
        <div className="size-full">
            <Header />
            {/* Height for header */}
            <div className="h-14" />
            <main className="size-full bg-background-muted">
                <Outlet />
            </main>
        </div>
    )
}
