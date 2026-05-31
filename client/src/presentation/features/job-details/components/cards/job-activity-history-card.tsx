import { jobActivityLogsOptions } from '@/presentation/lib'
import { Button } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { RotateCcwIcon } from 'lucide-react'
import { JobActivityHistory } from '../views/JobActivityHistory'

export const JobActivityHistoryCard = ({ jobId }: { jobId: string }) => {
    const {
        data: activityLogs,
        refetch: refetchLogs,
        isFetching: isLogsLoading,
    } = useQuery({
        ...jobActivityLogsOptions(jobId ?? ''),
        enabled: !!jobId,
    })
    return (
        <div className="overflow-hidden bg-white border shadow-sm border-default-200 rounded-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-default-50 border-default-200">
                <span className="text-sm font-semibold tracking-wide text-default-900">
                    Activity History
                </span>
                <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    onPress={() => refetchLogs()}
                    isLoading={isLogsLoading}
                >
                    <RotateCcwIcon size={14} className="text-default-500" />
                </Button>
            </div>
            <div className="p-4">
                <JobActivityHistory logs={activityLogs} />
            </div>
        </div>
    )
}
