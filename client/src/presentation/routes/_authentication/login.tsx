import { LoginPage } from '@presentation/features/authentication/login'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authentication/login')({
    head: () => ({
        meta: [
            {
                title: 'Authentication',
            },
            {
                name: 'description',
                content:
                    'Sign in to your account to manage your projects and tasks.',
            },
        ],
    }),
    component: LoginPage,
})
