import SettingTitle from '@/features/settings/components/SettingTitle'
import { ConfirmLogoutAllDevicesModal } from '@/features/user-sessions'
import {
    cookie,
    dateFormatter,
    getPageTitle,
    INTERNAL_URLS,
    TUpdatePasswordInput,
    UpdatePasswordInputSchema,
    useUpdatePasswordMutation,
} from '@/lib'
import {
    activeSessionsListOptions,
    securityLogsListOptions,
    useRevokeAllSessionMutation,
    useRevokeSessionMutation,
} from '@/lib/queries'
import { COOKIES, getDeviceIcon } from '@/lib/utils'
import {
    HeroBreadcrumbItem,
    HeroBreadcrumbs,
    HeroCard,
    HeroCardBody,
    HeroCardHeader,
    HeroPasswordInput,
    HeroTooltip,
} from '@/shared/components'
import { TUserSecurityLog } from '@/shared/types'
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Divider,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure,
} from '@heroui/react'
import { useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useFormik } from 'formik'
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    House,
    KeyRound,
    LogOut,
    MapPin,
    Shield,
    ShieldAlertIcon,
    Smartphone,
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/settings/login-and-security')({
    head: () => ({
        meta: [
            {
                title: getPageTitle('Login & Security'),
            },
        ],
    }),
    component: SecuritySettingsPage,
})

