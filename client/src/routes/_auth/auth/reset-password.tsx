import { Button, Card, CardBody, CardHeader, Input, Link } from '@heroui/react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { CheckCircle2, Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { INTERNAL_URLS, useResetPasswordWithTokenMutation } from '../../../lib'

export const resetPasswordParamsSchema = z.object({
    token: z.string().optional(),
})

export type TResetPasswordSearch = z.infer<typeof resetPasswordParamsSchema>
export const Route = createFileRoute('/_auth/auth/reset-password')({
    validateSearch: (search) => resetPasswordParamsSchema.parse(search),
    loaderDeps: ({ search }) => ({ search }),
    component: ResetPasswordPage,
})

export default function ResetPasswordPage() {
    const { token } = Route.useSearch()
    const router = useRouter()

    const { mutateAsync, isPending, error, isError } =
        useResetPasswordWithTokenMutation()

    // State
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isVisible, setIsVisible] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    // Validation State
    const passwordsMatch = newPassword === confirmPassword
    const isLengthValid = newPassword.length >= 8
    const canSubmit =
        newPassword && confirmPassword && passwordsMatch && isLengthValid

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!token || !canSubmit) return

        mutateAsync(
            { token, newPassword },
            {
                onSuccess: () => {
                    setIsSuccess(true)
                    // Optional: Redirect after few seconds
                    setTimeout(
                        () =>
                            router.navigate({
                                href: INTERNAL_URLS.login,
                            }),
                        3000
                    )
                },
            }
        )
    }

    const toggleVisibility = () => setIsVisible(!isVisible)

    // --- Success View ---
    if (isSuccess) {
        return (
            <div className="flex items-center justify-center p-4">
                <Card className="w-full max-w-lg p-6 text-center">
                    <CardBody className="flex flex-col items-center gap-4">
                        <div className="rounded-full bg-green-100 p-3 text-green-600">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-2xl font-bold">Password Reset!</h2>
                        <p className="text-text-subdued">
                            Your password has been successfully updated. You
                            will be redirected to the login page shortly.
                        </p>
                        <Button
                            color="primary"
                            className="mt-4 w-full"
                            onPress={() =>
                                router.navigate({ href: INTERNAL_URLS.login })
                            }
                        >
                            Go to Login
                        </Button>
                    </CardBody>
                </Card>
            </div>
        )
    }

    // --- Form View ---
    return (
        <div className="flex items-center justify-center  p-4">
            <Card className="w-full max-w-xl">
                <CardHeader className="flex flex-col gap-1 px-8 pt-8">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <LockKeyhole size={24} />
                        </div>
                        <h1 className="text-2xl font-bold">Set new password</h1>
                    </div>
                    <p className="mt-2 text-sm text-text-subdued">
                        Please enter your new password below. It must be at
                        least 8 characters long.
                    </p>
                </CardHeader>

                <CardBody className="px-8 pb-8 pt-4">
                    {!token ? (
                        <div className="rounded-lg bg-danger-50 p-4 text-sm text-danger-600">
                            Error: Invalid or missing reset token. Please
                            request a new link.
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-5"
                        >
                            {/* New Password Input */}
                            <Input
                                label="New Password"
                                variant="bordered"
                                placeholder="Enter new password"
                                endContent={
                                    <button
                                        className="focus:outline-none"
                                        type="button"
                                        onClick={toggleVisibility}
                                    >
                                        {isVisible ? (
                                            <EyeOff className="text-2xl text-default-400 pointer-events-none" />
                                        ) : (
                                            <Eye className="text-2xl text-default-400 pointer-events-none" />
                                        )}
                                    </button>
                                }
                                type={isVisible ? 'text' : 'password'}
                                value={newPassword}
                                onValueChange={setNewPassword}
                                errorMessage={
                                    newPassword.length > 0 && !isLengthValid
                                        ? 'Password must be at least 8 characters'
                                        : ''
                                }
                                isInvalid={
                                    newPassword.length > 0 && !isLengthValid
                                }
                            />

                            {/* Confirm Password Input */}
                            <Input
                                label="Confirm Password"
                                variant="bordered"
                                placeholder="Confirm new password"
                                type={isVisible ? 'text' : 'password'}
                                value={confirmPassword}
                                onValueChange={setConfirmPassword}
                                errorMessage={
                                    confirmPassword.length > 0 &&
                                    !passwordsMatch
                                        ? 'Passwords do not match'
                                        : ''
                                }
                                isInvalid={
                                    confirmPassword.length > 0 &&
                                    !passwordsMatch
                                }
                            />

                            {/* Server Error Message */}
                            {isError && (
                                <div className="rounded-medium bg-danger-50 p-3 text-sm text-danger">
                                    {(error as any)?.response?.data?.message ||
                                        'Failed to reset password. Token may be expired.'}
                                </div>
                            )}

                            <Button
                                color="primary"
                                type="submit"
                                size="lg"
                                isLoading={isPending}
                                isDisabled={!canSubmit}
                                className="font-medium shadow-md"
                            >
                                Reset Password
                            </Button>
                        </form>
                    )}

                    <div className="mt-6 text-center text-sm">
                        <span className="text-text-subdued">
                            Remember your password?{' '}
                        </span>
                        <Link
                            href={INTERNAL_URLS.login}
                            className="text-sm font-medium hover:underline text-primary"
                        >
                            Log in
                        </Link>
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}
