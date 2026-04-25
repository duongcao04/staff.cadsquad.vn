import {
    departmentsListOptions,
    editUserSchema,
    jobTitlesListOptions,
    rolesListOptions,
    RouteUtil,
    TEditUser,
    toggleUserStatusOptions,
    updateUserOptions,
    userOptions,
} from '@/lib'
import { TStaffDetailParams } from '@/routes/_administrator/mgmt/staff-directory/$code'
import { HeroButton, HeroTooltip, RoleChip } from '@/shared/components'
import { TUser } from '@/shared/types'
import {
    addToast,
    Button,
    Card,
    CardBody,
    CardHeader,
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
    useQueries,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import { useFormik } from 'formik'
import {
    AlertCircle,
    AtSignIcon,
    Briefcase,
    BriefcaseIcon,
    Building,
    Info,
    InfoIcon,
    KeyRound,
    KeyRoundIcon,
    Mail,
    Phone,
    Save,
    Settings2Icon,
    Trash2,
    UserIcon,
} from 'lucide-react'
import { useMemo } from 'react'
import { toFormikValidate } from 'zod-formik-adapter'
import { ChangeRoleModal } from '../../../user-access'
import { ChangeUserStatusModal } from '../../components/modals/ChangeUserStatusModal'
import { ConfirmSendPasswordResetEmail } from '../../components/modals/ConfirmSendPasswordResetEmail'
import { DeleteUserPermanentlyModal } from '../../components/modals/DeleteUserPermanentlyModal'
import ResetPasswordModal from '../../components/modals/ResetPasswordModal'

interface UserInformationTabsProps {
    activeTab: TStaffDetailParams['tab']
    data: TUser
}
export const UserInformationTabs = ({
    activeTab,
    data,
}: UserInformationTabsProps) => {
    return (
        <Card
            shadow="none"
            className="bg-background border border-border-default h-fit"
        >
            <CardHeader className="pb-3.5">
                <Tabs
                    aria-label="User Edit Tabs"
                    variant="underlined"
                    color="primary"
                    classNames={{
                        tabList: 'px-6 gap-6',
                        cursor: 'w-full bg-primary',
                        tab: 'max-w-fit px-0 h-8',
                        tabContent:
                            'group-data-[selected=true]:text-primary font-semibold text-text-subdued',
                    }}
                    selectedKey={activeTab}
                    onSelectionChange={(k) =>
                        RouteUtil.updateParams({ tab: k as string })
                    }
                >
                    <Tab
                        key="profile"
                        title={
                            <div className="flex items-center gap-2">
                                <UserIcon size={16} /> Personal Info
                            </div>
                        }
                    />
                    <Tab
                        key="organization"
                        title={
                            <div className="flex items-center gap-2">
                                <BriefcaseIcon size={16} /> Organization
                            </div>
                        }
                    />
                    <Tab
                        key="security"
                        title={
                            <div className="flex items-center gap-2">
                                <KeyRoundIcon size={16} /> Security
                            </div>
                        }
                    />
                    <Tab
                        key="account-control"
                        title={
                            <div className="flex items-center gap-2">
                                <Settings2Icon size={16} /> Account Control
                            </div>
                        }
                    />
                </Tabs>
            </CardHeader>

            <Divider />

            <CardBody className="p-6">
                {activeTab === 'profile' && <EditProfileTab user={data} />}
                {activeTab === 'organization' && (
                    <OrganizationDepartment user={data} />
                )}
                {activeTab === 'security' && <SecurityTab user={data} />}
                {activeTab === 'account-control' && (
                    <AccountControlTab user={data} />
                )}
            </CardBody>
        </Card>
    )
}

// ============================================================================
// TAB 1: EDIT PROFILE
// ============================================================================
function EditProfileTab({ user }: { user: TUser }) {
    const queryClient = useQueryClient()
    const updateUserMutation = useMutation(updateUserOptions)

    const formik = useFormik<TEditUser & { code?: string }>({
        initialValues: {
            displayName: user.displayName,
            username: user.username,
            code: user.code || '',
            email: user.email,
            phoneNumber: user.phoneNumber || '',
            personalEmail: user.personalEmail || '',
        },
        enableReinitialize: true,
        validate: toFormikValidate(editUserSchema),
        onSubmit: async (values) => {
            await updateUserMutation.mutateAsync(
                {
                    username: user.username,
                    data: values,
                },
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries({
                            queryKey: userOptions(user.code).queryKey,
                        })
                        addToast({
                            title: 'Update profile information successful',
                            color: 'success',
                        })
                    },
                }
            )
        },
    })

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    isRequired
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
                    isRequired
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
                    isRequired
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
                    label="Personal Email"
                    labelPlacement="outside-top"
                    placeholder="example@domail.com"
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
    const updateUserMutation = useMutation(updateUserOptions)
    const [
        { data: departmentsData, isLoading: loadingDepartments },
        { data: jobTitlesData, isLoading: loadingJobTitles },
    ] = useQueries({
        queries: [
            { ...departmentsListOptions() },
            { ...jobTitlesListOptions() },
        ],
    })
    const departments = departmentsData?.departments || []
    const jobTitles = jobTitlesData?.jobTitles || []

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
                    Organization
                </h4>
                <p className="text-xs text-primary-700">
                    Manage departments and job titles across your organization.
                    Keep structured to ensure clear responsibilities and
                    efficient user management.
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
                        isLoading={loadingDepartments}
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
                        isLoading={loadingJobTitles}
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
    const { data: rolesData } = useQuery({ ...rolesListOptions() })
    const roles = rolesData?.roles || []

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
                    <h3 className="font-bold text-text-default mb-3">
                        System Access Role
                    </h3>
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border-default rounded-xl bg-background hover:border-primary-200 transition-colors gap-4">
                        <div>
                            <div className="flex items-center justify-start gap-1.5">
                                <p className="font-semibold text-text-default text-sm">
                                    Current Role:{' '}
                                </p>
                                <RoleChip data={user.role} />
                            </div>
                            <p className="text-xs text-text-subdued mt-1 max-w-md">
                                This role defines global permissions. Changing
                                this affects access immediately.
                            </p>
                        </div>
                        <Button
                            size="sm"
                            color="primary"
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
                    <h3 className="font-bold text-text-default mb-3">
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

