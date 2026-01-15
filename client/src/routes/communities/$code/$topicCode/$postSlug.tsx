import {
    Avatar,
    BreadcrumbItem,
    Breadcrumbs,
    Button,
    Card,
    CardBody,
    Chip,
    Divider,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    ScrollShadow,
    Textarea,
    useDisclosure,
} from '@heroui/react'
import { createFileRoute } from '@tanstack/react-router'
import {
    ArrowLeftIcon,
    BoldIcon,
    EyeIcon,
    FlagIcon,
    HashIcon,
    HeartIcon,
    ItalicIcon,
    LinkIcon,
    ListIcon,
    MessageCircleIcon,
    MoreHorizontalIcon,
    ReplyIcon,
    ShareIcon,
    UsersIcon,
} from 'lucide-react'
import { useState } from 'react'

import { HeroButton } from '@/shared/components'

// --- MOCK DATA ---

const MOCK_TOPIC = {
    id: 't-1',
    title: 'Proposal: Migration to new Design System Tokens',
    content: `
    <p>Hi everyone,</p>
    <p>As discussed in the last sync, our current color palette is becoming unmanageable. I'm proposing we switch to a semantic token system (e.g., <code>bg-surface-primary</code> instead of <code>bg-zinc-900</code>).</p>
    <br/>
    <p><strong>Benefits:</strong></p>
    <ul>
        <li>Better Dark/Light mode support</li>
        <li>Easier theming for white-label clients</li>
        <li>Consistency across dev and design</li>
    </ul>
    <br/>
    <p>I've attached the initial mapping document below. Please review by Friday.</p>
  `,
    author: {
        name: 'Sarah Admin',
        avatar: 'https://i.pravatar.cc/150?u=sarah',
        role: 'Design Ops',
    },
    channel: 'Design System',
    timestamp: 'Oct 24, 2024 • 2:30 PM',
    likes: 45,
    views: 1205,
    tags: ['Design', 'Engineering', 'RFC'],
}

const MOCK_COMMENTS = [
    {
        id: 'c-1',
        author: {
            name: 'Bob Engineer',
            avatar: 'https://i.pravatar.cc/150?u=2',
            role: 'Senior Dev',
        },
        content:
            'This looks great, Sarah. One concern: how do we handle the legacy components? Do we plan a gradual migration or a hard cutover?',
        timestamp: '2 hours ago',
        likes: 12,
        replies: [
            {
                id: 'c-1-r1',
                author: {
                    name: 'Sarah Admin',
                    avatar: 'https://i.pravatar.cc/150?u=sarah',
                    role: 'Design Ops',
                },
                content:
                    "Good question! We're planning a gradual rollout. We'll deprecate the old variables but keep them working for 2 quarters",
                timestamp: '1 hour ago',
                likes: 5,
            },
        ],
    },
    {
        id: 'c-2',
        author: {
            name: 'Alice Manager',
            avatar: 'https://i.pravatar.cc/150?u=1',
            role: 'Sales Director',
        },
        content:
            'Will this affect the client presentation decks for next week? We use screenshots of the UI.',
        timestamp: '3 hours ago',
        likes: 3,
        replies: [],
    },
]

// --- ROUTE ---

export const Route = createFileRoute('/communities/$code/$topicCode/$postSlug')(
    {
        component: TopicPage,
    }
)

// --- COMPONENTS ---

