import { queryOptions } from '@tanstack/react-query'
import { clientApi } from '../../api'
import { ClientSchema } from '../../validationSchemas'
import { parseData, parseList } from '../../zod'

export const clientsListOptions = () => {
    return queryOptions({
        queryKey: ['clients'],
        queryFn: () => clientApi.findAll({}),
        select: (res) => ({
            clients: parseList(ClientSchema, res.result),
        }),
    })
}
export const clientDetailsByNameOptions = (name: string) => {
    return queryOptions({
        queryKey: ['clients', 'name', name],
        queryFn: () => clientApi.findClientByName(name),
        select: (res) => {
            const clientData = res?.result
            return parseData(ClientSchema, clientData)
        },
    })
}
export const clientOptions = (identify: string) => {
    return queryOptions({
        queryKey: ['clients', 'identify', identify],
        queryFn: () => clientApi.findOne(identify),
        select: (res) => {
            const clientData = res?.result
            return parseData(ClientSchema, clientData)
        },
    })
}
