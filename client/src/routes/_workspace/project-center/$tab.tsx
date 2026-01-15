import JobDetailDrawer from '@/features/job-details/components/drawers/JobDetailDrawer'
import {
    pCenterTableStore,
    ProjectCenterMobileContent,
    ViewColumnsDrawer,
} from '@/features/project-center'
import AddAttachmentsModal from '@/features/project-center/components/modals/AddAttachmentsModal'
import AssignMemberModal from '@/features/project-center/components/modals/AssignMemberModal'
import ProjectCenterTable from '@/features/project-center/components/views/ProjectCenterTable'
import { excelApi, getPageTitle, jobApi, STORAGE_KEYS } from '@/lib'
import {
    jobsListOptions,
    jobStatusesListOptions,
    jobTypesListOptions,
    paymentChannelsListOptions,
    useProfile,
    usersListOptions,
} from '@/lib/queries'
import { APP_PERMISSIONS, getAllowedJobColumns } from '@/lib/utils'
import {
    jobFiltersSchema,
    TDownloadExcelInput,
    TJobFilters,
} from '@/lib/validationSchemas'
import { ProjectCenterTabEnum } from '@/shared/enums'
import { useDevice, usePermission } from '@/shared/hooks'
import { TJob } from '@/shared/types'
import { Spinner, Tab, Tabs, useDisclosure } from '@heroui/react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import dayjs from 'dayjs'
import lodash from 'lodash'
import {
    BanknoteArrowUp,
    CircleCheckBig,
    ClockAlert,
    LucideIcon,
    PackageCheck,
    PinIcon,
    SquareX,
    Vote,
} from 'lucide-react'
import { Suspense, useMemo, useState, useTransition } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { z } from 'zod'

const DEFAULT_SORT = 'displayName:asc'

export const projectCenterParamsSchema = z
    .object({
        sort: z.string().optional().catch(DEFAULT_SORT),
        search: z.string().trim().optional(),
        limit: z.coerce.number().int().min(1).max(100).optional().catch(10),
        page: z.coerce.number().int().min(1).optional().catch(1),
    })
    .merge(jobFiltersSchema)

export type TProjectCenterSearch = z.infer<typeof projectCenterParamsSchema>

export const Route = createFileRoute('/_workspace/project-center/$tab')({
    head: () => ({
        meta: [{ title: getPageTitle('Project Center') }],
    }),
    validateSearch: (search) => projectCenterParamsSchema.parse(search),
    parseParams: (params) => {
        const result = z.nativeEnum(ProjectCenterTabEnum).safeParse(params.tab)
        if (!result.success)
            throw redirect({ href: '/project-center/priority' })
        return { tab: result.data }
    },
    loaderDeps: ({ search }) => ({ search }),
    loader: async ({ context, deps, params }) => {
        await Promise.all([
            context.queryClient.ensureQueryData(jobStatusesListOptions()),
            context.queryClient.ensureQueryData(jobTypesListOptions()),
            context.queryClient.ensureQueryData(paymentChannelsListOptions()),
            context.queryClient.ensureQueryData(usersListOptions()),
        ])

        const {
            limit = 10,
            page = 1,
            search,
            sort = DEFAULT_SORT,
        } = deps.search
        let hideFinishItems: '1' | '0' = '1'
        if (typeof window !== 'undefined') {
            const val = localStorage.getItem(
                STORAGE_KEYS.projectCenterFinishItems
            )
            hideFinishItems = val === 'true' ? '1' : '0'
        }

        void context.queryClient.ensureQueryData(
            jobsListOptions({
                limit,
                page,
                search,
                sort: [sort],
                tab: params.tab,
                hideFinishItems,
            })
        )
    },
    component: ProjectCenterPage,
})

export function ProjectCenterPage() {
    const search = Route.useSearch()
    const navigate = Route.useNavigate()
    const { tab } = Route.useParams()

    // Key fix: useTransition prevents jumping to Suspense fallback
    const [isPending, startTransition] = useTransition()

    const [localShowFinishItems, setLocalShowFinishItems] = useLocalStorage(
        STORAGE_KEYS.projectCenterFinishItems,
        false
    )

    // Using concrete objects for type safety and transition support
    const updateParams = (newParams: Partial<TProjectCenterSearch>) => {
        startTransition(() => {
            navigate({
                search: { ...search, ...newParams },
                replace: true,
            })
        })
    }

    const handleTabChange = (t: ProjectCenterTabEnum) => {
        startTransition(() => {
            navigate({
                to: '/project-center/$tab',
                params: { tab: t },
                search: { ...search, page: 1 },
                replace: true,
            })
        })
    }

    return (
        <div className="size-full space-y-5">
            <ProjectCenterTabs onTabChange={handleTabChange} defaultTab={tab} />

            {/* Visual feedback during transition */}
            <div
                className={
                    isPending
                        ? 'opacity-70 transition-opacity pointer-events-none'
                        : 'opacity-100 transition-opacity'
                }
            >
                <Suspense fallback={<TableLoadingFallback />}>
                    <ProjectCenterTableContent
                        tab={tab}
                        search={search}
                        localShowFinishItems={localShowFinishItems}
                        setLocalShowFinishItems={setLocalShowFinishItems}
                        onFiltersChange={(f) => updateParams({ ...f, page: 1 })}
                        onPageChange={(p) => updateParams({ page: p })}
                        onSortChange={(s) => updateParams({ sort: s, page: 1 })}
                        onLimitChange={(l) =>
                            updateParams({ limit: l, page: 1 })
                        }
                        onSearchChange={(s) =>
                            updateParams({ search: s || undefined, page: 1 })
                        }
                    />
                </Suspense>
            </div>
        </div>
    )
}

