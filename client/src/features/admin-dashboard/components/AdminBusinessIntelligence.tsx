import {
    currencyFormatter,
    getDueInLabel,
    ICountByStatus,
    INTERNAL_URLS,
} from '@/lib'
import { ScrollArea, ScrollBar } from '@/shared/components'
import { TClient, TJob } from '@/shared/types'
import { Avatar, Card, CardBody, CardHeader, Chip } from '@heroui/react'
import { Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { Clock, Flame } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface AdminBusinessIntelligenceProps {
    topClients: TClient[]
    urgentJobs: TJob[]
    countByStatus: ICountByStatus[]
}

export function AdminBusinessIntelligence({
    topClients,
    urgentJobs,
    countByStatus,
}: AdminBusinessIntelligenceProps) {
    const processedTopClients = topClients.map((client) => {
        const totalRevenue = client.jobs.reduce(
            (acc, curr) => acc + curr.incomeCost,
            0
        )
        return {
            id: client.id,
            name: client.name,
            activeJobCount: client.jobs.length,
            totalRevenue,
        }
    })

    const processedUrgentJobs = urgentJobs.map((job) => {
        const deadline = dayjs(job.dueAt)
        const now = dayjs()
        const diffInDays = deadline.diff(now, 'day', true)
        const isUrgent = diffInDays > 0 && diffInDays < 2

        return {
            no: job.no,
            displayName: job.displayName,
            clientName: job.client?.name,
            dueInLabel: getDueInLabel(job.dueAt.toString()),
            isUrgent,
        }
    })

    const processedJobStatusChars = countByStatus.map((it) => ({
        name: it.displayName,
        value: it._count.jobs,
        color: it.hexColor,
    }))

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: Top Clients */}
            <Card shadow="none" className="border border-border-default">
                <CardHeader className="px-6 py-4 border-b border-divider flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-default-900">
                            Top Clients
                        </h2>
                    </div>
                    <Link
                        to={INTERNAL_URLS.management.clients}
                        className="text-xs font-bold text-primary hover:underline"
                    >
                        View All
                    </Link>
                </CardHeader>
                <CardBody className="p-0">
                    <div className="flex flex-col">
                        {processedTopClients.length > 0 &&
                            processedTopClients.map((client, idx) => (
                                <div
                                    key={client.id}
                                    className={`p-4 flex items-center justify-between ${idx !== topClients.length - 1 ? 'border-b border-divider' : ''} hover:bg-default-50 transition-colors`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            name={client.name}
                                            className="bg-primary-100 text-primary-700 font-bold"
                                        />
                                        <div>
                                            <p className="text-sm font-bold text-default-900">
                                                {client.name}
                                            </p>
                                            <p className="text-xs text-default-500">
                                                {client?.activeJobCount} jobs
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-0.5">
                                        <div className="flex items-center justify-end gap-1 text-[10px] font-medium">
                                            Total revenue
                                        </div>
                                        <p className="text-sm font-bold text-success-600">
                                            {currencyFormatter(
                                                client.totalRevenue
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        {processedTopClients.length === 0 && (
                            <div className="p-6 h-[80%] flex items-center justify-center">
                                <p className="font-medium italic text-text-subdued">
                                    Top clients notfound.
                                </p>
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>

            {/* MIDDLE: Monthly Target Pacing */}
            <Card shadow="none" className="border border-border-default">
                <CardHeader className="px-6 py-4 border-b border-divider">
                    <h2 className="text-lg font-bold text-default-900">
                        Operations Pipeline
                    </h2>
                </CardHeader>
                <CardBody className="p-6 flex flex-col items-center justify-center">
                    <div className="h-50 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={processedJobStatusChars}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {processedJobStatusChars.map(
                                        (entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                            />
                                        )
                                    )}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow:
                                            '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-4 w-full mt-4">
                        {processedJobStatusChars.map((item) => (
                            <div
                                key={item.name}
                                className="flex items-center gap-2"
                            >
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-xs font-medium text-default-600">
                                    {item.name}
                                </span>
                                <span className="text-xs font-bold ml-auto">
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>

            {/* RIGHT: Urgent Operations Watchlist */}
            <Card
                shadow="none"
                className="border border-danger-700/30 lg:col-span-1"
            >
                <CardHeader className="px-6 py-4 border-b border-danger-100 flex justify-between items-center bg-danger-50">
                    <div className="flex items-center gap-2">
                        <Flame size={18} className="text-danger" />
                        <h2 className="text-lg font-bold text-danger-900">
                            Urgent Watchlist
                        </h2>
                    </div>
                    <Chip size="sm" color="danger" variant="flat">
                        Action Required
                    </Chip>
                </CardHeader>
                <CardBody className="p-0">
                    {processedUrgentJobs.length > 0 && (
                        <ScrollArea>
                            <ScrollBar orientation="vertical" />
                            {processedUrgentJobs.map((job, idx) => {
                                return (
                                    <div
                                        key={job.no}
                                        className={`p-4 flex items-center justify-between ${idx !== urgentJobs.length - 1 ? 'border-b border-divider' : ''} hover:bg-danger-50/50 transition-colors`}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-default-800">
                                                    {job.no}
                                                </span>
                                                <Chip
                                                    size="sm"
                                                    color={
                                                        job.isUrgent
                                                            ? 'danger'
                                                            : 'warning'
                                                    }
                                                    className="h-4 text-[10px] px-1"
                                                >
                                                    {job.isUrgent
                                                        ? 'Urgent'
                                                        : 'High'}
                                                </Chip>
                                            </div>
                                            <p className="text-sm font-semibold text-default-900 truncate max-w-45">
                                                {job.displayName}
                                            </p>
                                            <p className="text-xs text-default-500 truncate max-w-45">
                                                {job.clientName}
                                            </p>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <div className="flex items-center gap-1 text-danger-600 bg-danger-100 px-2 py-1 rounded text-xs font-bold">
                                                <Clock size={12} />
                                                {job.dueInLabel}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </ScrollArea>
                    )}
                    {processedUrgentJobs.length === 0 && (
                        <div className="p-6 h-[80%] flex items-center justify-center">
                            <p className="font-medium italic text-text-subdued">
                                No urgent jobs found.
                            </p>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    )
}
