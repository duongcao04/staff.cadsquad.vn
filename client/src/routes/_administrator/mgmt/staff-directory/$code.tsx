import {
    ConfirmSendPasswordResetEmail,
    UserInformationTabs,
} from '@/features/staff-directory'
import { ChangeUserStatusModal } from '@/features/staff-directory/components/modals/ChangeUserStatusModal'
import { DeleteUserPermanentlyModal } from '@/features/staff-directory/components/modals/DeleteUserPermanentlyModal'
import ResetPasswordModal from '@/features/staff-directory/components/modals/ResetPasswordModal'
import { UploadAvatarModal } from '@/features/staff-directory/components/modals/UploadAvatarModal'
import { ChangeRoleModal } from '@/features/user-access'
import {
    dateFormatter,
    INTERNAL_URLS,
    optimizeCloudinary,
    useUploadImageMutation,
} from '@/lib'
import {
    rolesListOptions,
    toggleUserStatusOptions,
    updateUserOptions,
    userOptions,
} from '@/lib/queries'
import { AppLoading, RoleChip } from '@/shared/components'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import { HeroCopyButton } from '@/shared/components/ui/hero-copy-button'
import { TUser } from '@/shared/types'
import {
    addToast,
    Avatar,
    BreadcrumbItem,
    Breadcrumbs,
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Divider,
    Spinner,
    Switch,
    useDisclosure,
} from '@heroui/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    Hash,
    HashIcon,
    KeyRound,
    Mail,
    Shield,
    Trash2,
    Upload,
} from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { NavigatorHelper } from '../../../../lib/helpers/navigation.helper'
import { useDevice } from '../../../../shared/hooks'

const staffDetailParams = z.object({
    tab: z
        .enum(['profile', 'organization', 'security', 'account-control'])
        .catch('profile')
        .default('profile'),
})
export type TStaffDetailParams = z.infer<typeof staffDetailParams>

