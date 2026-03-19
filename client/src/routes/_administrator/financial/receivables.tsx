import { JobStatusChip } from '@/shared/components/chips/JobStatusChip'
import {
  Button,
  Card,
  CardBody,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  useDisclosure
} from '@heroui/react'
import { createFileRoute } from '@tanstack/react-router'
import { useFormik } from 'formik'
import { AlertCircle, ArrowDownRight, CheckCircle2, Clock, Mail, Search } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_administrator/financial/receivables')({
  component: ReceivablesPage,
})

function RouteComponent() {
  return <div>Hello "/_administrator/financial/receivables"!</div>
}

// --- Mock Data ---
const MOCK_RECEIVABLES = [
    {
        id: '1',
        no: 'JOB-2026-042',
        displayName: 'Architectural Rendering',
        clientName: 'Global Real Estate Corp',
        invoiceDate: '2026-03-01',
        dueDate: '2026-03-15', // Overdue or soon
        amount: 2500,
        status: { code: 'wait_client_payment', displayName: 'Awaiting Payment', color: 'warning' },
        daysOverdue: 0,
    },
    {
        id: '2',
        no: 'JOB-2026-038',
        displayName: '3D Product Animation',
        clientName: 'TechGadgets Inc.',
        invoiceDate: '2026-02-15',
        dueDate: '2026-03-01', 
        amount: 850,
        status: { code: 'overdue', displayName: 'Overdue', color: 'danger' },
        daysOverdue: 12,
    },
    {
        id: '3',
        no: 'JOB-2026-045',
        displayName: 'Character Rigging',
        clientName: 'Studio X',
        invoiceDate: '2026-03-10',
        dueDate: '2026-03-24',
        amount: 1200,
        status: { code: 'wait_client_payment', displayName: 'Awaiting Payment', color: 'warning' },
        daysOverdue: 0,
    },
]

