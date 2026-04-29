import { dateFormatter } from '@/lib'
import { securityLogsListOptions } from '@/lib/queries'
import { TUserSecurityLog } from '@/shared/types'
import {
    Chip,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from '@heroui/react'
import { useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { AlertTriangle, CheckCircle2, ShieldAlertIcon } from 'lucide-react'
import {
    ActiveSessionsSection,
    TwoFactorAuthSection,
    UpdatePasswordForm,
} from '../../features/settings'

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
    const [
        {
            data: { securityLogs },
            isLoading,
        },
    ] = useSuspenseQueries({
        queries: [{ ...securityLogsListOptions() }],
    })

    return (
        <>
            <div className="max-w-5xl size-full text-text-default">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-xl font-semibold">Security</h1>
                    <p className="text-sm text-text-subdued mt-1">
                        Manage your account security and devices.
                    </p>
                </div>

                <hr className="border-t border-dashed border-border-default mb-8" />

                {/* Password Section */}
                <UpdatePasswordForm />

                <hr className="border-t border-dashed border-border-default my-8" />

                {/* 2FA Section */}
                <TwoFactorAuthSection />

                <hr className="border-t border-dashed border-border-default my-8" />

                {/* Active Sessions */}
                <ActiveSessionsSection />

                <hr className="border-t border-dashed border-border-default my-8" />

                {/* Login History */}
                <div className="flex flex-col lg:flex-row gap-8 pb-10">
                    <div className="lg:w-1/3">
                        <h3 className="text-md font-medium">Recent Activity</h3>
                        <p className="text-sm text-text-subdued mt-1">
                            Review your recent security logs and login attempts.
                        </p>
                    </div>
                    <div className="lg:w-2/3 border border-border-default rounded-xl overflow-hidden bg-background/50">
                        <Table
                            aria-label="User security logs table"
                            removeWrapper
                            className="min-h-50 bg-transparent"
                        >
                            <TableHeader>
                                <TableColumn className="bg-transparent text-text-subdued">
                                    EVENT
                                </TableColumn>
                                <TableColumn className="bg-transparent text-text-subdued">
                                    DATE
                                </TableColumn>
                                <TableColumn className="bg-transparent text-text-subdued">
                                    IP ADDRESS
                                </TableColumn>
                                <TableColumn
                                    align="end"
                                    className="bg-transparent text-text-subdued"
                                >
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
                                    <div className="flex flex-col items-center justify-center gap-2 py-10">
                                        <ShieldAlertIcon
                                            size={32}
                                            className="text-text-subdued mb-2"
                                        />
                                        <p className="text-sm font-medium">
                                            No activity found
                                        </p>
                                        <p className="text-xs text-text-subdued">
                                            Your security logs will appear here.
                                        </p>
                                    </div>
                                }
                            >
                                {(log: TUserSecurityLog) => (
                                    <TableRow
                                        key={log.id}
                                        className="hover:bg-background-hovered transition-colors border-t border-border-default border-dashed"
                                    >
                                        <TableCell>
                                            <span
                                                className={`font-medium text-sm ${log.status === 'FAILED' ? 'text-danger' : 'text-text-default'}`}
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
                                            <span className="px-2 py-1 text-xs border rounded bg-background/80 border-border-muted">
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
                    </div>
                </div>
            </div>
        </>
    )
}
