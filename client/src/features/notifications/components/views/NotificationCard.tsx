import { useMarkSeenNotification } from '@/lib/queries/useNotification'
import CadsquadLogo from '@/shared/components/CadsquadLogo'
import { NotificationStatusEnum } from '@/shared/enums/_notification-status.enum'
import type { TUserNotification } from '@/shared/types'
import { Image } from 'antd'
import { dateFormatter } from '../../../../lib'

export function NotificationCard({ data }: { data: TUserNotification }) {
    const markSeenNotification = useMarkSeenNotification()

    return (
        <div
            className="grid grid-cols-[50px_1fr_7px] gap-3 items-center"
            onClick={async () => {
                markSeenNotification.mutateAsync({
                    id: data.id,
                })
            }}
        >
            <div className="w-full aspect-square">
                {data?.imageUrl ? (
                    <div className="size-full aspect-square rounded-full">
                        <Image
                            src={data?.imageUrl}
                            alt="Notification image"
                            className="size-full aspect-square rounded-full object-fit"
                            preview={false}
                        />
                    </div>
                ) : (
                    <div className="size-full aspect-square rounded-full grid place-items-center bg-secondary">
                        <CadsquadLogo
                            classNames={{
                                logo: 'p-1.5',
                            }}
                        />
                    </div>
                )}
            </div>
            <div>
                <p
                    className="text-sm font-medium line-clamp-1"
                    title={data.title ?? ''}
                >
                    {data.title}
                </p>
                <p className="mt-1 text-sm line-clamp-2" title={data.content}>
                    {data.content}
                </p>
                <p className="text-[10px] italic text-text-subdued font-medium">
                    {dateFormatter(data.createdAt, {
                        isDistance: true,
                    })}
                </p>
            </div>
            {data.status === NotificationStatusEnum.UNSEEN && (
                <div className="w-full aspect-square rounded-full bg-gray-500"></div>
            )}
        </div>
    )
}
