import { QueryClient } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { routeTree } from './routeTree.gen'
import './styles/global.css'
import { AppThemeProvider, LayoutProvider } from './shared/contexts'

// Initialize dependencies
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
})

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

// Create the router instance
export const router = createRouter({
    routeTree,
    defaultPendingMs: 0,
    context: {
        queryClient,
    },
})

function App() {
    return <RouterProvider router={router} />
}
// Register the router for type safety
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
        <StrictMode>
            <LayoutProvider>
                <AppThemeProvider>
                    <App />
                </AppThemeProvider>
            </LayoutProvider>
        </StrictMode>
    )
}
