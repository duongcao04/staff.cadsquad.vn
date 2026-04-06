import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { departmentApi } from '../../api';
import { DepartmentSchema, TCreateDepartmentInput, TUpdateDepartmentInput } from '../../validationSchemas';
import { parseData, parseList } from '../../zod';
import { onErrorToast } from '../helper';

// 1. Keys factory
export const departmentQueryKeys = {
    resource: ['departments'] as const,
    lists: () => [...departmentQueryKeys.resource, 'lists'] as const,
    detail: (id: string) => [...departmentQueryKeys.resource, 'identify', id] as const,
    detailByName: (name: string) => [...departmentQueryKeys.resource, 'detail', name] as const
}

// 2. Fetch options
export const departmentsListOptions = () => {
    return queryOptions({
        queryKey: departmentQueryKeys.lists(),
        queryFn: async () => {
            const res = await departmentApi.findAll();
            // Parse danh sách: result từ API -> mảng TDepartment[]
            return parseList(DepartmentSchema, res?.result);
        },
        select: (data) => ({
            departments: data,
        }),
    });
};

export const departmentOptions = (identify: string) => {
    return queryOptions({
        queryKey: departmentQueryKeys.detail(identify),
        queryFn: async () => {
            const res = await departmentApi.findOne(identify);
            // Parse object đơn lẻ
            return parseData(DepartmentSchema, res?.result);
        },
        select: (department) => ({
            department,
            totalMember: department._count.users,
        }),
    });
};

// 3. Mutation options
export const createDepartmentOptions = mutationOptions({
    mutationFn: (data: TCreateDepartmentInput) =>
        departmentApi.create(data),
    onError: (err) => onErrorToast(err, 'Create failed'),
})

export const updateDepartmentOption = mutationOptions({
    mutationFn: ({
        id,
        data,
    }: {
        id: string
        data: TUpdateDepartmentInput
    }) => departmentApi.update(id, data),
    onError: (err) => onErrorToast(err, 'Update failed'),
})

export const deleteDepartmentOptions = mutationOptions({
    mutationFn: (id: string) => departmentApi.remove(id),
    onError: (err) => onErrorToast(err, 'Delete failed'),
})