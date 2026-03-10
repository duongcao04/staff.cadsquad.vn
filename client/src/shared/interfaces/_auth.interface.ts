export interface IValidateTokenResponse {
    isValid: boolean
}
export interface ILoginResponse {
    accessToken: {
        token: string
        expiresAt: number | string
    }
    sessionId: string
}