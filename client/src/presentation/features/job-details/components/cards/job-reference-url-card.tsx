import { Card, CardBody, CardHeader, Divider, Snippet } from '@heroui/react'
import { LinkIcon } from 'lucide-react'

export const JobReferenceUrlCard = ({ url }: { url: string }) => {
    return (
        <Card shadow="none" className="border border-border-default rounded-xl">
            <CardHeader className="flex items-center gap-2 px-3 py-3 text-sm bg-background-muted font-medium text-text-subdued">
                <LinkIcon size={14} />
                Public Link
            </CardHeader>

            <Divider className="bg-border-muted" />

            <CardBody className="p-3">
                <Snippet
                    symbol=""
                    size="sm"
                    variant="flat"
                    className="w-full border bg-default-50 text-default-900 border-default-200"
                >
                    {url}
                </Snippet>
            </CardBody>
        </Card>
    )
}
