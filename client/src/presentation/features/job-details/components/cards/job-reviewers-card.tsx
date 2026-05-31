import {
    Avatar,
    Card,
    CardBody,
    CardHeader,
    Divider,
    Tooltip,
} from '@heroui/react'
import { ContactRoundIcon } from 'lucide-react'
import { TJob } from '@/presentation/types'

export const JobReviewersCard = ({
    reviewers,
}: {
    reviewers: TJob['reviewers']
}) => {
    return (
        <Card shadow="none" className="border border-border-default rounded-xl">
            <CardHeader className="flex items-center gap-2 px-3 py-3 text-sm bg-background-muted font-medium text-text-subdued">
                <ContactRoundIcon size={16} />
                Reviewers ({reviewers.length})
            </CardHeader>

            <Divider className="bg-border-muted" />

            <CardBody className="p-3">
                <div className="flex items-center justify-start gap-3">
                    {reviewers.map((usr, idx) => {
                        return (
                            <Tooltip
                                key={usr.id || idx}
                                content={usr.displayName}
                            >
                                <Avatar
                                    className="cursor-pointer"
                                    src={usr.avatar}
                                    isBordered
                                />
                            </Tooltip>
                        )
                    })}
                </div>
            </CardBody>
        </Card>
    )
}
