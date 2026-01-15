import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    useDisclosure,
} from '@heroui/react'

import { IconCalendar, IconCalendarOutline } from '../../icons/sidebar-icons'
import TaskCalendar from './TaskCalendar'

export default function TaskCalendarPopover() {
    const { isOpen, onClose, onOpen } = useDisclosure({
        id: 'CollapseSidebarCalendarDropdown',
    })

    return (
        <div className="size-full pr-2">
            <div className="group size-full grid grid-cols-[16px_1fr] place-items-center">
                <div className="w-4 flex items-center">
                    <div
                        className={`ml-1.5 h-4 w-0.75 rounded-full ${
                            isOpen
                                ? 'bg-primary'
                                : 'bg-transparent group-hover:bg-text-subdued!'
                        }`}
                    ></div>
                </div>

                <Popover
                    placement="right-end"
                    size="sm"
                    classNames={{
                        base: '!z-0',
                        content: '!z-0 py-2 w-[300px]',
                        backdrop: '!z-0',
                        trigger: '!z-0',
                    }}
                    showArrow={true}
                    isOpen={isOpen}
                    onOpenChange={onOpen}
                    onClose={onClose}
                >
                    <PopoverTrigger>
                        <button className="w-full group cursor-pointer flex items-center justify-start rounded-lg hover:bg-text-disabled transition duration-200">
                            <div className="py-2 px-2.5">
                                {isOpen ? (
                                    <IconCalendar />
                                ) : (
                                    <IconCalendarOutline />
                                )}
                            </div>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent aria-label="Calendar" className="">
                        <TaskCalendar />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}
