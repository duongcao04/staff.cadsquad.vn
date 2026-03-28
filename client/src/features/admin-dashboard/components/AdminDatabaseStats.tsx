import {
    Briefcase,
    CircleDollar,
    Cubes3,
    Key,
    Person,
    PersonWorker,
    SealCheck,
    ShieldCheck,
    Sparkles,
} from '@gravity-ui/icons'
import { Card, CardBody, CardHeader } from '@heroui/react'
import { Activity, CreditCard, Database, Files, ListTree } from 'lucide-react'

interface AdminDatabaseStatsProps {
    users: number
    staff: number
    roles: number
    permissions: number
    departments: number
    jobTitles: number
    jobTypes: number
    jobs: number
    clients: number
    jobDeliveres: number
    jobFinished: number
    communities: number
    posts: number
    jobComments: number
    fileSystems: number
    folderTemplates: number
    paymentChannels: number
    payouts: number
}
export function AdminDatabaseStats(stats: AdminDatabaseStatsProps) {
    const processedDatabaseStats = [
        {
            category: 'Auth & Organization',
            items: [
                {
                    name: 'Users',
                    count: stats.users,
                    icon: <Person fontSize={16} />,
                },
                {
                    name: 'Staff',
                    count: stats.staff,
                    icon: <PersonWorker fontSize={16} />,
                },
                {
                    name: 'Departments',
                    count: stats.departments,
                    icon: <Cubes3 fontSize={16} />,
                },
                {
                    name: 'Job Titles',
                    count: stats.jobTitles,
                    icon: <Briefcase fontSize={16} />,
                },
            ],
        },
        {
            category: 'Core Operations',
            items: [
                {
                    name: 'Clients',
                    count: stats.clients,
                    icon: <Sparkles fontSize={16} />,
                },
                {
                    name: 'Job Finished',
                    count: stats.jobFinished,
                    icon: <SealCheck fontSize={16} />,
                },
                {
                    name: 'Activity Logs',
                    count: '45.2k',
                    icon: <Activity size={16} />,
                },
            ],
        },
        {
            category: 'Security',
            items: [
                {
                    name: 'Roles',
                    count: stats.roles,
                    icon: <ShieldCheck fontSize={16} />,
                },
                {
                    name: 'Permissions',
                    count: stats.permissions,
                    icon: <Key fontSize={16} />,
                },
            ],
        },
        {
            category: 'Assets & Finance',
            items: [
                {
                    name: 'File Systems',
                    count: stats.fileSystems,
                    icon: <Files size={16} />,
                },
                {
                    name: 'Folder Templates',
                    count: stats.folderTemplates,
                    icon: <ListTree size={16} />,
                },
                {
                    name: 'Payment Channels',
                    count: stats.paymentChannels,
                    icon: <CreditCard size={16} />,
                },
                {
                    name: 'Job Payouts',
                    count: stats.payouts,
                    icon: <CircleDollar fontSize={16} />,
                },
            ],
        },
    ]
    return (
        <Card shadow="none" className="border border-border-default">
            <CardHeader className="px-6 py-4 border-b border-divider bg-default-50">
                <div className="flex items-center gap-2">
                    <Database size={18} className="text-primary" />
                    <h2 className="text-lg font-bold text-default-900">
                        System Database Overview
                    </h2>
                </div>
                <p className="text-sm text-default-500 ml-auto">
                    Total records across all system modules
                </p>
            </CardHeader>
            <CardBody className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-4">
                    {processedDatabaseStats.map((group, idx) => (
                        <div key={idx} className="space-y-3">
                            <h3 className="text-xs font-bold text-default-400 uppercase tracking-wider mb-2">
                                {group.category}
                            </h3>
                            <div className="flex flex-col gap-2">
                                {group.items.map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-2.5 rounded-lg border border-transparent hover:border-default-200 hover:bg-default-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 text-default-600">
                                            <div className="text-default-400">
                                                {item.icon}
                                            </div>
                                            <span className="text-sm font-medium">
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-default-900 bg-default-100 px-2 py-0.5 rounded-md">
                                            {item.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    )
}
