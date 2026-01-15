import { Avatar } from '@heroui/react'
import { MoreVertical } from 'lucide-react'

import { optimizeCloudinary } from '@/lib'
import { TUser } from '@/shared/types'

type TopPerformersProps = {
    data: TUser[]
}
export const TopPerformers = ({ data }: TopPerformersProps) => {
    return (
        <div className="bg-background-muted p-6 rounded-2xl border border-border-default shadow-xs">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-text-default">Top Performers</h3>
                <div className="flex bg-background rounded-lg p-1">
                    <button className="px-3 py-1 text-xs font-medium rounded-md bg-background-muted shadow-sm text-text-default">
                        7d
                    </button>
                    <button className="px-3 py-1 text-xs font-medium rounded-md text-text-subdued hover:text-text-default">
                        1m
                    </button>
                    <button className="px-3 py-1 text-xs font-medium rounded-md text-text-subdued hover:text-text-default">
                        1y
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.map((user) => (
                    <div
                        key={user.id}
                        className="flex items-center p-3 rounded-xl border border-border-default hover:border-primary-100 hover:dark:border-primary-100/20 hover:dark:bg-primary-50/20 hover:bg-primary-50 transition-all group cursor-pointer"
                    >
                        <Avatar
                            src={optimizeCloudinary(user.avatar, {
                                width: 256,
                                height: 256,
                            })}
                        />
                        <div className="pl-3 flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-text-default truncate">
                                {user.displayName}
                            </h4>
                            <p className="text-xs text-slate-400 truncate group-hover:text-primary-600">
                                {user.email}
                            </p>
                        </div>
                        <button className="text-slate-300 hover:text-slate-600">
                            <MoreVertical className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
