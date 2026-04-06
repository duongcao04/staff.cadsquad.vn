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
}
