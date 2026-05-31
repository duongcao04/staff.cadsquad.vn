import { useState } from 'react'
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
} from '@heroui/react'
import { QrCode, Smartphone } from 'lucide-react'

type SetupTwoFactorModalProps = {
    isOpen: boolean
    onClose: () => void
    onVerify: (code: string) => Promise<void>
    qrCodeUrl?: string
}

export function SetupTwoFactorModal({
    isOpen,
    onClose,
    onVerify,
    qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Example:user@cadsquad.vn?secret=JBSWY3DPEHPK3PXP&issuer=Cadsquad',
}: SetupTwoFactorModalProps) {
    const [code, setCode] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)

    const handleVerify = async () => {
        setIsVerifying(true)
        try {
            await onVerify(code)
            setCode('') // reset on success
            onClose()
        } catch (error) {
            console.error('Verification failed', error)
        } finally {
            setIsVerifying(false)
        }
    }

    // Only allow numbers and limit to 6 characters
    const handleCodeChange = (value: string) => {
        const numericValue = value.replace(/\D/g, '')
        if (numericValue.length <= 6) {
            setCode(numericValue)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    setCode('')
                    onClose()
                }
            }}
            placement="center"
            backdrop="blur"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 pb-2">
                            Set up Two-step Verification
                        </ModalHeader>
                        <ModalBody className="text-sm text-text-default">
                            <p className="text-text-subdued mb-2">
                                Enhance your account security by requiring an
                                authentication code when you sign in.
                            </p>

                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-background-hovered text-xs font-semibold shrink-0">
                                        1
                                    </div>
                                    <p className="pt-0.5">
                                        Open an <strong>Authenticator</strong>{' '}
                                        app on your device.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-background-hovered text-xs font-semibold shrink-0">
                                        2
                                    </div>
                                    <div className="w-full">
                                        <p className="pt-0.5 mb-3">
                                            Scan the QR code below.
                                        </p>
                                        <div className="flex items-center justify-center p-4 border border-border-default rounded-xl w-fit">
                                            {qrCodeUrl ? (
                                                <img
                                                    src={qrCodeUrl}
                                                    alt="2FA QR Code"
                                                    className="w-40 h-40 object-contain"
                                                />
                                            ) : (
                                                <div className="w-40 h-40 flex flex-col items-center justify-center text-text-subdued bg-background-hovered rounded-lg">
                                                    <QrCode size={32} />
                                                    <span className="text-xs mt-2">
                                                        Loading...
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-text-subdued mt-2">
                                            Can't scan the code? You can also
                                            enter the setup key manually.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-background-hovered text-xs font-semibold shrink-0">
                                        3
                                    </div>
                                    <div className="w-full">
                                        <p className="pt-0.5 mb-3">
                                            Enter the 6-digit code generated by
                                            your app.
                                        </p>
                                        <Input
                                            value={code}
                                            onValueChange={handleCodeChange}
                                            placeholder="000 000"
                                            size="lg"
                                            variant="bordered"
                                            classNames={{
                                                input: 'text-center text-2xl tracking-[0.5em] font-mono pl-4',
                                            }}
                                            startContent={
                                                <Smartphone
                                                    size={20}
                                                    className="text-text-subdued"
                                                />
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter className="pt-6">
                            <Button variant="light" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleVerify}
                                isDisabled={code.length !== 6 || isVerifying}
                                isLoading={isVerifying}
                            >
                                Verify & Turn On
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
