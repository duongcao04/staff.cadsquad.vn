import { TJobTitle } from '@/shared/types'
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    cn,
} from '@heroui/react'
import { AlertTriangle, ShieldX, Trash2, Users, X } from 'lucide-react'

type ConfirmDeleteJobTitleModalProps = {
    isOpen: boolean
    onClose: () => void
    jobTitle: TJobTitle | null
    onConfirm: (jobTitle: TJobTitle) => void
    isLoading?: boolean
}

export function ConfirmDeleteJobTitleModal({
    isOpen,
    onClose,
    jobTitle,
    onConfirm,
    isLoading,
}: ConfirmDeleteJobTitleModalProps) {
    if (!jobTitle) return null

    const memberCount = jobTitle._count?.users || 0
    const canDelete = memberCount === 0

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 pt-6">
                            <div
                                className={cn(
                                    'w-12 h-12 rounded-2xl flex items-center justify-center mb-2 shadow-lg transition-transform duration-500',
                                    canDelete
                                        ? 'bg-danger/10 text-danger shadow-danger/20'
                                        : 'bg-warning/10 text-warning shadow-warning/20'
                                )}
                            >
                                {canDelete ? (
                                    <ShieldX size={24} />
                                ) : (
                                    <AlertTriangle size={24} />
                                )}
                            </div>
                            <span className="text-xl font-bold">
                                {canDelete
                                    ? 'Do you want delete this job title ?'
                                    : 'Protocol Blocked'}
                            </span>
                        </ModalHeader>

                        <ModalBody className="py-4">
                            <p className="text-sm leading-relaxed text-text-subdued">
                                {canDelete ? (
                                    <>
                                        You are initiating a terminal deletion
                                        of the{' '}
                                        <span className="px-1 font-mono font-bold rounded text-primary bg-primary/5">
                                            {jobTitle.code}
                                        </span>{' '}
                                        clearance level. This role will be
                                        purged from the system hierarchy.
                                    </>
                                ) : (
                                    <>
                                        The position{' '}
                                        <span className="font-bold text-text-default">
                                            {jobTitle.displayName}
                                        </span>{' '}
                                        cannot be purged because it is currently
                                        assigned to active personnel.
                                    </>
                                )}
                            </p>

                            {/* Technical Impact Card */}
                            {!canDelete && (
                                <div
                                    className={cn(
                                        'mt-4 p-4 rounded-2xl border transition-all duration-300',
                                        canDelete
                                            ? 'bg-white/5 border-white/10 shadow-inner'
                                            : 'bg-warning/5 border-warning/20 shadow-[0_0_20px_-10px_rgba(245,158,11,0.3)]'
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={cn(
                                                'p-2.5 rounded-xl flex items-center justify-center',
                                                canDelete
                                                    ? 'bg-background-hovered border border-white/5'
                                                    : 'bg-warning/20'
                                            )}
                                        >
                                            <Users
                                                size={18}
                                                className={
                                                    canDelete
                                                        ? 'text-text-subdued'
                                                        : 'text-warning'
                                                }
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-text-subdued opacity-70">
                                                Assigned Operatives
                                            </p>
                                            <div className="flex items-baseline gap-2">
                                                <p
                                                    className={cn(
                                                        'text-xl font-black italic tracking-tighter',
                                                        !canDelete &&
                                                            'text-warning'
                                                    )}
                                                >
                                                    {memberCount} Units
                                                </p>
                                                {canDelete && (
                                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
                                                        [ Clear ]
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!canDelete && (
                                <div className="flex items-start gap-3 p-3 mt-4 border rounded-xl bg-blue-500/5 border-blue-500/10">
                                    <div className="mt-0.5 p-1 rounded-md bg-blue-500/10">
                                        <Trash2
                                            size={12}
                                            className="text-blue-500"
                                        />
                                    </div>
                                    <p className="text-[11px] text-blue-400 font-medium leading-normal">
                                        <span className="font-bold text-blue-500 uppercase">
                                            Action Required:
                                        </span>{' '}
                                        Reassign all operatives to a different
                                        rank before attempting to decommission
                                        this clearance level.
                                    </p>
                                </div>
                            )}
                        </ModalBody>

                        <ModalFooter className="pt-2 pb-6">
                            <Button
                                variant="light"
                                onPress={onClose}
                                className="text-xs font-bold tracking-widest uppercase"
                                startContent={<X size={16} />}
                            >
                                {canDelete ? 'Abort' : 'Dismiss'}
                            </Button>

                            {canDelete && (
                                <Button
                                    color="danger"
                                    className="px-8 italic font-black tracking-tighter shadow-xl shadow-danger/20"
                                    onPress={() => onConfirm(jobTitle)}
                                    isLoading={isLoading}
                                    startContent={
                                        !isLoading && <Trash2 size={16} />
                                    }
                                >
                                    Confirm Purge
                                </Button>
                            )}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
