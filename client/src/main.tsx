import { QueryClient } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import './styles/global.css'
import { routeTree } from './routeTree.gen'

// 2. Initialize dependencies
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

// 3. Create the router instance
export const router = createRouter({
    routeTree,
    defaultPendingMs: 0,
    context: {
        queryClient,
    },
})

// 4. Register the router for type safety

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
        <StrictMode>
            <RouterProvider router={router} />
        </StrictMode>
    )
}
