import { EClientType } from '@/shared/enums'
import { IClientResponse } from '@/shared/interfaces'
import { TClient } from '@/shared/types'
import { queryOptions } from '@tanstack/react-query'
import { clientApi } from '../../api'

export const mapClient: (item?: IClientResponse) => TClient = (item) => ({
    id: item?.id ?? 'N/A',
    code: item?.code ?? '',
    name: item?.name ?? 'Unknown user',
    address: item?.address ?? '',
    billingEmail: item?.billingEmail ?? 'unknown@unknown.email',
    country: item?.country ?? 'Unknown country',
    email: item?.email ?? 'unknown@unknown.email',
    currency: item?.currency ?? 'Dollar',
    jobs: item?.jobs ?? [],
    paymentTerms: item?.paymentTerms ?? 0,
    phoneNumber: item?.phoneNumber ?? 'Unknown phone number',
    region: item?.region ?? 'Unknown region',
    taxId: item?.taxId ?? '',
    timezone: item?.timezone ?? 'Unknown timezone',
    type: item?.type ?? EClientType.INDIVIDUAL,
    createdAt: new Date(item?.createdAt ?? ''),
    updatedAt: new Date(item?.updatedAt ?? ''),
})

export const clientsListOptions = () => {
    return queryOptions({
        queryKey: ['clients'],
        queryFn: () => clientApi.findAll({}),
        select: (res) => ({
            clients: Array.isArray(res.result) ? res.result.map(mapClient) : [],
        }),
    })
}
export const clientDetailsByNameOptions = (name: string) => {
    return queryOptions({
        queryKey: ['clients', 'name', name],
        queryFn: () => clientApi.findClientByName(name),
        select: (res) => {
            const clientData = res?.result
            return mapClient(clientData)
        },
    })
}
