import {
    Avatar,
    Button,
    Card,
    CardFooter,
    Chip,
    Divider,
    ScrollShadow,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tabs,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { Image } from 'antd'
import {
    DownloadIcon,
    FileSpreadsheetIcon,
    FileTextIcon,
    FilterIcon,
    PlusIcon,
} from 'lucide-react'
import { useState } from 'react'
import { optimizeCloudinary } from '@/lib'
import {
    communitiesPostsListOptions,
    topicQueries,
} from '@/lib/queries/options/community-queries'
import CreatePost from '@/features/communities/components/modals/CreatePost'
import { communitiesStore } from '@/shared/stores/_communities.store'
import PostsView from '../../../../features/communities/components/views/PostsView'

export const MOCK_FILES = [
    {
        id: 'f-1',
        name: 'Q4_Sales_Report.xlsx',
        type: 'EXCEL',
        size: '2.4 MB',
        author: 'Alice Manager',
        date: 'Oct 24',
    },
    {
        id: 'f-2',
        name: 'Brand_Guidelines_V2.pdf',
        type: 'PDF',
        size: '14 MB',
        author: 'Marketing Team',
        date: 'Oct 22',
    },
    {
        id: 'f-3',
        name: 'Project_X_Specs.docx',
        type: 'DOC',
        size: '850 KB',
        author: 'Bob Engineer',
        date: 'Oct 20',
    },
    {
        id: 'f-4',
        name: 'Meeting_Minutes_Oct.txt',
        type: 'TEXT',
        size: '12 KB',
        author: 'Sarah Admin',
        date: 'Oct 18',
    },
]

export const MOCK_PHOTOS = [
    {
        id: 'img-1',
        src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
        caption: 'Team Building 2024',
    },
    {
        id: 'img-2',
        src: 'https://images.unsplash.com/photo-1551434678-e076c223a692',
        caption: 'New Warehouse Opening',
    },
    {
        id: 'img-3',
        src: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0',
        caption: 'Strategy Meeting',
    },
    {
        id: 'img-4',
        src: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952',
        caption: 'Q3 Awards',
    },
]

export const UPCOMING_EVENTS = [
    {
        id: 'ev-1',
        title: 'Q4 Strategy Kickoff',
        date: 'Mon, Oct 28 • 10:00 AM',
        location: 'Meeting Room A',
    },
    {
        id: 'ev-2',
        title: 'Happy Hour',
        date: 'Fri, Nov 01 • 5:00 PM',
        location: 'Lounge Area',
    },
]

export const MOCK_POSTS = [
    {
        id: 'p-1',
        author: {
            name: 'Alice Manager',
            avatar: 'https://i.pravatar.cc/150?u=1',
            role: 'Sales Director',
        },
        content:
            'Reminder: The Q4 strategy kickoff is happening this Monday. Please review the attached pre-read materials.',
        timestamp: '2 hours ago',
        likes: 24,
        comments: 5,
        isAnnouncement: true,
        hasEvent: true, // Special styling
        eventId: 'ev-1',
    },
    {
        id: 'p-2',
        author: {
            name: 'Bob Engineer',
            avatar: 'https://i.pravatar.cc/150?u=2',
            role: 'Senior Dev',
        },
        content:
            "Does anyone have access to the old CAD server? I'm getting a timeout error.",
        timestamp: '5 hours ago',
        likes: 2,
        comments: 12,
        isAnnouncement: false,
    },
]

export const Route = createFileRoute('/communities/$code/$topicCode/')({
    loader({ context, params }) {
        const { code, topicCode } = params
        return context.queryClient.ensureQueryData({
            ...topicQueries(code, topicCode),
        })
    },
    component: TopicPage,
})

export default function TopicPage() {
    const { code, topicCode } = Route.useParams()
    const { data: topic } = useSuspenseQuery({
        ...topicQueries(code, topicCode),
    })
    const { data: posts } = useSuspenseQuery({
        ...communitiesPostsListOptions(code),
    })
    const [activeTab, setActiveTab] = useState('posts')

    const isWritingPost = useStore(
        communitiesStore,
        (state) => state.isWritingPost
    )
    // 1. FILES VIEW
    const FilesView = () => (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">Documents</h3>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="flat"
                        startContent={<FilterIcon size={16} />}
                    >
                        Filter
                    </Button>
                    <Button
                        size="sm"
                        color="primary"
                        startContent={<PlusIcon size={16} />}
                    >
                        Upload
                    </Button>
                </div>
            </div>
            <Table
                aria-label="Files table"
                classNames={{
                    base: 'bg-zinc-900',
                    th: 'bg-zinc-800 text-zinc-400',
                    td: 'text-zinc-300',
                    wrapper: 'bg-zinc-900 border border-zinc-800 p-0',
                }}
            >
                <TableHeader>
                    <TableColumn>NAME</TableColumn>
                    <TableColumn>TYPE</TableColumn>
                    <TableColumn>SIZE</TableColumn>
                    <TableColumn>AUTHOR</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                    {MOCK_FILES.map((file) => (
                        <TableRow
                            key={file.id}
                            className="hover:bg-zinc-800/50 cursor-pointer transition-colors"
                        >
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-zinc-800 rounded text-zinc-400">
                                        {file.type === 'EXCEL' ? (
                                            <FileSpreadsheetIcon
                                                size={18}
                                                className="text-green-500"
                                            />
                                        ) : file.type === 'PDF' ? (
                                            <FileTextIcon
                                                size={18}
                                                className="text-red-500"
                                            />
                                        ) : (
                                            <FileTextIcon size={18} />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-zinc-200">
                                            {file.name}
                                        </span>
                                        <span className="text-xs text-zinc-500">
                                            {file.date}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    className="text-xs"
                                >
                                    {file.type}
                                </Chip>
                            </TableCell>
                            <TableCell>{file.size}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Avatar
                                        size="sm"
                                        src={`https://i.pravatar.cc/150?u=${file.author}`}
                                    />
                                    <span>{file.author}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Button isIconOnly size="sm" variant="light">
                                    <DownloadIcon
                                        size={16}
                                        className="text-zinc-500"
                                    />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )

    // 2. PHOTOS VIEW
    const PhotosView = () => (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">Gallery</h3>
                <Button
                    size="sm"
                    color="primary"
                    startContent={<PlusIcon size={16} />}
                >
                    Add Photo
                </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {MOCK_PHOTOS.map((photo) => (
                    <Card key={photo.id} isPressable className="border-none">
                        <Image
                            alt={photo.caption}
                            className="z-0 w-full h-full object-cover aspect-square hover:scale-110 transition-transform duration-300"
                            src={photo.src}
                        />
                        <CardFooter className="absolute bg-black/40 bottom-0 border-t-1 border-zinc-100/10 z-10 justify-between">
                            <p className="text-tiny text-white/90">
                                {photo.caption}
                            </p>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )

    // 3. POSTS VIEW (Feed)

    return (
        <div className="size-full">
            {/* --- CENTER CONTENT --- */}
            <div className="size-full">
                <div className="px-7 pt-3 pb-4 w-full flex items-center justify-between">
                    <div className="flex items-center justify-start gap-3">
                        <Image
                            src={optimizeCloudinary(topic.icon, {
                                width: 512,
                                height: 512,
                            })}
                            rootClassName="size-10"
                            className="rounded-md"
                            preview={false}
                        />
                        <h1 className="text-lg font-bold text-text-default">
                            {topic.title}
                        </h1>
                        <Tabs
                            selectedKey={activeTab}
                            onSelectionChange={(k) => setActiveTab(k as string)}
                            variant="underlined"
                            color="primary"
                            classNames={{
                                base: 'ml-1',
                                tabContent:
                                    'group-data-[selected=true]:text-text-default group-data-[selected=true]:font-medium font-medium',
                            }}
                        >
                            <Tab key="posts" title="Posts" />
                            <Tab key="files" title="Files" />
                            <Tab key="photos" title="Photos" />
                        </Tabs>
                    </div>
                </div>
            </div>
            <Divider />
            {/* Scrollable Main Area */}
            <ScrollShadow className="flex-1">
                {activeTab === 'posts' && (
                    <div className="p-6 size-full space-y-6">
                        <CreatePost title={topic.title} />
                        {/* Feed */}
                        {!isWritingPost && <PostsView posts={posts} />}
                    </div>
                )}
                {activeTab === 'files' && <FilesView />}
                {activeTab === 'photos' && <PhotosView />}
            </ScrollShadow>
        </div>
    )
}
