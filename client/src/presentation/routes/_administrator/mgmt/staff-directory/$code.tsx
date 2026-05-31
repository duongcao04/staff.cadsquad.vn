import {
    INTERNAL_URLS
} from '@/presentation/lib'
import { userOptions } from '@/presentation/lib/queries'
import { TUser } from '@/presentation/types'
import {
    addToast,
    BreadcrumbItem,
    Breadcrumbs,
    Button,
    Chip
} from '@heroui/react'
import { AppLoading } from '@presentation/components'
import AdminContentContainer from '@presentation/components/admin/AdminContentContainer'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import {
    ArrowLeft,
    HashIcon
} from 'lucide-react'
import { z } from 'zod'
import { EditStaffPage } from '../../../../features/administrator/management/staff-directory/detail'
import { NavigatorHelper } from '../../../../lib/helpers/navigation.helper'
import { useDevice } from '../../../../hooks'

const staffDetailParams = z.object({
    tab: z
        .enum(['profile', 'organization', 'security', 'account-control'])
        .catch('profile')
        .default('profile'),
})
export type TStaffDetailParams = z.infer<typeof staffDetailParams>

export const Route = createFileRoute(
    '/_administrator/mgmt/staff-directory/$code'
)({
    validateSearch: (search) => staffDetailParams.parse(search),
    head: (ctx) => {
        const loader = ctx.loaderData as unknown as TUser
        return {
            meta: [
                {
                    title:
                        (loader?.displayName ??
                            loader?.code ??
                            loader?.username) + ' | Staff Directory',
                },
            ],
        }
    },
    loader: ({ context, params }) => {
        const { code } = params
        return context.queryClient.ensureQueryData(userOptions(code))
    },
    pendingComponent: AppLoading,
    component: () => {
        const { isSmallView } = useDevice()
        const router = useRouter()
        const { code } = Route.useParams()
        const { data: user } = useSuspenseQuery(userOptions(code))

        const isDeletedUser = Boolean(user.deletedAt)

        return (
            <>
                <AdminContentContainer
                    className="pt-0 space-y-4"
                    showHeader
                    headerProps={{
                        title: (
                            <div className="flex items-center gap-4">
                                <Button
                                    isIconOnly
                                    variant="flat"
                                    onPress={() => router.history.back()}
                                >
                                    <ArrowLeft size={18} />
                                </Button>
                                <div>
                                    <div className="flex items-center justify-start gap-3">
                                        <h1 className="text-2xl font-bold text-text-default">
                                            {user.displayName}
                                        </h1>
                                        {!isSmallView && isDeletedUser && (
                                            <Chip
                                                color="danger"
                                                variant="shadow"
                                                classNames={{
                                                    base: 'shadow-md',
                                                    content: 'font-semibold',
                                                }}
                                            >
                                                Deleted Account
                                            </Chip>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-start gap-3">
                                        <Chip
                                            size="sm"
                                            startContent={
                                                <HashIcon size={12} />
                                            }
                                            classNames={{
                                                base: 'rounded-md cursor-pointer',
                                                content: 'font-bold pt-0.5',
                                            }}
                                            title="Copy"
                                            variant="flat"
                                            onClick={() => {
                                                NavigatorHelper.copy(
                                                    user.code,
                                                    () => {
                                                        addToast({
                                                            title: 'Copy user code successful',
                                                            color: 'success',
                                                        })
                                                    }
                                                )
                                            }}
                                        >
                                            {user.code}
                                        </Chip>
                                        {isSmallView && isDeletedUser && (
                                            <Chip
                                                color="danger"
                                                variant="shadow"
                                                classNames={{
                                                    base: 'shadow-md',
                                                    content: 'font-semibold',
                                                }}
                                            >
                                                Deleted Account
                                            </Chip>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ),
                    }}
                    breadcrumbs={
                        <Breadcrumbs className="text-xs" underline="hover">
                            <BreadcrumbItem>
                                <Link
                                    to={INTERNAL_URLS.admin.overview}
                                    className="text-text-subdued!"
                                >
                                    Management
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Link
                                    to={INTERNAL_URLS.management.team}
                                    className="text-text-subdued!"
                                >
                                    Staff Directory
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>{user.code}</BreadcrumbItem>
                        </Breadcrumbs>
                    }
                >
                    <EditStaffPage data={user} />
                </AdminContentContainer>
            </>
        )
    },
})
