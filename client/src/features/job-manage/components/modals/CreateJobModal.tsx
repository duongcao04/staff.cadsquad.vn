import { useCreateJobMutation } from '@/lib'
import {
    HeroModal,
    HeroModalBody,
    HeroModalContent,
    HeroModalHeader,
} from '@/shared/components/ui/hero-modal'
import { useDevice } from '@/shared/hooks'
import { useDisclosure } from '@heroui/react'
import { useState } from 'react'
import { useCopySharepointItemMutation } from '../../../../lib/queries/useSharepoint'
import CancelModal from '../../../../shared/components/ui/cancel-modal'
import CreateJobForm from '../forms/CreateJobForm'
import CreateJobFormMobile from '../forms/CreateJobFormMobile'

type Props = {
    isOpen: boolean
    onClose: () => void
}
export function CreateJobModal({ isOpen, onClose }: Props) {
    const { isSmallView } = useDevice()

    const [rootSharepointFolderId, setRootSharepointFolderId] = useState<
        string | null
    >(null)

    const createJobMutation = useCreateJobMutation()
    const cancelModalDisclosure = useDisclosure()

    const copySharepointMutation = useCopySharepointItemMutation()

    return (
        <>
            <CancelModal
                onConfirm={onClose}
                isOpen={cancelModalDisclosure.isOpen}
                onClose={cancelModalDisclosure.onClose}
            />
            <HeroModal
                isOpen={isOpen}
                onClose={cancelModalDisclosure.onOpen}
                placement={isSmallView ? 'bottom-center' : 'center'}
                size="4xl"
            >
                <HeroModalContent>
                    <HeroModalHeader>
                        <div className="space-y-1">
                            <p className="text-lg font-medium">
                                Create new job
                            </p>
                        </div>
                    </HeroModalHeader>
                    <HeroModalBody className="px-0 pt-0">
                        {isSmallView ? (
                            <CreateJobFormMobile
                                isSubmitting={createJobMutation.isPending}
                                onSubmit={async (values) => {}}
                                afterSubmit={onClose}
                            />
                        ) : (
                            <CreateJobForm
                                isSubmitting={createJobMutation.isPending}
                                rootSharepointFolderId={rootSharepointFolderId}
                                setRootSharepointFolderId={
                                    setRootSharepointFolderId
                                }
                                onSubmit={async (values) => {
                                    const createData = {
                                        attachmentUrls: values.attachmentUrls,
                                        clientName: values.clientName,
                                        displayName: values.displayName,
                                        dueAt: values.dueAt,
                                        incomeCost: values.incomeCost,
                                        jobAssignments: values.jobAssignments,
                                        no: values.no,
                                        startedAt: values.startedAt,
                                        totalStaffCost: values.totalStaffCost,
                                        typeId: values.typeId,
                                        description: values.description,
                                        paymentChannelId:
                                            values.paymentChannelId,
                                        sharepointFolderId: '',
                                    }
                                    if (values.useExistingSharepointFolder) {
                                        createData['sharepointFolderId'] =
                                            values.sharepointFolderId as string
                                    } else {
                                        const sharepointFolderName =
                                            values.no +
                                            '- ' +
                                            values.clientName.toUpperCase() +
                                            '_' +
                                            values.displayName.toUpperCase()
                                        const newSharepointFolderId =
                                            await copySharepointMutation
                                                .mutateAsync({
                                                    itemId: values.sharepointTemplateId as string,
                                                    destinationFolderId:
                                                        rootSharepointFolderId as string,
                                                    newName:
                                                        sharepointFolderName,
                                                })
                                                .then((res) => res.result.id)
                                        createData['sharepointFolderId'] =
                                            newSharepointFolderId as string
                                    }

                                    await createJobMutation.mutateAsync(
                                        createData
                                    )
                                }}
                                afterSubmit={onClose}
                            />
                        )}
                    </HeroModalBody>
                </HeroModalContent>
            </HeroModal>
        </>
    )
}