// ============================================================================
// TAB 4: ACCOUNT CONTROL
// ============================================================================
export function AccountControlTab({ user }: { user: TUser }) {
    const queryClient = useQueryClient()
    const resetPwModalState = useDisclosure()
    const recoveryPwModalState = useDisclosure()
    const deleteModalState = useDisclosure()
    const statusModalState = useDisclosure()

    const toggleUserStatusMutation = useMutation(toggleUserStatusOptions)

    const targetStatusAction: 'active' | 'deActive' = useMemo(
        () => (user.isActive ? 'deActive' : 'active'),
        [user.isActive]
    )

    return (
        <>
            {statusModalState.isOpen && (
                <ChangeUserStatusModal
                    isOpen={statusModalState.isOpen}
                    onClose={statusModalState.onClose}
                    user={user}
                    action={targetStatusAction}
                    onConfirm={async (userId) => {
                        toggleUserStatusMutation.mutateAsync(
                            { userId },
                            {
                                onSuccess() {
                                    queryClient.invalidateQueries({
                                        queryKey: userOptions(user.code)
                                            .queryKey,
                                    })
                                    addToast({
                                        title: `${targetStatusAction === 'deActive' ? 'Deactivate' : 'Reactivate'} account ${user.displayName} successful`,
                                        color: 'success',
                                    })
                                },
                            }
                        )
                    }}
                />
            )}
            {resetPwModalState.isOpen && user && (
                <ResetPasswordModal
                    isOpen={resetPwModalState.isOpen}
                    onClose={resetPwModalState.onClose}
                    data={user}
                />
            )}
            {recoveryPwModalState.isOpen && (
                <ConfirmSendPasswordResetEmail
                    isOpen={recoveryPwModalState.isOpen}
                    onClose={recoveryPwModalState.onClose}
                    user={user}
                />
            )}
            {deleteModalState.isOpen && (
                <DeleteUserPermanentlyModal
                    isOpen={deleteModalState.isOpen}
                    onClose={deleteModalState.onClose}
                    user={user}
                />
            )}
            <div className="space-y-8 animate-in fade-in duration-300">
                {/* Quick Actions Section */}
                <div>
                    <h3 className="font-bold text-text-default mb-3">
                        Account Control
                    </h3>
                    <div className="border border-border-default rounded-xl bg-background flex flex-col overflow-hidden">
                        {/* Action: Force Password Reset */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between p-5 gap-4 hover:bg-default-50 transition-colors">
                            <div className="flex flex-col gap-1.5">
                                <span className="font-semibold text-text-default flex items-center gap-2">
                                    <KeyRound
                                        size={18}
                                        className="text-default-500"
                                    />
                                    Force Password Reset
                                </span>
                                <p className="text-sm text-text-subdued max-w-2xl">
                                    Invalidate the current password. The user
                                    will be required to create a new one upon
                                    next login.
                                </p>
                            </div>
                            <Button
                                variant="flat"
                                className="font-semibold shrink-0 bg-default-100 hover:bg-default-200 text-default-700"
                                onPress={resetPwModalState.onOpen}
                            >
                                Reset Password
                            </Button>
                        </div>

                        <Divider />

                        {/* Action: Send Recovery Link */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between p-5 gap-4 hover:bg-default-50 transition-colors">
                            <div className="flex flex-col gap-1.5">
                                <span className="font-semibold text-text-default flex items-center gap-2">
                                    <Mail
                                        size={18}
                                        className="text-default-500"
                                    />
                                    Send Recovery Link
                                </span>
                                <p className="text-sm text-text-subdued max-w-2xl">
                                    Email a secure, one-time link to help the
                                    user regain access to their account.
                                </p>
                            </div>
                            <Button
                                variant="flat"
                                className="font-semibold shrink-0 bg-default-100 hover:bg-default-200 text-default-700"
                                onPress={recoveryPwModalState.onOpen}
                            >
                                Send Link
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Danger Zone Section */}
                <div>
                    <h3 className="font-bold text-danger-600 mb-3 flex items-center gap-2">
                        <AlertCircle size={20} strokeWidth={2.5} />
                        Danger Zone
                    </h3>
                    <div className="border border-danger-200 bg-danger-50/30 rounded-xl flex flex-col overflow-hidden">
                        {/* Account Status Toggle */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between p-5 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <span className="font-semibold text-danger-700">
                                    Account Status
                                </span>
                                <p className="text-sm text-danger-600/80 max-w-2xl">
                                    Deactivating this user will revoke all
                                    access to the dashboard immediately.
                                </p>
                            </div>
                            {toggleUserStatusMutation.isPending ? (
                                <Spinner size="sm" />
                            ) : (
                                <Switch
                                    color="success"
                                    isSelected={user.isActive}
                                    onValueChange={statusModalState.onOpen}
                                />
                            )}
                        </div>

                        <Divider className="bg-danger-200" />

                        {/* Delete User Permanently */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between p-5 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <span className="font-semibold text-danger-700 flex items-center gap-2">
                                    <Trash2
                                        size={18}
                                        className="text-danger-500"
                                    />
                                    Delete User Permanently
                                </span>
                                <p className="text-sm text-danger-600/80 max-w-2xl">
                                    Irreversibly erase this user's data and
                                    account from the system. This action cannot
                                    be undone.
                                </p>
                            </div>
                            <Button
                                variant="bordered"
                                color="danger"
                                className="bg-white font-semibold shadow-sm hover:bg-danger-50 transition-colors shrink-0"
                                onPress={deleteModalState.onOpen}
                            >
                                Delete User
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
