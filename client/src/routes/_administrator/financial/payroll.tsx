import {
    Button,
    Card,
    CardBody,
    Progress,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tabs,
} from '@heroui/react'
import { createFileRoute } from '@tanstack/react-router'
import {
    AlertTriangle,
    Building,
    Download,
    TrendingDown,
    TrendingUp,
} from 'lucide-react'

export const Route = createFileRoute('/_administrator/financial/payroll')({
    component: TaxReportPage,
})

const OUTPUT_VAT = [
    {
        id: 1,
        inv: 'INV-001',
        client: 'TechCorp',
        amount: 4500,
        tax: 360,
        date: '2024-02-01',
    },
    {
        id: 2,
        inv: 'INV-002',
        client: 'Amoovo',
        amount: 2800,
        tax: 224,
        date: '2024-02-05',
    },
]

const INPUT_VAT = [
    {
        id: 1,
        ref: 'EXP-992',
        vendor: 'AWS Services',
        amount: 120,
        tax: 9.6,
        date: '2024-02-02',
    },
    {
        id: 2,
        ref: 'EXP-993',
        vendor: 'Office Rental',
        amount: 1500,
        tax: 120,
        date: '2024-02-01',
    },
]

function TaxReportPage() {
    const totalOutput = 584 // Collected Tax
    const totalInput = 129.6 // Paid Tax
    const netPayable = totalOutput - totalInput

    return (
        <div className="p-8 max-w-400 mx-auto min-h-screen bg-slate-50 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Tax Declaration
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        VAT Input/Output reconciliation for February 2024.
                    </p>
                </div>
                <Button
                    color="primary"
                    variant="ghost"
                    startContent={<Download size={18} />}
                >
                    Export XML for Tax Auth
                </Button>
            </div>

            {/* Tax Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Output VAT (Money Collected) */}
                <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm">
                    <CardBody className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={18} className="text-blue-500" />
                            <span className="text-xs font-bold text-slate-500 uppercase">
                                Output VAT (Sold)
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">
                            ${totalOutput.toFixed(2)}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                            Tax collected from Clients
                        </p>
                    </CardBody>
                </Card>

                {/* Input VAT (Money Spent) */}
                <Card className="bg-white border-l-4 border-l-orange-500 shadow-sm">
                    <CardBody className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingDown
                                size={18}
                                className="text-orange-500"
                            />
                            <span className="text-xs font-bold text-slate-500 uppercase">
                                Input VAT (Bought)
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">
                            ${totalInput.toFixed(2)}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                            Tax deductible from Expenses
                        </p>
                    </CardBody>
                </Card>

                {/* Net Payable */}
                <Card className="bg-slate-900 text-white shadow-lg">
                    <CardBody className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Building size={18} className="text-emerald-400" />
                            <span className="text-xs font-bold text-slate-400 uppercase">
                                Net VAT Payable
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-white">
                            ${netPayable.toFixed(2)}
                        </h3>
                        <div className="mt-3">
                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                <span>Due Date: Mar 20, 2024</span>
                                <span>Status: Unpaid</span>
                            </div>
                            <Progress
                                value={0}
                                size="sm"
                                color="warning"
                                className="bg-slate-700"
                            />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Details Tables */}
            <Card className="w-full shadow-sm border border-slate-200">
                <Tabs
                    aria-label="Tax Details"
                    variant="underlined"
                    color="primary"
                    classNames={{
                        tabList:
                            'p-4 border-b border-divider w-full justify-start gap-8',
                        cursor: 'w-full bg-primary',
                        tabContent:
                            'font-medium group-data-[selected=true]:text-primary',
                    }}
                >
                    {/* Output Tab */}
                    <Tab key="output" title="Output Invoices (Sold)">
                        <Table
                            aria-label="Output Tax"
                            shadow="none"
                            removeWrapper
                            className="p-4"
                        >
                            <TableHeader>
                                <TableColumn>INVOICE NO</TableColumn>
                                <TableColumn>CLIENT</TableColumn>
                                <TableColumn>DATE</TableColumn>
                                <TableColumn>PRE-TAX</TableColumn>
                                <TableColumn>VAT (8%)</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {OUTPUT_VAT.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>
                                            <span className="font-mono text-xs">
                                                {row.inv}
                                            </span>
                                        </TableCell>
                                        <TableCell>{row.client}</TableCell>
                                        <TableCell>
                                            <span className="text-slate-500 text-sm">
                                                {row.date}
                                            </span>
                                        </TableCell>
                                        <TableCell>${row.amount}</TableCell>
                                        <TableCell>
                                            <span className="font-bold text-blue-600">
                                                +${row.tax}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Tab>

                    {/* Input Tab */}
                    <Tab key="input" title="Input Expenses (Bought)">
                        <Table
                            aria-label="Input Tax"
                            shadow="none"
                            removeWrapper
                            className="p-4"
                        >
                            <TableHeader>
                                <TableColumn>REF NO</TableColumn>
                                <TableColumn>VENDOR</TableColumn>
                                <TableColumn>DATE</TableColumn>
                                <TableColumn>PRE-TAX</TableColumn>
                                <TableColumn>VAT (Deductible)</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {INPUT_VAT.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>
                                            <span className="font-mono text-xs">
                                                {row.ref}
                                            </span>
                                        </TableCell>
                                        <TableCell>{row.vendor}</TableCell>
                                        <TableCell>
                                            <span className="text-slate-500 text-sm">
                                                {row.date}
                                            </span>
                                        </TableCell>
                                        <TableCell>${row.amount}</TableCell>
                                        <TableCell>
                                            <span className="font-bold text-orange-600">
                                                -${row.tax}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Tab>
                </Tabs>
            </Card>

            <div className="flex items-center gap-2 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-200">
                <AlertTriangle size={18} />
                <span>
                    <strong>Note:</strong> Ensure all invoices are signed
                    digitally before exporting the XML report for the General
                    Department of Taxation.
                </span>
            </div>
        </div>
    )
}
