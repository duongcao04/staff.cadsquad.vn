import { FirebaseApp, initializeApp } from 'firebase/app'
import { getMessaging, isSupported } from 'firebase/messaging'
import { firebaseConfig } from './config'

const app = initializeApp(firebaseConfig)
export const getMessagingSafe = async (app: FirebaseApp) => {
    try {
        const supported = await isSupported()
        if (supported) {
            return getMessaging(app)
        }
        console.warn('FCM không được hỗ trợ trên trình duyệt này.')
        return null
    } catch (err) {
        console.error('Lỗi khởi tạo Messaging:', err)
        return null
    }
}
export const messaging =
    typeof window !== 'undefined' ? getMessagingSafe(app) : null
