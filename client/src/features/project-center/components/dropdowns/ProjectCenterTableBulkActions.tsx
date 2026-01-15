import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    useDisclosure,
} from '@heroui/react'
import { ChevronDownIcon } from 'lucide-react'

import BulkChangeStatusModal from '../modals/BulkChangeStatusModal'

type ProjectCenterTableBulkActionsProps = {
    keys: Set<string> | 'all'
}
export default function ProjectCenterTableBulkActions({}: ProjectCenterTableBulkActionsProps) {
    const { isOpen, onClose, onOpen } = useDisclosure({
        id: 'ProjectCenterTableBulkActions',
    })

    const {
        isOpen: isOpenBulkChangeStatusModal,
        onClose: onCloseBulkChangeStatusModal,
        onOpen: onOpenBulkChangeStatusModal,
    } = useDisclosure({ id: 'BulkChangeStatusModal' })

    const onBulkChangeStatus = () => {
        onClose()
        onOpenBulkChangeStatusModal()
    }

    return (
        <>
            <BulkChangeStatusModal
                isOpen={isOpenBulkChangeStatusModal}
                onClose={onCloseBulkChangeStatusModal}
            />
            <Dropdown isOpen={isOpen} onClose={onClose} onOpenChange={onOpen}>
                <DropdownTrigger className="hidden sm:flex" onPress={onOpen}>
                    <Button
                        endContent={
                            <ChevronDownIcon className="text-small" size={14} />
                        }
                        variant="bordered"
                        size="sm"
                        className="hover:shadow-SM"
                    >
                        <span className="font-medium">Selected Actions</span>
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    disallowEmptySelection
                    aria-label="Table bulk actions"
                    closeOnSelect={false}
                    // onSelectionChange={setVisibleColumns}
                >
                    <DropdownSection title="Status">
                        <DropdownItem
                            key="change_status"
                            onPress={onBulkChangeStatus}
                        >
                            Bulk change status
                        </DropdownItem>
                        <DropdownItem key="delete_all">Delete all</DropdownItem>
                    </DropdownSection>
                    <DropdownSection title="Payment">
                        <DropdownItem key="mark_paid">
                            Mark as Paid
                        </DropdownItem>
                        <DropdownItem key="mark_un_paid">
                            Mark as Unpaid
                        </DropdownItem>
                    </DropdownSection>
                    <DropdownSection title="Assign member">
                        <DropdownItem key="bulk_assign">
                            Bulk assign
                        </DropdownItem>
                    </DropdownSection>
                </DropdownMenu>
            </Dropdown>
        </>
    )
}
