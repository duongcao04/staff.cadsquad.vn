import { useCreateJobMutation } from '@/lib'
import {
    HeroModal,
    HeroModalBody,
    HeroModalContent,
    HeroModalHeader,
} from '@/shared/components/ui/hero-modal'
import { useDevice } from '@/shared/hooks'
import CreateJobForm from '../forms/CreateJobForm'
import CreateJobFormMobile from '../forms/CreateJobFormMobile'

type Props = {
    isOpen: boolean
    onClose: () => void
}
export function CreateJobModal({ isOpen, onClose }: Props) {
    const { isSmallView } = useDevice()
    const createJobMutation = useCreateJobMutation()

    return (
        <HeroModal
            isOpen={isOpen}
            onClose={onClose}
            placement={isSmallView ? 'bottom-center' : 'center'}
            size="4xl"
        >
            <HeroModalContent>
                <HeroModalHeader>
                    <div className="space-y-1">
                        <p className="text-lg font-semibold">Create new job</p>
                    </div>
                </HeroModalHeader>
                <HeroModalBody className="px-0 pt-0">
                    {isSmallView ? (
                        <CreateJobFormMobile
                            isSubmitting={createJobMutation.isPending}
                            onSubmit={async (values) => {
                                await createJobMutation.mutateAsync(values)
                                console.log(values)
                            }}
                            afterSubmit={onClose}
                        />
                    ) : (
                        <CreateJobForm
                            isSubmitting={createJobMutation.isPending}
                            onSubmit={async (values) => {
                                await createJobMutation.mutateAsync(values)
                                console.log(values)
                            }}
                            afterSubmit={onClose}
                        />
                    )}
                </HeroModalBody>
            </HeroModalContent>
        </HeroModal>
    )
}
