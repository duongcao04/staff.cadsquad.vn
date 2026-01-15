import { INTERNAL_URLS } from '@/lib'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_workspace/jobs/')({
    beforeLoad: () => {
        throw redirect({
            to: INTERNAL_URLS.projectCenter,
        })
    },
    component: () => null,
})
