import CreateUserModal from '@/features/staff-directory/components/modals/CreateUserModal'
import { usersListOptions } from '@/lib/queries'
import { HeroButton } from '@/shared/components'
import { AdminPageHeading } from '@/shared/components/admin/AdminPageHeading'
import { useDisclosure } from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { FileDownIcon, UserRoundPlusIcon } from 'lucide-react'

export const Route = createFileRoute('/_administrator/mgmt/staff-directory')({
    component: StaffDirectoryLayout,
})

function StaffDirectoryLayout() {
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
            <Outlet />
        </>
    )
}