function ProjectCenterTableContent({
    tab,
    search,
    localShowFinishItems,
    setLocalShowFinishItems,
    onPageChange,
    onSortChange,
    onLimitChange,
    onSearchChange,
    onFiltersChange,
}: {
    tab: ProjectCenterTabEnum
    search: TProjectCenterSearch
    localShowFinishItems: boolean
    setLocalShowFinishItems: (s: boolean) => void
    onPageChange: (p: number) => void
    onSortChange: (s?: string) => void
    onLimitChange: (l: number) => void
    onSearchChange: (s?: string) => void
    onFiltersChange: (newFilters: TJobFilters) => void
}) {
    const { isSmallView } = useDevice()
    const { userRole, userPermissions } = useProfile()
    const [selectedJob, setSelectedJob] = useState<string | null>(null)

    const { data, isFetching, refetch } = useQuery({
        ...jobsListOptions({
            ...search,
            tab,
            hideFinishItems: localShowFinishItems ? '1' : '0',
        }),
        placeholderData: keepPreviousData,
    })

    const pagination = useMemo(
        () => ({
            limit: data?.paginate?.limit ?? 10,
            page: data?.paginate?.page ?? 1,
            totalPages: data?.paginate?.totalPages ?? 1,
            total: data?.paginate?.total ?? 0,
        }),
        [data?.paginate]
    )

    const storedColumns = useStore(
        pCenterTableStore,
        (state) => state.jobColumns
    )
    const headerColumns = useMemo(() => {
        return getAllowedJobColumns(storedColumns, userPermissions)
    }, [userRole, storedColumns])

    const viewColDisclosure = useDisclosure()
    const jobDetailDisclosure = useDisclosure()
    const assignMemberDisclosure = useDisclosure()
    const attachmentsDisclosure = useDisclosure()

    // Debounce Search Logic
    const debouncedSearchChange = useMemo(
        () => lodash.debounce((value: string) => onSearchChange(value), 500),
        [onSearchChange]
    )

    const handleExport = async () => {
        const exportColumns = getAllowedJobColumns(
            'all',
            userPermissions
        ).filter((c) => c.uid !== 'action')
        try {
            const res = await jobApi.findAll({ ...search, tab, isAll: '1' })
            const jobs = (res.result?.data as TJob[]) || []
            const payload: TDownloadExcelInput = {
                columns: exportColumns.map((col) => ({
                    header: col.displayName,
                    key: col.uid,
                })),
                data: jobs.map((item) => ({
                    ...item,
                    assignments: item.assignments
                        .map((a) => a.user.displayName)
                        .join(', '),
                    isPaid: item.isPaid ? 'Yes' : 'No',
                    paymentChannel: item.paymentChannel?.displayName,
                    type: item.type?.displayName,
                    status: item.status?.displayName,
                })),
            }
            const response = await excelApi.download(payload)
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute(
                'download',
                `ProjectCenter_Export_${dayjs().format('YYYYMMDD')}.xlsx`
            )
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Download failed', error)
        }
    }

    return (
        <>
            {viewColDisclosure.isOpen && (
                <ViewColumnsDrawer isOpen onClose={viewColDisclosure.onClose} />
            )}
            {jobDetailDisclosure.isOpen && selectedJob && (
                <JobDetailDrawer
                    jobNo={selectedJob}
                    isOpen
                    onClose={() => {
                        jobDetailDisclosure.onClose()
                        setSelectedJob(null)
                    }}
                />
            )}
            {assignMemberDisclosure.isOpen && selectedJob && (
                <AssignMemberModal
                    jobNo={selectedJob}
                    isOpen
                    onClose={() => {
                        assignMemberDisclosure.onClose()
                        setSelectedJob(null)
                    }}
                />
            )}
            {attachmentsDisclosure.isOpen && selectedJob && (
                <AddAttachmentsModal
                    jobNo={selectedJob}
                    isOpen
                    onClose={() => {
                        attachmentsDisclosure.onClose()
                        setSelectedJob(null)
                    }}
                />
            )}

            {isSmallView ? (
                <ProjectCenterMobileContent
                    data={data?.jobs ?? []}
                    isFetching={isFetching}
                    pagination={pagination}
                    onPageChange={onPageChange}
                    onSearchChange={onSearchChange}
                    onViewDetail={(no) => {
                        setSelectedJob(no)
                        jobDetailDisclosure.onOpen()
                    }}
                    onAssignMember={(no) => {
                        setSelectedJob(no)
                        assignMemberDisclosure.onOpen()
                    }}
                    onAddAttachments={(no) => {
                        setSelectedJob(no)
                        attachmentsDisclosure.onOpen()
                    }}
                    onExport={handleExport}
                />
            ) : (
                <ProjectCenterTable
                    data={data?.jobs ?? []}
                    tab={tab}
                    isLoadingData={isFetching}
                    pagination={pagination}
                    searchKeywords={search.search}
                    sort={search.sort}
                    visibleColumns={headerColumns.map((c) => c.uid)}
                    showFinishItems={localShowFinishItems}
                    onRefresh={refetch}
                    onDownloadCsv={handleExport}
                    openViewColDrawer={viewColDisclosure.onOpen}
                    openJobDetailDrawer={(no) => {
                        setSelectedJob(no)
                        jobDetailDisclosure.onOpen()
                    }}
                    onAssignMember={(no) => {
                        setSelectedJob(no)
                        assignMemberDisclosure.onOpen()
                    }}
                    onAddAttachments={(no) => {
                        setSelectedJob(no)
                        attachmentsDisclosure.onOpen()
                    }}
                    onShowFinishItemsChange={setLocalShowFinishItems}
                    onFiltersChange={onFiltersChange}
                    onPageChange={onPageChange}
                    onSearchKeywordsChange={(val) => {
                        if (!val) onSearchChange(undefined)
                        else debouncedSearchChange(val)
                    }}
                    onSortChange={onSortChange}
                    onLimitChange={onLimitChange}
                    filters={search as TJobFilters}
                />
            )}
        </>
    )
}

