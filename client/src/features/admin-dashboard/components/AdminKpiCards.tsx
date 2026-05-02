import { INTERNAL_URLS } from '@/lib'
import { Card, CardBody, CardFooter } from '@heroui/react'
import { Link } from '@tanstack/react-router'
import {
    Briefcase,
    Building2,
    Cloud,
    FileCheck,
    Landmark,
    Users,
} from 'lucide-react'
import { EJobManagementTableTabs } from '../../../routes/_administrator/mgmt/jobs'

interface AdminKpiCardsProps {
    stats: {
        jobActives: number
        pendingReviews: number
        pendingPayouts: number
        totalClients: number
        systemHealthIndex: number
    }
}

export function AdminKpiCards({ stats }: AdminKpiCardsProps) {
    return (
        <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-6 gap-4">
            <Card
                shadow="sm"
                className="border border-primary-200 bg-primary-50"
            >
                <CardBody className="p-4 flex flex-row items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-primary-700">
                            Active Jobs
                        </p>
                        <p className="text-2xl font-bold text-primary-900 mt-1">
                            {stats.jobActives}
                        </p>
                    </div>
                    <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                        <Briefcase size={20} />
                    </div>
                </CardBody>
                <CardFooter>
                    <div className="w-full flex justify-end">
                        <Link
                            to={INTERNAL_URLS.management.jobs}
                            search={{
                                tab: EJobManagementTableTabs.ALL,
                            }}
                            className="text-right text-tiny font-semibold text-warning-700 hover:underline"
                        >
                            View all
                        </Link>
                    </div>
                </CardFooter>
            </Card>

            <Card
                shadow="sm"
                className="border border-warning-200 bg-warning-50"
            >
                <CardBody className="p-4 flex flex-row items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-warning-700">
                            Pending Review
                        </p>
                        <p className="text-2xl font-bold text-warning-900 mt-1">
                            {stats.pendingReviews}
                        </p>
                    </div>
                    <div className="p-2 bg-warning-100 rounded-lg text-warning-600">
                        <FileCheck size={20} />
                    </div>
                </CardBody>
                <CardFooter>
                    <div className="w-full flex justify-end">
                        <Link
                            to={INTERNAL_URLS.management.jobs}
                            search={{
                                tab: EJobManagementTableTabs.DELIVERED,
                            }}
                            className="text-right text-tiny font-semibold text-warning-700 hover:underline"
                        >
                            View all
                        </Link>
                    </div>
                </CardFooter>
            </Card>

            <Card shadow="sm" className="border border-danger-200 bg-danger-50">
                <CardBody className="p-4 flex flex-row items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-danger-700">
                            Pending Payouts
                        </p>
                        <p className="text-2xl font-bold text-danger-900 mt-1">
                            {stats.pendingPayouts}
                        </p>
                    </div>
                    <div className="p-2 bg-danger-100 rounded-lg text-danger-600">
                        <Landmark size={20} />
                    </div>
                </CardBody>
                <CardFooter>
                    <div className="w-full flex justify-end">
                        <Link
                            to={INTERNAL_URLS.management.jobs}
                            search={{
                                tab: EJobManagementTableTabs.COMPLETED,
                            }}
                            className="text-right text-tiny font-semibold text-warning-700 hover:underline"
                        >
                            View all
                        </Link>
                    </div>
                </CardFooter>
            </Card>

            <Card shadow="sm" className="border border-default-200">
                <CardBody className="p-4 flex flex-row items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-default-600">
                            Total Clients
                        </p>
                        <p className="text-2xl font-bold text-default-900 mt-1">
                            {stats.totalClients}
                        </p>
                    </div>
                    <div className="p-2 bg-default-100 rounded-lg text-default-600">
                        <Building2 size={20} />
                    </div>
                </CardBody>
                <CardFooter>
                    <div className="w-full flex justify-end">
                        <Link
                            to={INTERNAL_URLS.management.clients}
                            className="text-right text-tiny font-semibold text-warning-700 hover:underline"
                        >
                            View all
                        </Link>
                    </div>
                </CardFooter>
            </Card>

            <Card shadow="sm" className="border border-default-200">
                <CardBody className="p-4 flex flex-row items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-default-600">
                            Active Staff
                        </p>
                        <p className="text-2xl font-bold text-default-900 mt-1">
                            24
                        </p>
                    </div>
                    <div className="p-2 bg-default-100 rounded-lg text-default-600">
                        <Users size={20} />
                    </div>
                </CardBody>
                <CardFooter>
                    <div className="w-full flex justify-end">
                        <Link
                            to={INTERNAL_URLS.management.team}
                            className="text-right text-tiny font-semibold text-warning-700 hover:underline"
                        >
                            View all
                        </Link>
                    </div>
                </CardFooter>
            </Card>

            <Card
                shadow="sm"
                className="border border-success-200 bg-success-50"
            >
                <CardBody className="p-4 flex flex-row items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-success-700">
                            Sys Health
                        </p>
                        <p className="text-sm font-bold text-success-900 mt-2">
                            {stats.systemHealthIndex}%
                        </p>
                    </div>
                    <div className="p-2 bg-success-100 rounded-lg text-success-600">
                        <Cloud size={20} />
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}
