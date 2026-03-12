import { pCenterTableStore } from '@/features/project-center'
import {
    jobStatusesListOptions,
    useBulkChangeStatusMutation,
} from '@/lib/queries'
import { HeroSelect, HeroSelectItem } from '@/shared/components'
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import { useState } from 'react'

type BulkChangeStatusModalProps = {
    isOpen: boolean
    onClose: () => void
    isLoading?: boolean
}
export default function BulkChangeStatusModal({
    isOpen,
    onClose,
}: BulkChangeStatusModalProps) {
    const [toStatusId, setToStatusId] = useState<string | null>(null)

    const selectedKeys = useStore(
        pCenterTableStore,
        (state) => state.selectedKeys
    )

    const {
        data: { jobStatuses },
        isLoading: loadingJobStatuses,
    } = useSuspenseQuery(jobStatusesListOptions())

    const { mutateAsync: bulkChangeStatusMutate, isPending: isUpdating } =
        useBulkChangeStatusMutation()

    const handleClose = () => {
        onClose()
    }

    const onSubmit = async () => {
        if (toStatusId) {
            await bulkChangeStatusMutate(
                {
                    data: {
                        jobIds:
                            selectedKeys !== 'all'
                                ? Array.from(selectedKeys)
                                : [],
                        toStatusId,
                    },
                },
                {
                    onSuccess: () => {
                        pCenterTableStore.setState((state) => ({
                            ...state,
                            selectedKeys: new Set(),
                        }))
                    },
                }
            )
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            placement="center"
            hideCloseButton
            classNames={{
                base: '!p-0',
            }}
            size="lg"
        >
            <ModalContent className="p-2">
                <ModalHeader
                    className="text-white"
                    style={{
                        backgroundColor: 'var(--color-primary)',
                    }}
                >
                    <div className="space-y-1">
                        <p className="font-medium text-lg">
                            Bulk change status for{' '}
                            {selectedKeys === 'all'
                                ? 'all items'
                                : `${selectedKeys.size} items`}
                        </p>
                        <p className="text-xs font-normal text-text-subdued">
                            Update the status for multiple jobs at once.
                        </p>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <div className="pt-2.5 px-0 space-y-3">
                        <p className="text-text-subdued text-sm">
                            Select the new status you want to apply to all
                            selected jobs.
                        </p>
                        <HeroSelect
                            isLoading={loadingJobStatuses}
                            id="status"
                            name="status"
                            placeholder="Select status ..."
                            selectionMode="single"
                            onChange={(e) => {
                                const value = e.target.value
                                setToStatusId(value)
                            }}
                            size="lg"
                            renderValue={(selectedItems) => {
                                return (
                                    <ul className="flex line-clamp-1 truncate">
                                        {selectedItems.map((jobStatus) => {
                                            const item = jobStatuses?.find(
                                                (d) => d.id === jobStatus.key
                                            )
                                            if (!item)
                                                return (
                                                    <span
                                                        className="text-gray-400"
                                                        key={jobStatus.key}
                                                    >
                                                        Select one job status
                                                    </span>
                                                )
                                            return (
                                                <div
                                                    key={jobStatus.key}
                                                    className="flex items-center gap-2"
                                                >
                                                    <div
                                                        className="w-2 h-2 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                item.hexColor ||
                                                                'transparent',
                                                        }}
                                                    />
                                                    <span>
                                                        {item.displayName}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </ul>
                                )
                            }}
                        >
                            {jobStatuses?.map((jobStatus) => (
                                <HeroSelectItem key={jobStatus.id}>
                                    <div className="flex items-center justify-start gap-2">
                                        <div
                                            className="size-2 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    jobStatus.hexColor
                                                        ? jobStatus.hexColor
                                                        : 'transparent',
                                            }}
                                        />
                                        <p>{jobStatus.displayName}</p>
                                    </div>
                                </HeroSelectItem>
                            ))}
                        </HeroSelect>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        isLoading={isUpdating}
                        onPress={onSubmit}
                    >
                        Reset
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