function TableLoadingFallback() {
    return (
        <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-divider bg-content1/50">
            <Spinner size="lg" color="primary" label="Syncing projects..." />
        </div>
    )
}

function ProjectCenterTabs({ defaultTab, onTabChange }: any) {
    const { hasPermission } = usePermission()
    const { isSmallView } = useDevice()
    return (
        <Tabs
            aria-label="Project Tabs"
            color="primary"
            size={isSmallView ? 'md' : 'sm'}
            variant="bordered"
            selectedKey={defaultTab}
            onSelectionChange={(key) =>
                onTabChange(key as ProjectCenterTabEnum)
            }
            classNames={{ tabWrapper: 'border-[1px]', tabList: 'border-1' }}
        >
            <Tab
                key={ProjectCenterTabEnum.PRIORITY}
                title={
                    <TabTitle
                        icon={PinIcon}
                        label="Priority"
                        rotate
                        value={ProjectCenterTabEnum.PRIORITY}
                    />
                }
            />
            <Tab
                key={ProjectCenterTabEnum.ACTIVE}
                title={
                    <TabTitle
                        icon={Vote}
                        label="Active"
                        value={ProjectCenterTabEnum.ACTIVE}
                    />
                }
            />
            <Tab
                key={ProjectCenterTabEnum.LATE}
                title={
                    <TabTitle
                        icon={ClockAlert}
                        label="Late"
                        value={ProjectCenterTabEnum.LATE}
                    />
                }
            />
            <Tab
                key={ProjectCenterTabEnum.DELIVERED}
                title={
                    <TabTitle
                        icon={PackageCheck}
                        label="Delivered"
                        value={ProjectCenterTabEnum.DELIVERED}
                    />
                }
            />
            <Tab
                key={ProjectCenterTabEnum.COMPLETED}
                title={
                    <TabTitle
                        icon={CircleCheckBig}
                        label="Completed"
                        value={ProjectCenterTabEnum.COMPLETED}
                    />
                }
            />
            <Tab
                key={ProjectCenterTabEnum.FINISHED}
                title={
                    <TabTitle
                        icon={BanknoteArrowUp}
                        label="Finished"
                        value={ProjectCenterTabEnum.FINISHED}
                    />
                }
            />
            {hasPermission(APP_PERMISSIONS.JOB.READ_SENSITIVE) && (
                <Tab
                    key={ProjectCenterTabEnum.CANCELLED}
                    title={
                        <TabTitle
                            icon={SquareX}
                            label="Canceled"
                            value={ProjectCenterTabEnum.CANCELLED}
                        />
                    }
                />
            )}
        </Tabs>
    )
}

const TabTitle = ({
    icon: Icon,
    label,
    rotate,
    value,
}: {
    icon: LucideIcon
    label: string
    rotate?: boolean
    value: ProjectCenterTabEnum
}) => {
    const { tab } = Route.useParams()
    const { isSmallView } = useDevice()

    if (isSmallView) {
        return (
            <div className="flex items-center space-x-2">
                <Icon size={16} className={rotate ? 'rotate-45' : ''} />
                {tab === value && <span>{label}</span>}
            </div>
        )
    }
    return (
        <div className="flex items-center space-x-2">
            <Icon size={16} className={rotate ? 'rotate-45' : ''} />
            <span>{label}</span>
        </div>
    )
}
