import { Button } from '@heroui/react'
import { Globe, LogOut, ShieldAlert, Smartphone } from 'lucide-react'
import { useDevice } from '../../../shared/hooks'
import {
    HeroModal,
    HeroModalBody,
    HeroModalContent,
    HeroModalFooter,
    HeroModalHeader,
} from '../../../shared/components/ui/hero-modal'

interface Props {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    isLoading?: boolean
}

export const ConfirmLogoutAllDevicesModal = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
}: Props) => {
    const { isSmallView } = useDevice()
    return (
        <HeroModal
            isOpen={isOpen}
            onClose={onClose}
            size={isSmallView ? 'lg' : 'md'}
            classNames={{
                base: 'border border-divider bg-background',
                header: 'border-b border-divider',
                footer: 'border-t border-divider',
            }}
        >
            <HeroModalContent>
                <HeroModalHeader className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-danger">
                        <ShieldAlert size={22} />
                        <span className="text-xl font-bold">
                            Secure Sign Out
                        </span>
                    </div>
                </HeroModalHeader>

                <HeroModalBody className="py-6">
                    <div className="space-y-4">
                        <p className="text-sm text-text-default">
                            Are you sure you want to sign out of{' '}
                            <b>all active sessions</b>? This action will:
                        </p>

                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-xs text-text-subdued bg-default-50 p-2 rounded-xl">
                                <Globe size={16} className="text-primary" />
                                Terminate sessions on all browsers (Chrome,
                                Safari, etc.)
                            </li>
                            <li className="flex items-center gap-3 text-xs text-text-subdued bg-default-50 p-2 rounded-xl">
                                <Smartphone
                                    size={16}
                                    className="text-primary"
                                />
                                Sign out from all mobile and tablet applications
                            </li>
                        </ul>

                        <div className="p-3 bg-danger-50 border border-danger-100 rounded-2xl text-[11px] text-danger-700 italic">
                            <b>Note:</b> You will need to re-authenticate on
                            this current device as well.
                        </div>
                    </div>
                </HeroModalBody>

                <HeroModalFooter>
                    <Button variant="light" onPress={onClose}>
                        Cancel
                    </Button>
                    <Button
                        color="danger"
                        className="font-bold px-6 shadow-lg shadow-danger/20"
                        startContent={<LogOut size={18} />}
                        onPress={onConfirm}
                        isLoading={isLoading}
                    >
                        Logout All Devices
                    </Button>
                </HeroModalFooter>
            </HeroModalContent>
        </HeroModal>
    )
}
