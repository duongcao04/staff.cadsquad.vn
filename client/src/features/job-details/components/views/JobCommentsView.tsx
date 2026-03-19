import { dateFormatter, linkify, optimizeCloudinary, useProfile } from '@/lib'
import { jobCommentsOptions, useCreateJobCommentMutation } from '@/lib/queries'
import { Avatar, Button, Divider, Skeleton } from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
    Bold,
    ChevronDown,
    Italic,
    MessageSquareMore,
    ReplyIcon,
    Underline,
} from 'lucide-react'
import { Suspense, useMemo, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { TJob, TJobComment } from '../../../../shared/types'
import {
    HeroCard,
    HeroCardBody,
    HeroCardFooter,
    HeroCardHeader,
} from '../../../../shared/components/ui/hero-card'
import HtmlReactParser from '../../../../shared/components/ui/html-react-parser'
import { RichInput } from '../../../../shared/components/ui/rich-input'

export default function JobCommentsView({ job }: { job: TJob }) {
    return (
        <div className="space-y-5 animate-in fade-in duration-500">
            {/* Luôn hiển thị khu vực thêm comment */}
            <AddCommentArea jobId={job.id} />

            <Divider />

            <div className="px-1">
                <ErrorBoundary
                    fallback={
                        <p className="text-center text-danger py-4">
                            Could not load comments.
                        </p>
                    }
                >
                    <Suspense fallback={<CommentsSkeleton />}>
                        {/* Tách riêng phần fetch data sang component này */}
                        <CommentsList job={job} />
                    </Suspense>
                </ErrorBoundary>
            </div>
        </div>
    )
}

function AddCommentArea({ jobId, parentId, onSuccess, autoFocus }: any) {
    const { data: profile } = useProfile()

    const createCommentMutation = useCreateJobCommentMutation()

    const [content, setContent] = useState('')

    const applyFormat = (command: string) => {
        document.execCommand(command, false)
    }

    const onSubmit = async () => {
        // Remove HTML tags to check if the comment is actually empty

        const strippedContent = content.replace(/<[^>]*>/g, '').trim()
        if (!strippedContent) return

        await createCommentMutation.mutateAsync({
            jobId,
            data: { content: content, parentId: parentId || null },
        })

        setContent('')

        if (onSuccess) onSuccess()
    }

    return (
        <HeroCard className="border-border-default shadow-none bg-background">
            <HeroCardHeader className="flex flex-row justify-between items-center py-2 px-3">
                <div className="flex items-center gap-2">
                    <Avatar
                        src={optimizeCloudinary(profile?.avatar)}
                        size="sm"
                        className="size-5"
                    />

                    <span className="text-[11px] font-medium text-default-500 italic">
                        {parentId ? 'Replying...' : 'Add a comment'}
                    </span>
                </div>

                <div className="flex gap-1">
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="h-6 w-6"
                        onPress={() => applyFormat('bold')}
                    >
                        <Bold size={12} />
                    </Button>

                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="h-6 w-6"
                        onPress={() => applyFormat('italic')}
                    >
                        <Italic size={12} />
                    </Button>

                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="h-6 w-6"
                        onPress={() => applyFormat('underline')}
                    >
                        <Underline size={12} />
                    </Button>
                </div>
            </HeroCardHeader>

            <Divider />

            <HeroCardBody className="p-0">
                <RichInput
                    value={content}
                    onChange={setContent}
                    autoFocus={autoFocus}
                    placeholder={
                        parentId ? 'Write a reply...' : 'Write a comment...'
                    }
                />
            </HeroCardBody>

            <HeroCardFooter className="justify-end gap-2 border-t border-divider py-1.5 px-3">
                <Button
                    size="sm"
                    color="primary"
                    radius="full"
                    className="h-7 text-xs font-bold"
                    onPress={onSubmit}
                    isLoading={createCommentMutation.isPending}
                >
                    {parentId ? 'Post Reply' : 'Post Comment'}
                </Button>
            </HeroCardFooter>
        </HeroCard>
    )
}

export function CommentsList({ job }: { job: TJob }) {
    const {
        data: { comments },
    } = useSuspenseQuery(jobCommentsOptions(job.id))

    const rootComments = useMemo(
        () => comments?.filter((c: TJobComment) => !c.parentId) || [],
        [comments]
    )

    return (
        <>
            <h3 className="text-sm font-medium mb-6">
                Discussion ({comments?.length || 0})
            </h3>

            <div className="max-w-4xl mx-auto space-y-6">
                {rootComments.length === 0 ? (
                    <EmptyCommentsState />
                ) : (
                    rootComments.map((comment: any) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            jobId={job.id}
                        />
                    ))
                )}
            </div>
        </>
    )
}

