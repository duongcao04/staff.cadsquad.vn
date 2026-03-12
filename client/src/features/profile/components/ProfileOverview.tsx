import { HeroCopyButton } from '@/shared/components/ui/hero-copy-button'
import type { TUser } from '@/shared/types'
import {
    Building2,
    CircleUserRound,
    Mail,
    MessageCircleMore,
    Phone,
} from 'lucide-react'

type ProfileOverviewProps = {
    data: TUser
}
export function ProfileOverview({ data }: ProfileOverviewProps) {
    return (
        <div className="mt-4">
            <div className="space-y-4">
                <div className="flex items-center justify-start gap-4 hover:bg-background-hovered px-3 py-2 rounded-md">
                    <Mail
                        size={28}
                        strokeWidth={2}
                        className="text-text-subdued"
                    />
                    <div className="w-full flex items-center justify-between gap-2">
                        <div>
                            <p className="text-xs text-text-subdued">Email</p>
                            <a
                                href={`mailto:${data?.email}`}
                                className="text-sm font-medium text-text-subdued hover:underline"
                                target="_blank"
                            >
                                {data.email}
                            </a>
                        </div>
                        <HeroCopyButton textValue={data.email} />
                    </div>
                </div>

                <div className="flex items-center justify-start gap-4 hover:bg-background-hovered px-3 py-2 rounded-md">
                    <MessageCircleMore
                        size={28}
                        strokeWidth={2}
                        className="text-text-subdued"
                    />
                    <div className="w-full flex items-center justify-between gap-2">
                        <div>
                            <p className="text-xs text-text-subdued">Chat</p>
                            <a
                                href={`mailto:${data?.email}`}
                                className="text-sm font-medium text-text-subdued hover:underline"
                                target="_blank"
                            >
                                {data.personalEmail ?? data.email}
                            </a>
                        </div>
                        <HeroCopyButton
                            textValue={data.personalEmail ?? data.email}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-start gap-4 hover:bg-background-hovered px-3 py-2 rounded-md">
                    <Building2
                        size={28}
                        strokeWidth={2}
                        className="text-text-subdued"
                    />
                    <div>
                        <p className="text-xs text-text-subdued">Department</p>
                        <p className="mt-1 text-sm font-medium text-text-default hover:underline">
                            {data.department?.displayName}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-start gap-4 hover:bg-background-hovered px-3 py-2 rounded-md">
                    <CircleUserRound
                        size={28}
                        strokeWidth={2}
                        className="text-text-subdued"
                    />
                    <div>
                        <p className="text-xs text-text-subdued">Job title</p>
                        <p className="mt-1 text-sm font-medium text-text-default hover:underline">
                            {data.jobTitle?.displayName ?? '-'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-start gap-4 hover:bg-background-hovered px-3 py-2 rounded-md">
                    <Phone
                        size={28}
                        strokeWidth={2}
                        className="text-text-subdued"
                    />
                    <div className="w-full flex items-center justify-between gap-2">
                        <div>
                            <p className="text-xs text-text-subdued">
                                Telephone
                            </p>
                            <a
                                href={`tel:${data?.phoneNumber}`}
                                className="text-sm font-medium text-text-subdued hover:underline"
                                target="_blank"
                            >
                                {data.phoneNumber}
                            </a>
                        </div>
                        <HeroCopyButton textValue={data.phoneNumber ?? ''} />
                    </div>
                </div>
            </div>
        </div>
    )
}
