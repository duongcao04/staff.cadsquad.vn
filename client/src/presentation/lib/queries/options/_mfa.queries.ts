import { mutationOptions, queryOptions } from '@tanstack/react-query'
import { mfaApi } from '../../api'
import { onErrorToast } from '../helper'

// 1. Keys factory
export const mfaQueryKeys = {
    resource: ['mfa'] as const,
    qrCode: () => [...mfaQueryKeys.resource, 'qr-code'] as const,
}

// 2. Fetch options
export const mfaQrCodeOptions = () => {
    return queryOptions({
        queryKey: mfaQueryKeys.qrCode(),
        queryFn: async () => {
            const res = await mfaApi.generateQrCode()
            return res
        },
        select: (res) => ({
            qrCode: res.qrCode,
        }),
    })
}

export const turnOnMfaOptions = mutationOptions({
    mutationFn: ({ code }: { code: string }) => mfaApi.turnOn(code),
    onError: (err) => onErrorToast(err, 'Turn on MFA Failed'),
})
