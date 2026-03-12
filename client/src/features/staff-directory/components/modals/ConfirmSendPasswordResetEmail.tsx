import { useForgotPasswordMutation } from '@/lib'
import { Button } from '@heroui/react'
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react'
import { useState } from 'react'
import { TUser } from '../../../../shared/types'
import {
    HeroModal,
    HeroModalBody,
    HeroModalContent,
    HeroModalFooter,
    HeroModalHeader,
} from '../../../../shared/components/ui/hero-modal'

interface ConfirmSendPasswordResetEmailProps {
    isOpen: boolean
    onClose: () => void
    user: TUser
}
export const ConfirmSendPasswordResetEmail = ({
    isOpen,
    onClose,
    user,
}: ConfirmSendPasswordResetEmailProps) => {
    const [isSuccess, setIsSuccess] = useState(false)

    const forgotPasswordMutation = useForgotPasswordMutation()
    const handleSendPasswordResetEmail = async () => {
        await forgotPasswordMutation.mutateAsync(user.email, {
            onSuccess() {
                setIsSuccess(true)
            },
        })
    }

    const handleClose = () => {
        onClose()
        // Reset state after transition finishes
        setTimeout(() => {
            setIsSuccess(false)
            forgotPasswordMutation.reset()
        }, 300)
    }

    return (
        <HeroModal
            isOpen={isOpen}
            onClose={handleClose}
            size="md"
            hideCloseButton={isSuccess}
        >
            <HeroModalContent>
                {/* --- Success View --- */}
                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-8 px-6 text-center animate-in fade-in zoom-in-95 duration-200">
                        <div className="rounded-full bg-green-100 p-3 mb-4 text-green-600">
                            <CheckCircle2 size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-text-default mb-2">
                            Email Sent!
                        </h3>
                        <p className="text-text-subdued mb-6">
                            A password reset link has been successfully sent to{' '}
                            <strong>{user.email}</strong>.
                        </p>
                        <Button
                            color="primary"
                            className="w-full"
                            onPress={handleClose}
                        >
                            Done
                        </Button>
                    </div>
                ) : (
                    /* --- Confirmation View --- */
                    <>
                        <HeroModalHeader className="flex flex-col gap-1">
                            <span className="flex items-center gap-2 text-lg">
                                <Mail className="text-primary" size={20} />
                                Send Reset Password Email
                            </span>
                        </HeroModalHeader>

                        <HeroModalBody>
                            <div className="bg-background p-4 rounded-large border border-border-default flex items-start gap-3">
                                <AlertCircle
                                    className="text-text-subdued shrink-0 mt-0.5"
                                    size={20}
                                />
                                <div className="text-sm text-text-subdued">
                                    <p className="mb-1">
                                        Are you sure you want to send a password
                                        reset link to:
                                    </p>
                                    <div className="font-medium text-text-default bg-background-hovered border border-border-default rounded px-2 py-1 inline-block mt-1">
                                        {user.displayName
                                            ? `${user.displayName} <${user.email}>`
                                            : user.email}
                                    </div>
                                    <p className="mt-2 text-xs text-text-subdued">
                                        The user will receive an email valid for
                                        15 minutes to reset their password
                                        securely.
                                    </p>
                                </div>
                            </div>

                            {forgotPasswordMutation.isError && (
                                <div className="text-danger text-sm bg-danger-50 p-2 rounded-medium mt-2">
                                    Error:{' '}
                                    {(forgotPasswordMutation.error as any)
                                        ?.response?.data?.message ||
                                        'Failed to send email'}
                                </div>
                            )}
                        </HeroModalBody>

                        <HeroModalFooter>
                            <Button
                                variant="light"
                                onPress={handleClose}
                                isDisabled={forgotPasswordMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleSendPasswordResetEmail}
                                isLoading={forgotPasswordMutation.isPending}
                                startContent={
                                    !forgotPasswordMutation.isPending && (
                                        <Mail size={16} />
                                    )
                                }
                            >
                                {forgotPasswordMutation.isPending
                                    ? 'Sending...'
                                    : 'Send Email'}
                            </Button>
                        </HeroModalFooter>
                    </>
                )}
            </HeroModalContent>
        </HeroModal>
    )
}
