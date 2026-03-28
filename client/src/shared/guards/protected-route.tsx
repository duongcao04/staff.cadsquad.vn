import { cookie, COOKIES, INTERNAL_URLS } from '@/lib'
import { usePermission } from '@/shared/hooks'
import { addToast } from '@heroui/react'
import { AppPermission } from '@staff-cadsquad/shared'
import { useLocation, useRouter } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'

interface ProtectedRouteProps {
    children: React.ReactNode
    permissions?: AppPermission | AppPermission[] | string | string[]
    requireAll?: boolean
}
export function ProtectedRoute({
    children,
    permissions = [],
    requireAll = false,
}: ProtectedRouteProps) {
    const router = useRouter()
    const { pathname } = useLocation()
    const { user, hasSomePermissions, hasEveryPermissions, loadingProfile } =
        usePermission()
    const [isChecking, setIsChecking] = useState(true)

    const permsArray = useMemo(
        () => (Array.isArray(permissions) ? permissions : [permissions]),
        [JSON.stringify(permissions)]
    )

    useEffect(() => {
        const validate = async () => {
            const token = cookie.get(COOKIES.authentication)
            const sessionId = cookie.get(COOKIES.sessionId) // Lấy sessionId từ cookie

            // 1. Kiểm tra Token và SessionId vật lý
            // Nếu thiếu 1 trong 2, coi như phiên không hợp lệ
            if (!token || !sessionId) {
                router.navigate({
                    href: `${INTERNAL_URLS.login}?redirect=${encodeURIComponent(pathname)}`,
                })
                return
            }

            // 2. Chờ load Profile (Lúc này API profile sẽ đi qua JwtGuard ở Backend
            // để check sid trong Redis, nếu sid bị revoke, API này sẽ trả về 401)
            if (loadingProfile) return

            // 3. Kiểm tra User tồn tại (được trả về sau khi API profile thành công)
            if (!user) {
                // Nếu API trả về lỗi (do bị revoke ở backend), user sẽ null
                router.navigate({ href: INTERNAL_URLS.login })
                return
            }

            // 4. Kiểm tra Quyền thực tế
            const isAllowed =
                permsArray.length === 0
                    ? true
                    : requireAll
                      ? hasEveryPermissions(permsArray)
                      : hasSomePermissions(permsArray)

            if (!isAllowed) {
                addToast({
                    title: 'Truy cập bị từ chối',
                    description: 'Bạn không có quyền truy cập vào trang này.',
                    color: 'danger',
                })
                router.navigate({ href: '/' })
                return
            }

            setIsChecking(false)
        }

        validate()
    }, [
        user,
        loadingProfile,
        permsArray,
        requireAll,
        pathname,
        router,
        hasSomePermissions,
        hasEveryPermissions,
    ])

    if (loadingProfile || isChecking) return <LoadingScreen />

    return <>{children}</>
}

function LoadingScreen() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />

                <p className="text-sm text-text-default">Verifying access...</p>
            </div>
        </div>
    )
}
