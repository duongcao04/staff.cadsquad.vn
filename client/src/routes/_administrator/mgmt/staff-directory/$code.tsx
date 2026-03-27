import { ConfirmSendPasswordResetEmail } from '@/features/staff-directory'
import { ChangeUserStatusModal } from '@/features/staff-directory/components/modals/ChangeUserStatusModal'
import { DeleteUserPermanentlyModal } from '@/features/staff-directory/components/modals/DeleteUserPermanentlyModal'
import ResetPasswordModal from '@/features/staff-directory/components/modals/ResetPasswordModal'
import { UploadAvatarModal } from '@/features/staff-directory/components/modals/UploadAvatarModal'
import { ChangeRoleModal } from '@/features/user-access'
import {
    dateFormatter,
    editUserSchema,
    getPageTitle,
    INTERNAL_URLS,
    optimizeCloudinary,
    TEditUser,
    toFormikValidate,
    useUploadImageMutation,
} from '@/lib'
import {
    departmentsListOptions,
    jobTitlesListOptions,
    rolesListOptions,
    toggleUserStatusOptions,
    updateUserOptions,
    userOptions,
} from '@/lib/queries'
import {
    AdminPageHeading,
    HeroBreadcrumbItem,
    HeroBreadcrumbs,
    HeroButton,
    HeroCard,
    HeroCardBody,
    HeroCardHeader,
    HeroTooltip,
    RoleChip,
} from '@/shared/components'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import { HeroCopyButton } from '@/shared/components/ui/hero-copy-button'
import { TUser } from '@/shared/types'
import {
    addToast,
    Avatar,
    Button,
    Chip,
    Divider,
    Input,
    Select,
    SelectItem,
    Spinner,
    Switch,
    Tab,
    Tabs,
    useDisclosure,
} from '@heroui/react'
import {
    useMutation,
    useSuspenseQueries,
    useSuspenseQuery,
} from '@tanstack/react-query'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useFormik } from 'formik'
import {
    AlertCircle,
    ArrowLeft,
    AtSignIcon,
    Briefcase,
    Building,
    Calendar,
    Hash,
    Info,
    InfoIcon,
    KeyRound,
    Mail,
    Phone,
    Save,
    Shield,
    Trash2,
    Upload,
    User,
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute(
    '/_administrator/mgmt/staff-directory/$code'
)({
    head: (ctx) => {
        const loader = ctx.loaderData as unknown as TUser
        return {
            meta: [
                {
                    title: getPageTitle(
                        loader?.displayName ?? loader?.code ?? loader?.username
                    ),
                },
            ],
        }
    },
    loader: ({ context, params }) => {
        const { code } = params
        return context.queryClient.ensureQueryData(userOptions(code))
    },
    component: () => {
        const router = useRouter()
        const { code } = Route.useParams()
        const { data: user } = useSuspenseQuery(userOptions(code))

        return (
            <>
                <AdminPageHeading
                    title={
                        <div className="flex items-center gap-4">
                            <Button
                                isIconOnly
                                variant="flat"
                                onPress={() => router.history.back()}
                            >
                                <ArrowLeft size={18} />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-text-default">
                                    {user.displayName}
                                </h1>
                                <p className="text-tiny text-text-subdued font-mono">
                                    CODE: {user.code}
                                </p>
                            </div>
                        </div>
                    }
                />
                <AdminContentContainer className="pt-0 space-y-4">
                    <HeroBreadcrumbs className="text-xs">
                        <HeroBreadcrumbItem>
                            <Link
                                to={INTERNAL_URLS.admin.overview}
                                className="text-text-subdued!"
                            >
                                Management
                            </Link>
                        </HeroBreadcrumbItem>
                        <HeroBreadcrumbItem>
                            <Link
                                to={INTERNAL_URLS.management.team}
                                className="text-text-subdued!"
                            >
                                Staff Directory
                            </Link>
                        </HeroBreadcrumbItem>
                        <HeroBreadcrumbItem>{user.code}</HeroBreadcrumbItem>
                    </HeroBreadcrumbs>

                    <EditStaffPage data={user} />
                </AdminContentContainer>
            </>
        )
    },
})

function EditStaffPage({ data: user }: { data: TUser }) {
    const toggleUserStatusMutation = useMutation(toggleUserStatusOptions)
    const uploadImageMutation = useUploadImageMutation()
    const updateUser = useMutation(updateUserOptions)

    const [activeTab, setActiveTab] = useState('profile')
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

    // --- Handlers ---
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
                    <HeroCard
                        shadow="none"
                        className="border border-border-default"
                    >
                        <HeroCardBody className="flex flex-col items-center p-8 text-center">
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
                                color={user.isActive ? 'success' : 'default'}
                                variant="flat"
                                className="mb-6 text-sm font-medium"
                            >
                                {user.isActive ? 'Active Account' : 'Inactive'}
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
                        </HeroCardBody>
                    </HeroCard>

                    {/* 2. Quick Actions Card */}
                    <HeroCard
                        shadow="none"
                        className="border border-border-default"
                    >
                        <HeroCardHeader className="px-6 py-4 border-b border-border-default">
                            <h3 className="font-bold text-sm text-text-default">
                                Quick Actions
                            </h3>
                        </HeroCardHeader>
                        <HeroCardBody className="p-4 flex flex-col gap-2">
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
                        </HeroCardBody>
                    </HeroCard>

                    {/* 3. Danger Zone */}
                    <HeroCard className="shadow-none border border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900">
                        <HeroCardHeader className="px-6 pt-6 pb-0">
                            <h4 className="font-bold text-red-900 dark:text-red-200 text-sm flex items-center gap-2">
                                <AlertCircle size={16} /> Danger Zone
                            </h4>
                        </HeroCardHeader>
                        <HeroCardBody className="p-6">
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
                        </HeroCardBody>
                    </HeroCard>
                </div>

                {/* --- RIGHT COLUMN (2/3): Edit Form with Tabs --- */}
                <div className="lg:col-span-2">
                    <HeroCard
                        shadow="none"
                        className="bg-background-muted border border-border-default h-fit"
                    >
                        <HeroCardHeader className="p-0 border-b border-border-default">
                            <Tabs
                                aria-label="User Edit Tabs"
                                variant="underlined"
                                color="primary"
                                classNames={{
                                    tabList: 'px-6 pt-2 gap-6',
                                    cursor: 'w-full bg-primary',
                                    tab: 'max-w-fit px-0 h-12',
                                    tabContent:
                                        'group-data-[selected=true]:text-primary font-semibold text-text-subdued',
                                }}
                                selectedKey={activeTab}
                                onSelectionChange={(k) =>
                                    setActiveTab(k as string)
                                }
                            >
                                <Tab
                                    key="profile"
                                    title={
                                        <div className="flex items-center gap-2">
                                            <User size={16} /> Personal Info
                                        </div>
                                    }
                                />
                                <Tab
                                    key="organization"
                                    title={
                                        <div className="flex items-center gap-2">
                                            <Briefcase size={16} /> Organization
                                            & Finance
                                        </div>
                                    }
                                />
                                <Tab
                                    key="security"
                                    title={
                                        <div className="flex items-center gap-2">
                                            <KeyRound size={16} /> Security
                                        </div>
                                    }
                                />
                            </Tabs>
                        </HeroCardHeader>

                        <HeroCardBody className="p-6">
                            {activeTab === 'profile' && (
                                <EditProfileTab user={user} />
                            )}
                            {activeTab === 'organization' && (
                                <OrganizationDepartment user={user} />
                            )}
                            {activeTab === 'security' && (
                                <SecurityTab user={user} />
                            )}
                        </HeroCardBody>
                    </HeroCard>
                </div>
            </div>
        </>
    )
}

