// 1. Tạo object hằng số (Runtime)
export const RoleEnum = {
    USER: 'USER',
    ADMIN: 'ADMIN',
    ACCOUNTING: 'ACCOUNTING',
} as const
// 2. Tạo Type từ Object đó (để dùng cho biến/props)
export type RoleEnum = (typeof RoleEnum)[keyof typeof RoleEnum]
