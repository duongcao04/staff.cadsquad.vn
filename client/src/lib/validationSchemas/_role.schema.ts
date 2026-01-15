import * as Yup from 'yup'

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
