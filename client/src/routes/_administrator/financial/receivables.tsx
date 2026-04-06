import { RecordClientPaymentModal } from '@/features/financial'
import { receivableJobsOptions } from '@/lib/queries/options/_financial-queries'
import { AdminPageHeading, AppLoading } from '@/shared/components'
import { JobStatusChip } from '@/shared/components/chips/JobStatusChip'
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Divider,
    Input,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure,
} from '@heroui/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { AlertCircle, CheckCircle2, Clock, Search } from 'lucide-react'
import { useState } from 'react'
import {
    currencyFormatter,
    dateFormatter,
    JobHelper,
    TJobReceivable,
} from '../../../lib'

export const Route = createFileRoute('/_administrator/financial/receivables')({
    pendingComponent: AppLoading,
    component: () => {
        return (
            <>
                <AdminPageHeading
                    title="Receivables"
                    description="Track and record incoming payments from clients."
                />
                <ReceivablesPage />
            </>
        )
    },
})

export default function ReceivablesPage() {
    const queryClient = useQueryClient()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [selectedJob, setSelectedJob] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState('')

    // --- 1. Fetch Dữ liệu thực từ API ---
    const { data, isLoading } = useQuery(receivableJobsOptions())
    const jobs = data || []

    // --- 2. Tính toán dựa trên dữ liệu thực ---
    const totalOutstanding = jobs.reduce(
        (sum, job) => sum + job.financial?.remainingAmount,
        0
    )

    // Giả định overdue nếu quá dueAt
    const totalOverdue = jobs
        .filter((job) => JobHelper.isLate(job))
        .reduce((sum, job) => sum + job.financial?.remainingAmount, 0)

    const filteredJobs = jobs.filter(
        (job) =>
            job.client?.name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            job.no.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleRecordPaymentClick = (job: any) => {
        setSelectedJob(job)
        onOpen()
    }

    return (
        <div className="px-6 mx-auto space-y-6 max-w-7xl">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card
                    shadow="none"
                    className="border border-warning-200 bg-warning-50"
                >
                    <CardBody className="flex flex-row items-center justify-between p-5">
                        <div>
                            <p className="text-sm font-semibold text-warning-700">
                                Total Outstanding
                            </p>
                            <p className="mt-1 text-3xl font-bold text-warning-900">
                                {currencyFormatter(totalOutstanding)}
                            </p>
                        </div>
                        <div className="p-3 rounded-full bg-warning-100 text-warning-600">
                            <Clock size={28} />
                        </div>
                    </CardBody>
                </Card>

                <Card
                    shadow="none"
                    className="border border-danger-200 bg-danger-50"
                >
                    <CardBody className="flex flex-row items-center justify-between p-5">
                        <div>
                            <p className="text-sm font-semibold text-danger-700">
                                Severely Overdue
                            </p>
                            <p className="mt-1 text-3xl font-bold text-danger-900">
                                {currencyFormatter(totalOverdue)}
                            </p>
                        </div>
                        <div className="p-3 rounded-full bg-danger-100 text-danger-600">
                            <AlertCircle size={28} />
                        </div>
                    </CardBody>
                </Card>
            </div>

            <Card shadow="sm" className="border border-default-200">
                <CardHeader>
                    <Input
                        placeholder="Search by Client or Job No..."
                        startContent={
                            <Search size={16} className="text-default-400" />
                        }
                        className="max-w-xs"
                        variant="bordered"
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                </CardHeader>

                <Divider className="bg-border-default" />

                <CardBody>
                    <Table
                        aria-label="Receivables Table"
                        removeWrapper
                        className="bg-transparent"
                    >
                        <TableHeader>
                            <TableColumn>Job</TableColumn>
                            <TableColumn>Client</TableColumn>
                            <TableColumn>DUE DATE</TableColumn>
                            <TableColumn>REMAINING</TableColumn>
                            <TableColumn>STATUS</TableColumn>
                            <TableColumn align="end">ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody
                            emptyContent={
                                isLoading
                                    ? 'Loading receivables...'
                                    : 'No pending receivables found.'
                            }
                            items={filteredJobs}
                        >
                            {(job: TJobReceivable) => (
                                <TableRow key={job.id}>
                                    <TableCell>
                                        <span className="text-sm font-bold text-default-700">
                                            #{job.no}
                                        </span>
                                        <p className="text-xs text-default-500">
                                            {job.displayName}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm font-bold text-default-900">
                                            {job.client?.name}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={
                                                JobHelper.isLate(job)
                                                    ? 'text-danger font-bold'
                                                    : ''
                                            }
                                        >
                                            {dateFormatter(job.dueAt)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-base font-bold text-success-600">
                                            {currencyFormatter(
                                                job.financial?.remainingAmount
                                            )}
                                        </span>
                                        <p className="text-[10px] text-default-400">
                                            Total:{' '}
                                            {currencyFormatter(job.incomeCost)}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <JobStatusChip
                                            data={job.status}
                                            props={{ size: 'sm' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            color="success"
                                            variant="flat"
                                            onPress={() =>
                                                handleRecordPaymentClick(job)
                                            }
                                            startContent={
                                                <CheckCircle2 size={16} />
                                            }
                                        >
                                            Record Payment
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            {selectedJob && (
                <RecordClientPaymentModal
                    isOpen={isOpen}
                    onClose={onClose}
                    job={selectedJob}
                    onSuccess={() =>
                        queryClient.invalidateQueries({
                            queryKey: ['financials'],
                        })
                    }
                />
            )}
        </div>
    )
}
