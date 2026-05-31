import { dateFormatter } from '@/presentation/lib'
import { TJob } from '@/presentation/types'
import { Avatar, Card, CardBody, CardHeader, Divider } from '@heroui/react'
import { CirclePlus } from 'lucide-react'

export const JobCreatorCard = ({
    creator,
    createdAt,
}: {
    creator: TJob['createdBy']
    createdAt: Date | string
}) => {
    return (
        <Card shadow="none" className="border border-border-default rounded-xl">
            <CardHeader className="flex items-center gap-2 px-3 py-3 text-sm bg-background-muted font-medium text-text-subdued">
                <CirclePlus size={16} />
                Created By
            </CardHeader>

            <Divider className="bg-border-muted" />

            <CardBody className="p-3">
                <div className="flex items-center gap-3">
                    <Avatar src={creator.avatar} size="md" />
                    <div className="flex flex-col">
                        <p className="text-sm font-bold text-default-900">
                            {creator.displayName}
                        </p>
                        <p className="text-xs text-default-500 mt-0.5 flex items-center gap-1">
                            {dateFormatter(createdAt, {
                                format: 'fullShort',
                            })}
                        </p>
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}
