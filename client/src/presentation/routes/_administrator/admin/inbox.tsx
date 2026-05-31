import {
    Avatar,
    Button,
    Card,
    Chip,
    Divider,
    Input,
    ScrollShadow,
    Tab,
    Tabs,
} from '@heroui/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
    AlertTriangle,
    Bell,
    Briefcase,
    CheckCircle2,
    Clock,
    ExternalLink,
    Info,
    MoreVertical,
    Search,
    Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { getPageTitle, INTERNAL_URLS } from '../../../lib'
import {
    AdminPageHeading,
    HeroBreadcrumbItem,
    HeroBreadcrumbs,
} from '../../../shared/components'
import AdminContentContainer from '../../../shared/components/admin/AdminContentContainer'

export const Route = createFileRoute('/_administrator/admin/inbox')({
    head: () => ({
        meta: [
            {
                title: getPageTitle('Inbox'),
            },
        ],
    }),
    component: InboxPage,
})

type NotificationType =
    | 'INFO'
    | 'WARNING'
    | 'ERROR'
    | 'SUCCESS'
    | 'JOB_UPDATE'
    | 'DEADLINE_REMINDER'
    | 'STATUS_CHANGE'

type NotificationStatus = 'SEEN' | 'UNSEEN'

interface Notification {
    id: string
    title: string
    content: string
    type: NotificationType
    status: NotificationStatus
    sender: {
        name: string
        avatar: string
    }
    createdAt: string // ISO string in DB
    redirectUrl?: string // Link to Job or Page
}

// --- Mock Data ---
const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        title: 'New Job Assigned: FV-2094',
        content:
            "You have been assigned to the 'Website Redesign project for TechCorp. Please review the brief.'",
        type: 'JOB_UPDATE',
        status: 'UNSEEN',
        sender: {
            name: 'Sarah Wilson',
            avatar: 'https://i.pravatar.cc/150?u=sarah',
        },
        createdAt: '10 mins ago',
        redirectUrl: '/jobs/FV-2094',
    },
    {
        id: '2',
        title: 'Urgent: Deadline Approaching',
        content:
            "The deadline for 'Mobile App Assets' is today at 5:00 PM. Please ensure all files are uploaded.",
        type: 'DEADLINE_REMINDER',
        status: 'UNSEEN',
        sender: { name: 'System', avatar: '' }, // System has no avatar
        createdAt: '1 hour ago',
        redirectUrl: '/jobs/FV-1022',
    },
    {
        id: '3',
        title: 'Payment Received',
        content:
            'Payment of $4,500 has been received from Client Amoovo via Stripe.',
        type: 'SUCCESS',
        status: 'SEEN',
        sender: { name: 'Finance Bot', avatar: '' },
        createdAt: 'Yesterday',
    },
    {
        id: '4',
        title: 'Server High Latency',
        content:
            'Warning: API response time exceeded 2000ms on the Asia-Pacific node.',
        type: 'WARNING',
        status: 'SEEN',
        sender: { name: 'DevOps Monitor', avatar: '' },
        createdAt: '2 days ago',
    },
    {
        id: '5',
        title: "Status Changed to 'In Review'",
        content:
            "David Chen moved the job 'SEO Optimization' to Review status.",
        type: 'STATUS_CHANGE',
        status: 'SEEN',
        sender: {
            name: 'David Chen',
            avatar: 'https://i.pravatar.cc/150?u=david',
        },
        createdAt: '3 days ago',
    },
]

// --- Helper Functions ---
const getIconByType = (type: NotificationType) => {
    switch (type) {
        case 'ERROR':
            return <AlertTriangle size={18} />
        case 'WARNING':
            return <AlertTriangle size={18} />
        case 'SUCCESS':
            return <CheckCircle2 size={18} />
        case 'JOB_UPDATE':
            return <Briefcase size={18} />
        case 'DEADLINE_REMINDER':
            return <Clock size={18} />
        case 'STATUS_CHANGE':
            return <Info size={18} />
        default:
            return <Bell size={18} />
    }
}