// ============================================================================
// TAB 1: EDIT PROFILE
// ============================================================================
function EditProfileTab({ user }: { user: TUser }) {
    const router = useRouter()
    const updateUserMutation = useUpdateUserMutation()

    const formik = useFormik<TEditUser & { code?: string }>({
        initialValues: {
            displayName: user.displayName,
            username: user.username,
            code: user.code || '', // 1. Staff Code initialized here
            email: user.email,
            phoneNumber: user.phoneNumber || '',
            personalEmail: user.personalEmail || '',
        },
        enableReinitialize: true,
        validate: toFormikValidate(editUserSchema),
        onSubmit: async (values) => {
            try {
                await updateUserMutation.mutateAsync(
                    {
                        username: user.username,
                        data: values,
                    },
                    {
                        onSuccess: () => {
                            if (values.username !== user.username)
                                router.navigate({ href: '../..' })
                        },
                    }
                )
            } catch (error) {
                console.error('Failed to update user', error)
            }
        },
    })

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="Full Name"
                    labelPlacement="outside-top"
                    placeholder="e.g. Sarah Wilson"
                    variant="bordered"
                    name="displayName"
                    description="Visible to teammates across the platform."
                    value={formik.values.displayName}
                    onValueChange={(v) =>
                        formik.setFieldValue('displayName', v)
                    }
                    isInvalid={
                        !!formik.errors.displayName &&
                        formik.touched.displayName
                    }
                    errorMessage={
                        formik.touched.displayName && formik.errors.displayName
                    }
                    onBlur={formik.handleBlur}
                    classNames={{ label: 'font-semibold text-text-default' }}
                />

                <Input
                    label="Username"
                    labelPlacement="outside-top"
                    placeholder="e.g. sarah_w"
                    variant="bordered"
                    name="username"
                    description="Your unique handle for login and tags."
                    startContent={
                        <AtSignIcon size={14} className="text-text-subdued" />
                    }
                    value={formik.values.username}
                    onValueChange={(v) => formik.setFieldValue('username', v)}
                    isInvalid={
                        !!formik.errors.username && formik.touched.username
                    }
                    errorMessage={
                        formik.touched.username && formik.errors.username
                    }
                    onBlur={formik.handleBlur}
                    classNames={{ label: 'font-semibold text-text-default' }}
                />

                <Input
                    label="Work Email Address"
                    labelPlacement="outside-top"
                    placeholder="sarah@company.com"
                    description="Used for system notifications and secure login."
                    variant="bordered"
                    startContent={
                        <Mail className="text-text-subdued" size={16} />
                    }
                    name="email"
                    value={formik.values.email}
                    onValueChange={(v) => formik.setFieldValue('email', v)}
                    isInvalid={!!formik.errors.email && formik.touched.email}
                    errorMessage={formik.touched.email && formik.errors.email}
                    onBlur={formik.handleBlur}
                    classNames={{ label: 'font-semibold text-text-default' }}
                />

                <Input
                    label="Personal Email (Optional)"
                    labelPlacement="outside-top"
                    placeholder="sarah.personal@gmail.com"
                    description="Secondary contact email for recovery."
                    variant="bordered"
                    startContent={
                        <Mail className="text-text-subdued" size={16} />
                    }
                    name="personalEmail"
                    value={formik.values.personalEmail}
                    onValueChange={(v) =>
                        formik.setFieldValue('personalEmail', v)
                    }
                    isInvalid={
                        !!formik.errors.personalEmail &&
                        formik.touched.personalEmail
                    }
                    errorMessage={
                        formik.touched.personalEmail &&
                        formik.errors.personalEmail
                    }
                    onBlur={formik.handleBlur}
                    classNames={{ label: 'font-semibold text-text-default' }}
                />

                <Input
                    label="Phone Number"
                    labelPlacement="outside-top"
                    placeholder="+84..."
                    variant="bordered"
                    description="Used for direct project coordination."
                    startContent={
                        <Phone className="text-text-subdued" size={16} />
                    }
                    name="phoneNumber"
                    value={formik.values.phoneNumber}
                    onValueChange={(v) =>
                        formik.setFieldValue('phoneNumber', v)
                    }
                    isInvalid={
                        !!formik.errors.phoneNumber &&
                        formik.touched.phoneNumber
                    }
                    errorMessage={
                        formik.touched.phoneNumber && formik.errors.phoneNumber
                    }
                    onBlur={formik.handleBlur}
                    classNames={{ label: 'font-semibold text-text-default' }}
                />
            </div>

            <Divider />

            <div className="flex justify-end">
                <HeroButton
                    color="primary"
                    startContent={!formik.isSubmitting && <Save size={16} />}
                    isLoading={formik.isSubmitting}
                    onPress={() => formik.handleSubmit()}
                    isDisabled={!formik.dirty}
                    className="font-bold px-6"
                >
                    Save Profile
                </HeroButton>
            </div>
        </div>
    )
}

