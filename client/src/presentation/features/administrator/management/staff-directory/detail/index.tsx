import { ChangeRoleModal } from '@/presentation/features/user-access'
import {
    dateFormatter,
    optimizeCloudinary,
    useUploadImageMutation,
} from '@/presentation/lib'
import { rolesListOptions, updateUserOptions } from '@/presentation/lib/queries'
import { TUser } from '@/presentation/types'
import {
    addToast,
    Avatar,
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Divider,
    useDisclosure,
} from '@heroui/react'
import { RoleChip } from '@presentation/components'
import { HeroCopyButton } from '@presentation/components/ui/hero-copy-button'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import {
    Calendar,
    Hash,
    KeyRound,
    Mail,
    OctagonXIcon,
    Shield,
    Upload,
} from 'lucide-react'
import { ConfirmSendPasswordResetEmail } from '../_components/modals/ConfirmSendPasswordResetEmail'
import ResetPasswordModal from '../_components/modals/ResetPasswordModal'
import { UploadAvatarModal } from '../_components/modals/UploadAvatarModal'
import { UserInformationTabs } from './components/UserInformationTabs'

export function EditStaffPage({ data: user }: { data: TUser }) {
    const { tab: activeTab } = useSearch({
        from: '/_administrator/mgmt/staff-directory/$code',
    })

    const isDeletedUser = Boolean(user.deletedAt)

    const uploadImageMutation = useUploadImageMutation()
    const updateUser = useMutation(updateUserOptions)

    // --- Modals ---
    const {
        isOpen: isOpenResetPasswordModal,
        onOpen: onOpenResetPasswordModal,
        onClose: onCloseResetPasswordModal,
    } = useDisclosure({ id: 'ResetPasswordModal' })
    const {
        isOpen: isOpenUploadAvatarModal,
        onOpen: onOpenUploadAvatarModal,
        onClose: onCloseUploadAvatarModal,
    } = useDisclosure({ id: 'UploadAvatarModal' })

    const confirmForgotPasswordModalDisclosure = useDisclosure({
        id: 'ConfirmForgotPasswordModal',
    })
    const changeRoleModalDisclosure = useDisclosure({ id: 'ChangeRoleModal' })

    const {
        data: { roles },
    } = useSuspenseQuery({ ...rolesListOptions() })

    const handleAvatarSave = async (imageFile: File) => {
        try {
            const newAvatarUrl =
                await uploadImageMutation.mutateAsync(imageFile)
            if (!newAvatarUrl) throw new Error('Failed to get image URL')
            await updateUser.mutateAsync({
                username: user.username,
                data: {
                    avatar: newAvatarUrl,
                },
            })
        } catch (error) {
            console.error(error)
            addToast({ title: 'Failed to update avatar', color: 'danger' })
        }
    }

    return (
        <>
            {/* Modals Mounting */}
            {isOpenResetPasswordModal && user && (
                <ResetPasswordModal
                    isOpen={isOpenResetPasswordModal}
                    onClose={onCloseResetPasswordModal}
                    data={user}
                />
            )}
            {isOpenUploadAvatarModal && (
                <UploadAvatarModal
                    isOpen={isOpenUploadAvatarModal}
                    onClose={onCloseUploadAvatarModal}
                    onSave={handleAvatarSave}
                    currentAvatarUrl={optimizeCloudinary(user.avatar, {
                        width: 256,
                        height: 256,
                    })}
                />
            )}
            {confirmForgotPasswordModalDisclosure.isOpen && (
                <ConfirmSendPasswordResetEmail
                    isOpen={confirmForgotPasswordModalDisclosure.isOpen}
                    onClose={confirmForgotPasswordModalDisclosure.onClose}
                    user={user}
                />
            )}
            {changeRoleModalDisclosure.isOpen && (
                <ChangeRoleModal
                    isOpen={changeRoleModalDisclosure.isOpen}
                    onClose={changeRoleModalDisclosure.onClose}
                    currentRoleId={user.role.id}
                    roles={roles}
                    user={user}
                />
            )}

            {/* MAIN 1/3 and 2/3 LAYOUT */}
            <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* --- LEFT COLUMN (1/3): Profile, Quick Actions, Danger Zone --- */}
                <div className="lg:col-span-1 space-y-6">
                    {/* 1. Profile Card */}
                    <Card
                        shadow="none"
                        className="border border-border-default"
                    >
                        <CardBody className="flex flex-col items-center p-8 text-center">
                            <div className="relative mb-4 group">
                                <Avatar
                                    src={optimizeCloudinary(user.avatar, {
                                        width: 512,
                                        height: 512,
                                    })}
                                    className="w-32 h-32 shadow-sm border border-border-default"
                                />
                                <div
                                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    onClick={onOpenUploadAvatarModal}
                                >
                                    <Upload className="text-white" size={24} />
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-text-default">
                                {user.displayName}
                            </h2>
                            <p className="text-sm text-text-subdued mb-4">
                                @{user.username}
                            </p>

                            <Chip
                                color={user.isActive ? 'success' : 'warning'}
                                variant="flat"
                                classNames={{
                                    content: 'font-semibold',
                                }}
                                className="mb-6 text-sm"
                            >
                                {user.isActive ? 'Active' : 'Inactive'}
                            </Chip>

                            <div className="w-full space-y-4 text-left">
                                <Divider />
                                <div className="flex justify-between text-sm items-center">
                                    <span className="text-text-subdued flex items-center gap-2">
                                        <Hash size={14} /> Code
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <HeroCopyButton textValue={user.code} />
                                        <span className="text-xs bg-background-hovered px-2 py-1 rounded truncate max-w-25 font-mono font-bold text-primary">
                                            {user.code}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-subdued flex items-center gap-2">
                                        <Shield size={14} /> Role
                                    </span>
                                    <RoleChip data={user.role} />
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-subdued flex items-center gap-2">
                                        <Calendar size={14} /> Joined
                                    </span>
                                    <span className="font-medium text-text-default">
                                        {dateFormatter(user.createdAt, {
                                            format: 'longDate',
                                        })}
                                    </span>
                                </div>
                                {isDeletedUser && user.deletedAt && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-subdued flex items-center gap-2">
                                            <OctagonXIcon size={14} /> Deleted
                                        </span>
                                        <span className="font-medium text-text-default">
                                            {dateFormatter(user.deletedAt, {
                                                format: 'longDate',
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardBody>
                    </Card>

                    {/* 2. Quick Actions Card */}
                    <Card
                        shadow="none"
                        className="border border-border-default"
                    >
                        <CardHeader className="px-6 py-4 border-b border-border-default">
                            <h3 className="font-bold text-sm text-text-default">
                                Quick Actions
                            </h3>
                        </CardHeader>
                        <CardBody className="p-4 flex flex-col gap-2">
                            <Button
                                variant="flat"
                                className="justify-start font-medium text-sm bg-default-100/50 hover:bg-default-200"
                                startContent={
                                    <KeyRound
                                        size={16}
                                        className="text-text-subdued"
                                    />
                                }
                                onPress={onOpenResetPasswordModal}
                            >
                                Force Password Reset
                            </Button>
                            <Button
                                variant="flat"
                                className="justify-start font-medium text-sm bg-default-100/50 hover:bg-default-200"
                                startContent={
                                    <Mail
                                        size={16}
                                        className="text-text-subdued"
                                    />
                                }
                                onPress={
                                    confirmForgotPasswordModalDisclosure.onOpen
                                }
                            >
                                Send Recovery Link
                            </Button>
                            <Button
                                variant="flat"
                                className="justify-start font-medium text-sm bg-default-100/50 hover:bg-default-200"
                                startContent={
                                    <Shield
                                        size={16}
                                        className="text-text-subdued"
                                    />
                                }
                                onPress={changeRoleModalDisclosure.onOpen}
                            >
                                Change Admin Role
                            </Button>
                        </CardBody>
                    </Card>
                </div>

                {/* --- RIGHT COLUMN (2/3): Edit Form with Tabs --- */}
                <div className="lg:col-span-2">
                    <UserInformationTabs activeTab={activeTab} data={user} />
                </div>
            </div>
        </>
    )
}
