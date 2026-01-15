import { Button, Card, CardBody, Chip, Tooltip } from '@heroui/react'
import { createFileRoute } from '@tanstack/react-router'
import {
    Braces,
    Check,
    Code,
    Copy,
    Eye,
    Printer,
    RotateCcw,
    Save,
} from 'lucide-react'
import { useEffect,useState } from 'react'

export const Route = createFileRoute(
    '/_administrator/financial/invoice-templates'
)({
    component: InvoiceTemplatePage,
})

// --- Mock Data (To simulate DB data in preview) ---
const MOCK_DATA = {
    invoiceNo: 'INV-2024-001',
    date: 'Oct 24, 2025',
    dueDate: 'Nov 24, 2025',
    clientName: 'TechCorp Industries',
    clientAddress: '123 Innovation Blvd, Silicon Valley, CA',
    clientEmail: 'billing@techcorp.com',
    myCompanyName: 'YangIs Dev Agency',
    myAddress: '456 Code Street, Ho Chi Minh City, VN',
    items: [
        {
            description: 'Frontend Development (React/Next.js)',
            quantity: 40,
            price: 50,
            total: 2000,
        },
        {
            description: 'UI/UX Design Phase 1',
            quantity: 15,
            price: 60,
            total: 900,
        },
        {
            description: 'Server Configuration (AWS)',
            quantity: 5,
            price: 80,
            total: 400,
        },
    ],
    subtotal: '3,300.00',
    tax: '264.00',
    total: '3,564.00',
    currency: '$',
}

// --- Available Variables for the User ---
const VARIABLES = [
    { category: 'General', key: '{{invoiceNo}}', label: 'Invoice #' },
    { category: 'General', key: '{{date}}', label: 'Issue Date' },
    { category: 'General', key: '{{dueDate}}', label: 'Due Date' },
    { category: 'Client', key: '{{clientName}}', label: 'Client Name' },
    { category: 'Client', key: '{{clientAddress}}', label: 'Client Address' },
    { category: 'Company', key: '{{myCompanyName}}', label: 'My Company' },
    { category: 'Company', key: '{{myAddress}}', label: 'My Address' },
    { category: 'Financial', key: '{{subtotal}}', label: 'Subtotal' },
    { category: 'Financial', key: '{{tax}}', label: 'Tax Amount' },
    { category: 'Financial', key: '{{total}}', label: 'Grand Total' },
    {
        category: 'Special',
        key: '{{itemsRow}}',
        label: 'Items Table Rows (Loop)',
    },
]

