import { Card, CardBody, CardHeader, Divider } from '@heroui/react'
import HtmlReactParser from '@/shared/components/ui/html-react-parser'

export const JobDescriptionCard = ({ data }: { data: string }) => {
    return (
        <Card shadow="none" className="border border-border-default rounded-xl">
            <CardHeader className="flex items-center gap-2 px-3 py-3 text-sm bg-background-muted">
                Description
            </CardHeader>

            <Divider className="bg-border-muted" />

            <CardBody className="p-3">
                <div className="p-4 text-sm leading-relaxed text-default-700 min-h-25">
                    {data ? (
                        <HtmlReactParser htmlString={data} />
                    ) : (
                        <p className="py-6 italic text-center text-default-400">
                            No description provided.
                        </p>
                    )}
                </div>
            </CardBody>
        </Card>
    )
}