// ============================================================================
// TAB 2: ORGANIZATION & FINANCE
// ============================================================================
function OrganizationDepartment({ user }: { user: TUser }) {
    const updateUserMutation = useUpdateUserMutation()
    const [
        {
            data: { departments },
        },
        {
            data: { jobTitles },
        },
    ] = useSuspenseQueries({
        queries: [
            { ...departmentsListOptions() },
            { ...jobTitlesListOptions() },
        ],
    })

    const formik = useFormik({
        initialValues: {
            departmentId: user.department?.id || '',
            jobTitleId: user.jobTitle?.id || '',
        },
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                await updateUserMutation.mutateAsync({
                    username: user.username,
                    data: {
                        ...values,
                    },
                })
            } catch (error) {
                console.error('Failed to update user org data', error)
            }
        },
    })

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 mb-6">
                <h4 className="text-sm font-bold text-primary-900 mb-1">
                    Corporate & Financial Placement
                </h4>
                <p className="text-xs text-primary-700">
                    Changing the Department or Role will immediately affect user
                    access and reporting.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Department Select */}
                <div className="space-y-1">
                    <div className="flex items-center gap-1 mb-1">
                        <span className="font-semibold text-sm text-text-default">
                            Department
                        </span>
                        <HeroTooltip content="Determines which departmental community hubs the user can join.">
                            <InfoIcon
                                size={14}
                                className="text-text-subdued cursor-help"
                            />
                        </HeroTooltip>
                    </div>
                    <Select
                        placeholder="Select department"
                        variant="bordered"
                        selectedKeys={
                            formik.values.departmentId
                                ? [formik.values.departmentId]
                                : []
                        }
                        onSelectionChange={(keys) =>
                            formik.setFieldValue(
                                'departmentId',
                                Array.from(keys)[0]
                            )
                        }
                        startContent={
                            <Building className="text-text-subdued" size={16} />
                        }
                        isInvalid={
                            !!formik.errors.departmentId &&
                            formik.touched.departmentId
                        }
                        errorMessage={formik.errors.departmentId as string}
                    >
                        {departments?.map((d) => (
                            <SelectItem key={d.id} textValue={d.displayName}>
                                {d.displayName}
                            </SelectItem>
                        )) || []}
                    </Select>
                </div>

                {/* Job Title Select */}
                <div className="space-y-1">
                    <div className="flex items-center gap-1 mb-1">
                        <span className="font-semibold text-sm text-text-default">
                            Job Title
                        </span>
                        <HeroTooltip content="Formal title used in the company directory and project signatures.">
                            <Info
                                size={14}
                                className="text-text-subdued cursor-help"
                            />
                        </HeroTooltip>
                    </div>
                    <Select
                        placeholder="Select title"
                        variant="bordered"
                        selectedKeys={
                            formik.values.jobTitleId
                                ? [formik.values.jobTitleId]
                                : []
                        }
                        onSelectionChange={(keys) =>
                            formik.setFieldValue(
                                'jobTitleId',
                                Array.from(keys)[0]
                            )
                        }
                        startContent={
                            <Briefcase
                                className="text-text-subdued"
                                size={16}
                            />
                        }
                        isInvalid={
                            !!formik.errors.jobTitleId &&
                            formik.touched.jobTitleId
                        }
                        errorMessage={formik.errors.jobTitleId as string}
                    >
                        {jobTitles.map((j) => (
                            <SelectItem key={j.id} textValue={j.displayName}>
                                {j.displayName}
                            </SelectItem>
                        ))}
                    </Select>
                </div>
            </div>

            <Divider />

            <div className="flex justify-end">
                <HeroButton
                    color="primary"
                    startContent={!formik.isSubmitting && <Save size={16} />}
                    isLoading={formik.isSubmitting}
                    onPress={() => formik.handleSubmit()}
                    isDisabled={!formik.dirty}
                    className="font-bold px-6 shadow-md"
                >
                    Save Organization Settings
                </HeroButton>
            </div>
        </div>
    )
}