// --- Default HTML Template ---
const DEFAULT_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica', sans-serif; color: #333; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .title { font-size: 32px; font-weight: bold; color: #3B82F6; }
    .meta { text-align: right; }
    .meta p { margin: 4px 0; font-size: 14px; color: #666; }
    .bill-to { margin-bottom: 30px; }
    .bill-to h3 { font-size: 14px; text-transform: uppercase; color: #999; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { text-align: left; padding: 12px; background: #f8fafc; color: #64748b; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .totals { margin-left: auto; width: 300px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; }
    .total-row { font-size: 18px; font-weight: bold; color: #3B82F6; border-top: 2px solid #3B82F6; padding-top: 12px; }
    .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <div class="title">INVOICE</div>
      <p><strong>{{myCompanyName}}</strong><br>{{myAddress}}</p>
    </div>
    <div class="meta">
      <p>Invoice #: <strong>{{invoiceNo}}</strong></p>
      <p>Date: {{date}}</p>
      <p>Due Date: <strong>{{dueDate}}</strong></p>
    </div>
  </div>

  <div class="bill-to">
    <h3>Bill To:</h3>
    <p><strong>{{clientName}}</strong><br>{{clientAddress}}<br>{{clientEmail}}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align: right;">Qty</th>
        <th style="text-align: right;">Price</th>
        <th style="text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      {{itemsRow}}
    </tbody>
  </table>

  <div class="totals">
    <div class="row">
      <span>Subtotal:</span>
      <span>{{currency}}{{subtotal}}</span>
    </div>
    <div class="row">
      <span>Tax (8%):</span>
      <span>{{currency}}{{tax}}</span>
    </div>
    <div class="row total-row">
      <span>Total:</span>
      <span>{{currency}}{{total}}</span>
    </div>
  </div>

  <div class="footer">
    Thank you for your business! Please pay within 30 days.
  </div>

</body>
</html>
`

function InvoiceTemplatePage() {
    const [templateCode, setTemplateCode] = useState(DEFAULT_TEMPLATE)
    const [renderedPreview, setRenderedPreview] = useState('')
    const [copiedKey, setCopiedKey] = useState<string | null>(null)

    // --- Compile Template (Mock Engine) ---
    // In production, use Handlebars.js or Mustache.js on server and client
    const compileTemplate = () => {
        let html = templateCode

        // 1. Generate Rows for Items
        const itemsHtml = MOCK_DATA.items
            .map(
                (item) => `
      <tr>
        <td>${item.description}</td>
        <td style="text-align: right;">${item.quantity}</td>
        <td style="text-align: right;">${MOCK_DATA.currency}${item.price}</td>
        <td style="text-align: right;">${MOCK_DATA.currency}${item.total}</td>
      </tr>
    `
            )
            .join('')

        // 2. Replace Special Loop Variable
        html = html.replace('{{itemsRow}}', itemsHtml)

        // 3. Replace Standard Variables
        Object.keys(MOCK_DATA).forEach((key) => {
            // @ts-ignore
            const val = MOCK_DATA[key]
            if (typeof val === 'string' || typeof val === 'number') {
                const regex = new RegExp(`{{${key}}}`, 'g')
                html = html.replace(regex, String(val))
            }
        })

        setRenderedPreview(html)
    }

    // Re-compile whenever code changes
    useEffect(() => {
        compileTemplate()
    }, [templateCode])

    // Copy helper
    const copyVariable = (key: string) => {
        navigator.clipboard.writeText(key)
        setCopiedKey(key)
        setTimeout(() => setCopiedKey(null), 1500)
    }

    const handlePrint = () => {
        const printWindow = window.open('', '', 'width=800,height=600')
        if (printWindow) {
            printWindow.document.write(renderedPreview)
            printWindow.document.close()
            printWindow.focus()
            printWindow.print()
            printWindow.close()
        }
    }

    return (
        <div className="p-8 h-screen flex flex-col max-w-450 mx-auto bg-slate-50">
            {/* --- Header --- */}
            <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Invoice Template Editor
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {/* FIXED LINE BELOW: Wrapped {{variables}} in quotes */}
                        Customize HTML/CSS for client invoices. Use{' '}
                        <span className="font-mono text-xs bg-slate-200 px-1 rounded">
                            {'{{variables}}'}
                        </span>{' '}
                        to inject database data.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="flat"
                        color="warning"
                        startContent={<RotateCcw size={18} />}
                        onPress={() => setTemplateCode(DEFAULT_TEMPLATE)}
                    >
                        Reset Default
                    </Button>
                    <Button
                        variant="flat"
                        startContent={<Printer size={18} />}
                        onPress={handlePrint}
                    >
                        Test Print
                    </Button>
                    <Button color="primary" startContent={<Save size={18} />}>
                        Save Template
                    </Button>
                </div>
            </div>

            {/* --- Main Workspace --- */}
            <div className="flex-1 flex gap-6 min-h-0">
                {/* LEFT: Editor & Variables */}
                <div className="flex-1 flex flex-col gap-4 min-w-0">
                    {/* Variables Toolbar */}
                    <Card className="shrink-0 shadow-sm border border-slate-200">
                        <CardBody className="py-3 px-4">
                            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 uppercase">
                                <Braces size={14} /> Available Variables (Click
                                to copy)
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {VARIABLES.map((v) => (
                                    <Tooltip
                                        key={v.key}
                                        content={`Insert ${v.label}`}
                                    >
                                        <Chip
                                            size="sm"
                                            variant="flat"
                                            className="cursor-pointer hover:bg-primary-100 hover:text-primary-700 transition-colors font-mono text-xs"
                                            startContent={
                                                copiedKey === v.key ? (
                                                    <Check size={12} />
                                                ) : (
                                                    <Copy size={12} />
                                                )
                                            }
                                            onClick={() => copyVariable(v.key)}
                                        >
                                            {v.key}
                                        </Chip>
                                    </Tooltip>
                                ))}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Code Editor */}
                    <Card className="flex-1 shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                        <div className="bg-slate-900 text-slate-300 px-4 py-2 text-xs flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-2">
                                <Code size={14} />{' '}
                                <span>HTML / CSS Editor</span>
                            </div>
                            <span className="opacity-50">template.html</span>
                        </div>
                        <textarea
                            className="flex-1 w-full h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm p-4 resize-none focus:outline-none"
                            value={templateCode}
                            onChange={(e) => setTemplateCode(e.target.value)}
                            spellCheck={false}
                        />
                    </Card>
                </div>

                {/* RIGHT: Live Preview */}
                <div className="flex-1 flex flex-col min-w-0">
                    <Card className="flex-1 shadow-sm border border-slate-200 bg-slate-200/50 flex flex-col overflow-hidden">
                        <div className="bg-white border-b border-slate-200 px-4 py-2 text-xs flex justify-between items-center shrink-0 text-slate-600">
                            <div className="flex items-center gap-2">
                                <Eye size={14} />{' '}
                                <span>Live Preview (A4 Scale)</span>
                            </div>
                            <span className="opacity-70">
                                Mock Data Applied
                            </span>
                        </div>

                        {/* Preview Container - Scaled to look like A4 */}
                        <div className="flex-1 overflow-y-auto p-8 flex justify-center">
                            <div
                                className="bg-white shadow-xl min-h-[297mm] w-[210mm] origin-top transform scale-[0.85] p-[10mm] text-slate-800"
                                // Dangerous HTML is safe here because it's Admin-only input
                                dangerouslySetInnerHTML={{
                                    __html: renderedPreview,
                                }}
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
