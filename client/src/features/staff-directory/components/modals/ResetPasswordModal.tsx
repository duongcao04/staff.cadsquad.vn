import {
    generatePassword,
    resetPasswordOptions,
    ResetPasswordSchema,
    userOptions,
} from '@/lib'
import { HeroCopyButton } from '@/shared/components/ui/hero-copy-button'
import {
    HeroModal,
    HeroModalBody,
    HeroModalContent,
    HeroModalFooter,
    HeroModalHeader,
} from '@/shared/components/ui/hero-modal'
import { HeroPasswordInput } from '@/shared/components/ui/hero-password-input'
import type { TUser } from '@/shared/types'
import { Button, Radio, RadioGroup } from '@heroui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import * as yup from 'yup'

type Props = {
    isOpen: boolean
    onClose: () => void
    isLoading?: boolean
    data: TUser
}

export default function ResetPasswordModal({ isOpen, onClose, data }: Props) {
    const queryClient = useQueryClient()
    const [resetOption, setResetOption] = useState<'automatic' | 'manual'>(
        'automatic'
    )
    const [passwordInput, setPasswordInput] = useState('')
    const [isSuccess, setSuccess] = useState(false)

    // --- Validation Logic using Your Schema ---
    const validationResult = useMemo(() => {
        // Skip validation if automatic or empty (until touched/typed)
        if (resetOption === 'automatic') return { isValid: true, error: '' }

        try {
            // Validate explicitly against the schema
            ResetPasswordSchema.validateSync(
                { newPassword: passwordInput },
                { abortEarly: true }
            )
            return { isValid: true, error: '' }
        } catch (err) {
            if (err instanceof yup.ValidationError) {
                return { isValid: false, error: err.message }
            }
            return { isValid: false, error: 'Invalid password' }
        }
    }, [passwordInput, resetOption])

    const handleClose = () => {
        onClose()
        setTimeout(() => {
            setResetOption('automatic')
            setPasswordInput('')
            setSuccess(false)
        }, 200)
    }

    const { mutateAsync: resetPasswordMutation, isPending: isResetting } =
        useMutation(resetPasswordOptions)

    const handleResetPassword = async () => {
        if (!data?.id) return

        let finalPassword = passwordInput

        if (resetOption === 'automatic') {
            finalPassword = generatePassword()
            setPasswordInput(finalPassword)
        }

        await resetPasswordMutation(
            {
                userId: data.id,
                resetPasswordInput: {
                    newPassword: finalPassword,
                },
            },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({
                        queryKey: userOptions(data.code).queryKey,
                    })
                    setSuccess(true)
                },
            }
        )
    }

    return (
        <HeroModal
            isOpen={isOpen}
            onClose={handleClose}
            placement="center"
            hideCloseButton
            classNames={{ base: '!p-0' }}
            size="lg"
        >
            <HeroModalContent className="p-2">
                <HeroModalHeader
                    className="font-medium text-lg text-white transition-colors duration-300"
                    style={{
                        backgroundColor: isSuccess
                            ? '#138748'
                            : 'var(--color-primary)',
                    }}
                >
                    {isSuccess ? (
                        <div>
                            <p>Reset password successfully</p>
                            <p className="text-sm opacity-90 font-normal">
                                @{data?.username}
                            </p>
                        </div>
                    ) : (
                        <p>Reset password for user @{data?.username}</p>
                    )}
                </HeroModalHeader>

                <HeroModalBody>
                    <div className="pt-2.5 px-0">
                        {!isSuccess ? (
                            <>
                                <RadioGroup
                                    value={resetOption}
                                    onValueChange={(value) =>
                                        setResetOption(
                                            value as 'automatic' | 'manual'
                                        )
                                    }
                                >
                                    <Radio
                                        value="automatic"
                                        description="You'll be able to view and copy the password in the next step"
                                        classNames={{
                                            base: 'gap-2 items-start',
                                            wrapper: 'mt-1.5',
                                        }}
                                    >
                                        Automatically generate a password
                                    </Radio>
                                    <Radio
                                        value="manual"
                                        classNames={{ base: 'gap-2' }}
                                    >
                                        Create password manually
                                    </Radio>
                                </RadioGroup>

                                {resetOption === 'manual' && (
                                    <div className="mt-4 w-full animate-in fade-in slide-in-from-top-2">
                                        <HeroPasswordInput
                                            isRequired
                                            label="New Password"
                                            value={passwordInput}
                                            onChange={(e) =>
                                                setPasswordInput(e.target.value)
                                            }
                                            variant="underlined"
                                            autoFocus
                                            // --- Connected to Schema Result ---
                                            // Only show error if user has typed something and it's invalid
                                            isInvalid={
                                                passwordInput.length > 0 &&
                                                !validationResult.isValid
                                            }
                                            errorMessage={
                                                validationResult.error
                                            }
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="animate-in zoom-in-95 duration-200">
                                <HeroPasswordInput
                                    label="New Password"
                                    value={passwordInput}
                                    isReadOnly
                                    variant="bordered"
                                />
                                <HeroCopyButton
                                    className="mt-3 w-full"
                                    color="primary"
                                    variant="solid"
                                    textValue={passwordInput}
                                >
                                    Copy Password
                                </HeroCopyButton>
                            </div>
                        )}
                    </div>
                </HeroModalBody>

                <HeroModalFooter>
                    {isSuccess ? (
                        <Button variant="light" onPress={handleClose}>
                            Done
                        </Button>
                    ) : (
                        <>
                            <Button variant="light" onPress={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                isLoading={isResetting}
                                onPress={handleResetPassword}
                                // Disable if manual mode and validation fails
                                isDisabled={
                                    resetOption === 'manual' &&
                                    (!passwordInput ||
                                        !validationResult.isValid)
                                }
                            >
                                Reset Password
                            </Button>
                        </>
                    )}
                </HeroModalFooter>
            </HeroModalContent>
        </HeroModal>
    )
}
