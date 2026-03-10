import { queryOptions } from '@tanstack/react-query';
import { departmentApi } from '../../api';
import { DepartmentSchema } from '../../validationSchemas';
import { parseData, parseList } from '../../zod';

export const departmentsListOptions = () => {
    return queryOptions({
        queryKey: ['departments'],
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
        queryKey: ['departments', 'identify', identify],
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