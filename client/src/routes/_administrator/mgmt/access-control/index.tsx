import { permissionsListOptions, rolesListOptions } from '@/lib/queries'
import { HeroCard, HeroCardBody } from '@/shared/components'
import {
    Button,
    CardBody,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tooltip,
} from '@heroui/react'
import { useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
    Activity,
    CheckCircle2,
    Lock,
    ShieldAlert,
    ShieldCheck,
    UserCheck,
    Users,
    XCircle,
} from 'lucide-react'
import React from 'react'

export const Route = createFileRoute(
    '/_administrator/mgmt/access-control/'
)({
    component: RolePermissionOverviewPage,
})

export default function RolePermissionOverviewPage() {
    const [
        {
            data: { total: totalRoles },
        },
        {
            data: { total: totalPermissions },
        },
    ] = useSuspenseQueries({
        queries: [{ ...rolesListOptions() }, { ...permissionsListOptions() }],
    })
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* --- Stats Row --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Roles"
                    value={totalRoles}
                    icon={<ShieldCheck className="text-primary" />}
                />
                <StatCard
                    title="Permissions"
                    value={totalPermissions}
                    icon={<Lock className="text-secondary" />}
                />
                <StatCard
                    title="Moderators"
                    value="12"
                    icon={<Users className="text-success" />}
                />
                <StatCard
                    title="Administrators"
                    value="24h"
                    icon={<Activity className="text-warning" />}
                />
            </div>

            {/* --- Main Content --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Matrix Summary */}
                <HeroCard className="lg:col-span-2 border-divider shadow-sm">
                    <CardBody className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-medium text-lg">
                                Authority Matrix Summary
                            </h3>
                            <Button size="sm" color="primary" variant="flat">
                                View Full Matrix
                            </Button>
                        </div>
                        <PermissionMatrixPreview />
                    </CardBody>
                </HeroCard>

                {/* Role Distribution Chart Placeholder */}
                <HeroCard className="border-divider shadow-sm">
                    <CardBody className="p-6 space-y-4">
                        <h3 className="font-bold text-lg">
                            Staff Distribution
                        </h3>
                        <p className="text-xs text-text-subdued italic">
                            Users per Role
                        </p>
                        {/* You would integrate a Pie Chart here */}
                        <div className="h-48 w-full bg-default-50 rounded-3xl border-2 border-dashed border-divider flex items-center justify-center">
                            [Staff Role Chart]
                        </div>
                    </CardBody>
                </HeroCard>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon }: any) {
    return (
        <HeroCard shadow="none" className="border border-border-muted">
            <HeroCardBody className="flex flex-row items-center gap-4 p-5">
                <div className="p-3 bg-background-muted rounded-2xl">
                    {icon}
                </div>
                <div>
                    <p className="text-xs font-medium text-text-subdued tracking-widest">
                        {title}
                    </p>
                    <p className="text-2xl font-black">{value}</p>
                </div>
            </HeroCardBody>
        </HeroCard>
    )
}

// Define access levels for visual consistency
const ACCESS = {
    FULL: (
        <Tooltip content="Full Access">
            <CheckCircle2 size={18} className="text-success mx-auto" />
        </Tooltip>
    ),
    OWN: (
        <Tooltip content="Own Content Only">
            <UserCheck size={18} className="text-primary mx-auto" />
        </Tooltip>
    ),
    NONE: (
        <Tooltip content="No Access">
            <XCircle size={18} className="text-default-300 mx-auto" />
        </Tooltip>
    ),
    LIMIT: (
        <Tooltip content="Limited/Moderate Only">
            <ShieldAlert size={18} className="text-warning mx-auto" />
        </Tooltip>
    ),
}

const matrixData = [
    {
        entity: 'Community',
        member: 'NONE',
        author: 'NONE',
        moderator: 'LIMIT',
        admin: 'FULL',
    },
    {
        entity: 'Topic',
        member: 'NONE',
        author: 'NONE',
        moderator: 'NONE',
        admin: 'FULL',
    },
    {
        entity: 'Post (Create)',
        member: 'FULL',
        author: 'FULL',
        moderator: 'FULL',
        admin: 'FULL',
    },
    {
        entity: 'Post (Edit)',
        member: 'NONE',
        author: 'OWN',
        moderator: 'LIMIT',
        admin: 'FULL',
    },
    {
        entity: 'Post (Delete)',
        member: 'NONE',
        author: 'OWN',
        moderator: 'FULL',
        admin: 'FULL',
    },
    {
        entity: 'Comment',
        member: 'FULL',
        author: 'FULL',
        moderator: 'FULL',
        admin: 'FULL',
    },
]

export const PermissionMatrixPreview = () => {
    return (
        <div className="w-full overflow-hidden border border-divider rounded-2xl bg-background shadow-sm">
            <Table
                aria-label="Permission Matrix Summary"
                removeWrapper
                classNames={{
                    th: 'bg-default-50 text-default-600 font-bold uppercase text-[10px] tracking-wider py-4',
                    td: 'py-3 border-t border-divider',
                }}
            >
                <TableHeader>
                    <TableColumn width={200}>ENTITY / ACTION</TableColumn>
                    <TableColumn align="center">MEMBER</TableColumn>
                    <TableColumn align="center">AUTHOR</TableColumn>
                    <TableColumn align="center">MODERATOR</TableColumn>
                    <TableColumn align="center">ADMIN</TableColumn>
                </TableHeader>
                <TableBody>
                    {matrixData.map((row, index) => (
                        <TableRow
                            key={index}
                            className="hover:bg-default-50/50 transition-colors"
                        >
                            <TableCell className="font-medium text-sm text-text-default">
                                {row.entity}
                            </TableCell>
                            <TableCell>
                                {ACCESS[row.member as keyof typeof ACCESS]}
                            </TableCell>
                            <TableCell>
                                {ACCESS[row.author as keyof typeof ACCESS]}
                            </TableCell>
                            <TableCell>
                                {ACCESS[row.moderator as keyof typeof ACCESS]}
                            </TableCell>
                            <TableCell>
                                {ACCESS[row.admin as keyof typeof ACCESS]}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Legend Footer */}
            <div className="flex flex-wrap gap-6 p-4 bg-default-50/50 border-t border-divider">
                <LegendItem
                    icon={<CheckCircle2 size={14} className="text-success" />}
                    label="Full Access"
                />
                <LegendItem
                    icon={<UserCheck size={14} className="text-primary" />}
                    label="Own Items Only"
                />
                <LegendItem
                    icon={<ShieldAlert size={14} className="text-warning" />}
                    label="Limited/Moderate"
                />
                <LegendItem
                    icon={<XCircle size={14} className="text-default-300" />}
                    label="No Access"
                />
            </div>
        </div>
    )
}

const LegendItem = ({
    icon,
    label,
}: {
    icon: React.ReactNode
    label: string
}) => (
    <div className="flex items-center gap-2 text-[10px] font-bold text-text-subdued uppercase tracking-tighter">
        {icon}
        <span>{label}</span>
    </div>
)
