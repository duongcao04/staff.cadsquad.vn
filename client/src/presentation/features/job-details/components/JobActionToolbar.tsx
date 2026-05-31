import {
    AlertTriangle,
    CheckCircle2,
    Pause,
    Play,
    UploadCloud,
} from 'lucide-react'
import { useState } from 'react'
import { HeroCard, HeroCardBody } from '../../../shared/components/ui/hero-card'

export const JobActionToolbar = () => {
    const [isTimerRunning, setIsTimerRunning] = useState(false)

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 1. Time Tracker (Primary Action) */}
            <HeroCard
                isPressable
                onPress={() => setIsTimerRunning(!isTimerRunning)}
                className={`border-2 shadow-sm transition-all ${isTimerRunning ? 'border-primary bg-primary-50' : 'border-slate-200 bg-white hover:border-primary/50'}`}
            >
                <HeroCardBody className="flex flex-col items-center justify-center p-4 gap-2 text-center h-32">
                    {isTimerRunning ? (
                        <>
                            <Pause
                                size={28}
                                className="text-primary animate-pulse"
                            />
                            <div>
                                <span className="font-bold text-primary block text-lg">
                                    01:24:15
                                </span>
                                <span className="text-xs text-primary/70 font-medium uppercase">
                                    Stop Timer
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            <Play size={28} className="text-slate-400" />
                            <div>
                                <span className="font-bold text-slate-700 block">
                                    Start Working
                                </span>
                                <span className="text-xs text-slate-400">
                                    Track your hours
                                </span>
                            </div>
                        </>
                    )}
                </HeroCardBody>
            </HeroCard>

            {/* 2. Upload Deliverable */}
            <HeroCard
                isPressable
                className="border border-slate-200 shadow-sm bg-white hover:border-blue-400 group"
            >
                <HeroCardBody className="flex flex-col items-center justify-center p-4 gap-2 text-center h-32">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-full group-hover:scale-110 transition-transform">
                        <UploadCloud size={24} />
                    </div>
                    <div>
                        <span className="font-bold text-slate-700 block text-sm">
                            Upload Work
                        </span>
                        <span className="text-xs text-slate-400">
                            Add files/assets
                        </span>
                    </div>
                </HeroCardBody>
            </HeroCard>

            {/* 3. Submit for Review */}
            <HeroCard
                isPressable
                className="border border-slate-200 shadow-sm bg-white hover:border-orange-400 group"
            >
                <HeroCardBody className="flex flex-col items-center justify-center p-4 gap-2 text-center h-32">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-full group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <span className="font-bold text-slate-700 block text-sm">
                            Submit Review
                        </span>
                        <span className="text-xs text-slate-400">
                            Notify Manager
                        </span>
                    </div>
                </HeroCardBody>
            </HeroCard>

            {/* 4. Report Issue */}
            <HeroCard
                isPressable
                className="border border-slate-200 shadow-sm bg-white hover:border-red-400 group"
            >
                <HeroCardBody className="flex flex-col items-center justify-center p-4 gap-2 text-center h-32">
                    <div className="p-2 bg-red-50 text-red-600 rounded-full group-hover:scale-110 transition-transform">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <span className="font-bold text-slate-700 block text-sm">
                            Report Issue
                        </span>
                        <span className="text-xs text-slate-400">
                            Flag a blocker
                        </span>
                    </div>
                </HeroCardBody>
            </HeroCard>
        </div>
    )
}
