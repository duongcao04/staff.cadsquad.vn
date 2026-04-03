import { TDepartment } from '@/shared/types'
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    cn,
} from '@heroui/react'
import { AlertTriangle, Info, Trash2, Users, X } from 'lucide-react'

type ConfirmDeleteDeptModalProps = {
    isOpen: boolean
    onClose: () => void
    department: TDepartment | null
    onConfirm: (dept: TDepartment) => void
    isLoading?: boolean
}

export function ConfirmDeleteDeptModal({
    isOpen,
    onClose,
    department,
    onConfirm,
    isLoading,
}: ConfirmDeleteDeptModalProps) {
    if (!department) return null

    const memberCount = department._count?.users || 0
    const canDelete = memberCount === 0

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 pt-6">
                            <div
                                className={cn(
                                    'w-12 h-12 rounded-2xl flex items-center justify-center mb-2 shadow-lg',
                                    canDelete
                                        ? 'bg-danger/10 text-danger'
                                        : 'bg-warning/10 text-warning'
                                )}
                            >
                                {canDelete ? (
                                    <Trash2 size={24} />
                                ) : (
                                    <AlertTriangle size={24} />
                                )}
                            </div>
                            <span className="text-xl font-black tracking-tight">
                                {canDelete
                                    ? 'Terminate Department'
                                    : 'Deletion Blocked'}
                            </span>
                        </ModalHeader>

                        <ModalBody className="py-4">
                            <p className="text-sm leading-relaxed text-text-subdued">
                                {canDelete ? (
                                    <>
                                        You are about to delete the{' '}
                                        <span className="font-bold text-text-default">
                                            {department.displayName}
                                        </span>{' '}
                                        department. This action is irreversible.
                                    </>
                                ) : (
                                    <>
                                        The department{' '}
                                        <span className="font-bold text-text-default">
                                            {department.displayName}
                                        </span>{' '}
                                        cannot be removed while it contains
                                        active members.
                                    </>
                                )}
                            </p>

                            {/* Status Card */}
                            {!canDelete && (
                                <div
                                    className={cn(
                                        'mt-2 p-4 rounded-xl border flex items-center gap-4 transition-all',
                                        canDelete
                                            ? 'bg-white/5 border-white/10'
                                            : 'bg-warning/5 border-warning/20 shadow-[0_0_15px_-5px_rgba(245,158,11,0.2)]'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'p-2 rounded-lg',
                                            canDelete
                                                ? 'bg-background-hovered'
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
                                    <div>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-text-subdued">
                                            Current Occupancy
                                        </p>
                                        <p
                                            className={cn(
                                                'text-lg font-bold',
                                                !canDelete && 'text-warning'
                                            )}
                                        >
                                            {memberCount} Active Operatives
                                        </p>
                                    </div>
                                </div>
                            )}

                            {!canDelete && (
                                <div className="flex items-start gap-2 p-3 mt-2 border rounded-lg bg-blue-500/5 border-blue-500/10">
                                    <Info
                                        size={14}
                                        className="text-blue-500 mt-0.5"
                                    />
                                    <p className="text-[11px] text-blue-500/80 font-medium">
                                        Please reassign or remove all members
                                        before attempting to delete this
                                        department unit.
                                    </p>
                                </div>
                            )}
                        </ModalBody>

                        <ModalFooter className="pt-2 pb-6">
                            <Button
                                variant="light"
                                onPress={onClose}
                                startContent={<X size={16} />}
                            >
                                {canDelete ? 'Cancel' : 'Dismiss'}
                            </Button>

                            {canDelete && (
                                <Button
                                    color="danger"
                                    variant="shadow"
                                    className="px-6"
                                    onPress={() => onConfirm(department)}
                                    isLoading={isLoading}
                                >
                                    Confirm Deletion
                                </Button>
                            )}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
