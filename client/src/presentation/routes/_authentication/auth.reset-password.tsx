import ResetPasswordPage from '@presentation/features/authentication/reset-password'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const resetPasswordParamsSchema = z.object({
    token: z.string().optional(),
})

export type TResetPasswordSearch = z.infer<typeof resetPasswordParamsSchema>
export const Route = createFileRoute('/_authentication/auth/reset-password')({
    validateSearch: (search) => resetPasswordParamsSchema.parse(search),
    loaderDeps: ({ search }) => ({ search }),
    component: ResetPasswordPage,
})
