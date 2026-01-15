import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { paymentChannelApi } from '@/lib/api'

import { mapPaymentChannel } from './options/payment-channel-queries'

export const usePaymentChannels = () => {
    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['paymentChannels'],
        queryFn: () => paymentChannelApi.findAll(),
        select: (res) => res.result,
    })
    const paymentChannels = useMemo(() => {
        const paymentChannelsData = data

        if (!Array.isArray(paymentChannelsData)) {
            return []
        }

        return paymentChannelsData.map((item) => mapPaymentChannel(item))
    }, [data])

    return {
        data: paymentChannels,
        isLoading: isLoading || isFetching,
    }
}
