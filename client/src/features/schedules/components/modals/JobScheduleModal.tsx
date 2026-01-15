import { dateFormatter, INTERNAL_URLS } from '@/lib'
import { jobByNoOptions } from '@/lib/queries'
import {
    Avatar,
    AvatarGroup,
    Button,
    Chip,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { Clock, Plus } from 'lucide-react'

type JobScheduleModalProps = {
    isOpen: boolean
    onClose: () => void
    jobNo: string
}
export default function JobScheduleModal({
    isOpen,
    onClose,
    jobNo,
}: JobScheduleModalProps) {
    const { data: job } = useQuery({
        ...jobByNoOptions(jobNo),
        enabled: isOpen,
    })
    const router = useRouter()

    const handleEditDetails = () => {
        router.navigate({
            href: INTERNAL_URLS.editJob(jobNo),
        })
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} backdrop="blur">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-text-subdued text-xs font-medium uppercase tracking-wider">
                                <Clock size={12} />
                                {job &&
                                    dateFormatter(job.dueAt, {
                                        format: 'longDateTime',
                                    })}
                            </div>
                            <span className="text-xl">{job?.displayName}</span>
                        </ModalHeader>
                        <ModalBody>
                            <div className="flex items-center gap-2 mb-4">
                                <Chip
                                    variant="flat"
                                    style={{
                                        backgroundColor: `${job?.status.hexColor}20`,
                                        color: job?.status?.hexColor,
                                    }}
                                >
                                    {job?.status.displayName}
                                </Chip>
                                <span className="text-sm text-text-subdued">
                                    for{' '}
                                    <strong>
                                        {job?.client?.name || 'Unknown client'}
                                    </strong>
                                </span>
                            </div>

                            <div className="bg-background p-4 rounded-xl border border-border-default mb-4">
                                <p className="text-sm font-semibold text-text-default mb-2">
                                    Assignees
                                </p>
                                <div className="flex items-center gap-3">
                                    <AvatarGroup max={3} isBordered>
                                        {job?.assignments.map((ass, i) => (
                                            <Avatar
                                                key={i}
                                                src={ass.user.avatar}
                                                name={ass.user.displayName}
                                            />
                                        ))}
                                    </AvatarGroup>
                                    <Button
                                        size="sm"
                                        variant="light"
                                        startContent={<Plus size={14} />}
                                        onPress={() => {
                                            router.navigate({
                                                href: `${INTERNAL_URLS.editJob(jobNo)}/?tab=team`,
                                            })
                                        }}
                                    >
                                        Add
                                    </Button>
                                </div>
                            </div>

                            <p className="text-sm text-text-subdued">
                                This job is currently in the{' '}
                                <strong>{job?.status.displayName}</strong>{' '}
                                phase. Ensure all deliverables are uploaded
                                before the deadline.
                            </p>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                color="danger"
                                variant="light"
                                onPress={onClose}
                            >
                                Delete
                            </Button>
                            <Button color="primary" onPress={handleEditDetails}>
                                Edit Details
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
