import { axiosClient } from '../axios'

export const userDeviceApi = {
    registerDevice: (token: string, deviceType?: string) =>
        axiosClient.post('/v1/user-devices/register', {
            token: token,
            type: deviceType ?? 'WEB', // Hoặc detect trình duyệt
        }),
}
