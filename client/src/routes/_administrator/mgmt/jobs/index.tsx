import { CreateJobModal } from '@/features/job-manage'
import AdminManagementJobsTable from '@/features/job-manage/components/views/AdminManagementJobsTable'
import { getPageTitle } from '@/lib'
import { jobsListOptions } from '@/lib/queries'
import { AdminPageHeading, HeroButton } from '@/shared/components'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import { TJob } from '@/shared/types'
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Selection,
    useDisclosure,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import lodash from 'lodash'
import { PlusIcon } from 'lucide-react'
import { startTransition, useEffect, useMemo, useState } from 'react'
import { z } from 'zod'

const DEFAULT_SORT = 'displayName:asc'

export const manageJobsParamsSchema = z.object({
    sort: z.string().optional().catch(DEFAULT_SORT),
    search: z.string().trim().optional(),
    limit: z.coerce.number().int().min(1).max(100).optional().catch(10),
    page: z.coerce.number().int().min(1).optional().catch(1),
})

export type TManageJobsParams = z.infer<typeof manageJobsParamsSchema>

export const Route = createFileRoute('/_administrator/mgmt/jobs/')({
    head: () => ({
        meta: [{ title: getPageTitle('Job Management') }],
    }),
    validateSearch: (search) => manageJobsParamsSchema.parse(search),
    loaderDeps: ({ search }) => ({ search }),
    loader: ({ context, deps }) => {
        const {
            limit = 10,
            page = 1,
            search,
            sort = DEFAULT_SORT,
        } = deps.search
        return context.queryClient.ensureQueryData(
            jobsListOptions({
                limit,
                page,
                search,
                sort: [sort],
            })
        )
    },
    component: ManageJobsPage,
})

function ManageJobsPage() {
    const navigate = useNavigate({ from: Route.fullPath })
    const searchParams = Route.useSearch()
    const createJobModalDisclosure = useDisclosure({ id: 'CreateJobModal' })

    // --- Server State ---
    const options = jobsListOptions({
        ...searchParams,
        sort: [searchParams.sort || DEFAULT_SORT],
    })
    const { data, isFetching } = useSuspenseQuery(options)

    // --- Local UI State ---
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]))
    const [statusFilter, setStatusFilter] = useState<Selection>('all')

    // Search State: searchValue quản lý input tức thì, debouncedSearch cập nhật URL
    const [searchValue, setSearchValue] = useState(searchParams.search || '')

    // --- Search Logic (Fix Debounce) ---

    // 1. Hàm cập nhật URL
    const updateSearch = (
        updater: (old: TManageJobsParams) => TManageJobsParams
    ) => {
        startTransition(() => {
            navigate({
                search: ((old: TManageJobsParams) =>
                    updater(old as TManageJobsParams)) as unknown as true,
                replace: true,
            })
        })
    }

    // 2. Tạo hàm debounce để cập nhật URL sau 500ms
    const debouncedUpdateUrl = useMemo(
        () =>
            lodash.debounce((value: string) => {
                updateSearch((old) => ({
                    ...old,
                    search: value || undefined,
                    page: 1,
                }))
            }, 500),
        []
    )

    // 3. Sync input khi URL thay đổi (nhấn Back/Forward hoặc reset)
    useEffect(() => {
        setSearchValue(searchParams.search || '')
    }, [searchParams.search])

    // 4. Cleanup debounce
    useEffect(() => {
        return () => debouncedUpdateUrl.cancel()
    }, [debouncedUpdateUrl])

    // --- Handlers ---

    const onSearchInputChange = (value: string) => {
        setSearchValue(value) // Cập nhật UI ngay lập tức
        debouncedUpdateUrl(value) // Trigger debounce cập nhật URL
    }

    const handleClearSearch = () => {
        setSearchValue('')
        debouncedUpdateUrl.cancel()
        updateSearch((old) => ({ ...old, search: undefined, page: 1 }))
    }

    const handlePageChange = (newPage: number) => {
        navigate({ search: (prev) => ({ ...prev, page: newPage }) })
    }

    const handleSortChange = (newSort: string) => {
        navigate({
            search: (old) => ({ ...old, sort: newSort, page: 1 }),
            replace: true,
        })
    }

    // --- Bulk Actions ---
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const [bulkActionType, setBulkActionType] = useState<
        'DELETE' | 'STATUS' | null
    >(null)

    const onBulkAction = (type: 'DELETE' | 'STATUS') => {
        setBulkActionType(type)
        onOpen()
    }

    const handleBulkConfirm = () => {
        const selectedIds =
            selectedKeys === 'all'
                ? data.jobs.map((j: TJob) => j.id)
                : Array.from(selectedKeys)

        console.log(`Performing ${bulkActionType} on:`, selectedIds)
        setSelectedKeys(new Set([]))
        onOpenChange()
    }

    const pagination = {
        limit: data.paginate?.limit ?? 10,
        page: data.paginate?.page ?? 1,
        totalPages: data.paginate?.totalPages ?? 1,
        total: data.paginate?.total ?? 0,
    }

    return (
        <>
            {createJobModalDisclosure.isOpen && (
                <CreateJobModal
                    isOpen={createJobModalDisclosure.isOpen}
                    onClose={createJobModalDisclosure.onClose}
                />
            )}

            <AdminPageHeading
                title="All Jobs"
                showBadge
                badgeCount={data.paginate?.total}
                actions={
                    <HeroButton
                        color="primary"
                        className="px-6"
                        startContent={<PlusIcon size={16} />}
                        onPress={createJobModalDisclosure.onOpen}
                    >
                        New Job
                    </HeroButton>
                }
            />

            <AdminContentContainer>
                <AdminManagementJobsTable
                    data={data.jobs}
                    isLoadingData={isFetching}
                    // Search props
                    searchValue={searchValue}
                    onSearchChange={onSearchInputChange}
                    onClearSearch={handleClearSearch}
                    // Pagination & Sort
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    sort={searchParams.sort ?? DEFAULT_SORT}
                    onSortChange={handleSortChange}
                    // Selection & Filter
                    selectedKeys={selectedKeys}
                    onSelectionChange={setSelectedKeys}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    onBulkAction={onBulkAction}
                />

                <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>
                                    Confirm{' '}
                                    {bulkActionType === 'DELETE'
                                        ? 'Deletion'
                                        : 'Update'}
                                </ModalHeader>
                                <ModalBody>
                                    <p className="text-default-600">
                                        Are you sure you want to{' '}
                                        {bulkActionType === 'DELETE'
                                            ? 'permanently delete'
                                            : 'update'}{' '}
                                        <strong>
                                            {selectedKeys === 'all'
                                                ? data.jobs.length
                                                : selectedKeys.size}
                                        </strong>{' '}
                                        selected jobs?
                                    </p>
                                </ModalBody>
                                <ModalFooter>
                                    <Button variant="light" onPress={onClose}>
                                        Cancel
                                    </Button>
                                    <Button
                                        color={
                                            bulkActionType === 'DELETE'
                                                ? 'danger'
                                                : 'primary'
                                        }
                                        onPress={handleBulkConfirm}
                                    >
                                        Confirm
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </AdminContentContainer>
        </>
    )
}
