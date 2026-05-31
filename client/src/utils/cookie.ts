import Cookies from 'universal-cookie'

class Cookie extends Cookies {}

export const cookie = new Cookie()

export function parseExpires(expiresAt: string | number) {
    if (typeof expiresAt === 'number') {
        const ms =
            String(expiresAt).length === 10 ? expiresAt * 1000 : expiresAt
        return new Date(ms)
    }
    return new Date(expiresAt)
}
