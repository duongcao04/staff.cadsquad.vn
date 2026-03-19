import { departmentApi } from '@/lib/api'
import {
    DepartmentSchema,
    type TCreateDepartmentInput,
    type TUpdateDepartmentInput,
} from '@/lib/validationSchemas'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { parseList } from '../zod'
import { onErrorToast } from './helper'

export const useDepartments = () => {
    const { data, isFetching, isLoading } = useQuery({
        queryKey: ['departments'],
        queryFn: () => departmentApi.findAll(),
        select: (res) => res.result,
    })

    const departments = useMemo(() => {
        const departmentsData = data

        if (!Array.isArray(departmentsData)) {
            return []
        }

        return parseList(departments, DepartmentSchema)
    }, [data])

    return {
        departments: departments ?? [],
        data: departments ?? [],
        isLoading: isFetching || isLoading,
    }
}

export const useDepartmentById = (id: string) => {
    return useQuery({
        queryKey: ['departments', 'id', id],
        queryFn: () => {
            if (!id) {
                return undefined
            }
            return departmentApi.findOne(id)
        },
        select: (res) => res?.result,
        enabled: !!id,
    })
}

export const useUpdateDepartment = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: TUpdateDepartmentInput
        }) => departmentApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] })
        },
    })
}

export const useDeleteDepartment = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => departmentApi.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] })
        },
    })
}

export const useCreateDepartmentMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: TCreateDepartmentInput) =>
            departmentApi.create(data),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ['departments'] })
        },
        onError: (err) => onErrorToast(err, 'Create department failed'),
    })
}
