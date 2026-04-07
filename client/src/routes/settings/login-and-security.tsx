import SettingTitle from '@/features/settings/components/SettingTitle'
import { ConfirmLogoutAllDevicesModal } from '@/features/user-sessions'
import {
    cookie,
    dateFormatter,
    INTERNAL_URLS,
    TUpdatePasswordInput,
    UpdatePasswordInputSchema,
} from '@/lib'
import {
    activeSessionsListOptions,
    securityLogsListOptions,
    updateUsePasswordOptions,
    useRevokeAllSessionMutation,
    useRevokeSessionMutation,
} from '@/lib/queries'
import { COOKIES, getDeviceIcon } from '@/lib/utils'
import {
    HeroBreadcrumbItem,
    HeroBreadcrumbs,
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
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure,
} from '@heroui/react'
import { useMutation, useSuspenseQueries } from '@tanstack/react-query'
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
    ShieldAlertIcon,
} from 'lucide-react'

export const Route = createFileRoute('/settings/login-and-security')({
    head: () => ({
        meta: [
            {
                title: 'Login & Security',
            },
        ],
    }),
    component: SecuritySettingsPage,
})

function SecuritySettingsPage() {
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
                        to={INTERNAL_URLS.settings.overview}
                        className="text-text-subdued!"
                    >
                        Settings
                    </Link>
                </HeroBreadcrumbItem>
                <HeroBreadcrumbItem>Login & Security</HeroBreadcrumbItem>
            </HeroBreadcrumbs>

            <div className="mt-5 space-y-6 size-full">
                {/* Header */}
                <SettingTitle
                    title="Login & Security"
                    description="Manage your password, 2FA, and active sessions."
                />

                <UpdatePasswordForm />

                {/* Active Sessions */}
                <Card shadow="none" className="border border-border-default">
                    <CardHeader className="flex items-center justify-between px-6 py-4">
                        <div className="flex flex-col items-start">
                            <h2 className="flex items-center gap-2 text-lg font-bold">
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
                    </CardHeader>
                    <Divider className="bg-border-default" />
                    <CardBody className="px-6 pb-6">
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
                                        className="flex items-center justify-between p-3 transition-colors border border-border-default rounded-xl hover:bg-background-hovered"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center ${isCurrentSession ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-text-subdued dark:text-text-7'}`}
                                            >
                                                <Icon size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-text-default">
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
                    </CardBody>
                </Card>

                {/* Login History */}
                <Card shadow="none" className="border border-border-default">
                    <CardHeader className="px-6 py-4">
                        <h4 className="flex items-center gap-2 text-lg font-bold text-text-default">
                            <Clock size={20} className="text-text-subdued" />{' '}
                            Recent Activity
                        </h4>
                    </CardHeader>
                    <Divider className="bg-border-default" />
                    <CardBody>
                        <Table
                            aria-label="User security logs table"
                            removeWrapper
                            className="min-h-50"
                        >
                            <TableHeader>
                                <TableColumn>EVENT</TableColumn>
                                <TableColumn>DATE</TableColumn>
                                <TableColumn>IP ADDRESS</TableColumn>
                                <TableColumn align="end">STATUS</TableColumn>
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
                                    <div className="flex flex-col items-center justify-center gap-2 py-10">
                                        <div className="p-3 rounded-full bg-default-100">
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
                                        className="px-6 hover:bg-background-hovered"
                                    >
                                        <TableCell>
                                            <span
                                                className={`font-medium text-sm ${log.status === 'FAILED' ? 'text-red-500' : 'text-text-default'}`}
                                            >
                                                {log.event}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs text-text-subdued">
                                                {dateFormatter(log.createdAt, {
                                                    format: 'longDateTime',
                                                })}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 text-xs border rounded text-text-default bg-background/80 border-border-muted">
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
                    </CardBody>
                </Card>
            </div>
        </>
    )
}

function UpdatePasswordForm() {
    const updatePasswordMutation = useMutation(updateUsePasswordOptions)

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
            className="space-y-6 size-full lg:col-span-1"
        >
            {/* Change Password */}
            <Card shadow="none" className="border border-border-default">
                <CardHeader className="px-6 py-4">
                    <h4 className="flex items-center gap-2 text-lg font-bold text-text-default">
                        <KeyRound size={20} className="text-primary" /> Password
                    </h4>
                </CardHeader>

                <Divider className="bg-border-default" />

                <CardBody className="gap-4 px-6 pb-6">
                    <HeroPasswordInput
                        isRequired
                        id="oldPassword"
                        name="oldPassword"
                        labelPlacement="outside-top"
                        classNames={{ label: 'font-semibold' }}
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
                    <HeroPasswordInput
                        isRequired
                        id="newPassword"
                        name="newPassword"
                        label="New Password"
                        labelPlacement="outside-top"
                        classNames={{ label: 'font-semibold' }}
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
                        isRequired
                        id="newConfirmPassword"
                        name="newConfirmPassword"
                        label="Confirm New Password"
                        labelPlacement="outside-top"
                        classNames={{ label: 'font-semibold' }}
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
                            variant="shadow"
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
                </CardBody>
            </Card>
        </form>
    )
}
