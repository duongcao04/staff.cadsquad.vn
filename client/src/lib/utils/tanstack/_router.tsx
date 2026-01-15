import { useNavigate } from '@tanstack/react-router'
import { startTransition } from 'react'

export function useUpdateSearchParams(fromRoute: string) {
    const navigate = useNavigate({ from: fromRoute as any })

    return <T,>(updater: (old: T) => T) => {
        startTransition(() => {
            navigate({
                search: updater as any,
                replace: true,
            })
        })
    }
}