// ============================================================================
// TAB 3: SECURITY
// ============================================================================
function SecurityTab({ user }: { user: TUser }) {
    const {
        data: { roles },
    } = useSuspenseQuery({ ...rolesListOptions() })
    const changeRoleModalDisclosure = useDisclosure({ id: 'ChangeRoleModal' })

    return (
        <>
            {changeRoleModalDisclosure.isOpen && (
                <ChangeRoleModal
                    isOpen={changeRoleModalDisclosure.isOpen}
                    onClose={changeRoleModalDisclosure.onClose}
                    currentRoleId={user.role.id}
                    roles={roles}
                    user={user}
                />
            )}

            <div className="space-y-6 animate-in fade-in duration-300">
                {/* System Access Role */}
                <div>
                    <h3 className="font-bold text-text-default text-sm mb-3">
                        System Access Role
                    </h3>
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border-default rounded-xl bg-background hover:border-primary-200 transition-colors gap-4">
                        <div>
                            <p className="font-semibold text-text-default text-sm">
                                Primary Role:{' '}
                                {user.role?.displayName || 'Unassigned'}
                            </p>
                            <p className="text-xs text-text-subdued mt-1 max-w-md">
                                This role defines global permissions. Changing
                                this affects access immediately.
                            </p>
                        </div>
                        <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            onPress={changeRoleModalDisclosure.onOpen}
                            className="font-semibold"
                        >
                            Change Role
                        </Button>
                    </div>
                </div>

                <Divider />

                {/* Session Management */}
                <div>
                    <h3 className="font-bold text-text-default text-sm mb-3">
                        Session Control
                    </h3>
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border-default rounded-xl bg-background hover:border-danger-200 transition-colors gap-4">
                        <div>
                            <p className="font-semibold text-text-default text-sm">
                                Force Global Logout
                            </p>
                            <p className="text-xs text-text-subdued mt-1 max-w-md">
                                Sign out this user from all active browsers and
                                mobile devices. Use this if the account is
                                compromised.
                            </p>
                        </div>
                        <Button
                            size="sm"
                            variant="bordered"
                            color="danger"
                            className="font-semibold bg-white"
                        >
                            Log Out All Devices
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}
