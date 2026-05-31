import { dateFormatter, JobHelper, sharepointFolderItemsOptions } from '@/presentation/lib'
import { TJob } from '@/presentation/types'
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Divider,
    Tooltip,
} from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { Cloud, ExternalLink, Folder } from 'lucide-react'

export const JobSharepointDetailCard = ({ job }: { job: TJob }) => {
    const sharepointDisplay = JobHelper.getSharepointDisplay(job)

    const { data } = useQuery({
        ...sharepointFolderItemsOptions(job.sharepointFolder?.itemId || '-1'),
        enabled: !!job.sharepointFolderId && !!job.sharepointFolder?.itemId,
    })
    const sharepointFolderChilds = data?.items || []

    const resultFolder =
        sharepointFolderChilds.filter((it) =>
            JobHelper.sharepointResultFolderRegex.test(it.name)
        )?.[0] || null

    return (
        <Card shadow="none" className="border border-border-default rounded-xl">
            <CardHeader className="flex items-center gap-2 px-3 py-3 text-sm bg-background-muted font-medium text-text-subdued">
                <Cloud size={20} />
                SharePoint Directory
            </CardHeader>

            <Divider className="bg-border-muted" />

            <CardBody className="p-3">
                <div className="flex flex-col gap-4">
                    {/* Main Folder Identity */}
                    <div className="flex items-start gap-3 p-3 border bg-default-50/50 rounded-xl border-default-100">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary mt-0.5">
                            <Folder
                                fontSize={18}
                                fill="currentColor"
                                className="opacity-80"
                            />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                            <span
                                className="text-sm font-bold truncate text-default-900"
                                title={sharepointDisplay.folderName}
                            >
                                {sharepointDisplay.folderName}
                            </span>
                            <span className="text-xs text-default-500 mt-0.5">
                                {job?.sharepointFolder?.isFolder
                                    ? 'Folder'
                                    : 'File Link'}
                            </span>
                        </div>
                    </div>

                    {/* Extended Metadata Grid */}
                    {(job?.sharepointFolder || job?.folderTemplate) && (
                        <div className="grid grid-cols-2 gap-3 px-1">
                            {/* Size (If available) */}
                            {job?.sharepointFolder?.size ||
                            job?.folderTemplate?.size ? (
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-default-400 tracking-wider mb-1">
                                        Size
                                    </p>
                                    <p className="text-xs font-medium text-default-700">
                                        {(() => {
                                            const bytes =
                                                job.sharepointFolder?.size ||
                                                job.folderTemplate?.size ||
                                                0
                                            if (bytes === 0) return '0 B'
                                            const k = 1024
                                            const sizes = [
                                                'B',
                                                'KB',
                                                'MB',
                                                'GB',
                                                'TB',
                                            ]
                                            const i = Math.floor(
                                                Math.log(bytes) / Math.log(k)
                                            )
                                            return (
                                                parseFloat(
                                                    (
                                                        bytes / Math.pow(k, i)
                                                    ).toFixed(2)
                                                ) +
                                                ' ' +
                                                sizes[i]
                                            )
                                        })()}
                                    </p>
                                </div>
                            ) : null}

                            {/* Created By */}
                            {job?.sharepointFolder?.createdBy && (
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-default-400 tracking-wider mb-1">
                                        Created By
                                    </p>
                                    <p
                                        className="text-xs font-medium truncate text-default-700"
                                        title={
                                            job.sharepointFolder?.createdBy ||
                                            ''
                                        }
                                    >
                                        {job.sharepointFolder?.createdBy}
                                    </p>
                                </div>
                            )}

                            {/* Created Date */}
                            {job?.sharepointFolder?.createdDateTime && (
                                <div className="col-span-2">
                                    <p className="text-[10px] uppercase font-bold text-default-400 tracking-wider mb-1">
                                        Date Created
                                    </p>
                                    <p className="text-xs font-medium text-default-700">
                                        {dateFormatter(
                                            job.sharepointFolder
                                                ?.createdDateTime || '',
                                            {
                                                format: 'longDateTime',
                                            }
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons Area */}
                    {sharepointDisplay.publicWebUrl && (
                        <div className="flex flex-col gap-2 mt-1 px-1">
                            <p className="text-[10px] uppercase font-bold text-default-400 tracking-wider">
                                Actions
                            </p>
                            <div className="flex gap-2 w-full">
                                <Tooltip
                                    content="Open the source directory in SharePoint"
                                    placement="top"
                                    delay={500}
                                >
                                    <Button
                                        as="a"
                                        href={sharepointDisplay.publicWebUrl}
                                        target="_blank"
                                        isDisabled={
                                            !sharepointDisplay.publicWebUrl
                                        }
                                        color="primary"
                                        variant="flat"
                                        size="sm"
                                        className="flex-1 font-bold shadow-sm"
                                        endContent={<ExternalLink size={14} />}
                                    >
                                        Open SharePoint
                                    </Button>
                                </Tooltip>

                                {resultFolder && (
                                    <Tooltip
                                        content="Open the folder containing the processed results"
                                        placement="top"
                                        delay={500}
                                    >
                                        <Button
                                            as="a"
                                            href={resultFolder.webUrl}
                                            target="_blank"
                                            isDisabled={!resultFolder.webUrl}
                                            color="primary"
                                            variant="light"
                                            size="sm"
                                            className="flex-1 font-medium shadow-sm"
                                            endContent={
                                                <ExternalLink size={14} />
                                            }
                                        >
                                            Open Result Folder
                                        </Button>
                                    </Tooltip>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    )
}
