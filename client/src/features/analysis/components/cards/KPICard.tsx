import { HeroCard } from '@/shared/components'
import { CardBody } from '@heroui/react'
import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react'

interface KPICardProps {
    title: string
    value: string | number
    trend?: string
    subtext?: string
    icon: LucideIcon
    colorClass: string // VD: "bg-emerald-500"
    textColor: string // VD: "text-emerald-600"
}

export const KPICard = ({
    title,
    value,
    trend,
    subtext,
    icon: Icon,
    colorClass,
    textColor,
}: KPICardProps) => {
    const isPositive = trend?.startsWith('+')

    return (
        <HeroCard className="shadow-sm border border-divider">
            <CardBody className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-default-500 uppercase tracking-wider">
                            {title}
                        </p>
                        <h3 className="text-2xl font-black mt-1 text-default-900">
                            {value}
                        </h3>
                    </div>
                    <div
                        className={`p-2 rounded-xl ${colorClass} bg-opacity-10`}
                    >
                        <Icon size={20} className={textColor} />
                    </div>
                </div>

                {(trend || subtext) && (
                    <div className="mt-4 flex items-center gap-2">
                        {trend && (
                            <span
                                className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded ${
                                    isPositive
                                        ? 'text-emerald-600 bg-emerald-50'
                                        : 'text-red-600 bg-red-50'
                                }`}
                            >
                                {isPositive ? (
                                    <TrendingUp size={12} className="mr-1" />
                                ) : (
                                    <TrendingDown size={12} className="mr-1" />
                                )}
                                {trend}
                            </span>
                        )}
                        <span className="text-xs text-default-400">
                            {subtext}
                        </span>
                    </div>
                )}
            </CardBody>
        </HeroCard>
    )
}
