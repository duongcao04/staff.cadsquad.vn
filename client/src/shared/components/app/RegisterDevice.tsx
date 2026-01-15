import { userDeviceApi } from '@/lib/api'
import { messaging } from '@/lib/firebase'
import { useMutation } from '@tanstack/react-query'
import { getToken } from 'firebase/messaging'
import { useEffect } from 'react'
import { envConfig } from '../../../lib'

export const RegisterDevice = () => {
    const { mutate: register } = useMutation({
        mutationFn: (data: { value: string; type: string }) =>
            userDeviceApi.registerDevice(data.value, data.type),
        onSuccess: (_) => {
            console.log('✅ Device token updated successfully')
        },
    })

    useEffect(() => {
        const setupNotifications = async () => {
            try {
                if (!messaging || typeof window === 'undefined') return

                // 1. Kiểm tra quyền
                const permission = await Notification.requestPermission()
                if (permission !== 'granted') return

                // 2. Lấy Token từ Firebase
                const fcmToken = await getToken(messaging, {
                    vapidKey: envConfig.FIREBASE.vapidKey,
                })

                console.log(fcmToken)

                register({
                    value: fcmToken,
                    type: (window as any).__TAURI_INTERNALS__
                        ? 'TAURI_APP'
                        : 'WEB_BROWSER',
                })
            } catch (error) {
                console.error('🔥 Firebase Setup Error:', error)
            }
        }

        setupNotifications()
    }, [register])

    return null
}
