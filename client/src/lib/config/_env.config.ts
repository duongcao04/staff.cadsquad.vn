import * as yup from 'yup'

// 1. Add .required() for critical variables and defaults for others
const configSchema = yup.object({
    APP_TITLE: yup.string().default('App'),
    APP_VERSION: yup.string().default('1.0.0'),
    API_ENDPOINT: yup.string().required('API_ENDPOINT is required'),
    APP_URL: yup.string().required('URL is required'),
    WS_URL: yup.string().optional(), // WebSocket might be optional
    FIREBASE: yup.object({
        apiKey: yup.string(),
        authDomain: yup.string(),
        databaseURL: yup.string(),
        projectId: yup.string(),
        storageBucket: yup.string(),
        messagingSenderId: yup.string(),
        appId: yup.string(),
        measurementId: yup.string(),
        vapidKey: yup.string(),
    }),
})

function configProject() {
    try {
        const config = configSchema.validateSync(
            {
                APP_TITLE: import.meta.env.VITE_APP_TITLE,
                APP_VERSION: import.meta.env.VITE_APP_VERSION,

                // Clean usage: Only run removeTrailingSlash if value exists
                API_ENDPOINT: import.meta.env.VITE_API_ENDPOINT,
                APP_URL: import.meta.env.VITE_APP_URL,
                WS_URL: import.meta.env.VITE_WS_URL,
                FIREBASE: {
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
            },
            {
                abortEarly: false, // Show all missing vars at once, not just the first one
            }
        )

        console.table(config)
        return config
    } catch (error) {
        // 3. Log specific validation errors so you know what to fix
        if (error instanceof yup.ValidationError) {
            console.error('❌ Env Validation Error:', error.errors)
        } else {
            console.error(error)
        }
        throw new Error('Các giá trị khai báo trong file .env không hợp lệ')
    }
}

export const envConfig = configProject()