export const Route = createFileRoute(
    '/_administrator/mgmt/staff-directory/$code'
)({
    validateSearch: (search) => staffDetailParams.parse(search),
    head: (ctx) => {
        const loader = ctx.loaderData as unknown as TUser
        return {
            meta: [
                {
                    title:
                        (loader?.displayName ??
                            loader?.code ??
                            loader?.username) + ' | Staff Directory',
                },
            ],
        }
    },
    loader: ({ context, params }) => {
        const { code } = params
        return context.queryClient.ensureQueryData(userOptions(code))
    },
    pendingComponent: AppLoading,
    component: () => {
        const { isSmallView } = useDevice()
        const router = useRouter()
        const { code } = Route.useParams()
        const { data: user } = useSuspenseQuery(userOptions(code))

        const isDeletedUser = Boolean(user.deletedAt)

        return (
            <>
                <AdminContentContainer
                    className="pt-0 space-y-4"
                    showHeader
                    headerProps={{
                        title: (
                            <div className="flex items-center gap-4">
                                <Button
                                    isIconOnly
                                    variant="flat"
                                    onPress={() => router.history.back()}
                                >
                                    <ArrowLeft size={18} />
                                </Button>
                                <div>
                                    <div className="flex items-center justify-start gap-3">
                                        <h1 className="text-2xl font-bold text-text-default">
                                            {user.displayName}
                                        </h1>
                                        {!isSmallView && isDeletedUser && (
                                            <Chip
                                                color="danger"
                                                variant="shadow"
                                                classNames={{
                                                    base: 'shadow-md',
                                                    content: 'font-semibold',
                                                }}
                                            >
                                                Deleted Account
                                            </Chip>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-start gap-3">
                                        <Chip
                                            size="sm"
                                            startContent={
                                                <HashIcon size={12} />
                                            }
                                            classNames={{
                                                base: 'rounded-md cursor-pointer',
                                                content: 'font-bold pt-0.5',
                                            }}
                                            title="Copy"
                                            variant="flat"
                                            onClick={() => {
                                                NavigatorHelper.copy(
                                                    user.code,
                                                    () => {
                                                        addToast({
                                                            title: 'Copy user code successful',
                                                            color: 'success',
                                                        })
                                                    }
                                                )
                                            }}
                                        >
                                            {user.code}
                                        </Chip>
                                        {isSmallView && isDeletedUser && (
                                            <Chip
                                                color="danger"
                                                variant="shadow"
                                                classNames={{
                                                    base: 'shadow-md',
                                                    content: 'font-semibold',
                                                }}
                                            >
                                                Deleted Account
                                            </Chip>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ),
                    }}
                    breadcrumbs={
                        <Breadcrumbs className="text-xs" underline="hover">
                            <BreadcrumbItem>
                                <Link
                                    to={INTERNAL_URLS.admin.overview}
                                    className="text-text-subdued!"
                                >
                                    Management
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Link
                                    to={INTERNAL_URLS.management.team}
                                    className="text-text-subdued!"
                                >
                                    Staff Directory
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>{user.code}</BreadcrumbItem>
                        </Breadcrumbs>
                    }
                >
                    <EditStaffPage data={user} />
                </AdminContentContainer>
            </>
        )
    },
})

function EditStaffPage({ data: user }: { data: TUser }) {
    const { tab: activeTab } = Route.useSearch()

    const toggleUserStatusMutation = useMutation(toggleUserStatusOptions)
    const uploadImageMutation = useUploadImageMutation()
    const updateUser = useMutation(updateUserOptions)

    const [toggleUserActive, setToggleUserActive] = useState<
        'active' | 'deActive'
    >(user.isActive ? 'deActive' : 'active')

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
    const {
        isOpen: isOpenDeleteUserPermanentlyModal,
        onOpen: onOpenDeleteUserPermanentlyModal,
        onClose: onCloseDeleteUserPermanentlyModal,
    } = useDisclosure({ id: 'DeleteUserPermanentlyModal' })

    const changeUserStatusModal = useDisclosure({ id: 'ChangeUserStatusModal' })
    const confirmForgotPasswordModalDisclosure = useDisclosure({
        id: 'ConfirmForgotPasswordModal',
    })
    const changeRoleModalDisclosure = useDisclosure({ id: 'ChangeRoleModal' })

    const {
        data: { roles },
    } = useSuspenseQuery({ ...rolesListOptions() })

    const handleOpenChangeUserModal = (isActive: boolean) => {
        setToggleUserActive(isActive ? 'active' : 'deActive')
        changeUserStatusModal.onOpen()
    }

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
            {changeUserStatusModal.isOpen && (
                <ChangeUserStatusModal
                    isOpen={changeUserStatusModal.isOpen}
                    onClose={changeUserStatusModal.onClose}
                    user={user}
                    action={toggleUserActive}
                    onConfirm={async (userId) => {
                        toggleUserStatusMutation.mutateAsync({ userId })
                    }}
                />
            )}
            {isOpenResetPasswordModal && user && (
                <ResetPasswordModal
                    isOpen={isOpenResetPasswordModal}
                    onClose={onCloseResetPasswordModal}
                    data={user}
                />
            )}
            {isOpenDeleteUserPermanentlyModal && (
                <DeleteUserPermanentlyModal
                    isOpen={isOpenDeleteUserPermanentlyModal}
                    onClose={onCloseDeleteUserPermanentlyModal}
                    user={user}
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

                    {/* 3. Danger Zone */}
                    <Card className="shadow-none border border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900">
                        <CardHeader className="px-6 pt-6 pb-0">
                            <h4 className="font-bold text-red-900 dark:text-red-200 text-sm flex items-center gap-2">
                                <AlertCircle size={16} /> Danger Zone
                            </h4>
                        </CardHeader>
                        <CardBody className="p-6">
                            <p className="text-xs text-red-700 dark:text-red-500 mb-4">
                                Deactivating this user will revoke all access to
                                the dashboard immediately.
                            </p>
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-medium text-sm text-text-subdued">
                                    Account Status
                                </span>
                                {toggleUserStatusMutation.isPending ? (
                                    <Spinner size="sm" />
                                ) : (
                                    <Switch
                                        color="success"
                                        isSelected={user.isActive}
                                        onValueChange={(val) =>
                                            handleOpenChangeUserModal(!val)
                                        }
                                    />
                                )}
                            </div>
                            <Button
                                className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 shadow-sm"
                                variant="flat"
                                startContent={<Trash2 size={16} />}
                                onPress={onOpenDeleteUserPermanentlyModal}
                            >
                                Delete User Permanently
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
