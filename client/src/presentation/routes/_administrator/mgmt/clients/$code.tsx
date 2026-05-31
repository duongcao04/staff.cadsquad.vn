import { ClientDetailPage } from '@presentation/features/administrator/management/client/detail'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export enum TabOptions {
    HISTORY = 'history',
}
export const clientDetailSchema = z.object({
    tab: z.nativeEnum(TabOptions).default(TabOptions.HISTORY),
})
export type TClientDetailSchema = z.infer<typeof clientDetailSchema>
export const Route = createFileRoute('/_administrator/mgmt/clients/$code')({
    validateSearch: (search) => clientDetailSchema.parse(search),
    loaderDeps: ({ search }) => ({ search }),
    component: ClientDetailPage,
})
