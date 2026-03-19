import { INTERNAL_URLS } from '@/lib'
import { TUser } from '@/shared/types'
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    useDisclosure,
} from '@heroui/react'
import { useRouter } from '@tanstack/react-router'
import { Mail, MoreVertical, SendIcon, UserPen } from 'lucide-react'
import { AssignJobModal } from '../modals/AssignJobModal'
import { DeactivateUserModal } from '../modals/DeactiveUserModal'
import { EmailUserModal } from '../modals/EmailUserModal'
import { SendNotificationModal } from '../modals/SendNotificationModal'

type StaffDropdownProps = {
    selectedUser: TUser
}
export function StaffDropdown({ selectedUser }: StaffDropdownProps) {
    const router = useRouter()

    const assignJobModal = useDisclosure()
    const emailUserModal = useDisclosure()
    const notificationModal = useDisclosure()
    const deactivateModal = useDisclosure()

    return (
        <>
            {/* Modals Management */}
            {assignJobModal.isOpen && selectedUser && (
                <AssignJobModal
                    isOpen
                    onClose={assignJobModal.onClose}
                    user={selectedUser}
                />
            )}
            {emailUserModal.isOpen && selectedUser && (
                <EmailUserModal
                    isOpen
                    onClose={emailUserModal.onClose}
                    user={selectedUser}
                />
            )}
            {notificationModal.isOpen && selectedUser && (
                <SendNotificationModal
                    isOpen
                    onClose={notificationModal.onClose}
                    user={selectedUser}
                />
            )}
            {deactivateModal.isOpen && selectedUser && (
                <DeactivateUserModal
                    isOpen
                    onClose={deactivateModal.onClose}
                    user={selectedUser}
                />
            )}
            <Dropdown placement="bottom-end">
                <DropdownTrigger>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-text-default"
                    >
                        <MoreVertical size={20} />
                    </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="User Actions">
                    <DropdownSection showDivider>
                        <DropdownItem
                            key="view"
                            startContent={<UserPen size={16} />}
                            onPress={() => {
                                router.navigate({
                                    href: INTERNAL_URLS.management.staffDetail(
                                        selectedUser.username
                                    ),
                                })
                            }}
                        >
                            View Profile
                        </DropdownItem>
                        <DropdownItem
                            key="notify"
                            startContent={<SendIcon size={16} />}
                            onPress={notificationModal.onOpen}
                        >
                            Send Notification
                        </DropdownItem>
                        <DropdownItem
                            key="email"
                            startContent={<Mail size={16} />}
                            onPress={emailUserModal.onOpen}
                        >
                            Direct Email
                        </DropdownItem>
                    </DropdownSection>
                    <DropdownSection title="Danger zone">
                        <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            onPress={deactivateModal.onOpen}
                        >
                            Deactivate User
                        </DropdownItem>
                    </DropdownSection>
                </DropdownMenu>
            </Dropdown>
        </>
    )
}
