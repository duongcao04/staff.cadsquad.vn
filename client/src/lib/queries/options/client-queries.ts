import { mutationOptions, queryOptions } from '@tanstack/react-query'
import { clientApi } from '../../api'
import { ClientSchema, TEditClientFormValues } from '../../validationSchemas'
import { parseData, parseList } from '../../zod'
import { onErrorToast } from '../helper'

export const clientQueryKeys = {
    resource: ['clients'] as const,
    lists: () => [...clientQueryKeys.resource, 'lists'] as const,
    detail: (id: string) => [...clientQueryKeys.resource, 'identify', id] as const,
    detailByName: (name: string) => [...clientQueryKeys.resource, 'detail', name] as const
}

export const clientsListOptions = () => {
    return queryOptions({
        queryKey: clientQueryKeys.lists(),
        queryFn: () => clientApi.findAll({}),
        select: (res) => ({
            clients: parseList(ClientSchema, res.result),
        }),
    })
}
export const clientDetailsByNameOptions = (name: string) => {
    return queryOptions({
        queryKey: clientQueryKeys.detailByName(name),
        queryFn: () => clientApi.findClientByName(name),
        select: (res) => {
            const clientData = res?.result
            return parseData(ClientSchema, clientData)
        },
    })
}
export const clientOptions = (identify: string) => {
    return queryOptions({
        queryKey: clientQueryKeys.detail(identify),
        queryFn: () => clientApi.findOne(identify),
        select: (res) => {
            const clientData = res?.result
            return parseData(ClientSchema, clientData)
        },
    })
}

export const createClientOptions = mutationOptions({
    mutationFn: (data: TEditClientFormValues) => clientApi.create(data),
    onError: (err) => onErrorToast(err, 'Create failed'),
})

export const updateClientOptions = mutationOptions({
    mutationFn: ({
        clientId,
        data,
    }: {
        clientId: string
        data: TEditClientFormValues
    }) => clientApi.updateClient(clientId, data),
    onError: (err) => onErrorToast(err, 'Update failed'),
})