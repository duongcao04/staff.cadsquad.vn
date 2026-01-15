import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import { AnalyticsOverview } from '@/lib/api'

type RevenueChartProps = {
    data: AnalyticsOverview['financialChart']['data']
}
export const RevenueChart = ({ data }: RevenueChartProps) => {
    return (
        <div className="bg-background-muted p-6 rounded-2xl border border-border-default shadow-xs mb-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-text-default">
                    Financial Overview
                </h3>
                <button className="text-xs border border-border-default rounded-lg px-3 py-1 text-text-subdued hover:bg-background-hovered">
                    1 Nov - 7 Nov 2024
                </button>
            </div>

            <div className="h-62.5 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient
                                id="colorIncome"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#10B981"
                                    stopOpacity={0.1}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#10B981"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                            stroke="#F1F5F9"
                        />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 12 }}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="income"
                            stroke="#10B981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorIncome)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
