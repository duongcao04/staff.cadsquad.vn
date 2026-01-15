import axios from 'axios'

import { cookie } from '@/lib/cookie'

import { apiBaseUrl, COOKIES, INTERNAL_URLS } from './utils'

export type ApiResponse<T = unknown, D = Record<string, unknown>> = {
    success: boolean
    message: string
    error?: string
    result?: T
    meta?: D
    timestamp?: string
}

export type ApiError = {
    success: boolean
    message: string
    error?: string
    timestamp?: string
}

export const axiosClient = axios.create({
    baseURL: apiBaseUrl, // API endpoint url
    timeout: 5000, // Request timeout
    withCredentials: true, // Allow sending cookies
})
// Sửa đổi interceptor cho axiosClient
axiosClient.interceptors.request.use(
    (config) => {
        // 1. Lấy Access Token từ cookie
        const token = cookie.get(COOKIES.authentication)
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // 2. Lấy Session ID từ cookie (Đã lưu khi login)
        const sessionId = cookie.get(COOKIES.sessionId) // Đảm bảo bạn đã định nghĩa key này trong COOKIES
        if (sessionId) {
            config.headers['x-session-id'] = sessionId
        }

        config.headers['Content-Type'] = 'application/json'
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Kiểm tra lỗi xác thực 401
        if (error.response?.status === 401) {
            // 1. Xóa sạch các cookie liên quan đến phiên làm việc
            cookie.remove(COOKIES.authentication)
            cookie.remove(COOKIES.sessionId)

            // 2. Kiểm tra nếu không phải đang ở trang login thì mới redirect
            const isAtLoginPage =
                window.location.pathname === INTERNAL_URLS.login

            if (!isAtLoginPage) {
                // Lưu lại trang hiện tại để sau khi login xong có thể quay lại
                const currentPath = encodeURIComponent(window.location.pathname)
                window.location.href = `${INTERNAL_URLS.login}?redirect=${currentPath}`
            }
        }

        // Các xử lý lỗi khác giữ nguyên
        if (error.response) {
            console.error(
                'Response error:',
                error.response.status,
                error.response.data
            )
            return Promise.reject(error.response.data)
        }
        // ... (phần còn lại của code cũ)
        return Promise.reject(error)
    }
)

// Create a separate instance specifically for Multipart forms
export const axiosClientMultipart = axios.create({
    baseURL: apiBaseUrl,
    timeout: 30000, // Uploads might take longer, so increased timeout is good
    withCredentials: true,
})

/**
 * This is for Form-data
 */
// Request Interceptor: ONLY handles Authentication
axiosClientMultipart.interceptors.request.use(
    (config) => {
        const token = cookie.get(COOKIES.authentication)
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        // CRITICAL: We do NOT set 'Content-Type' here.
        // We let the browser detect FormData and set it automatically.
        return config
    },
    (error) => {
        if (error?.response) return Promise.reject(error.response)
        return Promise.reject(error)
    }
)

// Response Interceptor: Matches your main client's error handling
axiosClientMultipart.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response) {
            console.error(
                'Upload Error:',
                error.response.status,
                error.response.data
            )
            return Promise.reject(error.response.data)
        } else if (error.request) {
            console.error('No response received:', error.request)
            return Promise.reject({ message: 'No response from server' })
        } else {
            console.error('Axios error:', error.message)
            return Promise.reject({ message: error.message })
        }
    }
)