const enable2FA = false
function SecuritySettingsPage() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure() // For 2FA Modal
    const [is2FAEnabled, setIs2FAEnabled] = useState(true)

    const revokeSessionMutation = useRevokeSessionMutation()
    const revokeAllSessionMutation = useRevokeAllSessionMutation(() => {})

    const confirmLogoutAllDeviceDisclosure = useDisclosure({
        id: 'ConfirmLogoutAllDevicesModal',
    })

    const [
        {
            data: { securityLogs },
            isLoading,
        },
        {
            data: { activeSessions },
        },
    ] = useSuspenseQueries({
        queries: [
            { ...securityLogsListOptions() },
            { ...activeSessionsListOptions() },
        ],
    })

    const handleRevokeSession = async (sessionId: string) => {
        await revokeSessionMutation.mutateAsync(sessionId)
    }
    const handleRevokeAllSession = async () => {
        await revokeAllSessionMutation.mutateAsync()
    }

    return (
        <>
            {confirmLogoutAllDeviceDisclosure.isOpen && (
                <ConfirmLogoutAllDevicesModal
                    isOpen={confirmLogoutAllDeviceDisclosure.isOpen}
                    onClose={confirmLogoutAllDeviceDisclosure.onClose}
                    onConfirm={handleRevokeAllSession}
                />
            )}
            <HeroBreadcrumbs className="text-xs">
                <HeroBreadcrumbItem>
                    <Link
                        to={INTERNAL_URLS.home}
                        className="text-text-subdued!"
                    >
                        <House size={16} />
                    </Link>
                </HeroBreadcrumbItem>
                <HeroBreadcrumbItem>
                    <Link
                        to={INTERNAL_URLS.settings}
                        className="text-text-subdued!"
                    >
                        Settings
                    </Link>
                </HeroBreadcrumbItem>
                <HeroBreadcrumbItem>Login & Security</HeroBreadcrumbItem>
            </HeroBreadcrumbs>

            <div className="size-full mt-5">
                {/* Header */}
                <SettingTitle
                    title="Login & Security"
                    description="Manage your password, 2FA, and active sessions."
                />

                <div
                    className={`mt-7 grid grid-cols-1 ${enable2FA ? 'lg:grid-cols-2' : ''} gap-8`}
                >
                    {/* --- LEFT COLUMN: Credentials --- */}
                    <UpdatePasswordForm />
                    {/* --- RIGHT COLUMN: Activity & Sessions --- */}
                    {enable2FA && (
                        <div className="size-full lg:col-span-1 space-y-6">
                            {/* 2FA Settings */}
                            <Card className="shadow-sm border border-border-default">
                                <CardHeader className="px-6 pt-6 pb-2">
                                    <h4 className="font-bold text-lg text-text-default flex items-center gap-2">
                                        <Shield
                                            size={20}
                                            className="text-success"
                                        />{' '}
                                        Two-Factor Authentication
                                    </h4>
                                </CardHeader>
                                <CardBody className="px-6 pb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="pr-4">
                                            <p
                                                className={`font-bold text-sm ${is2FAEnabled ? 'text-success-600' : 'text-text-subdued'}`}
                                            >
                                                {is2FAEnabled
                                                    ? 'Enabled'
                                                    : 'Disabled'}
                                            </p>
                                            <p className="text-xs text-text-subdued mt-1">
                                                Secure your account with an
                                                authenticator app (Google Auth,
                                                Authy).
                                            </p>
                                        </div>
                                        <Switch
                                            isSelected={is2FAEnabled}
                                            onValueChange={setIs2FAEnabled}
                                            color="success"
                                        />
                                    </div>

                                    {!is2FAEnabled && (
                                        <Button
                                            variant="flat"
                                            color="primary"
                                            className="w-full"
                                            onPress={onOpen}
                                        >
                                            Setup 2FA Now
                                        </Button>
                                    )}

                                    {is2FAEnabled && (
                                        <div className="bg-background-muted p-3 rounded-lg border border-border-default">
                                            <div className="flex items-center gap-2 text-xs font-bold text-text-default mb-2">
                                                <Smartphone size={14} />
                                                Recovery Codes
                                            </div>
                                            <p className="text-xs text-text-subdued mb-3">
                                                You have 3 unused recovery codes
                                                left. Generate new ones if you
                                                lost them.
                                            </p>
                                            <Button
                                                size="sm"
                                                variant="bordered"
                                                className="w-full border-border-default"
                                            >
                                                View Codes
                                            </Button>
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Active Sessions */}
                <HeroCard className="mt-6 ">
                    <HeroCardHeader className="px-6 pt-6 pb-2 flex justify-between items-center">
                        <div className="flex flex-col items-start">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <ShieldAlertIcon
                                    size={20}
                                    className="text-text-subdued"
                                />
                                Active Sessions
                            </h2>
                            <p className="text-small text-text-subdued">
                                Manage devices currently logged into your
                                account.
                            </p>
                        </div>
                        <Button
                            size="sm"
                            variant="light"
                            color="danger"
                            startContent={
                                revokeSessionMutation.isPending ? (
                                    <Spinner />
                                ) : (
                                    <LogOut size={16} />
                                )
                            }
                            disabled={revokeSessionMutation.isPending}
                            onPress={confirmLogoutAllDeviceDisclosure.onOpen}
                        >
                            Log Out All Devices
                        </Button>
                    </HeroCardHeader>
                    <HeroCardBody className="px-6 pb-6">
                        <div className="space-y-4">
                            {activeSessions.map((session) => {
                                const currentSessionId = cookie.get(
                                    COOKIES.sessionId
                                )
                                const isCurrentSession =
                                    session.sessionId === currentSessionId
                                const Icon = getDeviceIcon(session.device)
                                return (
                                    <div
                                        key={session.ipAddress}
                                        className="flex items-center justify-between p-3 border border-border-default rounded-xl hover:bg-background-hovered transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center ${isCurrentSession ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-text-subdued dark:text-text-7'}`}
                                            >
                                                <Icon size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-text-default text-sm">
                                                        {session.device}
                                                    </p>
                                                    {isCurrentSession && (
                                                        <Chip
                                                            size="sm"
                                                            color="success"
                                                            variant="flat"
                                                            className="h-5 text-[10px]"
                                                        >
                                                            Current
                                                        </Chip>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-text-subdued">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={10} />{' '}
                                                        {session.ipAddress}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={10} />{' '}
                                                        {dateFormatter(
                                                            session.lastActive,
                                                            {
                                                                format: 'longDateTime',
                                                            }
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {!isCurrentSession && (
                                            <HeroTooltip content="Revoke Access">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    color="danger"
                                                    disabled={
                                                        revokeSessionMutation.isPending
                                                    }
                                                    onPress={() =>
                                                        handleRevokeSession(
                                                            session.sessionId
                                                        )
                                                    }
                                                >
                                                    {revokeSessionMutation.isPending ? (
                                                        <Spinner />
                                                    ) : (
                                                        <LogOut size={16} />
                                                    )}
                                                </Button>
                                            </HeroTooltip>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </HeroCardBody>
                </HeroCard>

                {/* Login History */}
                <HeroCard className="mt-6 ">
                    <HeroCardHeader className="px-6 pt-6 pb-2">
                        <h4 className="font-bold text-lg text-text-default flex items-center gap-2">
                            <Clock size={20} className="text-text-subdued" />{' '}
                            Recent Activity
                        </h4>
                    </HeroCardHeader>
                    <HeroCardBody className="p-0">
                        <Table
                            aria-label="User security logs table"
                            removeWrapper
                            className="min-h-50"
                        >
                            <TableHeader className="px-12">
                                <TableColumn className="bg-transparent text-[11px] font-bold">
                                    EVENT
                                </TableColumn>
                                <TableColumn className="bg-transparent text-[11px] font-bold">
                                    DATE
                                </TableColumn>
                                <TableColumn className="bg-transparent text-[11px] font-bold">
                                    IP ADDRESS
                                </TableColumn>
                                <TableColumn className="bg-transparent text-[11px] font-bold text-right">
                                    STATUS
                                </TableColumn>
                            </TableHeader>

                            <TableBody
                                items={securityLogs ?? []}
                                isLoading={isLoading}
                                loadingContent={
                                    <Spinner
                                        label="Loading activity..."
                                        size="sm"
                                    />
                                }
                                emptyContent={
                                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                                        <div className="p-3 bg-default-100 rounded-full">
                                            <ShieldAlertIcon
                                                size={32}
                                                className="text-text-subdued"
                                            />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-text-default">
                                                No activity found
                                            </p>
                                            <p className="text-xs text-text-subdued">
                                                Your security logs will appear
                                                here.
                                            </p>
                                        </div>
                                    </div>
                                }
                            >
                                {(log: TUserSecurityLog) => (
                                    <TableRow
                                        key={log.id}
                                        className="hover:bg-background-hovered px-6"
                                    >
                                        <TableCell>
                                            <span
                                                className={`font-medium text-sm ${log.status === 'FAILED' ? 'text-red-500' : 'text-text-default'}`}
                                            >
                                                {log.event}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-text-subdued text-xs">
                                                {dateFormatter(log.createdAt, {
                                                    format: 'longDateTime',
                                                })}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-text-default text-xs bg-background/80 border border-border-muted px-2 py-1 rounded">
                                                {log.ipAddress}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end">
                                                <Chip
                                                    size="sm"
                                                    variant="flat"
                                                    color={
                                                        log.status === 'SUCCESS'
                                                            ? 'success'
                                                            : 'danger'
                                                    }
                                                    startContent={
                                                        log.status ===
                                                        'SUCCESS' ? (
                                                            <CheckCircle2
                                                                size={12}
                                                            />
                                                        ) : (
                                                            <AlertTriangle
                                                                size={12}
                                                            />
                                                        )
                                                    }
                                                >
                                                    {log.status}
                                                </Chip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </HeroCardBody>
                </HeroCard>

                {/* 2FA Setup Modal */}
                {enable2FA && (
                    <Modal
                        isOpen={isOpen}
                        onOpenChange={onOpenChange}
                        size="md"
                    >
                        <ModalContent>
                            {(onClose) => (
                                <>
                                    <ModalHeader>
                                        Setup Two-Factor Authentication
                                    </ModalHeader>
                                    <ModalBody className="flex flex-col items-center text-center">
                                        <div className="w-48 h-48 bg-slate-100 rounded-xl mb-4 flex items-center justify-center border border-border-default">
                                            <span className="text-text-subdued font-mono text-xs">
                                                QR CODE PLACEHOLDER
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-4">
                                            Scan this QR code with your
                                            authenticator app (Google
                                            Authenticator, Authy, etc.) and
                                            enter the code below.
                                        </p>
                                        <Input
                                            placeholder="Enter 6-digit code"
                                            className="max-w-xs text-center font-mono text-lg tracking-widest"
                                            maxLength={6}
                                        />
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button
                                            variant="light"
                                            onPress={onClose}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            color="primary"
                                            onPress={() => {
                                                setIs2FAEnabled(true)
                                                onClose()
                                            }}
                                        >
                                            Verify & Enable
                                        </Button>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                )}
            </div>
        </>
    )
}

function UpdatePasswordForm() {
    const updatePasswordMutation = useUpdatePasswordMutation()

    const formik = useFormik<TUpdatePasswordInput>({
        initialValues: {
            oldPassword: '',
            newPassword: '',
            newConfirmPassword: '',
        },
        validationSchema: UpdatePasswordInputSchema,
        onSubmit: (values) => {
            updatePasswordMutation.mutateAsync(
                {
                    updatePasswordInput: values,
                },
                {
                    onSuccess: () => {
                        formik.resetForm()
                    },
                }
            )
        },
    })

    return (
        <form
            onSubmit={formik.handleSubmit}
            className="size-full lg:col-span-1 space-y-6"
        >
            {/* Change Password */}
            <HeroCard>
                <HeroCardHeader className="px-6 pt-6 pb-2">
                    <h4 className="font-bold text-lg text-text-default flex items-center gap-2">
                        <KeyRound size={20} className="text-primary" /> Password
                    </h4>
                </HeroCardHeader>
                <HeroCardBody className="px-6 pb-6 gap-4">
                    <HeroPasswordInput
                        id="oldPassword"
                        name="oldPassword"
                        value={formik.values.oldPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={
                            Boolean(formik.touched.oldPassword) &&
                            Boolean(formik.errors.oldPassword)
                        }
                        errorMessage={
                            Boolean(formik.touched.oldPassword) &&
                            formik.errors.oldPassword
                        }
                        label="Current Password"
                        placeholder="Enter current password"
                        variant="bordered"
                    />
                    <Divider />
                    <HeroPasswordInput
                        id="newPassword"
                        name="newPassword"
                        label="New Password"
                        placeholder="Minimum 8 characters"
                        type="password"
                        variant="bordered"
                        value={formik.values.newPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={
                            Boolean(formik.touched.newPassword) &&
                            Boolean(formik.errors.newPassword)
                        }
                        errorMessage={
                            Boolean(formik.touched.newPassword) &&
                            formik.errors.newPassword
                        }
                    />
                    <HeroPasswordInput
                        id="newConfirmPassword"
                        name="newConfirmPassword"
                        label="Confirm New Password"
                        placeholder="Re-enter new password"
                        type="password"
                        variant="bordered"
                        value={formik.values.newConfirmPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={
                            Boolean(formik.touched.newConfirmPassword) &&
                            Boolean(formik.errors.newConfirmPassword)
                        }
                        errorMessage={
                            Boolean(formik.touched.newConfirmPassword) &&
                            formik.errors.newConfirmPassword
                        }
                    />
                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            color="primary"
                            size="sm"
                            isLoading={updatePasswordMutation.isPending}
                            isDisabled={
                                !formik.dirty ||
                                !formik.isValid ||
                                updatePasswordMutation.isPending
                            }
                        >
                            Update Password
                        </Button>
                    </div>
                </HeroCardBody>
            </HeroCard>
        </form>
    )
}
