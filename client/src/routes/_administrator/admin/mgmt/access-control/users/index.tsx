import { createFileRoute, Link } from '@tanstack/react-router'
import { User, Button, Input, Chip } from '@heroui/react'
import { Search, ChevronRight } from 'lucide-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { usersListOptions } from '../../../../../../lib/queries'
import { INTERNAL_URLS, optimizeCloudinary } from '../../../../../../lib'

export const Route = createFileRoute(
    '/_administrator/admin/mgmt/access-control/users/'
)({
    component: UserAccessPage,
})

export function UserAccessPage() {
    const mockStaff = [
        {
            username: 'son.dang',
            name: 'Dang Son',
            role: 'Moderator',
            avatar: '',
        },
        {
            username: 'linh.nguyen',
            name: 'Linh Nguyen',
            role: 'Member',
            avatar: '',
        },
    ]

    const {
        data: { users },
    } = useSuspenseQuery({
        ...usersListOptions(),
    })

    return (
        <div className="space-y-4">
            <Input
                placeholder="Search staff by name or username..."
                startContent={<Search size={18} className="text-default-400" />}
                variant="bordered"
                className="max-w-md"
            />

            <div className="bg-background border border-divider rounded-3xl overflow-hidden">
                {users.map((staff, i) => (
                    <div
                        key={staff.username}
                        className={`flex items-center justify-between p-4 ${i !== mockStaff.length - 1 ? 'border-b border-divider' : ''} hover:bg-default-50 transition-colors`}
                    >
                        <User
                            name={
                                <span className="font-bold">
                                    {staff.displayName}
                                </span>
                            }
                            description={`@${staff.username}`}
                            avatarProps={{
                                src: optimizeCloudinary(staff.avatar),
                            }}
                        />
                        <div className="flex items-center gap-4">
                            <Chip size="sm" variant="dot" color="primary">
                                {staff.role.displayName}
                            </Chip>
                            <Link
                                to={INTERNAL_URLS.userRolePermissionManage(
                                    staff.username
                                )}
                            >
                                <Button
                                    size="sm"
                                    variant="flat"
                                    endContent={<ChevronRight size={14} />}
                                >
                                    Manage Permissions
                                </Button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
