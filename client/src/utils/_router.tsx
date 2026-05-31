import { router } from '@/main'
import { startTransition } from 'react'

export class RouteUtil {
    static updateParams<TSearch>(newParams: Partial<TSearch>) {
        startTransition(() => {
            router.navigate({
                search: (prev: any) => ({ ...prev, ...newParams }) as never,
                replace: true,
            })
        })
    }

    /**
     * Generic navigate wrapper typed exactly as router.navigate.
     * This preserves strict type inference for 'to', 'params', and 'search'.
     */
    static navigate: typeof router.navigate = (opts) => {
        startTransition(() => {
            // We cast opts to any internally because TypeScript struggles
            // to reconcile spreads inside heavily generic wrappers,
            // but the external API remains 100% strictly typed for the caller.
            router.navigate({ replace: true, ...(opts as any) })
        })

        // TanStack's navigate expects a Promise return type
        return Promise.resolve()
    }
}
