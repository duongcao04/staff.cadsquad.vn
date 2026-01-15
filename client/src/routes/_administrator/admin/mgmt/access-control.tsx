import { INTERNAL_URLS } from '@/lib'
import { AdminPageHeading, HeroButton } from '@/shared/components'
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
} from '@heroui/react'
import { createFileRoute, Outlet, useRouter } from '@tanstack/react-router'
import { MoreHorizontalIcon } from 'lucide-react'

export const Route = createFileRoute(
    '/_administrator/admin/mgmt/access-control'
)({
    component: () => {
        const router = useRouter()
        return (
            <>
                <AdminPageHeading
                    className="mb-5"
                    title="Roles & Permissions"
                    description="Review your members roles and allocate permissions"
                    actions={
                        <div className="flex gap-2">
                            <HeroButton
                                color="primary"
                                className="px-6"
                                onPress={() =>
                                    router.navigate({
                                        href: INTERNAL_URLS.rolesManage,
                                    })
                                }
                            >
                                Manage Roles
                            </HeroButton>
                            <Dropdown placement="bottom-end">
                                <DropdownTrigger>
                                    <HeroButton
                                        isIconOnly
                                        variant="bordered"
                                        color="default"
                                        className="min-w-unit-10"
                                    >
                                        <MoreHorizontalIcon size={20} />
                                    </HeroButton>
                                </DropdownTrigger>
                                <DropdownMenu>
                                    <DropdownSection title="Actions">
                                        <DropdownItem
                                            key="allPerms"
                                            onPress={() =>
                                                router.navigate({
                                                    href: INTERNAL_URLS.allPermissions,
                                                })
                                            }
                                        >
                                            View all Permissions
                                        </DropdownItem>
                                    </DropdownSection>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    }
                />
                <Outlet />
            </>
        )
    },
})