export function CommentsSkeleton() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto mt-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 items-start animate-pulse">
                    <Skeleton className="size-8 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="flex justify-between w-full">
                            <Skeleton className="w-24 h-3 rounded-lg" />
                            <Skeleton className="w-16 h-3 rounded-lg" />
                        </div>
                        <Skeleton className="w-full h-16 rounded-xl" />
                        <Skeleton className="w-12 h-3 rounded-lg ml-1" />
                    </div>
                </div>
            ))}
        </div>
    )
}
function CommentItem({
    comment,
    jobId,
    isReply = false,
}: {
    comment: TJobComment
    jobId: string
    isReply?: boolean
}) {
    const [isReplying, setIsReplying] = useState(false)
    const [showReply, setShowReply] = useState<boolean>(false)

    return (
        <div className="flex flex-col gap-3 relative animate-in fade-in slide-in-from-bottom-2 duration-400">
            <div className="flex gap-3 items-start">
                <Avatar
                    src={optimizeCloudinary(comment.user.avatar)}
                    name={comment.user.displayName}
                    size="sm"
                    className="mt-1 shrink-0 shadow-sm"
                />

                <div className="flex-1 min-w-0">
                    <div className="border border-divider p-3 rounded-xl rounded-tl-none bg-content1 shadow-xs group hover:border-default-400 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-default-900">
                                {comment.user.displayName}
                            </span>
                            <span className="text-[10px] text-default-400 font-medium">
                                {dateFormatter(comment.createdAt, {
                                    format: 'longDate',
                                })}
                            </span>
                        </div>

                        <div className="text-sm text-default-600 leading-relaxed whitespace-pre-wrap">
                            <HtmlReactParser
                                htmlString={linkify(comment.content)}
                            />
                        </div>
                    </div>

                    {!isReply && (
                        <div className="flex items-center gap-4 mt-1 px-1">
                            <button
                                onClick={() => setIsReplying(!isReplying)}
                                className="text-[11px] font-medium text-text-subdued hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <ReplyIcon size={12} />
                                {isReplying ? 'Cancel' : 'Reply'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* FORM REPLY */}
            {isReplying && (
                <div className="ml-11 mt-1 animate-in zoom-in-95 duration-200">
                    <AddCommentArea
                        jobId={jobId}
                        parentId={comment.id}
                        onSuccess={() => setIsReplying(false)}
                        autoFocus
                    />
                </div>
            )}

            <div className="ml-10 ">
                {!showReply! &&
                    comment.replies &&
                    comment.replies?.length > 0 && (
                        <div
                            className="flex items-center justify-start gap-1 cursor-pointer text-text-subdued font-medium"
                            onClick={() => {
                                setShowReply(true)
                            }}
                        >
                            <ChevronDown size={12} />
                            <p className="text-xs">
                                View all {comment.replies.length} replies
                            </p>
                        </div>
                    )}
                {/* HIỂN THỊ REPLIES VỚI ĐƯỜNG KẺ XANH */}
                {showReply && comment.replies && comment.replies.length > 0 && (
                    // ml-4 hoặc ml-5 tùy vào kích thước Avatar để đường kẻ nằm giữa Avatar
                    <div className="pl-4 border-l-2 border-divider hover:border-primary/50 transition-colors mt-1 space-y-5">
                        {comment.replies.map((reply: any) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                jobId={jobId}
                                isReply={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export function EmptyCommentsState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in zoom-in-95 duration-500">
            {/* Icon Container với hiệu ứng vòng tròn mờ */}
            <div className="relative mb-4">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl scale-150 animate-pulse" />
                <div className="relative bg-content2 border border-divider p-4 rounded-full shadow-sm">
                    <MessageSquareMore
                        size={32}
                        className="text-primary/60"
                        strokeWidth={1.5}
                    />
                </div>
            </div>

            {/* Text Content */}
            <h4 className="text-base font-medium text-default-700">
                No discussion yet
            </h4>
            <p className="text-sm text-default-500 max-w-60 mt-1 leading-relaxed">
                Be the first to share your thoughts or updates about this job.
            </p>

            {/* Một chi tiết nhỏ để hướng dẫn người dùng nhìn lên ô input */}
            <div className="mt-6 flex flex-col items-center gap-2 text-primary-500/50 animate-bounce">
                <span className="text-[10px] font-bold uppercase tracking-widest">
                    Start here
                </span>
                <div className="w-px h-8 bg-linear-to-b from-primary/50 to-transparent" />
            </div>
        </div>
    )
}
