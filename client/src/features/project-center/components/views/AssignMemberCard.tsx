'use client'

import { Button, Skeleton } from '@heroui/react'
import { Image } from 'antd'
import { X } from 'lucide-react'

import { useProfile } from '@/lib/queries'

import { optimizeCloudinary } from '../../../../lib/cloudinary'
import { TUser } from '../../../../shared/types'

type AssignMemberCardProps = {
    data: TUser
    onRemoveMember: (memberId: string) => void
}
export default function AssignMemberCard({
    data,
    onRemoveMember,
}: AssignMemberCardProps) {
    const { isAdmin } = useProfile()
    return (
        <div className="group flex items-center justify-between px-2 py-1.5 hover:bg-text-3 rounded-md">
            <div className="flex items-center justify-start gap-4">
                <Image
                    src={optimizeCloudinary(data?.avatar)}
                    alt="user avatar"
                    rootClassName="!size-10 rounded-full"
                    className="size-full! rounded-full"
                    preview={false}
                />
                <div>
                    <p className="font-semibold">{data?.displayName}</p>
                    <p className="text-text-subdued font-normal!">
                        {data?.email}
                    </p>
                </div>
            </div>
            {isAdmin && (
                <Button
                    isIconOnly
                    size="sm"
                    color="danger"
                    className="hidden group-hover:flex"
                    title="Remove"
                    onPress={() => {
                        onRemoveMember(data.id)
                    }}
                >
                    <X size={14} />
                </Button>
            )}
        </div>
    )
}
export function AssignMemberCardSkeleton() {
    return (
        <div className="flex items-center justify-between px-2 py-1.5 w-full">
            <div className="flex items-center justify-start gap-4 w-full">
                {/* Avatar Skeleton */}
                <div>
                    <Skeleton className="flex rounded-full w-10 h-10" />
                </div>

                {/* Text Details Skeleton */}
                <div className="w-full flex flex-col gap-2">
                    {/* Display Name placeholder */}
                    <Skeleton className="h-3 w-24 rounded-lg" />

                    {/* Email placeholder */}
                    <Skeleton className="h-2 w-32 rounded-lg" />
                </div>
            </div>

            {/* We don't render the X button skeleton because 
          it's hidden by default in the real component */}
        </div>
    )
}
