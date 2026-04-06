import { INTERNAL_URLS } from '@/lib'
import { jobTitleOptions } from '@/lib/queries'
import { AdminPageHeading, AppLoading } from '@/shared/components'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import {
    BreadcrumbItem,
    Breadcrumbs,
    Button,
    Card,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    User
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
    Activity,
    ChevronLeft,
    MoreVertical,
    Users
} from 'lucide-react'
import { TUser } from '@/shared/types'

export const Route = createFileRoute('/_administrator/mgmt/job-titles/$code')({
    loader: ({ context, params }) =>
        context.queryClient.ensureQueryData(jobTitleOptions(params.code)),
    pendingComponent: AppLoading,
    component: JobTitleDetail,
})

function JobTitleDetail() {
    const { code } = Route.useParams()
    const {
        data: { jobTitle },
    } = useSuspenseQuery(jobTitleOptions(code))

    return (
        <div className="min-h-screen">
            <AdminPageHeading
                title={
                    <div className="flex items-center gap-2">
                        <Button
                            isIconOnly
                            variant="light"
                            as={Link}
                            href={INTERNAL_URLS.management.jobTitles}
                        >
                            <ChevronLeft size={16} />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">
                                {jobTitle.displayName}
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono bg-primary/10 text-primary px-1.5 rounded">
                                    {jobTitle.code}
                                </span>
                            </div>
                        </div>
                    </div>
                }
            />

            <AdminContentContainer className="pt-0">
                <Breadcrumbs className="mb-6" underline="hover">
                    <BreadcrumbItem>Management</BreadcrumbItem>
                    <BreadcrumbItem href={INTERNAL_URLS.management.jobTitles}>
                        Job Titles
                    </BreadcrumbItem>
                    <BreadcrumbItem>{jobTitle.displayName}</BreadcrumbItem>
                </Breadcrumbs>

                <div className="grid grid-cols-12 gap-6">
                    {/* Main Content */}
                    <div className="col-span-12 space-y-6 lg:col-span-8">
                        <Card
                            shadow="none"
                            className="border border-border-default backdrop-blur-xl"
                        >
                            <div className="p-4">
                                <Table removeWrapper aria-label="Personnel">
                                    <TableHeader>
                                        <TableColumn>Member</TableColumn>
                                        <TableColumn>Status</TableColumn>
                                        <TableColumn align="end">
                                            Actions
                                        </TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {jobTitle.users?.map((u: TUser) => (
                                            <TableRow
                                                key={u.id}
                                                className="transition-colors hover:bg-background-hovered"
                                            >
                                                <TableCell>
                                                    <User
                                                        name={
                                                            <span className="font-bold">
                                                                {u.displayName}
                                                            </span>
                                                        }
                                                        description={`@${u.username}`}
                                                        avatarProps={{
                                                            src: u.avatar,
                                                            radius: 'md',
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="sm"
                                                        variant="solid"
                                                        color={
                                                            u.isActive
                                                                ? 'success'
                                                                : 'danger'
                                                        }
                                                    >
                                                        <p className="px-2 font-semibold text-white">
                                                            Active
                                                        </p>
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-end">
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                        >
                                                            <MoreVertical
                                                                size={16}
                                                            />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                    </div>

                    <div className="col-span-12 space-y-6 lg:col-span-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 space-y-2 transition-colors border rounded-2xl bg-white/5 border-white/5 hover:bg-white/10">
                                <div className="flex items-center gap-2 text-primary/60">
                                    <Users size={14} />
                                    <span className="text-[9px] font-black uppercase tracking-tighter">
                                        Force Size
                                    </span>
                                </div>
                                <p className="text-xl italic font-black tracking-tighter">
                                    {jobTitle._count?.users || 0}
                                </p>
                                <p className="text-[10px] font-bold text-text-subdued uppercase">
                                    Operatives
                                </p>
                            </div>

                            <div className="p-4 space-y-2 transition-colors border rounded-2xl bg-white/5 border-white/5 hover:bg-white/10">
                                <div className="flex items-center gap-2 text-emerald-500/60">
                                    <Activity size={14} />
                                    <span className="text-[9px] font-black uppercase tracking-tighter">
                                        Status
                                    </span>
                                </div>
                                <p className="text-xl italic font-black tracking-tighter text-emerald-500">
                                    Active
                                </p>
                                <p className="text-[10px] font-bold text-text-subdued uppercase">
                                    Deployed
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminContentContainer>
        </div>
    )
}
