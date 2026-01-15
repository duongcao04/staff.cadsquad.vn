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

export interface IRegisterUserInput {
    firstName: string
    lastName: string
    dob?: Date
    email: string
    password?: string
}

export interface LoginUserDto {
    email: string
    password?: string
}