export default function TopicPage() {
    const sidebarDisclosure = useDisclosure({ defaultOpen: true })
    const [liked, setLiked] = useState(false)
    const [replyContent, setReplyContent] = useState('')

    return (
        <div className="size-full flex bg-background">
            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header / Breadcrumbs */}
                <div className="h-16 shrink-0 border-b border-border-default flex items-center px-6 justify-between bg-background/50 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <HeroButton
                            isIconOnly
                            variant="light"
                            size="sm"
                            onPress={() => window.history.back()} // In real app, use router.history.goBack()
                        >
                            <ArrowLeftIcon size={18} />
                        </HeroButton>
                        <Breadcrumbs
                            size="sm"
                            separator="/"
                            itemClasses={{
                                item: 'text-text-subdued',
                                separator: 'text-text-subdued/50',
                            }}
                        >
                            <BreadcrumbItem>Community</BreadcrumbItem>
                            <BreadcrumbItem>
                                {MOCK_TOPIC.channel}
                            </BreadcrumbItem>
                            <BreadcrumbItem className="font-semibold text-text-default">
                                Proposal: Migration...
                            </BreadcrumbItem>
                        </Breadcrumbs>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="light"
                            className="hidden sm:flex text-text-subdued hover:text-text-default"
                        >
                            <ShareIcon size={16} /> Share
                        </Button>
                        <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            className="lg:hidden"
                            onPress={sidebarDisclosure.onOpen}
                        >
                            <ListIcon size={18} />
                        </Button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <ScrollShadow className="flex-1 p-4 md:p-8">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* 1. ORIGINAL POST (TOPIC) */}
                        <div className="space-y-4">
                            {/* Tags */}
                            <div className="flex gap-2">
                                {MOCK_TOPIC.tags.map((tag) => (
                                    <Chip
                                        key={tag}
                                        size="sm"
                                        variant="flat"
                                        color="primary"
                                        className="h-6 bg-primary/10 text-primary-400 border border-primary/20"
                                    >
                                        #{tag}
                                    </Chip>
                                ))}
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl font-bold text-text-default leading-tight">
                                {MOCK_TOPIC.title}
                            </h1>

                            {/* Author Meta */}
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        src={MOCK_TOPIC.author.avatar}
                                        size="md"
                                        isBordered
                                        className="ring-border-default"
                                    />
                                    <div>
                                        <div className="text-medium font-semibold text-text-default">
                                            {MOCK_TOPIC.author.name}
                                        </div>
                                        <div className="text-tiny text-text-subdued flex items-center gap-2">
                                            {MOCK_TOPIC.author.role}
                                            <span>•</span>
                                            {MOCK_TOPIC.timestamp}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        color={liked ? 'danger' : 'default'}
                                        onPress={() => setLiked(!liked)}
                                        startContent={
                                            <HeartIcon
                                                size={18}
                                                fill={
                                                    liked
                                                        ? 'currentColor'
                                                        : 'none'
                                                }
                                            />
                                        }
                                        className={
                                            liked
                                                ? ''
                                                : 'bg-background-muted text-text-default'
                                        }
                                    >
                                        {MOCK_TOPIC.likes + (liked ? 1 : 0)}
                                    </Button>
                                </div>
                            </div>

                            <Divider className="my-4 bg-border-default" />

                            {/* Rich Content */}
                            <div
                                className="prose prose-invert prose-zinc max-w-none text-text-default/90 leading-relaxed"
                                dangerouslySetInnerHTML={{
                                    __html: MOCK_TOPIC.content,
                                }}
                            />

                            {/* Post Actions Bar */}
                            <div className="flex items-center gap-4 pt-6">
                                <Button
                                    variant="ghost"
                                    className="text-text-subdued hover:text-text-default"
                                    startContent={<ReplyIcon size={18} />}
                                >
                                    Reply to thread
                                </Button>
                                <div className="flex-1" />
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button
                                            isIconOnly
                                            variant="light"
                                            className="text-text-subdued"
                                        >
                                            <MoreHorizontalIcon size={20} />
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        variant="faded"
                                        aria-label="Topic Actions"
                                    >
                                        <DropdownItem key="copy">
                                            Copy Link
                                        </DropdownItem>
                                        <DropdownItem key="mute">
                                            Mute Thread
                                        </DropdownItem>
                                        <DropdownItem
                                            key="report"
                                            className="text-danger"
                                            color="danger"
                                            startContent={
                                                <FlagIcon size={16} />
                                            }
                                        >
                                            Report
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                        </div>

                        {/* 2. COMMENT SECTION */}
                        <div className="pt-8">
                            <h3 className="text-lg font-semibold text-text-default mb-6 flex items-center gap-2">
                                <MessageCircleIcon size={20} />
                                {MOCK_COMMENTS.length} Comments
                            </h3>

                            {/* Reply Box */}
                            <Card className="bg-background-muted border border-border-default mb-8">
                                <CardBody className="gap-2">
                                    <Textarea
                                        placeholder="Write a reply..."
                                        minRows={2}
                                        variant="bordered"
                                        classNames={{
                                            inputWrapper:
                                                'bg-background border-border-default focus-within:border-primary shadow-none',
                                        }}
                                        value={replyContent}
                                        onValueChange={setReplyContent}
                                    />
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-1">
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                            >
                                                <BoldIcon size={16} />
                                            </Button>
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                            >
                                                <ItalicIcon size={16} />
                                            </Button>
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                            >
                                                <LinkIcon size={16} />
                                            </Button>
                                        </div>
                                        <Button
                                            size="sm"
                                            color="primary"
                                            isDisabled={!replyContent}
                                        >
                                            Post Reply
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Comments List */}
                            <div className="space-y-6">
                                {MOCK_COMMENTS.map((comment) => (
                                    <CommentItem
                                        key={comment.id}
                                        comment={comment}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollShadow>
            </div>

            {/* --- RIGHT SIDEBAR (Topic Info) --- */}
            {/* Hidden on mobile unless toggled, flexible on desktop */}
            <div
                className={`${sidebarDisclosure.isOpen ? `flex` : `hidden`} xl:flex w-80 shrink-0 border-l border-border-default bg-background-muted flex-col`}
            >
                <div className="p-5 border-b border-border-default flex items-center justify-between">
                    <h3 className="font-bold text-text-default text-sm uppercase tracking-wider">
                        Topic Info
                    </h3>
                    <HeroButton
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="xl:hidden"
                        onPress={sidebarDisclosure.onClose}
                    >
                        <ArrowLeftIcon size={16} />
                    </HeroButton>
                </div>

                <div className="p-5 space-y-8">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-background border border-border-default">
                            <div className="text-text-subdued text-xs font-semibold uppercase mb-1 flex items-center gap-1">
                                <EyeIcon size={12} /> Views
                            </div>
                            <div className="text-xl font-bold text-text-default">
                                {MOCK_TOPIC.views.toLocaleString()}
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-background border border-border-default">
                            <div className="text-text-subdued text-xs font-semibold uppercase mb-1 flex items-center gap-1">
                                <UsersIcon size={12} /> Ppl
                            </div>
                            <div className="text-xl font-bold text-text-default">
                                12
                            </div>
                        </div>
                    </div>

                    {/* Channel Context */}
                    <div>
                        <h4 className="text-xs font-bold text-text-subdued uppercase mb-3">
                            In Channel
                        </h4>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border-default cursor-pointer hover:border-primary transition-colors">
                            <div className="size-10 rounded-md bg-zinc-800 flex items-center justify-center text-zinc-400">
                                <HashIcon size={20} />
                            </div>
                            <div>
                                <div className="font-semibold text-text-default text-sm">
                                    Design System
                                </div>
                                <div className="text-tiny text-text-subdued">
                                    Public Channel • 24 Active
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div>
                        <h4 className="text-xs font-bold text-text-subdued uppercase mb-3">
                            Timeline
                        </h4>
                        <div className="relative pl-4 border-l border-border-default space-y-6">
                            <div className="relative">
                                <div className="absolute -left-5.25 top-1 size-2.5 rounded-full bg-primary ring-4 ring-background-muted" />
                                <div className="text-xs text-text-default font-medium">
                                    Topic Created
                                </div>
                                <div className="text-[10px] text-text-subdued">
                                    {MOCK_TOPIC.timestamp}
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-5.25 top-1 size-2.5 rounded-full bg-zinc-600 ring-4 ring-background-muted" />
                                <div className="text-xs text-text-default font-medium">
                                    Last Activity
                                </div>
                                <div className="text-[10px] text-text-subdued">
                                    2 hours ago
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- SUB-COMPONENT: COMMENT ITEM ---

const CommentItem = ({ comment }: { comment: any }) => {
    return (
        <div className="group animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                    <Avatar src={comment.author.avatar} size="sm" />
                    {/* Thread Line */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="w-px flex-1 bg-border-default my-1" />
                    )}
                </div>

                <div className="flex-1 space-y-2">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-text-default hover:underline cursor-pointer">
                                {comment.author.name}
                            </span>
                            <span className="text-xs text-text-subdued bg-zinc-800/50 px-1.5 py-0.5 rounded">
                                {comment.author.role}
                            </span>
                            <span className="text-tiny text-text-subdued">
                                • {comment.timestamp}
                            </span>
                        </div>
                    </div>

                    {/* Body */}
                    <p className="text-sm text-text-default/90 leading-relaxed">
                        {comment.content}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-1">
                        <button className="flex items-center gap-1.5 text-xs font-medium text-text-subdued hover:text-text-default transition-colors">
                            <HeartIcon size={14} /> {comment.likes}
                        </button>
                        <button className="flex items-center gap-1.5 text-xs font-medium text-text-subdued hover:text-text-default transition-colors">
                            <MessageCircleIcon size={14} /> Reply
                        </button>
                    </div>

                    {/* Nested Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="pt-4 space-y-4">
                            {comment.replies.map((reply: any) => (
                                <CommentItem key={reply.id} comment={reply} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
