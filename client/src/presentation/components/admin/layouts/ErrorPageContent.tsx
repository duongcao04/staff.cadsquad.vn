import { Button } from '@heroui/react'
import { AlertCircleIcon, RefreshCwIcon } from 'lucide-react'

export function ErrorPageContent({
    error,
    refresh,
}: {
    error: Error
    refresh: () => void
}) {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-125 w-full p-8 text-center bg-default-50/50 rounded-2xl border border-default-200">
            <div className="p-4 bg-danger-50 text-danger-500 rounded-full mb-4">
                <AlertCircleIcon size={32} />
            </div>
            <h3 className="text-xl font-bold text-default-900 mb-2">
                Failed to Load
            </h3>
            <p className="text-sm text-default-500 max-w-md mb-6">
                {error?.message ||
                    'An unexpected error occurred while communicating with the server. Please check your connection and try again.'}
            </p>
            <div className="flex gap-3">
                <Button
                    color="primary"
                    variant="flat"
                    onPress={refresh}
                    startContent={<RefreshCwIcon size={16} />}
                >
                    Try Again
                </Button>
            </div>
        </div>
    )
}
