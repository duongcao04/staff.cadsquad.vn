import {
    Avatar,
    BreadcrumbItem,
    Breadcrumbs,
    Button,
    Card,
    CardBody,
    Chip,
    cn,
    Divider,
    Progress,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tabs,
    User,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
    Activity,
    Briefcase,
    ExternalLink,
    Info,
    Plus,
    Settings2,
    ShieldCheck,
    TrendingUp,
    Users,
} from 'lucide-react'
import { useState } from 'react'

import { COLORS, INTERNAL_URLS, optimizeCloudinary } from '@/lib'
import { departmentOptions } from '@/lib/queries'
import { AdminPageHeading, AppLoading } from '@/shared/components'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import { ChevronLeft } from '@gravity-ui/icons'

export const Route = createFileRoute('/_administrator/mgmt/departments/$code')({
    loader: ({ context, params }) => {
        return context.queryClient.ensureQueryData(
            departmentOptions(params.code)
        )
    },
    pendingComponent: AppLoading,
    component: DepartmentDetailRoot,
})

function DepartmentDetailRoot() {
    const { code } = Route.useParams()
    const {
        data: { department },
    } = useSuspenseQuery({ ...departmentOptions(code) })

    return (
        <div className="min-h-screen">
            <AdminPageHeading
                title={
                    <div className="flex items-center gap-4">
                        <Button
                            isIconOnly
                            variant="light"
                            as={Link}
                            href={INTERNAL_URLS.management.departments}
                        >
                            <ChevronLeft fontSize={16} />
                        </Button>
                        <div className="relative group">
                            <div
                                className="absolute transition duration-1000 opacity-25 -inset-1 rounded-xl blur group-hover:opacity-50"
                                style={{
                                    backgroundColor:
                                        department.hexColor || COLORS.black,
                                }}
                            />
                            <div
                                className="relative flex items-center justify-center w-12 h-12 text-2xl font-black text-white shadow-2xl rounded-xl"
                                style={{
                                    backgroundColor:
                                        department.hexColor || COLORS.black,
                                }}
                            >
                                {department.displayName.charAt(0)}
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-text-default">
                                {department.displayName}
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-mono font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded">
                                    {department.code}
                                </span>
                                <span className="text-xs text-text-subdued">
                                    • Active Workspace
                                </span>
                            </div>
                        </div>
                    </div>
                }
                actions={
                    <div className="flex items-center gap-3">
                        <Button
                            isIconOnly
                            variant="flat"
                            className="border border-white/5"
                        >
                            <Settings2 size={18} />
                        </Button>
                        <Button
                            color="primary"
                            className="font-bold shadow-lg shadow-primary/20"
                            startContent={<Plus size={18} />}
                        >
                            Assign Job
                        </Button>
                    </div>
                }
            />

            <AdminContentContainer className="pt-0">
                <Breadcrumbs className="mb-6" underline="hover">
                    <BreadcrumbItem>Management</BreadcrumbItem>
                    <BreadcrumbItem href={INTERNAL_URLS.management.departments}>
                        Departments
                    </BreadcrumbItem>
                    <BreadcrumbItem>{department.displayName}</BreadcrumbItem>
                </Breadcrumbs>

                <div className="grid grid-cols-12 gap-6">
                    {/* --- LEFT SIDE: Main Info & Tabs --- */}
                    <div className="col-span-12 space-y-6 lg:col-span-9">
                        <DepartmentTabs department={department} />
                    </div>

                    {/* --- RIGHT SIDE: Info Panel --- */}
                    <div className="col-span-12 space-y-6 lg:col-span-3">
                        <DepartmentSidebar department={department} />
                    </div>
                </div>
            </AdminContentContainer>
        </div>
    )
}

