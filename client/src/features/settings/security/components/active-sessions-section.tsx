import { Button, useDisclosure, Spinner, Chip } from '@heroui/react'
import { useSuspenseQueries } from '@tanstack/react-query'
import { LogOut, MapPin, Clock } from 'lucide-react'
import {
    useRevokeSessionMutation,
    useRevokeAllSessionMutation,
    securityLogsListOptions,
    activeSessionsListOptions,
    cookie,
    COOKIES,
    getDeviceIcon,
    dateFormatter,
} from '@/lib'
import { HeroTooltip } from '@/shared/components'
import { ConfirmLogoutAllDevicesModal } from '../../../user-sessions'

export function ActiveSessionsSection() {
    const confirmLogoutAllDeviceDisclosure = useDisclosure({
        id: 'ConfirmLogoutAllDevicesModal',
    })
    const revokeSessionMutation = useRevokeSessionMutation()
    const revokeAllSessionMutation = useRevokeAllSessionMutation(() => {})
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
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3">
                    <h3 className="text-md font-medium">Active Sessions</h3>
                    <p className="text-sm text-text-subdued mt-1 mb-4">
                        Manage devices currently logged into your account.
                    </p>
                    <Button
                        size="sm"
                        variant="light"
                        color="danger"
                        className="px-0"
                        startContent={
                            revokeSessionMutation.isPending ? (
                                <Spinner size="sm" />
                            ) : (
                                <LogOut size={16} />
                            )
                        }
                        disabled={revokeSessionMutation.isPending}
                        onPress={confirmLogoutAllDeviceDisclosure.onOpen}
                    >
                        Log Out All Devices
                    </Button>
                </div>
                <div className="lg:w-2/3 space-y-4">
                    {activeSessions.map((session) => {
                        const currentSessionId = cookie.get(COOKIES.sessionId)
                        const isCurrentSession =
                            session.sessionId === currentSessionId
                        const Icon = getDeviceIcon(session.device)
                        return (
                            <div
                                key={session.ipAddress}
                                className="flex items-center justify-between p-4 transition-colors border border-border-default rounded-xl bg-background/50 hover:bg-background-hovered"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${isCurrentSession ? 'bg-green-500/10 text-green-500' : 'bg-default-100 text-text-subdued'}`}
                                    >
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium">
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
                                                <Spinner size="sm" />
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
            </div>
        </>
    )
}
