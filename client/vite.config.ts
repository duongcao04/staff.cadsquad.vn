import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    // Load các biến env (VITE_...) để sử dụng trong config
    const env = loadEnv(mode, process.cwd())

    return {
        // Prevent Vite from obscuring Rust errors
        clearScreen: false,
        envPrefix: ['VITE_', 'TAURI_'],

        server: {
            port: 3000,
            host: true,
            strictPort: true,
            fs: {
                allow: ['..'], // Allows Vite to reach up one directory into 'shared'
            },
        },
        preview: {
            port: 3000,
        },

        // Inject các biến env vào mã nguồn thông qua import.meta.env
        define: {
            // Lưu ý: Key ở đây phải khớp 100% với chuỗi trong file .js (có dấu ngoặc kép)
            VITE_FIREBASE_API_KEY: JSON.stringify(env.VITE_FIREBASE_API_KEY),
            VITE_FIREBASE_AUTH_DOMAIN: JSON.stringify(
                env.VITE_FIREBASE_AUTH_DOMAIN
            ),
            VITE_FIREBASE_PROJECT_ID: JSON.stringify(
                env.VITE_FIREBASE_PROJECT_ID
            ),
            VITE_FIREBASE_MESSAGING_SENDER_ID: JSON.stringify(
                env.VITE_FIREBASE_MESSAGING_SENDER_ID
            ),
            VITE_FIREBASE_APP_ID: JSON.stringify(env.VITE_FIREBASE_APP_ID),
        },

        plugins: [
            tailwindcss(),
            TanStackRouterVite(),
            react({
                babel: {
                    plugins: [['babel-plugin-react-compiler']],
                },
            }),
            // Chỗ này bạn đang comment VitePWA, cứ giữ nguyên nếu chưa cần
        ],

        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                '@staff-cadsquad/shared': path.resolve(
                    __dirname,
                    '../shared/index.ts'
                ),
            },
        },

        build: {
            target: 'esnext',
            drop: ['console', 'debugger'],
            rollupOptions: {
                // ĐỊNH NGHĨA 2 ĐẦU VÀO: Ứng dụng chính và Service Worker
                input: {
                    main: path.resolve(__dirname, 'index.html'),
                    'firebase-messaging-sw': path.resolve(
                        __dirname,
                        'public/firebase-messaging-sw.js'
                    ),
                },
                output: {
                    // Giữ tên file Service Worker cố định ở root của thư mục dist
                    entryFileNames: (chunkInfo) => {
                        return chunkInfo.name === 'firebase-messaging-sw'
                            ? '[name].js' // Xuất ra dist/firebase-messaging-sw.js
                            : 'assets/[name]-[hash].js'
                    },
                },
                onwarn(warning, warn) {
                    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                        return
                    }
                    warn(warning)
                },
            },
            minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
            sourcemap: !!process.env.TAURI_DEBUG,
            chunkSizeWarningLimit: 2000,
        },
    }
})