const getColorByType = (type: NotificationType) => {
    switch (type) {
        case 'ERROR':
            return 'danger'
        case 'WARNING':
            return 'warning'
        case 'SUCCESS':
            return 'success'
        case 'DEADLINE_REMINDER':
            return 'danger'
        case 'JOB_UPDATE':
            return 'primary'
        default:
            return 'default'
    }
}

function InboxPage() {
    const [selectedId, setSelectedId] = useState<string | null>(
        MOCK_NOTIFICATIONS[0].id
    )
    const [searchQuery, setSearchQuery] = useState('')
    const [filter, setFilter] = useState<'ALL' | 'UNSEEN'>('ALL')

    // --- Filtering Logic ---
    const filteredList = useMemo(() => {
        return MOCK_NOTIFICATIONS.filter((item) => {
            const matchesSearch =
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.content.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesFilter = filter === 'ALL' || item.status === 'UNSEEN'
            return matchesSearch && matchesFilter
        })
    }, [searchQuery, filter])

    const selectedMessage = MOCK_NOTIFICATIONS.find((n) => n.id === selectedId)

    return (
        <>
            <AdminPageHeading title="Inbox" />

            <HeroBreadcrumbs className="pt-3 px-7 text-xs">
                <HeroBreadcrumbItem>
                    <Link
                        to={INTERNAL_URLS.admin.overview}
                        className="text-text-subdued!"
                    >
                        Admin
                    </Link>
                </HeroBreadcrumbItem>
                <HeroBreadcrumbItem>Inbox</HeroBreadcrumbItem>
            </HeroBreadcrumbs>
            <AdminContentContainer className="mt-1 h-[calc(100svh-150px)]">
                {/* Main Content Area (Split View) */}
                <Card className="h-full flex-1 min-h-0 overflow-hidden shadow-sm border border-border-default">
                    <div className="flex h-full">
                        {/* --- LEFT PANEL: List --- */}
                        <div className="w-100 border-r border-border-default flex flex-col">
                            {/* Search & Tabs */}
                            <div className="p-4 border-b border-border-default space-y-4">
                                <Input
                                    placeholder="Search inbox..."
                                    startContent={
                                        <Search
                                            size={16}
                                            className="text-slate-400"
                                        />
                                    }
                                    size="sm"
                                    variant="bordered"
                                    value={searchQuery}
                                    onValueChange={setSearchQuery}
                                    isClearable
                                    radius="lg"
                                />
                                <Tabs
                                    size="sm"
                                    aria-label="Filter"
                                    color="primary"
                                    variant="solid"
                                    selectedKey={filter}
                                    onSelectionChange={(k) =>
                                        setFilter(k as any)
                                    }
                                    className="w-full"
                                >
                                    <Tab key="ALL" title="All Messages" />
                                    <Tab key="UNSEEN" title="Unread" />
                                </Tabs>
                            </div>

                            {/* Scrollable List */}
                            <ScrollShadow className="flex-1 overflow-y-auto">
                                {filteredList.length > 0 ? (
                                    filteredList.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() =>
                                                setSelectedId(item.id)
                                            }
                                            className={`
                          p-4 border-b border-border-default cursor-pointer transition-colors hover:bg-background-hovered relative
                          ${selectedId === item.id ? 'bg-background-hovered hover:bg-background-hovered' : ''}
                          ${item.status === 'UNSEEN' ? 'bg-background-hovered/30' : 'bg-background'}
                          ${selectedId === item.id && item.status === 'UNSEEN' && 'bg-background-hovered!'}
                        `}
                                        >
                                            {/* Unread Indicator */}
                                            {item.status === 'UNSEEN' && (
                                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary"></div>
                                            )}

                                            <div className="flex gap-3 pl-2">
                                                <Avatar
                                                    src={item.sender.avatar}
                                                    name={item.sender.name.charAt(
                                                        0
                                                    )}
                                                    className="shrink-0"
                                                    size="sm"
                                                    isBordered={
                                                        item.status === 'UNSEEN'
                                                    }
                                                    color={
                                                        item.status === 'UNSEEN'
                                                            ? 'primary'
                                                            : 'default'
                                                    }
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4
                                                            className={`text-sm truncate pr-2 ${item.status === `UNSEEN` ? `font-bold text-text-default` : `font-medium text-text-default`}`}
                                                        >
                                                            {item.sender.name}
                                                        </h4>
                                                        <span className="text-[10px] text-text-subdued whitespace-nowrap">
                                                            {item.createdAt}
                                                        </span>
                                                    </div>
                                                    <p
                                                        className={`text-sm truncate mb-1 ${item.status === `UNSEEN` ? `text-text-subdued font-medium` : `text-text-subdued`}`}
                                                    >
                                                        {item.title}
                                                    </p>
                                                    <p className="text-xs text-text-subdued/60 truncate">
                                                        {item.content}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-400 text-sm">
                                        No messages found.
                                    </div>
                                )}
                            </ScrollShadow>
                        </div>

                        {/* --- RIGHT PANEL: Detail View --- */}
                        <div className="flex-1 bg-slate-50/50 flex flex-col h-full overflow-hidden">
                            {selectedMessage ? (
                                <>
                                    {/* Toolbar */}
                                    <div className="h-16 border-b border-border-default flex items-center justify-between px-6 bg-background-muted shrink-0">
                                        <div className="flex gap-2">
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                color="danger"
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                            >
                                                <MoreVertical size={18} />
                                            </Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-xs text-text-subdued self-center mr-2">
                                                {selectedMessage.createdAt}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Message Content */}
                                    <ScrollShadow className="bg-background-muted flex-1 p-8 overflow-y-auto">
                                        <div className="max-w-3xl mx-auto">
                                            {/* Message Header */}
                                            <div className="flex justify-between items-start mb-8">
                                                <div className="flex items-center gap-4">
                                                    <Avatar
                                                        src={
                                                            selectedMessage
                                                                .sender.avatar
                                                        }
                                                        name={selectedMessage.sender.name.charAt(
                                                            0
                                                        )}
                                                        size="lg"
                                                        isBordered
                                                    />
                                                    <div>
                                                        <h2 className="text-xl font-bold text-text-default">
                                                            {
                                                                selectedMessage.title
                                                            }
                                                        </h2>
                                                        <p className="text-sm text-text-subdued">
                                                            From:{' '}
                                                            <span className="text-text-subdued font-medium">
                                                                {
                                                                    selectedMessage
                                                                        .sender
                                                                        .name
                                                                }
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <Chip
                                                    variant="flat"
                                                    color={getColorByType(
                                                        selectedMessage.type
                                                    )}
                                                    startContent={getIconByType(
                                                        selectedMessage.type
                                                    )}
                                                    className="capitalize"
                                                >
                                                    {selectedMessage.type
                                                        .replace('_', ' ')
                                                        .toLowerCase()}
                                                </Chip>
                                            </div>

                                            <Divider className="mb-8" />

                                            {/* Body */}
                                            <div className="prose prose-slate max-w-none text-text-subdued leading-relaxed">
                                                <p>{selectedMessage.content}</p>

                                                {/* Contextual content based on type (simulated) */}
                                                {selectedMessage.type ===
                                                    'JOB_UPDATE' && (
                                                    <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                                        <h4 className="font-bold text-blue-900 text-sm mb-1">
                                                            Job Context
                                                        </h4>
                                                        <p className="text-xs text-blue-700 mb-3">
                                                            Job ID: FV-2094 •
                                                            Client: TechCorp
                                                        </p>
                                                        {selectedMessage.redirectUrl && (
                                                            <Button
                                                                size="sm"
                                                                color="primary"
                                                                endContent={
                                                                    <ExternalLink
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                }
                                                                as="a"
                                                                href={
                                                                    selectedMessage.redirectUrl
                                                                }
                                                            >
                                                                View Job Details
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}

                                                {selectedMessage.type ===
                                                    'SUCCESS' && (
                                                    <div className="mt-6 flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl text-green-800">
                                                        <CheckCircle2 />
                                                        <span className="font-medium text-sm">
                                                            Transaction verified
                                                            successfully.
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </ScrollShadow>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                                        <Bell
                                            size={32}
                                            className="text-slate-400"
                                        />
                                    </div>
                                    <p>Select a message to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </AdminContentContainer>
        </>
    )
}
