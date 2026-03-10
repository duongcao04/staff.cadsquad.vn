import * as Yup from 'yup';
import { ZodType, z } from 'zod';
import { TRole } from '../../shared/types';
import { COLORS } from '../utils';
import { UserSchema } from './_user.schema';

export const RoleSchema: ZodType<TRole> = z.lazy(() => z.object({
    id: z.string().catch('N/A'),
    displayName: z.string().catch('Unknown Role'),
    code: z.string().catch('UNKNOWN'),
    hexColor: z.string().default(COLORS.black),

    // Quan hệ 1-n với Permissions
    // Dùng z.array(z.any()) nếu chưa muốn validate sâu permission
    permissions: z.array(z.any()).default([]),

    // Quan hệ n-n với Users
    // Sử dụng z.lazy để tránh lỗi Circular Dependency với UserSchema
    users: z.array(z.lazy(() => UserSchema)).default([]),
    createdAt: z.coerce.date().catch(new Date()),
    updatedAt: z.coerce.date().catch(new Date()),
}));

export const createRoleSchema = Yup.object().shape({
    displayName: Yup.string()
        .min(3, 'Too Short!')
        .max(50, 'Too Long!')
        .required('Role name is required'),
    hexColor: Yup.string()
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid Hex Color')
        .required('Required'),
    permissionIds: Yup.array()
        .of(Yup.string())
        .min(1, 'Select at least one permission'),
})

export type TCreateRoleInput = Yup.InferType<typeof createRoleSchema>
