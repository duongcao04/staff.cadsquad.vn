import {
    Chip,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Avatar,
    Dropdown,
    Button,
    Divider,
} from '@heroui/react'
import {
    MoreHorizontalIcon,
    HeartIcon,
    MessageCircleIcon,
    ShareIcon,
} from 'lucide-react'
import { useState } from 'react'
import { optimizeCloudinary, dateFormatter } from '../../../../lib'
import { TPost } from '../../../../shared/types'
import {
    HeroCard,
    HeroCardHeader,
    HeroCardBody,
    HeroCardFooter,
} from '../../../../shared/components/ui/hero-card'
import lodash from 'lodash'

type PostsViewProps = {
    posts: TPost[]
}
export default function PostsView({ posts }: PostsViewProps) {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {posts.map((post) => (
                <PostCard post={post} key={post.id} />
            ))}
        </div>
    )
}

function PostCard({ post }: { post: TPost }) {
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

    const toggleLike = (id: string) => {
        const next = new Set(likedPosts)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setLikedPosts(next)
    }
    const hasEvent = lodash.isEmpty(post.event)

    return (
        <HeroCard
            key={post.id}
            className="bg-background border border-border-default"
        >
            <HeroCardHeader className="justify-between items-start pb-0">
                <div className="flex gap-3">
                    <Avatar
                        src={optimizeCloudinary(post.author.avatar, {
                            width: 56,
                            height: 56,
                        })}
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-small font-medium text-text-default">
                                {post.author.displayName}
                            </h4>
                            {post.isPinned && (
                                <Chip
                                    size="sm"
                                    color="warning"
                                    variant="flat"
                                    className="h-5 px-1 text-[10px]"
                                >
                                    Announcement
                                </Chip>
                            )}
                        </div>
                        <span className="text-tiny text-text-subdued">
                            {post.author.role} • {dateFormatter(post.createdAt)}
                        </span>
                    </div>
                </div>
                <Dropdown>
                    <DropdownTrigger>
                        <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            className="text-zinc-500"
                        >
                            <MoreHorizontalIcon size={18} />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu variant="faded" aria-label="Post Actions">
                        <DropdownItem key="save">Save Post</DropdownItem>
                        <DropdownItem key="mute">
                            Mute Notifications
                        </DropdownItem>
                        <DropdownItem
                            key="report"
                            className="text-danger"
                            color="danger"
                        >
                            Report
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </HeroCardHeader>

            <HeroCardBody className="py-4 text-text-default gap-3">
                <p>{post.content}</p>
                {/* Event Attachment HeroCard */}
                {hasEvent && (
                    <div className="flex gap-4 p-3 rounded-lg bg-background-muted border border-border-default cursor-pointer hover:border-primary transition-colors">
                        <div className="w-12 h-12 rounded-lg bg-red-900/30 text-red-500 flex flex-col items-center justify-center border border-red-900/50">
                            <span className="text-[10px] font-bold uppercase">
                                OCT
                            </span>
                            <span className="text-lg font-bold leading-none">
                                28
                            </span>
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="font-bold text-text-default">
                                Q4 Strategy Kickoff
                            </span>
                            <span className="text-xs text-text-subdued">
                                Mon • 10:00 AM • Meeting Room A
                            </span>
                        </div>
                        <Button
                            size="sm"
                            variant="flat"
                            className="ml-auto self-center"
                        >
                            RSVP
                        </Button>
                    </div>
                )}
            </HeroCardBody>

            <Divider />

            <HeroCardFooter className="gap-6 pt-3">
                <button
                    onClick={() => toggleLike(post.id)}
                    className={`cursor-pointer flex items-center gap-2 text-small transition-colors ${likedPosts.has(post.id) ? `text-pink-500` : `text-text-default/80 hover:text-text-subdued`}`}
                >
                    <HeartIcon
                        size={18}
                        fill={likedPosts.has(post.id) ? 'currentColor' : 'none'}
                    />
                    <span>{post.likeCount}</span>
                </button>
                <button
                    className="cursor-pointer flex items-center gap-2 text-text-default/80 hover:text-blue-500 transition-colors text-small"
                    // onClick={() => {
                    //     if (topic?.community?.code) {
                    //         router.navigate({
                    //             href: INTERNAL_URLS.getPostDetailUrl(
                    //                 topic.community.code,
                    //                 topic.code,
                    //                 'a'
                    //             ),
                    //         })
                    //     }
                    // }}
                >
                    <MessageCircleIcon size={18} />
                    <span>Comments</span>
                </button>
                <button className="cursor-pointer flex items-center gap-2 text-text-default/80 hover:text-zinc-200 transition-colors text-small ml-auto">
                    <ShareIcon size={18} />
                    <span>Share</span>
                </button>
            </HeroCardFooter>
        </HeroCard>
    )
}
