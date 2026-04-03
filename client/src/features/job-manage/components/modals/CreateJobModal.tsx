import {
    copySharepointItemOptions,
    createJobOptions,
    INTERNAL_URLS,
} from '@/lib'
import { CancelModal } from '@/shared/components/ui/cancel-modal'
import { useDevice } from '@/shared/hooks'
import { ChevronsExpandUpRight } from '@gravity-ui/icons'
import {
    addToast,
    Button,
    Divider,
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    Tooltip,
    useDisclosure,
} from '@heroui/react'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import CreateJobForm from '../forms/CreateJobForm'
import { Link } from '@tanstack/react-router'

type Props = {
    isOpen: boolean
    onClose: () => void
}
export function CreateJobModal({ isOpen, onClose }: Props) {
    const { isSmallView } = useDevice()

    const [isDirtyForm, setDirtyForm] = useState(false)

    const [rootSharepointFolderId, setRootSharepointFolderId] = useState<
        string | null
    >(null)

    const createJobAction = useMutation(createJobOptions)
    const cancelModalDisclosure = useDisclosure()

    const copySharepointMutation = useMutation(copySharepointItemOptions)

    return (
        <>
            <CancelModal
                onConfirm={onClose}
                isOpen={cancelModalDisclosure.isOpen}
                onClose={cancelModalDisclosure.onClose}
            />
            <Modal
                isOpen={isOpen}
                onClose={() => {
                    if (isDirtyForm) {
                        cancelModalDisclosure.onOpen()
                    } else {
                        onClose()
                    }
                }}
                placement={isSmallView ? 'bottom-center' : 'center'}
                size="5xl"
            >
                <ModalContent>
                    <ModalHeader>
                        <div className="flex items-center justify-between w-full pr-6">
                            <p className="text-xl font-medium">
                                Create new job
                            </p>
                            <Tooltip content="Open in fullscreen">
                                <Button
                                    variant="light"
                                    isIconOnly
                                    radius="full"
                                    as={Link}
                                    href={INTERNAL_URLS.management.jobCreation}
                                >
                                    <ChevronsExpandUpRight fontSize={14} />
                                </Button>
                            </Tooltip>
                        </div>
                    </ModalHeader>
                    <Divider />
                    <ModalBody className="px-0 pt-0">
                        <CreateJobForm
                            setDirtyForm={setDirtyForm}
                            isSubmitting={createJobAction.isPending}
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
                                    paymentChannelId: values.paymentChannelId,
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
                                                newName: sharepointFolderName,
                                            })
                                            .then((res) => res.result.id)
                                    createData['sharepointFolderId'] =
                                        newSharepointFolderId as string
                                }

                                await createJobAction.mutateAsync(
                                    createData,
                                    {
                                        onSuccess() {
                                            addToast({
                                                title: 'Successfully',
                                                description:
                                                    'Create job successfuly',
                                                color: 'success',
                                            })
                                        },
                                    }
                                )
                            }}
                            afterSubmit={onClose}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )
}
