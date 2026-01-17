import { JobMobileCard, ScrollArea, ScrollBar } from '@/shared/components'
import { HeroInput } from '@/shared/components/ui/hero-input'
import { TJob } from '@/shared/types'
import { Button, Pagination, Spinner } from '@heroui/react'
import { DownloadIcon, Filter, SearchIcon } from 'lucide-react'

interface ProjectCenterMobileContentProps {
    data: TJob[]
    isFetching: boolean
    pagination: {
        page: number
        totalPages: number
        limit: number
        total: number
    }
    onPageChange: (page: number) => void
    onSearchChange: (value?: string) => void
    onViewDetail: (no: string) => void
    onAssignMember: (no: string) => void
    onAddAttachments: (no: string) => void
    onExport: () => void
}

export const ProjectCenterMobileContent = ({
    data,
    isFetching,
    pagination,
    onPageChange,
    onSearchChange,
    onExport,
}: ProjectCenterMobileContentProps) => {
    return (
        <div className="flex flex-col h-full gap-4 relative">
            {/* 1. SEARCH & FILTERS HEADER */}
            <div className="flex flex-col gap-3 px-1 pt-1 shrink-0">
                <HeroInput
                    placeholder="Search ID or project name..."
                    startContent={
                        <SearchIcon size={18} className="text-default-400" />
                    }
                    onValueChange={(val) => onSearchChange(val || undefined)}
                    isClearable
                    classNames={{
                        inputWrapper:
                            'bg-content2 shadow-none border border-divider',
                    }}
                />
                <div className="flex gap-2">
                    <Button
                        variant="bordered"
                        className="flex-1 font-bold text-xs h-9 border-divider bg-content1"
                        startContent={<Filter size={14} />}
                    >
                        Filters
                    </Button>
                    <Button
                        color="primary"
                        variant="flat"
                        className="flex-1 font-bold text-xs h-9"
                        startContent={<DownloadIcon size={14} />}
                        onPress={onExport}
                    >
                        Export
                    </Button>
                </div>
            </div>

            {/* 2. SCROLLABLE LIST AREA */}
            <ScrollArea className="flex-1 -mx-2 px-2 pb-20">
                {isFetching && data.length === 0 ? (
                    <div className="flex justify-center py-20">
                        <Spinner label="Loading projects..." color="primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 pb-24">
                        {data.map((job) => (
                            <JobMobileCard key={job.id} job={job} />
                        ))}
                    </div>
                )}

                {!isFetching && data.length === 0 && (
                    <div className="text-center py-20 text-default-400 text-sm">
                        No projects found.
                    </div>
                )}
                <ScrollBar orientation="vertical" />
            </ScrollArea>

            {/* 3. FIXED PAGINATION */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-background/95 backdrop-blur-md border-t border-divider flex justify-center z-20">
                <Pagination
                    total={pagination.totalPages || 1}
                    page={pagination.page}
                    onChange={onPageChange}
                    size="sm"
                    color="primary"
                    variant="flat"
                    showControls
                    isCompact
                />
            </div>
        </div>
    )
}
