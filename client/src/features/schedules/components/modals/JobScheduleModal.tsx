import { dateFormatter, INTERNAL_URLS, optimizeCloudinary } from '@/lib'
import { jobByNoOptions } from '@/lib/queries'
import {
    Avatar,
    Button,
    Chip,
    Divider,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
} from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import dayjs from 'dayjs'
import {
    AlignLeft,
    Building2,
    Calendar,
    Clock,
    Cloud,
    ExternalLink,
    Tag,
    Users,
} from 'lucide-react'
import JobFinishChip from '../../../../shared/components/chips/JobFinishChip'
import CountdownTimer from '../../../../shared/components/ui/countdown-timer'
import { JobStatusSystemTypeEnum } from '../../../../shared/enums'

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
    const { data: job, isLoading } = useQuery({
        ...jobByNoOptions(jobNo),
        enabled: isOpen,
    })
    const router = useRouter()

    const handleOpenWorkspace = () => {
        router.navigate({
            href: INTERNAL_URLS.management.jobDetail(jobNo),
        })
        onClose()
    }

    const isCompleted =
        job?.status.systemType === JobStatusSystemTypeEnum.COMPLETED
    const isFinish =
        job?.status.systemType === JobStatusSystemTypeEnum.TERMINATED
    const isPaused = isCompleted || isFinish

    const sharepointDisplay = (() => {
        if (!job?.sharepointFolder && !job?.folderTemplate) {
            return 'Unlinked'
        }
        if (job?.sharepointFolder) {
            return (
                job?.sharepointFolder.displayName ||
                job?.sharepointFolder.itemId
            )
        } else {
            return (
                job?.folderTemplate?.folderName || job?.folderTemplate?.folderId
            )
        }
    })()

    const sharepointUrl =
        job?.sharepointFolder.webUrl || job?.folderTemplate?.webUrl || null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="2xl"
            scrollBehavior="inside"
            classNames={{
                base: 'overflow-hidden',
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        {isLoading || !job ? (
                            <div className="h-100 flex items-center justify-center">
                                <Spinner
                                    size="lg"
                                    color="primary"
                                    label="Loading job details..."
                                />
                            </div>
                        ) : (
                            <>
                                {/* --- Header --- */}
                                <ModalHeader
                                    className="flex flex-col gap-3 pb-5 pt-6 pl-6 pr-10"
                                    style={{
                                        backgroundColor: job.status?.hexColor
                                            ? `${job.status.hexColor}15`
                                            : 'transparent',
                                        borderBottom: `1px solid ${job.status?.hexColor ? `${job.status.hexColor}30` : 'var(--nextui-colors-default-200)'}`,
                                    }}
                                >
                                    <div className="flex items-start justify-between w-full">
                                        <div className="flex flex-col gap-2">
                                            <span
                                                className="text-xs font-bold px-2.5 py-1 rounded-md tracking-wider w-fit border shadow-sm"
                                                style={{
                                                    backgroundColor: job.status
                                                        ?.hexColor
                                                        ? `${job.status.hexColor}20`
                                                        : 'var(--nextui-colors-default-100)',
                                                    color:
                                                        job.status?.hexColor ||
                                                        'inherit',
                                                    borderColor: job.status
                                                        ?.hexColor
                                                        ? `${job.status.hexColor}40`
                                                        : 'transparent',
                                                }}
                                            >
                                                {job.no}
                                            </span>
                                            <h2 className="text-2xl font-bold text-default-900 leading-tight">
                                                {job.displayName}
                                            </h2>
                                            <div className="w-full mt-1">
                                                {isPaused ? (
                                                    <JobFinishChip
                                                        status={
                                                            isCompleted
                                                                ? 'completed'
                                                                : 'finish'
                                                        }
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-text-subdued">
                                                        <p className="text-sm font-medium">
                                                            Due on:
                                                        </p>
                                                        <CountdownTimer
                                                            targetDate={dayjs(
                                                                job?.dueAt
                                                            )}
                                                            hiddenUnits={[
                                                                'second',
                                                                'year',
                                                            ]}
                                                            paused={isPaused}
                                                            className="text-right! text-sm font-semibold"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Chip
                                            variant="solid"
                                            className="font-bold whitespace-nowrap shadow-sm text-white"
                                            style={{
                                                backgroundColor:
                                                    job.status?.hexColor ||
                                                    'var(--nextui-colors-default-500)',
                                            }}
                                        >
                                            {job.status?.displayName}
                                        </Chip>
                                    </div>
                                </ModalHeader>

                                <ModalBody className="px-6 py-5 gap-6">
                                    {/* --- Timeframe Grid --- */}
                                    <div className="grid grid-cols-2 gap-4 bg-default-50 p-4 rounded-xl border border-default-200">
                                        <div>
                                            <p className="text-xs font-semibold text-default-500 flex items-center gap-1.5 mb-1.5 uppercase tracking-wider">
                                                <Calendar size={14} /> Start
                                                Date
                                            </p>
                                            <p className="text-sm font-medium text-default-900">
                                                {job.startedAt
                                                    ? dateFormatter(
                                                          job.startedAt,
                                                          { format: 'longDate' }
                                                      )
                                                    : 'Not specified'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-danger-500 flex items-center gap-1.5 mb-1.5 uppercase tracking-wider">
                                                <Clock size={14} /> Due Date
                                            </p>
                                            <p className="text-sm font-bold text-danger-600">
                                                {job.dueAt
                                                    ? dateFormatter(job.dueAt, {
                                                          format: 'longDateTime',
                                                      })
                                                    : 'No deadline'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* --- Core Info & SharePoint Grid --- */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-semibold text-default-500 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                                                <Building2 size={14} /> Client
                                            </p>
                                            <p
                                                title={
                                                    job.client?.name ||
                                                    'Internal'
                                                }
                                                className="text-sm font-medium text-default-900 bg-default-100/50 p-2.5 rounded-lg border border-default-100 truncate"
                                            >
                                                {job.client?.name || 'Internal'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-default-500 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                                                <Tag size={14} /> Job Type
                                            </p>
                                            <p
                                                title={
                                                    job.type?.displayName ||
                                                    'Standard'
                                                }
                                                className="text-sm font-medium text-default-900 bg-default-100/50 p-2.5 rounded-lg border border-default-100 truncate"
                                            >
                                                {job.type?.displayName ||
                                                    'Standard'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-default-500 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                                                <Cloud size={14} /> SharePoint
                                            </p>
                                            <p
                                                title={sharepointDisplay}
                                                className="text-sm font-medium text-default-900 bg-default-100/50 p-2.5 rounded-lg border border-default-100 truncate"
                                            >
                                                {sharepointDisplay}
                                            </p>
                                        </div>
                                    </div>

                                    <Divider className="my-1" />

                                    {/* --- Assignees --- */}
                                    <div>
                                        <p className="text-xs font-semibold text-default-500 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                                            <Users size={14} /> Assigned Team (
                                            {job.assignments?.length || 0})
                                        </p>
                                        {job.assignments &&
                                        job.assignments.length > 0 ? (
                                            <div className="flex flex-col gap-3">
                                                {job.assignments.map(
                                                    (assignment, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center gap-3"
                                                        >
                                                            <Avatar
                                                                src={optimizeCloudinary(
                                                                    assignment
                                                                        .user
                                                                        .avatar
                                                                )}
                                                                name={
                                                                    assignment
                                                                        .user
                                                                        .displayName
                                                                }
                                                                size="sm"
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-default-900">
                                                                    {
                                                                        assignment
                                                                            .user
                                                                            .displayName
                                                                    }
                                                                </span>
                                                                <span className="text-xs text-default-500">
                                                                    {assignment
                                                                        .user
                                                                        .jobTitle
                                                                        ?.displayName ||
                                                                        'Member'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-default-400 italic bg-default-50 p-3 rounded-lg">
                                                No team members assigned yet.
                                            </p>
                                        )}
                                    </div>

                                    {/* --- Description --- */}
                                    <div>
                                        <p className="text-xs font-semibold text-default-500 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                                            <AlignLeft size={14} /> Description
                                            & Notes
                                        </p>
                                        <div className="text-sm text-default-700 bg-default-50 p-4 rounded-xl border border-default-200 whitespace-pre-wrap leading-relaxed">
                                            {job.description || (
                                                <span className="italic opacity-50">
                                                    No additional description
                                                    provided.
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </ModalBody>

                                {/* --- Action Footer --- */}
                                <ModalFooter className="px-6 py-4 border-t border-default-200 bg-default-50/50">
                                    <Button
                                        variant="light"
                                        onPress={handleOpenWorkspace}
                                        className="font-medium mr-auto"
                                    >
                                        Open Workspace
                                    </Button>
                                    <Button
                                        variant="flat"
                                        onPress={onClose}
                                        className="font-medium"
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        color="primary"
                                        variant="solid"
                                        as={'a'}
                                        href={sharepointUrl}
                                        target="_blank"
                                        isDisabled={!sharepointUrl}
                                        endContent={<ExternalLink size={16} />}
                                        className="font-semibold text-white!"
                                    >
                                        View SharePoint
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
