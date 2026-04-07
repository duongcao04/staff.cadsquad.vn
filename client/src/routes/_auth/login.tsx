import { LoginForm } from '@/features/auth'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/login')({
    head: () => ({
        meta: [
            {
                title: 'Authenticaion',
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

function LoginPage() {
    return <LoginForm />
}
