import parsePhoneNumberFromString from 'libphonenumber-js'
import * as yup from 'yup'
import { z } from 'zod';

export const LoginInputSchema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().required(),
})
export type TLoginInput = yup.InferType<typeof LoginInputSchema>
const passwordSchema = yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(
        /[!@#$%^&*]/,
        'Password must contain at least one special character (!@#$%^&*)'
    )
export const UpdatePasswordInputSchema = yup.object({
    oldPassword: yup.string().required('Old password is required'),
    newPassword: passwordSchema,
    newConfirmPassword: yup
        .string()
        .required('Please confirm your new password')
        .oneOf([yup.ref('newPassword')], 'Passwords must match'),
})

export type TUpdatePasswordInput = yup.InferType<
    typeof UpdatePasswordInputSchema
>

export const ResetPasswordSchema = yup.object().shape({
    newPassword: yup
        .string()
        .required('New password is required')
        .matches(/^.{8,}$/, 'Password must be at least 8 characters'),
})
export type TResetPasswordInput = yup.InferType<typeof ResetPasswordSchema>

export const updateProfileSchema = yup.object({
    displayName: yup
        .string()
        .min(2, 'Tên phải có ít nhất 2 ký tự')
        .max(50, 'Tên không được vượt quá 50 ký tự')
        .optional(),

    avatar: yup
        .string()
        .url('Định dạng liên kết ảnh không hợp lệ')
        .nullable()
        .optional(),

    personalEmail: yup.string().email('Personal email is invalid').optional(),

    phoneNumber: yup
        .string()
        .test(
            'is-valid-phone',
            'Số điện thoại không hợp lệ hoặc không đúng định dạng quốc tế',
            (value) => {
                // 1. Cho phép trống nếu không bắt buộc
                if (!value || value.trim() === '' || value.trim() === '-')
                    return true

                // 2. Parse thử số điện thoại với quốc gia mặc định là VN
                // Nếu user nhập +84... nó sẽ tự ưu tiên mã vùng quốc tế
                const phoneNumber = parsePhoneNumberFromString(value, 'VN')

                // 3. Kiểm tra tính hợp lệ của số điện thoại theo tiêu chuẩn quốc tế
                return phoneNumber ? phoneNumber.isValid() : false
            }
        )
        .optional()
        .nullable(),
})

// Trích xuất Type để sử dụng trong TypeScript
export type TUpdateProfileInput = yup.InferType<typeof updateProfileSchema>


export const RegisterUserSchema = z.object({
    firstName: z.string()
        .min(1, 'First name is required')
        .max(50, 'First name is too long'),

    lastName: z.string()
        .min(1, 'Last name is required')
        .max(50, 'Last name is too long'),

    // Sử dụng coerce để tự động biến đổi input date từ form thành đối tượng Date
    dob: z.coerce.date()
        .max(new Date(), 'Date of birth cannot be in the future')
        .optional(),

    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email format'),

    // Password thường bắt buộc khi đăng ký mới
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .optional(), // Để optional nếu bạn dùng cho cả trường hợp Social Login
});

// Trích xuất Type từ Schema
export type TRegisterUserValues = z.infer<typeof RegisterUserSchema>;