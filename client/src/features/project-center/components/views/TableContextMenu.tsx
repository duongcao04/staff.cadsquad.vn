import { pCenterTableStore } from '@/features/project-center'
import { INTERNAL_URLS } from '@/lib'
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from '@/shared/components/ui/context-menu'
import { useStore } from '@tanstack/react-store'
import {
    CircleCheck,
    CircleDollarSign,
    PinIcon,
    SquareArrowOutUpRight,
    Trash,
    UserPlus,
} from 'lucide-react'
import React, { useEffect } from 'react'

type Props = { children: React.ReactNode }

export default function TableContextMenu({ children }: Props) {
    useEffect(() => {
        // Define the event handler
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleContextMenu = (e: any) => {
            e.preventDefault()
        }

        // Add the event listener to the document
        document.addEventListener('contextmenu', handleContextMenu)

        // Remove the event listener on component unmount
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu)
        }
    }, [])

    const contextItem = useStore(
        pCenterTableStore,
        (state) => state.contextItem
    )

    const onOpenNewTab = () => {
        if (contextItem?.no) {
            window.open(
                INTERNAL_URLS.getJobDetailUrl(contextItem?.no),
                '_blank'
            )
        }
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent
                className="bg-background-muted w-[200px]"
                style={{ zIndex: 99999 }}
            >
                <ContextMenuItem
                    disabled={!contextItem}
                    onClick={onOpenNewTab}
                    className="cursor-pointer"
                >
                    <SquareArrowOutUpRight size={12} />
                    Open in new tab
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem disabled={!contextItem}>
                    <PinIcon
                        size={14}
                        className="text-text-subdued rotate-45"
                    />
                    Pin Job
                </ContextMenuItem>
                <ContextMenuItem disabled={!contextItem}>
                    <UserPlus size={14} className="text-text-subdued" />
                    Assign / Reassign
                </ContextMenuItem>
                <ContextMenuItem disabled={!contextItem}>
                    <Trash size={14} className="text-text-subdued" />
                    Delete
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem disabled={!contextItem}>
                    <CircleDollarSign size={14} className="text-text-subdued" />
                    Update Cost
                </ContextMenuItem>
                <ContextMenuItem disabled={!contextItem}>
                    <CircleCheck size={14} className="text-text-subdued" />
                    Mark as Paid
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
}
