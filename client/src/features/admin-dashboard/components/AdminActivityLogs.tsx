import { dateFormatter, INTERNAL_URLS } from '@/lib'
import { TAuditLog } from '@/shared/types'
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    User as HeroUser,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from '@heroui/react'
import { Link } from '@tanstack/react-router'
import {
    Activity,
    ArrowUpRight,
    Cloud,
    Landmark,
    ListTree,
    Settings,
    Users,
    Zap,
} from 'lucide-react'

const RECENT_ACTIVITY_LOGS = [
    {
        id: '1',
        user: 'Admin Sarah',
        avatar: 'https://i.pravatar.cc/150?u=a',
        action: 'Created new Job',
        target: '#JOB-2026-088',
        time: '10 mins ago',
        type: 'JOB',
    },
    {
        id: '2',
        user: 'Cao Hai Duong',
        avatar: 'https://i.pravatar.cc/150?u=b',
        action: 'Delivered files for',
        target: '#JOB-2026-042',
        time: '1 hour ago',
        type: 'DELIVERY',
    },
    {
        id: '3',
        user: 'System',
        avatar: '',
        action: 'SharePoint Sync Completed',
        target: 'Folder Templates',
        time: '2 hours ago',
        type: 'SYSTEM',
    },
    {
        id: '4',
        user: 'Acct. Manager',
        avatar: 'https://i.pravatar.cc/150?u=c',
        action: 'Processed Bulk Payout',
        target: '$4,320.00',
        time: '5 hours ago',
        type: 'FINANCIAL',
    },
]

interface AdminActivityLogsProps {
    auditLogs: TAuditLog[]
}
export function AdminActivityLogs({ auditLogs }: AdminActivityLogsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card
                shadow="none"
                className="border border-primary-200 bg-primary-50 lg:col-span-1"
            >
                <CardHeader className="px-6 py-4 border-b border-primary-100 flex justify-between items-center bg-primary-100/50">
                    <div className="flex items-center gap-2">
                        <Zap size={18} className="text-primary-600" />
                        <h2 className="text-lg font-bold text-primary-900">
                            Quick Jump
                        </h2>
                    </div>
                </CardHeader>
                <CardBody className="p-4 space-y-3">
                    <Link
                        to={INTERNAL_URLS.management.accessControl}
                        className="block"
                    >
                        <div className="p-3 bg-white border border-primary-100 rounded-lg hover:border-primary transition-colors flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <Users size={18} className="text-primary" />
                                <span className="text-sm font-semibold text-default-700">
                                    User & Role Management
                                </span>
                            </div>
                            <ArrowUpRight
                                size={16}
                                className="text-primary-400"
                            />
                        </div>
                    </Link>
                    <Link to="/mgmt/jobs/folder-templates" className="block">
                        <div className="p-3 bg-white border border-primary-100 rounded-lg hover:border-primary transition-colors flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <ListTree size={18} className="text-success" />
                                <span className="text-sm font-semibold text-default-700">
                                    Folder Templates
                                </span>
                            </div>
                            <ArrowUpRight
                                size={16}
                                className="text-primary-400"
                            />
                        </div>
                    </Link>
                    <Link
                        to={INTERNAL_URLS.financial.overview}
                        className="block"
                    >
                        <div className="p-3 bg-white border border-primary-100 rounded-lg hover:border-primary transition-colors flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <Landmark size={18} className="text-warning" />
                                <span className="text-sm font-semibold text-default-700">
                                    Financial Hub
                                </span>
                            </div>
                            <ArrowUpRight
                                size={16}
                                className="text-primary-400"
                            />
                        </div>
                    </Link>
                    <Link to={INTERNAL_URLS.admin.settings} className="block">
                        <div className="p-3 bg-white border border-primary-100 rounded-lg hover:border-primary transition-colors flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <Settings
                                    size={18}
                                    className="text-default-500"
                                />
                                <span className="text-sm font-semibold text-default-700">
                                    System Settings
                                </span>
                            </div>
                            <ArrowUpRight
                                size={16}
                                className="text-primary-400"
                            />
                        </div>
                    </Link>
                </CardBody>
            </Card>

            <Card
                shadow="none"
                className="border border-border-default lg:col-span-2"
            >
                <div className="px-6 py-4 border-b border-divider flex justify-between items-center bg-default-50">
                    <h2 className="text-lg font-bold text-default-900 flex items-center gap-2">
                        <Activity size={18} className="text-default-500" />{' '}
                        System Activity Log
                    </h2>
                    <Button size="sm" variant="light" color="primary">
                        View Full Audit Log &rarr;
                    </Button>
                </div>
                <Table
                    aria-label="Recent Activity Table"
                    removeWrapper
                    className="bg-transparent"
                >
                    <TableHeader>
                        <TableColumn>USER / SYSTEM</TableColumn>
                        <TableColumn>ACTION</TableColumn>
                        <TableColumn>TARGET</TableColumn>
                        <TableColumn>MODULE</TableColumn>
                        <TableColumn align="end">TIME</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {auditLogs?.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell>
                                    {log.actor ? (
                                        <HeroUser
                                            name={
                                                <span className="text-sm font-medium">
                                                    {log.actor.displayName}
                                                </span>
                                            }
                                            avatarProps={{
                                                src: log.actor.avatar,
                                                size: 'sm',
                                            }}
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 pl-1">
                                            <Cloud
                                                size={16}
                                                className="text-primary"
                                            />
                                            <span className="text-sm font-bold text-primary">
                                                System
                                            </span>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-default-600">
                                        {log.action}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm font-semibold text-default-900">
                                        {log.targetDisplay}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        size="sm"
                                        variant="flat"
                                        color={
                                            log.module === 'SECURITY'
                                                ? 'danger'
                                                : log.module === 'FINANCIAL'
                                                  ? 'success'
                                                  : log.module === 'SYSTEM'
                                                    ? 'primary'
                                                    : 'default'
                                        }
                                    >
                                        {log.module}
                                    </Chip>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs text-default-500 whitespace-nowrap">
                                        {dateFormatter(log.createdAt, {
                                            isDistance: true,
                                        })}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