function DepartmentTabs({ department }: any) {
    const [selectedTab, setSelectedTab] = useState('overview')

    return (
        <Card
            shadow="none"
            className="overflow-visible border border-border-default bg-background backdrop-blur-xl"
        >
            <CardBody className="p-0">
                <Tabs
                    selectedKey={selectedTab}
                    onSelectionChange={(k) => setSelectedTab(k as string)}
                    variant="underlined"
                    classNames={{
                        tabList: 'px-6 pt-2 border-b border-white/5 gap-8',
                        cursor: 'bg-primary h-[3px]',
                        tab: 'h-14 font-bold text-sm uppercase tracking-wider',
                    }}
                >
                    <Tab key="overview" title="Workspace Overview">
                        <div className="p-6 space-y-8">
                            {/* Detailed Stats Grid */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <GlassStat
                                    label="Force Size"
                                    value={department.users?.length || 0}
                                    sub="Registered Members"
                                    icon={Users}
                                    color="blue"
                                />
                                <GlassStat
                                    label="Operational Load"
                                    value="78%"
                                    sub="+12% from last week"
                                    icon={Activity}
                                    color="orange"
                                />
                                <GlassStat
                                    label="Efficiency"
                                    value="94.2"
                                    sub="Performance Index"
                                    icon={TrendingUp}
                                    color="emerald"
                                />
                            </div>

                            {/* Active Projects Matrix */}
                            <div>
                                <div className="flex items-end justify-between mb-4">
                                    <h3 className="flex items-center gap-2 text-lg font-black">
                                        <Briefcase
                                            size={20}
                                            className="text-primary"
                                        />
                                        Active Directives
                                    </h3>
                                    <Button
                                        size="sm"
                                        variant="light"
                                        className="font-bold text-primary"
                                    >
                                        View Archive
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {[1, 2].map((i) => (
                                        <div
                                            key={i}
                                            className="relative p-4 transition-all border group rounded-2xl bg-white/5 border-white/5 hover:bg-white/10"
                                        >
                                            <div className="flex justify-between mb-3">
                                                <Chip
                                                    size="sm"
                                                    variant="flat"
                                                    color="primary"
                                                    className="font-bold"
                                                >
                                                    SPRINT_0{i}
                                                </Chip>
                                                <span className="text-[10px] font-mono text-text-subdued uppercase">
                                                    Due in 4d
                                                </span>
                                            </div>
                                            <h4 className="mb-1 font-bold">
                                                Global Infrastructure Expansion
                                            </h4>
                                            <p className="mb-4 text-xs text-text-subdued line-clamp-1">
                                                Deployment of edge nodes across
                                                SEA region.
                                            </p>
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter text-text-subdued">
                                                    <span>Progression</span>
                                                    <span>65%</span>
                                                </div>
                                                <Progress
                                                    size="sm"
                                                    value={65}
                                                    color="primary"
                                                    className="h-1.5"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Tab>

                    <Tab key="members" title="Unit Roster">
                        <div className="p-6">
                            <Table
                                removeWrapper
                                shadow="none"
                                className="bg-transparent"
                            >
                                <TableHeader>
                                    <TableColumn className="bg-transparent border-b border-white/5">
                                        OPERATIVE
                                    </TableColumn>
                                    <TableColumn className="bg-transparent border-b border-white/5">
                                        ACCESS LEVEL
                                    </TableColumn>
                                    <TableColumn className="bg-transparent border-b border-white/5">
                                        STATUS
                                    </TableColumn>
                                    <TableColumn
                                        align="end"
                                        className="bg-transparent border-b border-white/5"
                                    >
                                        ACTION
                                    </TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {department.users?.map((member: any) => (
                                        <TableRow
                                            key={member.id}
                                            className="transition-colors group hover:bg-white/5"
                                        >
                                            <TableCell>
                                                <User
                                                    name={
                                                        <span className="text-sm font-bold">
                                                            {member.displayName}
                                                        </span>
                                                    }
                                                    description={
                                                        <span className="font-mono text-[10px] text-text-subdued italic">
                                                            @{member.username}
                                                        </span>
                                                    }
                                                    avatarProps={{
                                                        src: optimizeCloudinary(
                                                            member.avatar,
                                                            {
                                                                width: 100,
                                                                height: 100,
                                                            }
                                                        ),
                                                        className:
                                                            'rounded-lg border border-white/10 shadow-lg',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck
                                                        size={14}
                                                        className="text-primary/60"
                                                    />
                                                    <span className="text-xs font-medium tracking-wider uppercase">
                                                        {
                                                            member.role
                                                                .displayName
                                                        }
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={cn(
                                                            'w-1.5 h-1.5 rounded-full',
                                                            member.isActive
                                                                ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                                                                : 'bg-red-500'
                                                        )}
                                                    />
                                                    <span className="text-[10px] font-bold uppercase">
                                                        {member.isActive
                                                            ? 'Online'
                                                            : 'Offline'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    variant="flat"
                                                    isIconOnly
                                                    className="transition-opacity rounded-lg opacity-0 group-hover:opacity-100"
                                                >
                                                    <ExternalLink size={14} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Tab>
                </Tabs>
            </CardBody>
        </Card>
    )
}

function DepartmentSidebar({ department }: any) {
    return (
        <div className="space-y-6">
            {/* Leadership Card */}
            <Card className="border shadow-none bg-primary/5 border-primary/20">
                <CardBody className="p-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">
                        Unit Leadership
                    </h5>
                    <div className="flex items-center gap-3">
                        <Avatar
                            src="https://i.pravatar.cc/150?u=sarah"
                            className="w-12 h-12 rounded-xl ring-2 ring-primary/20"
                        />
                        <div>
                            <p className="text-sm font-black">Sarah Wilson</p>
                            <p className="text-[10px] text-text-subdued uppercase font-bold">
                                Principal Director
                            </p>
                        </div>
                    </div>
                    <Button
                        fullWidth
                        size="sm"
                        variant="flat"
                        color="primary"
                        className="mt-4 font-bold"
                    >
                        Message Lead
                    </Button>
                </CardBody>
            </Card>

            {/* Technical Metadata */}
            <div className="p-4 space-y-4 border rounded-2xl bg-white/5 border-white/5">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-text-subdued flex items-center gap-2">
                    <Info size={12} /> System Metadata
                </h5>

                <div className="space-y-3">
                    <MetaItem
                        label="Reference Code"
                        value={department.code}
                        mono
                    />
                    <MetaItem label="Created At" value="Mar 2026" />
                    <MetaItem label="Default Priority" value="Tier 1" />
                    <MetaItem label="Workload Cap" value="Unlimited" />
                </div>

                <Divider className="bg-border-default" />

                <div>
                    <p className="text-[10px] font-bold uppercase text-text-subdued mb-2">
                        Description
                    </p>
                    <p className="text-xs italic leading-relaxed text-text-subdued">
                        "
                        {department.notes ||
                            'No operational directives provided for this unit.'}
                        "
                    </p>
                </div>
            </div>
        </div>
    )
}

const MetaItem = ({ label, value, mono }: any) => (
    <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-text-subdued uppercase">
            {label}
        </span>
        <span
            className={cn(
                'text-xs font-bold',
                mono && 'font-mono text-primary'
            )}
        >
            {value}
        </span>
    </div>
)

const GlassStat = ({ label, value, sub, icon: Icon, color }: any) => {
    const colorMap: any = {
        blue: 'text-blue-500 bg-blue-500/10',
        emerald: 'text-emerald-500 bg-emerald-500/10',
        orange: 'text-orange-500 bg-orange-500/10',
        purple: 'text-purple-500 bg-purple-500/10',
    }

    return (
        <div className="relative p-4 overflow-hidden border rounded-2xl bg-white/5 border-white/5 group">
            <Icon
                size={40}
                className={cn(
                    'absolute -right-2 -bottom-2 opacity-5 group-hover:scale-110 transition-transform',
                    colorMap[color].split(' ')[0]
                )}
            />
            <div
                className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center mb-3',
                    colorMap[color]
                )}
            >
                <Icon size={18} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider text-text-subdued">
                {label}
            </p>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl italic font-black tracking-tighter">
                    {value}
                </span>
            </div>
            <p className="text-[10px] font-bold text-text-subdued mt-1">
                {sub}
            </p>
        </div>
    )
}
