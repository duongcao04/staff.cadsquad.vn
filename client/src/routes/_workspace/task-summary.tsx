import {
    Button,
    Card,
    CardBody,
    Checkbox,
    Chip,
    Progress,
    User,
} from '@heroui/react'
import { createFileRoute } from '@tanstack/react-router'
import {
    AlertCircle,
    Briefcase,
    CheckCircle2,
    Play,
    TrendingUp,
} from 'lucide-react'

import { getPageTitle, optimizeCloudinary, useProfile } from '../../lib'

export const Route = createFileRoute('/_workspace/task-summary')({
    head: () => ({
        meta: [
            {
                title: getPageTitle('Task Summary'),
            },
        ],
    }),
    component: TaskSummaryPage,
})

const TODAY_TASKS = [
    {
        id: 1,
        title: 'Fix Mobile Navigation',
        job: 'FV-2024',
        due: '2:00 PM',
        priority: 'HIGH',
    },
    {
        id: 2,
        title: 'Export Assets for Dev',
        job: 'FV-2029',
        due: '5:00 PM',
        priority: 'MEDIUM',
    },
]

function TaskSummaryPage() {
    const { profile } = useProfile()

    return (
        <div className="p-8 space-y-8">
            {/* 1. Welcome & Status Header */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-background-muted p-6 rounded-2xl border border-border-default shadow-sm">
                <div className="flex items-center gap-4">
                    <User
                        name={`Welcome back, ${profile.displayName}!`}
                        description={
                            <div className="flex items-center gap-2 text-text-subdued mt-1.5">
                                <Briefcase size={16} />
                                <span className="text-sm">
                                    {profile.department?.displayName}
                                </span>
                            </div>
                        }
                        avatarProps={{
                            src: optimizeCloudinary(profile.avatar, {
                                width: 256,
                                height: 256,
                            }),
                            size: 'lg',
                        }}
                        classNames={{
                            name: 'text-xl font-bold text-text-default',
                            description: 'text-text-subdued',
                        }}
                    />
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="text-right hidden md:block">
                        <p className="text-xs font-bold text-slate-400 uppercase">
                            Current Status
                        </p>
                        <p className="text-sm font-medium text-emerald-600 flex items-center gap-1 justify-end">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Available for Work
                        </p>
                    </div>
                    <Button
                        color="primary"
                        variant="shadow"
                        startContent={<Play size={16} fill="currentColor" />}
                    >
                        Resume Timer (01:20:45)
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2. Main Work Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Priority Card */}
                    <Card className="bg-linear-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
                        <CardBody className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <Chip
                                        size="sm"
                                        variant="solid"
                                        className="bg-white/20 text-white mb-2 border-none"
                                    >
                                        Top Priority
                                    </Chip>
                                    <h2 className="text-2xl font-bold">
                                        E-Commerce Website Redesign
                                    </h2>
                                    <p className="opacity-80 text-sm">
                                        Client: TechCorp • Due Tomorrow
                                    </p>
                                </div>
                                <div className="text-center bg-white/10 p-3 rounded-xl backdrop-blur-md">
                                    <p className="text-xs opacity-70 uppercase font-bold">
                                        Income
                                    </p>
                                    <p className="text-xl font-bold">$400</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs opacity-80">
                                    <span>Progress</span>
                                    <span>65%</span>
                                </div>
                                <Progress
                                    value={65}
                                    size="sm"
                                    classNames={{
                                        indicator: 'bg-white',
                                        track: 'bg-white/20',
                                    }}
                                />
                            </div>
                            <div className="mt-6 flex gap-3">
                                <Button className="bg-white text-blue-700 font-bold">
                                    Continue Work
                                </Button>
                                <Button
                                    variant="bordered"
                                    className="text-white border-white/40"
                                >
                                    View Details
                                </Button>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Today's Checklist */}
                    <Card className="border border-border-default shadow-sm">
                        <CardBody className="p-6">
                            <h3 className="font-bold text-text-default mb-4 flex items-center gap-2">
                                <CheckCircle2 className="text-emerald-500" />{' '}
                                Today's Focus
                            </h3>
                            <div className="space-y-3">
                                {TODAY_TASKS.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center justify-between p-3 bg-background-muted rounded-xl border border-border-default hover:border-blue-200 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Checkbox size="lg" radius="full" />
                                            <div>
                                                <p className="font-medium text-text-default group-hover:text-blue-600 transition-colors">
                                                    {task.title}
                                                </p>
                                                <p className="text-xs text-text-subdued flex items-center gap-1">
                                                    <span className="font-mono bg-white px-1 border border-slate-200 rounded">
                                                        {task.job}
                                                    </span>{' '}
                                                    • Due {task.due}
                                                </p>
                                            </div>
                                        </div>
                                        {task.priority === 'HIGH' && (
                                            <Chip
                                                size="sm"
                                                color="danger"
                                                variant="flat"
                                                className="h-6"
                                            >
                                                High
                                            </Chip>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    variant="light"
                                    className="w-full text-slate-400"
                                    startContent={
                                        <div className="text-xl">+</div>
                                    }
                                >
                                    Add Personal Task
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* 3. Stats & Notifications Sidebar */}
                <div className="space-y-6">
                    {/* Earnings Widget */}
                    <Card className="border border-slate-200 shadow-sm">
                        <CardBody className="p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <TrendingUp size={20} />
                                </div>
                                <span className="font-bold text-text-default text-sm">
                                    This Month
                                </span>
                            </div>
                            <h3 className="text-3xl font-bold text-text-default">
                                $1,250.00
                            </h3>
                            <p className="text-xs text-text-subdued mt-1">
                                Pending Payout: <strong>$450.00</strong>
                            </p>
                            <Button
                                className="w-full mt-4"
                                size="sm"
                                variant="flat"
                                color="primary"
                            >
                                View History
                            </Button>
                        </CardBody>
                    </Card>

                    {/* Notifications */}
                    <Card className="border border-border-default shadow-sm">
                        <CardBody className="p-0">
                            <div className="p-4 border-b border-border-default font-bold text-text-default text-sm">
                                Recent Updates
                            </div>
                            <div className="divide-y divide-border-default">
                                <div className="p-4 flex gap-3 hover:bg-background-hovered transition-colors">
                                    <div className="mt-1">
                                        <AlertCircle
                                            size={16}
                                            className="text-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-default">
                                            <strong>Admin</strong> assigned you
                                            to{' '}
                                            <span className="text-blue-600">
                                                FV-2030
                                            </span>
                                            .
                                        </p>
                                        <p className="text-[10px] text-text-subdued mt-1">
                                            2 hours ago
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4 flex gap-3 hover:bg-background-hovered transition-colors">
                                    <div className="mt-1">
                                        <CheckCircle2
                                            size={16}
                                            className="text-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-default">
                                            Job <strong>FV-2028</strong> was
                                            marked Paid.
                                        </p>
                                        <p className="text-[10px] text-text-subdued mt-1">
                                            Yesterday
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    )
}
