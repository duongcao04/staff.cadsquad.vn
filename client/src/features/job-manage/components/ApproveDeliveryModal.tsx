import { Button } from '@heroui/react'
import { AlertTriangle } from 'lucide-react'
import {
    HeroModal,
    HeroModalContent,
    HeroModalHeader,
    HeroModalBody,
    HeroModalFooter,
} from '../../../shared/components/ui/hero-modal'

interface ApproveDeliveryModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    isLoading?: boolean
}

export default function ApproveDeliveryModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
}: ApproveDeliveryModalProps) {
    return (
        <HeroModal
            isOpen={isOpen}
            onClose={onClose}
            hideCloseButton={isLoading}
            isDismissable={!isLoading}
        >
            <HeroModalContent>
                {() => (
                    <>
                        <HeroModalHeader className="flex flex-col gap-1">
                            Confirm Approval
                        </HeroModalHeader>

                        <HeroModalBody>
                            <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-lg text-primary-600 dark:bg-primary-900/20">
                                <AlertTriangle className="size-6 shrink-0" />
                                <div className="text-sm">
                                    <p className="font-semibold">
                                        This action cannot be undone.
                                    </p>
                                    <p>
                                        The job will be marked as{' '}
                                        <strong>Completed</strong> and the staff
                                        member will be notified.
                                    </p>
                                </div>
                            </div>
                            <p className="text-default-500 text-sm mt-2">
                                Are you sure you want to approve this delivery?
                            </p>
                        </HeroModalBody>

                        <HeroModalFooter>
                            <Button
                                variant="light"
                                onPress={onClose}
                                isDisabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onPress={onConfirm}
                                isLoading={isLoading}
                            >
                                Approve Delivery
                            </Button>
                        </HeroModalFooter>
                    </>
                )}
            </HeroModalContent>
        </HeroModal>
    )
}
