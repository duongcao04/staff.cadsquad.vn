import { z } from 'zod'
import { LoginInputSchema } from '../validations'

export interface AuthTokens {
    accessToken: string
    refreshToken: string
}

export type TLoginInput = z.infer<typeof LoginInputSchema>

export interface AuthRepository {
    login(credentials: TLoginInput): void
    logout(): Promise<void>
    forgotPassword(email: string): Promise<void>
}
