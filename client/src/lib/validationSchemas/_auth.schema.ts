import parsePhoneNumberFromString from 'libphonenumber-js'
import * as yup from 'yup'

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
