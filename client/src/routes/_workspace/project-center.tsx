import { PageHeading } from '@/shared/components'
import { useDevice } from '@/shared/hooks'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_workspace/project-center')({
    component: ProjectCenterLayout,
})

function ProjectCenterLayout() {
    const { isSmallView } = useDevice()
    return (
        <>
            <PageHeading
                title="Project center"
                classNames={{
                    wrapper: `${isSmallView ? '!py-3' : '!py-2'} pl-6 pr-3.5 border-b border-border-default`,
                }}
            />
            <div
                className={`size-full ${isSmallView ? 'container' : 'pl-5 pr-3.5'} pt-5`}
            >
                <Outlet />
            </div>
        </>
    )
}
