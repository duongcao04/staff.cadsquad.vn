import { z } from 'zod'

const configSchema = z.object({
    MODE: z.string().default('development'),
    APP_TITLE: z.string().default('App'),
    APP_VERSION: z.string().default('1.0.0'),
    API_ENDPOINT: z.string().min(1, 'API_ENDPOINT is required'),
    APP_URL: z.string().min(1, 'URL is required'),
    WS_URL: z.string().optional(),
    firebase: z
        .object({
            apiKey: z.string(),
            authDomain: z.string(),
            databaseURL: z.string(),
            projectId: z.string(),
            storageBucket: z.string(),
            messagingSenderId: z.string(),
            appId: z.string(),
            measurementId: z.string(),
            vapidKey: z.string(),
        })
        .optional(),
})

function configProject() {
    try {
        const config = configSchema.safeParse({
            MODE: import.meta.env.MODE,
            APP_TITLE: import.meta.env.VITE_APP_TITLE,
            APP_VERSION: import.meta.env.VITE_APP_VERSION,

            // Clean usage: Only run removeTrailingSlash if value exists
            API_ENDPOINT: import.meta.env.VITE_API_ENDPOINT,
            APP_URL: import.meta.env.VITE_APP_URL,
            WS_URL: import.meta.env.VITE_WS_URL,
            firebase: {
                apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
                authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
                databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
                projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
                storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
                messagingSenderId: import.meta.env
                    .VITE_FIREBASE_MESSAGING_SENDER_ID,
                appId: import.meta.env.VITE_FIREBASE_APP_ID,
                measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            },
        })

        config.data?.MODE === 'development' && console.table(config)
        return config.data
    } catch (error) {
        throw new Error('Các giá trị khai báo trong file .env không hợp lệ')
    }
}

export const envConfig = configProject()
