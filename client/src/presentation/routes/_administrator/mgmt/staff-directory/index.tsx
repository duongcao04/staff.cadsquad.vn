import CreateUserModal from '@/presentation/features/staff-directory/components/modals/CreateUserModal'
import { departmentsListOptions, usersListOptions } from '@/presentation/lib/queries'
import { getPageTitle } from '@/presentation/lib/utils'
import {
    useDisclosure
} from '@heroui/react'
import { AdminPageHeading, AppLoading, HeroButton } from '@presentation/components'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
    FileDownIcon,
    LayoutGridIcon,
    TableIcon,
    UserRoundPlusIcon
} from 'lucide-react'
import { z } from 'zod'
import { StaffDirectoryPage } from '@presentation/features/administrator/management/staff-directory'

// --- 1. CONSTANTS & SCHEMA ---
export const VIEW_OPTIONS = [
    {
        key: 'table',
        label: 'List View',
        icon: TableIcon,
        description: 'Standard row layout',
    },
    {
        key: 'grid',
        label: 'Grid View',
        icon: LayoutGridIcon,
        description: 'Card gallery layout',
    },
]

const staffSearchSchema = z.object({
    page: z.coerce.number().optional().default(1).catch(1),
    limit: z.coerce.number().optional().default(8).catch(8),
    search: z.string().optional(),
    departmentId: z.string().optional(),
    // Fixed: Default to 'table' instead of 'grid'
    view: z.enum(['table', 'grid']).default('table'),
})

export type TStaffSearchValues = z.infer<typeof staffSearchSchema>

// --- 2. ROUTE DEFINITION ---
export const Route = createFileRoute('/_administrator/mgmt/staff-directory/')({
    validateSearch: (search) => staffSearchSchema.parse(search),
    loaderDeps: ({ search }) => ({
        page: search.page,
        limit: search.limit,
        search: search.search,
        departmentId: search.departmentId,
    }),
    head: () => {
        return {
            meta: [
                {
                    title: getPageTitle('Staff Directory'),
                },
            ],
        }
    },
    loader: async ({ context, deps }) => {
        const { departmentId, limit, page, search } = deps
        return Promise.all([
            context.queryClient.ensureQueryData(
                usersListOptions({
                    limit,
                    page,
                    sortBy: 'displayName',
                    sortOrder: 'asc',
                    departmentId,
                    search,
                })
            ),
            context.queryClient.ensureQueryData(departmentsListOptions()),
        ])
    },
    pendingComponent: AppLoading,
    component: () => {
        const options = usersListOptions()
        const {
            data: { total },
        } = useSuspenseQuery(options)

        const createUserModalDisclosure = useDisclosure({
            id: 'CreateUserModal',
        })
        return (
            <>
                {createUserModalDisclosure.isOpen && (
                    <CreateUserModal
                        isOpen={createUserModalDisclosure.isOpen}
                        onClose={createUserModalDisclosure.onClose}
                    />
                )}
                <AdminPageHeading
                    title="Staff Directory"
                    showBadge
                    badgeCount={total}
                    actions={
                        <div className="flex gap-3">
                            <HeroButton
                                variant="flat"
                                color="default"
                                startContent={<FileDownIcon size={16} />}
                                className="hidden sm:flex"
                            >
                                Export
                            </HeroButton>
                            <HeroButton
                                color="primary"
                                className="px-6"
                                startContent={<UserRoundPlusIcon size={16} />}
                                onPress={createUserModalDisclosure.onOpen}
                            >
                                New Member
                            </HeroButton>
                        </div>
                    }
                />
                <StaffDirectoryPage />
            </>
        )
    },
})
