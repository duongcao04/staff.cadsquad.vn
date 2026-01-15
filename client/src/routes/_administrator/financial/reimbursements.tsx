import {
    Button,
    Card,
    Chip,
    Divider,
    Image,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tabs,
    useDisclosure,
    User,
} from '@heroui/react'
import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle2, Clock, Eye, Paperclip,XCircle } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute(
    '/_administrator/financial/reimbursements'
)({
    component: ReimbursementsPage,
})

// --- Mock Data ---
const CLAIMS = [
    {
        id: '1',
        user: 'David Chen',
        avatar: 'https://i.pravatar.cc/150?u=david',
        title: 'Figma Professional Sub',
        date: '2024-02-20',
        amount: 15.0,
        status: 'PENDING',
        receiptUrl: 'https://via.placeholder.com/300x400?text=Receipt+Image',
    },
    {
        id: '2',
        user: 'Sarah Wilson',
        avatar: 'https://i.pravatar.cc/150?u=sarah',
        title: 'Client Dinner (TechCorp)',
        date: '2024-02-18',
        amount: 120.5,
        status: 'APPROVED',
        receiptUrl: '',
    },
    {
        id: '3',
        user: 'James Smith',
        avatar: 'https://i.pravatar.cc/150?u=james',
        title: 'Grab for Meeting',
        date: '2024-02-15',
        amount: 8.5,
        status: 'REJECTED',
        receiptUrl: '',
    },
]
function ReimbursementsPage() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const [selectedClaim, setSelectedClaim] = useState<any>(null)

    const handleReview = (claim: any) => {
        setSelectedClaim(claim)
        onOpen()
    }

    return (
        <div className="p-8 max-w-400 mx-auto min-h-screen bg-slate-50 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Reimbursements
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Review and approve staff expense claims.
                    </p>
                </div>
                {/* Stat */}
                <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-warning animate-pulse"></div>
                    <span className="text-sm font-bold text-slate-700">
                        1 Request Pending
                    </span>
                </div>
            </div>

            <Card className="w-full shadow-sm border border-slate-200">
                <Tabs
                    aria-label="Claims"
                    variant="underlined"
                    color="primary"
                    classNames={{
                        tabList: 'p-4 w-full border-b border-divider',
                    }}
                >
                    <Tab key="all" title="All Requests">
                        <Table
                            aria-label="Reimbursement Table"
                            shadow="none"
                            removeWrapper
                            className="p-4"
                        >
                            <TableHeader>
                                <TableColumn>REQUESTED BY</TableColumn>
                                <TableColumn>DESCRIPTION</TableColumn>
                                <TableColumn>DATE</TableColumn>
                                <TableColumn>AMOUNT</TableColumn>
                                <TableColumn>STATUS</TableColumn>
                                <TableColumn align="end">ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {CLAIMS.map((claim) => (
                                    <TableRow
                                        key={claim.id}
                                        className="hover:bg-slate-50"
                                    >
                                        <TableCell>
                                            <User
                                                name={claim.user}
                                                avatarProps={{
                                                    src: claim.avatar,
                                                    size: 'sm',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-slate-700">
                                                {claim.title}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                                <Paperclip size={10} /> Receipt
                                                Attached
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-slate-500 text-sm">
                                                {claim.date}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-bold text-slate-800">
                                                ${claim.amount.toFixed(2)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                color={
                                                    claim.status === 'APPROVED'
                                                        ? 'success'
                                                        : claim.status ===
                                                            'REJECTED'
                                                          ? 'danger'
                                                          : 'warning'
                                                }
                                                startContent={
                                                    claim.status ===
                                                    'APPROVED' ? (
                                                        <CheckCircle2
                                                            size={12}
                                                        />
                                                    ) : claim.status ===
                                                      'REJECTED' ? (
                                                        <XCircle size={12} />
                                                    ) : (
                                                        <Clock size={12} />
                                                    )
                                                }
                                            >
                                                {claim.status}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="light"
                                                    startContent={
                                                        <Eye size={16} />
                                                    }
                                                    onPress={() =>
                                                        handleReview(claim)
                                                    }
                                                >
                                                    Review
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Tab>
                    <Tab key="pending" title="Pending Approval" />
                    <Tab key="history" title="History" />
                </Tabs>
            </Card>

            {/* Review Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Review Claim #{selectedClaim?.id}
                            </ModalHeader>
                            <ModalBody>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Receipt Preview */}
                                    <div className="bg-slate-100 rounded-lg flex items-center justify-center p-4 border border-slate-200 min-h-75">
                                        {selectedClaim?.receiptUrl ? (
                                            <Image
                                                src={selectedClaim.receiptUrl}
                                                alt="Receipt"
                                                className="max-h-75 object-contain"
                                            />
                                        ) : (
                                            <span className="text-slate-400 text-sm">
                                                No Preview Available
                                            </span>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-slate-400 font-bold uppercase">
                                                Employee
                                            </label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <User
                                                    name={selectedClaim?.user}
                                                    avatarProps={{
                                                        src: selectedClaim?.avatar,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 font-bold uppercase">
                                                Expense Detail
                                            </label>
                                            <p className="font-bold text-slate-800 text-lg">
                                                {selectedClaim?.title}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {selectedClaim?.date}
                                            </p>
                                        </div>
                                        <Divider />
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs text-slate-400 font-bold uppercase">
                                                Claim Amount
                                            </label>
                                            <span className="text-2xl font-bold text-primary">
                                                $
                                                {selectedClaim?.amount.toFixed(
                                                    2
                                                )}
                                            </span>
                                        </div>

                                        {selectedClaim?.status ===
                                            'PENDING' && (
                                            <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg">
                                                Approval adds this amount to
                                                their next payroll payout
                                                automatically.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="danger"
                                    variant="light"
                                    onPress={onClose}
                                >
                                    Reject
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={onClose}
                                    startContent={<CheckCircle2 size={18} />}
                                >
                                    Approve Claim
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    )
}
