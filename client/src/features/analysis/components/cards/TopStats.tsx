import { Link } from '@tanstack/react-router'
import { AlertCircle, BanknoteArrowDown, Briefcase, Clock } from 'lucide-react'

import { INTERNAL_URLS } from '../../../../lib'

export const TopStats = ({
    activeJobs,
    overdueJobs,
    pendingReview,
    waitingPayment,
}: {
    activeJobs: number
    overdueJobs: number
    pendingReview: number
    waitingPayment: number
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Active Jobs Card */}
            <div className="bg-background-muted p-5 rounded-2xl border border-border-default shadow-xs flex items-center justify-between">
                <div>
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-3">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <h3 className="text-2xl font-bold text-text-default">
                        {activeJobs}
                    </h3>
                    <p className="text-sm text-text-subdued font-medium">
                        Active Jobs
                    </p>
                </div>
                <div className="h-full flex flex-col justify-end">
                    <Link
                        to={INTERNAL_URLS.management.jobs}
                        className="text-xs text-primary! font-bold cursor-pointer hover:underline flex items-center gap-1"
                    >
                        View details →
                    </Link>
                </div>
            </div>

            {/* Overdue Jobs Card */}
            <div className="bg-background-muted p-5 rounded-2xl border border-border-default shadow-xs flex items-center justify-between">
                <div>
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <h3 className="text-2xl font-bold text-text-default">
                        {overdueJobs}
                    </h3>
                    <p className="text-sm text-text-subdued font-medium">
                        Overdue / Late
                    </p>
                </div>
                <div className="h-full flex flex-col justify-end">
                    <span className="text-xs text-text-subdued hover:text-text-muted cursor-pointer hover:underline flex items-center gap-1">
                        View details →
                    </span>
                </div>
            </div>

            {/* Pending Review Card */}
            <div className="bg-background-muted p-5 rounded-2xl border border-border-default shadow-xs flex items-center justify-between">
                <div>
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-3">
                        <Clock className="w-5 h-5" />
                    </div>
                    <h3 className="text-2xl font-bold text-text-default">
                        {pendingReview}
                    </h3>
                    <p className="text-sm text-text-subdued font-medium">
                        Pending Review
                    </p>
                </div>
                <div className="h-full flex flex-col justify-end">
                    <span className="text-xs text-text-subdued hover:text-text-muted cursor-pointer hover:underline flex items-center gap-1">
                        View details →
                    </span>
                </div>
            </div>

            {/* Waiting for Payment Card */}
            <div className="bg-background-muted p-5 rounded-2xl border border-border-default shadow-xs flex items-center justify-between">
                <div>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3">
                        <BanknoteArrowDown className="w-5 h-5" />
                    </div>
                    <h3 className="text-2xl font-bold text-text-default">
                        {waitingPayment}
                    </h3>
                    <p className="text-sm text-text-subdued font-medium">
                        Waiting for Payment
                    </p>
                </div>
                <Link
                    to={INTERNAL_URLS.pendingPayouts}
                    className="h-full flex flex-col justify-end"
                >
                    <span className="text-xs text-text-subdued hover:text-text-muted cursor-pointer hover:underline flex items-center gap-1">
                        View details →
                    </span>
                </Link>
            </div>
        </div>
    )
}
