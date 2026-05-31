import { PageHeading } from '@presentation/components'
import { useDevice } from '@presentation/hooks'

export function ProjectCenterLayout({
    children,
}: {
    children: React.ReactNode
}) {
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
                {children}
            </div>
        </>
    )
}