export default function ReceivablesPage() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [selectedJob, setSelectedJob] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val)

    // Calculate totals
    const totalOutstanding = MOCK_RECEIVABLES.reduce((sum, job) => sum + job.amount, 0)
    const totalOverdue = MOCK_RECEIVABLES.filter(j => j.daysOverdue > 0).reduce((sum, job) => sum + job.amount, 0)

    // Filter jobs based on search
    const filteredJobs = MOCK_RECEIVABLES.filter(job => 
        job.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        job.no.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleRecordPaymentClick = (job: any) => {
        setSelectedJob(job)
        onOpen()
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* 1. Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-default-900 flex items-center gap-2">
                        <ArrowDownRight className="text-success" /> Accounts Receivable
                    </h1>
                    <p className="text-sm text-default-500">Track and record incoming payments from clients.</p>
                </div>
            </div>

            {/* 2. Summary Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card shadow="sm" className="border border-warning-200 bg-warning-50">
                    <CardBody className="p-5 flex flex-row items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-warning-700">Total Outstanding</p>
                            <p className="text-3xl font-bold text-warning-900 mt-1">{formatCurrency(totalOutstanding)}</p>
                        </div>
                        <div className="p-3 bg-warning-100 rounded-full text-warning-600">
                            <Clock size={28} />
                        </div>
                    </CardBody>
                </Card>

                <Card shadow="sm" className="border border-danger-200 bg-danger-50">
                    <CardBody className="p-5 flex flex-row items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-danger-700">Severely Overdue</p>
                            <p className="text-3xl font-bold text-danger-900 mt-1">{formatCurrency(totalOverdue)}</p>
                        </div>
                        <div className="p-3 bg-danger-100 rounded-full text-danger-600">
                            <AlertCircle size={28} />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* 3. Data Table Section */}
            <Card shadow="sm" className="border border-default-200">
                <div className="p-4 border-b border-divider flex items-center justify-between">
                    <Input 
                        placeholder="Search by Client or Job No..." 
                        startContent={<Search size={16} className="text-default-400" />}
                        className="max-w-xs"
                        variant="bordered"
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <Button variant="flat" color="default" startContent={<Mail size={16} />}>
                        Send Reminders
                    </Button>
                </div>
                
                <Table aria-label="Receivables Table" removeWrapper className="bg-transparent">
                    <TableHeader>
                        <TableColumn>JOB NO</TableColumn>
                        <TableColumn>CLIENT & PROJECT</TableColumn>
                        <TableColumn>INVOICE DATE</TableColumn>
                        <TableColumn>DUE DATE</TableColumn>
                        <TableColumn>AMOUNT OWED</TableColumn>
                        <TableColumn>STATUS</TableColumn>
                        <TableColumn align="end">ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent={"No pending receivables found."}>
                        {filteredJobs.map((job) => (
                            <TableRow key={job.id}>
                                <TableCell>
                                    <span className="font-bold text-sm text-default-700">#{job.no}</span>
                                </TableCell>
                                <TableCell>
                                    <p className="font-bold text-sm text-default-900">{job.clientName}</p>
                                    <p className="text-xs text-default-500">{job.displayName}</p>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-default-600">{job.invoiceDate}</span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className={`text-sm ${job.daysOverdue > 0 ? 'text-danger font-bold' : 'text-default-600'}`}>
                                            {job.dueDate}
                                        </span>
                                        {job.daysOverdue > 0 && (
                                            <span className="text-[10px] text-danger">{job.daysOverdue} days late</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-base font-bold text-success-600">
                                        {formatCurrency(job.amount)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <JobStatusChip data={job.status} props={{ size: 'sm' }} />
                                </TableCell>
                                <TableCell>
                                    <Button 
                                        size="sm" 
                                        color="success" 
                                        variant="flat"
                                        onPress={() => handleRecordPaymentClick(job)}
                                        startContent={<CheckCircle2 size={16} />}
                                    >
                                        Record Payment
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* 4. Record Payment Modal */}
            {selectedJob && (
                <RecordClientPaymentModal 
                    isOpen={isOpen} 
                    onClose={onClose} 
                    job={selectedJob} 
                />
            )}
        </div>
    )
}

// --- Inner Component: Modal ---
const RecordClientPaymentModal = ({ isOpen, onClose, job }: { isOpen: boolean, onClose: () => void, job: any }) => {
    const formik = useFormik({
        initialValues: {
            amountReceived: job?.amount || 0,
            paymentChannelId: '',
            referenceNo: '',
            notes: '',
        },
        enableReinitialize: true,
        onSubmit: async (values) => {
            console.log('Recording Payment:', values, 'for Job:', job.id)
            // 1. API Call to save Transaction (Type: INCOME)
            // 2. API Call to update Job Status -> WAIT_PAYOUT
            onClose()
            formik.resetForm()
        }
    })

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalContent>
                <form onSubmit={formik.handleSubmit}>
                    <ModalHeader className="flex flex-col gap-1 border-b border-divider pb-4">
                        <div className="flex items-center gap-2 text-success-600">
                            <ArrowDownRight size={22} />
                            <span className="text-xl font-bold">Record Income</span>
                        </div>
                        <p className="text-sm text-default-500">
                            Confirm payment received for <strong className="text-default-900">{job?.clientName}</strong>
                        </p>
                    </ModalHeader>
                    
                    <ModalBody className="py-6 space-y-4">
                        <div className="bg-default-50 p-4 rounded-xl border border-default-200 flex justify-between items-center">
                            <span className="text-sm font-medium text-default-600">Expected Amount:</span>
                            <span className="text-lg font-bold text-default-900">${job?.amount.toLocaleString()}</span>
                        </div>

                        <Input 
                            isRequired
                            name="amountReceived"
                            label="Actual Amount Received" 
                            type="number" 
                            value={formik.values.amountReceived.toString()}
                            onChange={formik.handleChange}
                            startContent={<span className="text-default-400">$</span>}
                            variant="bordered" 
                            labelPlacement="outside"
                            description="Adjust if the client paid a partial amount or included fees."
                        />

                        <Select 
                            isRequired
                            name="paymentChannelId"
                            label="Deposited Into" 
                            variant="bordered" 
                            labelPlacement="outside"
                            onChange={formik.handleChange}
                        >
                            <SelectItem key="stripe" textValue="Stripe Account">Stripe Account</SelectItem>
                            <SelectItem key="paypal" textValue="PayPal Business">PayPal Business</SelectItem>
                            <SelectItem key="bank_vcb" textValue="Vietcombank (VCB)">Vietcombank (VCB)</SelectItem>
                        </Select>

                        <Input 
                            name="referenceNo"
                            label="Bank / TXN Reference No." 
                            placeholder="e.g. STRIPE-CH-12345"
                            variant="bordered" 
                            labelPlacement="outside"
                            value={formik.values.referenceNo}
                            onChange={formik.handleChange}
                        />

                        <Textarea 
                            name="notes"
                            label="Internal Notes" 
                            placeholder="Add any details about this transfer..." 
                            variant="bordered" 
                            labelPlacement="outside"
                            value={formik.values.notes}
                            onChange={formik.handleChange}
                        />
                    </ModalBody>
                    
                    <ModalFooter className="border-t border-divider pt-4">
                        <Button variant="flat" onPress={onClose}>Cancel</Button>
                        <Button 
                            color="success" 
                            type="submit" 
                            className="font-bold text-white px-6"
                        >
                            Confirm Receipt
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    )
}