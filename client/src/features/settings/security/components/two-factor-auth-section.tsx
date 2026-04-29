import {
    mfaQrCodeOptions,
    profileOptions,
    turnOnMfaOptions,
} from '@/lib/queries'
import { addToast, Switch, useDisclosure } from '@heroui/react'
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { SetupTwoFactorModal } from './modals/setup-two-factor-modal'

export function TwoFactorAuthSection() {
    const queryClient = useQueryClient()
    const [{ data: profileData }, { data: mfaData }] = useQueries({
        queries: [profileOptions(), mfaQrCodeOptions()],
    })
    const qrCodeUrl = mfaData?.qrCode
    const isMfaEnabled = profileData?.profile.isTwoFactorAuthenticationEnabled

    console.log(isMfaEnabled)

    const turnOnAction = useMutation(turnOnMfaOptions)

    const { isOpen, onClose, onOpen } = useDisclosure()
    return (
        <>
            {isOpen && (
                <SetupTwoFactorModal
                    isOpen={isOpen}
                    onClose={onClose}
                    onVerify={async (code) => {
                        turnOnAction.mutateAsync(
                            { code },
                            {
                                onSuccess() {
                                    queryClient.invalidateQueries(
                                        profileOptions()
                                    )
                                    addToast({
                                        title: 'Turn on 2FA successful',
                                        color: 'success',
                                    })
                                },
                            }
                        )
                    }}
                    qrCodeUrl={qrCodeUrl}
                />
            )}
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3">
                    <h3 className="text-md font-medium">
                        Two-step verification
                    </h3>
                    <p className="text-sm text-text-subdued mt-1">
                        We recommend requiring a verification code in addition
                        to your password.
                    </p>
                </div>
                <div className="lg:w-2/3 flex items-start pt-1">
                    <Switch
                        isSelected={isMfaEnabled}
                        color="success"
                        size="sm"
                        classNames={{
                            label: 'text-sm font-medium text-text-default',
                        }}
                        onValueChange={(isSelected) => {
                            if (isSelected) {
                                onOpen()
                            }
                        }}
                    >
                        Two-step verification
                    </Switch>
                </div>
            </div>
        </>
    )
}
