import { Button } from '@heroui/react'
import { useMutation } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { CheckCircle2 } from 'lucide-react'
import {
    TUpdatePasswordInput,
    UpdatePasswordInputSchema,
    updateUsePasswordOptions,
} from '@/lib'
import { HeroPasswordInput } from '@/shared/components'

export function UpdatePasswordForm() {
    const updatePasswordMutation = useMutation(updateUsePasswordOptions)

    const formik = useFormik<TUpdatePasswordInput>({
        initialValues: {
            oldPassword: '',
            newPassword: '',
            newConfirmPassword: '',
        },
        validationSchema: UpdatePasswordInputSchema,
        onSubmit: (values) => {
            updatePasswordMutation.mutateAsync(
                {
                    updatePasswordInput: values,
                },
                {
                    onSuccess: () => {
                        formik.resetForm()
                    },
                }
            )
        },
    })

    return (
        <form
            onSubmit={formik.handleSubmit}
            className="flex flex-col lg:flex-row gap-8"
        >
            <div className="lg:w-1/3">
                <h3 className="text-md font-medium">Password</h3>
                <p className="text-sm text-text-subdued mt-1">
                    Set a password to protect your account.
                </p>
            </div>

            <div className="lg:w-2/3 space-y-8 max-w-lg">
                <div className="space-y-14">
                    <div className="space-y-1">
                        <HeroPasswordInput
                            isRequired
                            id="oldPassword"
                            name="oldPassword"
                            labelPlacement="outside"
                            classNames={{ label: 'font-medium pb-1' }}
                            value={formik.values.oldPassword}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            isInvalid={
                                Boolean(formik.touched.oldPassword) &&
                                Boolean(formik.errors.oldPassword)
                            }
                            errorMessage={
                                Boolean(formik.touched.oldPassword) &&
                                formik.errors.oldPassword
                            }
                            label="Current password"
                            placeholder="Enter current password"
                            variant="bordered"
                        />
                        {formik.values.oldPassword &&
                            !formik.errors.oldPassword && (
                                <div className="flex items-center gap-1 text-xs text-success mt-2">
                                    <CheckCircle2 size={12} /> Very secure
                                </div>
                            )}
                    </div>

                    <HeroPasswordInput
                        isRequired
                        id="newPassword"
                        name="newPassword"
                        label="New password"
                        labelPlacement="outside"
                        classNames={{ label: 'font-medium pb-1' }}
                        placeholder="Minimum 8 characters"
                        type="password"
                        variant="bordered"
                        value={formik.values.newPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={
                            Boolean(formik.touched.newPassword) &&
                            Boolean(formik.errors.newPassword)
                        }
                        errorMessage={
                            Boolean(formik.touched.newPassword) &&
                            formik.errors.newPassword
                        }
                    />
                    <HeroPasswordInput
                        isRequired
                        id="newConfirmPassword"
                        name="newConfirmPassword"
                        label="Confirm new password"
                        labelPlacement="outside"
                        classNames={{ label: 'font-medium pb-1' }}
                        placeholder="Re-enter new password"
                        type="password"
                        variant="bordered"
                        value={formik.values.newConfirmPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={
                            Boolean(formik.touched.newConfirmPassword) &&
                            Boolean(formik.errors.newConfirmPassword)
                        }
                        errorMessage={
                            Boolean(formik.touched.newConfirmPassword) &&
                            formik.errors.newConfirmPassword
                        }
                    />
                </div>

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        variant="bordered"
                        className="border-border-default text-text-default hover:bg-background-hovered h-10 mb-1"
                        isLoading={updatePasswordMutation.isPending}
                        isDisabled={
                            !formik.dirty ||
                            !formik.isValid ||
                            updatePasswordMutation.isPending
                        }
                    >
                        Save new password
                    </Button>
                </div>
            </div>
        </form>
    )
}
