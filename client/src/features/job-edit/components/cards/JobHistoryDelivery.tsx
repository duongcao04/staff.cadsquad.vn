import { HeroTooltip } from '@/shared/components'
import { TJobDelivery } from '@/shared/types'
import { PackageOpen } from 'lucide-react'
import JobDeliveryItemCard from './JobDeliveryItemCard'

type JobHistoryDeliveryProps = {
    jobDeliveries?: TJobDelivery[]
    onApprove: (deliveryId: string) => void
    onReject: (deliveryId: string, feedback: string) => void
    isLoading: boolean
}
export function JobHistoryDelivery({
    jobDeliveries,
    onApprove,
    onReject,
    isLoading,
}: JobHistoryDeliveryProps) {
    console.log(jobDeliveries)

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* --- HEADER & TOOLTIP --- */}
            <div className="flex flex-col gap-1 pb-4 border-b border-border-default">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-bold text-text-default">
                            Deliverables & Submissions
                        </h1>
                        <HeroTooltip
                            placement="right"
                            content={
                                <div className="px-1 py-1 max-w-62.5 text-tiny text-text-subdued">
                                    Review work submitted by assigned team
                                    members. You can approve the work to move
                                    the job forward or reject it with feedback.
                                </div>
                            }
                        >
                            <div className="flex items-center justify-center w-4 h-4 rounded-full bg-default-200 hover:bg-default-300 text-[10px] font-bold text-text-subdued cursor-help transition-colors">
                                !
                            </div>
                        </HeroTooltip>
                    </div>

                    {/* Badge showing total count */}
                    <div className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full">
                        {jobDeliveries?.length || 0} Submissions
                    </div>
                </div>
                <p className="text-sm text-text-subdued">
                    Manage the delivery lifecycle and review submitted files and
                    links.
                </p>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="p-4 rounded-2xl bg-default-50 border border-border-default border-dashed min-h-75 flex flex-col">
                {/* Empty State */}
                {!jobDeliveries?.length && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-border-default mb-4">
                            <PackageOpen
                                size={28}
                                className="text-default-400"
                            />
                        </div>
                        <h4 className="text-base font-bold text-text-default mb-1">
                            No Deliverables Yet
                        </h4>
                        <p className="text-sm text-text-subdued max-w-70">
                            Assigned team members haven't submitted any work for
                            this job. Once they do, it will appear here for your
                            review.
                        </p>
                    </div>
                )}

                {/* List of Deliveries */}
                {jobDeliveries && jobDeliveries.length > 0 && (
                    <div className="space-y-4">
                        {jobDeliveries.map((delivery) => (
                            <JobDeliveryItemCard
                                key={delivery.id}
                                delivery={delivery}
                                onApprove={onApprove}
                                onReject={onReject}
                                isLoading={isLoading}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
