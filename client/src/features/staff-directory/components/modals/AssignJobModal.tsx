import {
    Autocomplete,
    AutocompleteItem,
    Avatar,
    Button,
    Chip,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Textarea,
} from '@heroui/react'
import { Briefcase, Calendar, CheckCircle2, Search } from 'lucide-react'
import { useState } from 'react'

import { TUser } from '../../../../shared/types'

// --- Mock Data: Available Jobs (Fetch from API in real app) ---
const AVAILABLE_JOBS = [
    {
        id: '1',
        title: 'Website Redesign',
        client: 'TechCorp',
        status: 'IN_PROGRESS',
        deadline: '2024-03-10',
        image: 'https://via.placeholder.com/150/3b82f6/ffffff?text=Web',
    },
    {
        id: '2',
        title: 'Mobile App Assets',
        client: 'Startup Inc',
        status: 'URGENT',
        deadline: '2024-03-01',
        image: 'https://via.placeholder.com/150/ef4444/ffffff?text=App',
    },
    {
        id: '3',
        title: 'SEO Audit',
        client: 'RetailChain',
        status: 'TODO',
        deadline: '2024-03-20',
        image: 'https://via.placeholder.com/150/10b981/ffffff?text=SEO',
    },
]

interface AssignJobModalProps {
    isOpen: boolean
    onClose: () => void
    user: TUser | null
}

export const AssignJobModal = ({
    isOpen,
    onClose,
    user,
}: AssignJobModalProps) => {
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
    const [note, setNote] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const selectedJob = AVAILABLE_JOBS.find((j) => j.id === selectedJobId)

    const handleAssign = () => {
        setIsSubmitting(true)
        // Simulate API Call
        console.log(
            `Assigning Job ${selectedJobId} to User ${user?.id} with note: ${note}`
        )

        setTimeout(() => {
            setIsSubmitting(false)
            onClose()
            // Trigger toast success here
        }, 1000)
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
            backdrop="blur"
            classNames={{
                header: 'border-b border-border-default',
                footer: 'border-t border-border-default',
            }}
        >
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <span className="text-xl">Assign Job</span>
                            <span className="text-sm font-normal text-slate-500">
                                Select a project to assign to{' '}
                                <strong>{user?.displayName}</strong>
                            </span>
                        </ModalHeader>

                        <ModalBody className="py-6">
                            {/* 1. User Confirmation Card */}
                            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                                <Avatar
                                    src={user?.avatar}
                                    size="md"
                                    isBordered
                                />
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">
                                        {user?.displayName}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {user?.jobTitle?.displayName ||
                                            'Team Member'}
                                    </p>
                                </div>
                                <div className="ml-auto">
                                    <Chip
                                        size="sm"
                                        color="success"
                                        variant="flat"
                                    >
                                        Available
                                    </Chip>
                                </div>
                            </div>

                            {/* 2. Job Selector (Autocomplete) */}
                            <div className="space-y-4">
                                <Autocomplete
                                    label="Select Job / Project"
                                    placeholder="Search by job title or client..."
                                    labelPlacement="outside"
                                    variant="bordered"
                                    defaultItems={AVAILABLE_JOBS}
                                    onSelectionChange={(key) =>
                                        setSelectedJobId(key as string)
                                    }
                                    startContent={
                                        <Search
                                            className="text-slate-400"
                                            size={18}
                                        />
                                    }
                                >
                                    {(item) => (
                                        <AutocompleteItem
                                            key={item.id}
                                            textValue={item.title}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-small font-bold">
                                                        {item.title}
                                                    </span>
                                                    <span className="text-tiny text-default-400">
                                                        {item.client}
                                                    </span>
                                                </div>
                                                <Chip
                                                    size="sm"
                                                    variant="flat"
                                                    color={
                                                        item.status === 'URGENT'
                                                            ? 'danger'
                                                            : 'primary'
                                                    }
                                                >
                                                    {item.status}
                                                </Chip>
                                            </div>
                                        </AutocompleteItem>
                                    )}
                                </Autocomplete>

                                {/* Selected Job Preview */}
                                {selectedJob && (
                                    <div className="p-4 border border-blue-200 bg-blue-50 rounded-xl animate-in fade-in zoom-in-95">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-blue-900">
                                                {selectedJob.title}
                                            </h4>
                                            <span className="text-xs font-bold bg-white px-2 py-1 rounded text-blue-600 border border-blue-100">
                                                {selectedJob.client}
                                            </span>
                                        </div>
                                        <div className="flex gap-4 text-xs text-blue-700/80">
                                            <span className="flex items-center gap-1">
                                                <Briefcase size={12} /> Web Dev
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} /> Due:{' '}
                                                {selectedJob.deadline}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* 3. Instructions */}
                                <Textarea
                                    label="Instructions (Optional)"
                                    placeholder="E.g. Focus on the mobile responsive layout..."
                                    labelPlacement="outside"
                                    variant="bordered"
                                    minRows={2}
                                    value={note}
                                    onValueChange={setNote}
                                />
                            </div>
                        </ModalBody>

                        <ModalFooter>
                            <Button variant="light" onPress={close}>
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleAssign}
                                isDisabled={!selectedJobId}
                                isLoading={isSubmitting}
                                startContent={
                                    !isSubmitting && <CheckCircle2 size={18} />
                                }
                            >
                                Confirm Assignment
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
