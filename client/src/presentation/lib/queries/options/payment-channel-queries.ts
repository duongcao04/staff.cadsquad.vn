import { queryOptions } from '@tanstack/react-query'
import { paymentChannelApi } from '../../api'
import { PaymentChannelSchema } from '../../validationSchemas'
import { parseList } from '../../zod'

export const paymentChannelsListOptions = () => {
    return queryOptions({
        queryKey: ['payment-channels'],
        queryFn: () => paymentChannelApi.findAll(),
        select: (res) => {
            const paymentChannelsData = res?.result
            return {
                paymentChannels: parseList(PaymentChannelSchema, paymentChannelsData)
            }
        },
    })
}
