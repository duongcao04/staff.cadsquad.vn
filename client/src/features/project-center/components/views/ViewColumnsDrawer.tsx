import { pCenterTableStore, toggleJobColumns } from '@/features/project-center'
import { useProfile } from '@/lib'
import { getAllowedJobColumns } from '@/lib/utils'
import type { JobColumnKey } from '@/shared/types'
import { useStore } from '@tanstack/react-store'
import { Drawer } from 'antd'
import {
    ArrowLeft,
    AtSign,
    BanknoteArrowUp,
    Calendar,
    CalendarClock,
    DollarSign,
    GalleryThumbnails,
    Hand,
    Handshake,
    Landmark,
    Layers2,
    Loader,
    Paperclip,
    Text,
    UsersRound,
    Wallet,
} from 'lucide-react'
import { useMemo } from 'react'
import { ViewColumnSwitch } from './ViewColumnSwitch'

type Props = { isOpen: boolean; onClose: () => void }

export function ViewColumnsDrawer({ isOpen, onClose }: Props) {
    const { userPermissions } = useProfile() // Destructure role directly

    // 1. Use the helper to get only the columns this specific role is allowed to see/toggle
    const AVAILABLE_COLUMNS = useMemo(() => {
        return getAllowedJobColumns('all', userPermissions)
    }, [userPermissions])

    const visibleColumns = useStore(
        pCenterTableStore,
        (state) => state.jobColumns
    )

    const columnMeta: Partial<
        Record<JobColumnKey, { title: string; icon?: React.ReactNode }>
    > = {
        no: {
            title: 'Job no',
            icon: (
                <p className="font-bold text-lg text-text-subdued leading-none">
                    #
                </p>
            ),
        },
        type: {
            title: 'Type',
            icon: <Layers2 size={20} className="text-text-subdued" />,
        },
        thumbnailUrl: {
            title: 'Thumbnail',
            icon: <GalleryThumbnails size={20} className="text-text-subdued" />,
        },
        displayName: {
            title: 'Display name',
            icon: <AtSign size={20} className="text-text-subdued" />,
        },
        description: {
            title: 'Description',
            icon: <Text size={20} className="text-text-subdued" />,
        },
        attachmentUrls: {
            title: 'Attachments',
            icon: <Paperclip size={20} className="text-text-subdued" />,
        },
        clientName: {
            title: 'Client name',
            icon: <Handshake size={20} className="text-text-subdued" />,
        },
        incomeCost: {
            title: 'Income cost',
            icon: <DollarSign size={20} className="text-text-subdued" />,
        },
        totalStaffCost: {
            title: 'Total Staff Cost',
            icon: <Wallet size={20} className="text-text-subdued" />,
        },
        staffCost: {
            title: 'Your Cost',
            icon: (
                <p className="font-semibold text-lg text-text-subdued leading-none">
                    đ
                </p>
            ),
        },
        assignments: {
            title: 'Assignees',
            icon: <UsersRound size={20} className="text-text-subdued" />,
        },
        paymentChannel: {
            title: 'Payment channel',
            icon: <Landmark size={20} className="text-text-subdued" />,
        },
        status: {
            title: 'Status',
            icon: <Loader size={20} className="text-text-subdued" />,
        },
        isPaid: {
            title: 'Paid status',
            icon: <BanknoteArrowUp size={20} className="text-text-subdued" />,
        },
        dueAt: {
            title: 'Due on',
            icon: <CalendarClock size={20} className="text-text-subdued" />,
        },
        completedAt: {
            title: 'Completed at',
            icon: <Calendar size={20} className="text-text-subdued" />,
        },
        createdAt: {
            title: 'Created at',
            icon: <Calendar size={20} className="text-text-subdued" />,
        },
        updatedAt: {
            title: 'Updated at',
            icon: <Calendar size={20} className="text-text-subdued" />,
        },
        action: {
            title: 'Actions',
            icon: <Hand size={20} className="text-text-subdued" />,
        },
    }

    // 2. Pass the role to the toggle function to ensure restricted keys aren't saved
    const handleSwitch = (key: JobColumnKey, isVisible: boolean) =>
        toggleJobColumns(key, isVisible, userPermissions)

    return (
        <Drawer
            open={isOpen}
            title="View columns"
            width={400}
            maskClosable
            closeIcon={<ArrowLeft size={16} />}
            onClose={onClose}
            classNames={{
                body: '!py-3 !px-5',
            }}
        >
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-text-subdued text-xs uppercase tracking-wider">
                        Available Columns
                    </p>
                </div>

                <div className="divide-y divide-border/50">
                    {AVAILABLE_COLUMNS.map((col) => {
                        const isSelected =
                            visibleColumns === 'all'
                                ? true
                                : visibleColumns?.includes(col.uid)

                        return (
                            <div
                                key={col.uid}
                                className="flex items-center justify-between py-3 hover:bg-content2/50 px-2 -mx-2 rounded-lg transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 flex justify-center group-hover:scale-110 transition-transform">
                                        {columnMeta[col.uid]?.icon}
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-sm font-medium text-text-default">
                                            {col.displayName}
                                        </p>
                                        <p className="text-[10px] text-text-subdued font-mono">
                                            ID: {col.uid}
                                        </p>
                                    </div>
                                </div>
                                <ViewColumnSwitch
                                    colKey={col.uid}
                                    isSelected={isSelected}
                                    onSwitch={handleSwitch}
                                />
                            </div>
                        )
                    })}
                </div>
            </div>
        </Drawer>
    )
}
