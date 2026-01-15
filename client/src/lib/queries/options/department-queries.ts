import { queryOptions } from '@tanstack/react-query'
import { IDepartmentResponse } from '../../../shared/interfaces'
import { TDepartment } from '../../../shared/types'
import { departmentApi } from '../../api'
import { COLORS, toDate } from '../../utils'
import { mapUser } from './user-queries'

export const mapDepartment: (item?: IDepartmentResponse) => TDepartment = (
    item
) => ({
    id: item?.id ?? 'N/A',
    code: item?.code ?? 'UNKNOWN',
    displayName: item?.displayName ?? 'Unknown department',
    users: item?.users?.map(mapUser) ?? [],
    hexColor: item?.hexColor ?? COLORS.white,
    notes: item?.notes ?? null,
    _count: { users: item?._count?.users ?? 0 },
    createdAt: toDate(item?.createdAt),
    updatedAt: toDate(item?.updatedAt),
})

export const departmentsListOptions = () => {
    return queryOptions({
        queryKey: ['departments'],
        queryFn: () => departmentApi.findAll(),
        select: (res) => {
            const departmentsData = res?.result
            return {
                departments: Array.isArray(departmentsData)
                    ? departmentsData.map(mapDepartment)
                    : [],
            }
        },
    })
}

export const departmentOptions = (identify: string) => {
    return queryOptions({
        queryKey: ['departments', 'identify', identify],
        queryFn: () => departmentApi.findOne(identify),
        select: (res) => {
            const departmentData = res?.result
            const department = mapDepartment(departmentData)
            return {
                department,
                totalMember: department._count.users,
            }
        },
    })
}
