import { pCenterTableStore, toggleJobColumns } from '@/features/project-center'
import { useProfile } from '@/lib'
import { getAllowedJobColumns } from '@/lib/utils'
import { ColumnMeta, ViewColumnsDrawer } from '@/shared/components'
import type { JobColumnKey } from '@/shared/types'
import { useStore } from '@tanstack/react-store'
import {
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

// Define icons specific to Jobs
const JOB_COLUMN_META: ColumnMeta = {
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

type Props = { isOpen: boolean; onClose: () => void }

export function ProjectCenterViewColumnsDrawer({ isOpen, onClose }: Props) {
    const { userPermissions } = useProfile()

    // 1. Get ALL allowed columns (not just the visible ones)
    const availableColumns = useMemo(() => {
        return getAllowedJobColumns('all', userPermissions)
    }, [userPermissions])

    // 2. Get current visible state from Store
    const visibleColumns = useStore(
        pCenterTableStore,
        (state) => state.jobColumns
    )

    // 3. Action to update store
    const handleToggle = (key: string, isVisible: boolean) => {
        toggleJobColumns(key as JobColumnKey, isVisible, userPermissions)
    }

    return (
        <ViewColumnsDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Workbench Columns"
            availableColumns={availableColumns}
            visibleKeys={visibleColumns}
            onToggle={handleToggle}
            meta={JOB_COLUMN_META}
        />
    )
}
