import { HeroModal, HeroModalContent } from '@/shared/components'
import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { JobDueContent, JobDueSkeleton } from '../job-due/JobDueContent'

type Props = {
    isOpen: boolean
    onClose: () => void
    currentDate: Date
}

function JobDueModal({ isOpen, onClose, currentDate }: Props) {
    return (
        <HeroModal
            isOpen={isOpen && Boolean(currentDate)}
            onClose={onClose}
            classNames={{
                base: 'max-w-[90%] sm:max-w-[80%] md:max-w-[80%] xl:max-w-[60%]',
            }}
            placement="top"
        >
            <HeroModalContent>
                <ErrorBoundary
                    fallback={
                        <div className="p-10 text-center text-danger">
                            Failed to load jobs.
                        </div>
                    }
                >
                    <Suspense
                        fallback={<JobDueSkeleton currentDate={currentDate} />}
                    >
                        {/* Chỉ render content khi modal thực sự mở để trigger fetch */}
                        {isOpen && (
                            <JobDueContent
                                currentDate={currentDate}
                                onClose={onClose}
                            />
                        )}
                    </Suspense>
                </ErrorBoundary>
            </HeroModalContent>
        </HeroModal>
    )
}

export default React.memo(JobDueModal)
