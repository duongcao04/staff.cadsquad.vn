import {
    Button,
    Card,
    CardBody,
    Divider,
    Input,
    Select,
    SelectItem,
    Switch,
    Tab,
    Tabs,
} from '@heroui/react'
import { createFileRoute } from '@tanstack/react-router'
import { Building, DollarSign, Save,Target } from 'lucide-react'

export const Route = createFileRoute('/_administrator/financial/setting')({
    component: SettingsPage,
})

function SettingsPage() {
    return (
        <div className="p-8 max-w-250 mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        System Settings
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Configure global accounting, tax, and notification
                        rules.
                    </p>
                </div>
                <Button color="primary" startContent={<Save size={16} />}>
                    Save Changes
                </Button>
            </div>

            <div className="flex w-full flex-col">
                <Tabs
                    aria-label="Settings Options"
                    color="primary"
                    variant="underlined"
                    classNames={{
                        tabList:
                            'gap-6 w-full relative rounded-none p-0 border-b border-divider mb-6',
                        cursor: 'w-full bg-primary',
                        tab: 'max-w-fit px-0 h-12',
                    }}
                >
                    {/* TAB: General & Currency */}
                    <Tab
                        key="general"
                        title={
                            <div className="flex items-center gap-2">
                                <DollarSign size={18} />
                                <span>General & Currency</span>
                            </div>
                        }
                    >
                        <Card className="shadow-sm border border-slate-200">
                            <CardBody className="p-6 gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Select
                                        label="Base Currency"
                                        placeholder="Select currency"
                                        defaultSelectedKeys={['vnd']}
                                    >
                                        <SelectItem key="vnd" textValue="VND">
                                            VND (Vietnam Dong)
                                        </SelectItem>
                                        <SelectItem key="usd" textValue="USD">
                                            USD (US Dollar)
                                        </SelectItem>
                                    </Select>
                                    <Input
                                        label="Currency Symbol"
                                        placeholder="e.g. ₫"
                                        defaultValue="₫"
                                    />
                                </div>
                                <Divider />
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-slate-800">
                                            Automatic Exchange Rate
                                        </h4>
                                        <p className="text-xs text-slate-500">
                                            Update rates daily via API.
                                        </p>
                                    </div>
                                    <Switch defaultSelected />
                                </div>
                            </CardBody>
                        </Card>
                    </Tab>

                    {/* TAB: Tax & Company */}
                    <Tab
                        key="tax"
                        title={
                            <div className="flex items-center gap-2">
                                <Building size={18} />
                                <span>Tax & Company</span>
                            </div>
                        }
                    >
                        <Card className="shadow-sm border border-slate-200">
                            <CardBody className="p-6 gap-6">
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-border-default">
                                    <div>
                                        <h4 className="font-bold text-slate-800">
                                            Enable VAT/Tax Calculation
                                        </h4>
                                        <p className="text-xs text-slate-500">
                                            Apply tax to all generated invoices
                                            automatically.
                                        </p>
                                    </div>
                                    <Switch defaultSelected color="success" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Default VAT Rate (%)"
                                        type="number"
                                        placeholder="8"
                                        defaultValue="8"
                                        endContent="%"
                                    />
                                    <Input
                                        label="Tax ID (MST)"
                                        placeholder="0312345678"
                                    />
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Company Name (Invoice Header)"
                                            placeholder="YangIs Dev"
                                            defaultValue="YangIs Dev"
                                        />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Tab>

                    {/* TAB: Targets */}
                    <Tab
                        key="targets"
                        title={
                            <div className="flex items-center gap-2">
                                <Target size={18} />
                                <span>Financial Targets</span>
                            </div>
                        }
                    >
                        <Card className="shadow-sm border border-slate-200">
                            <CardBody className="p-6 gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Monthly Revenue Goal"
                                        placeholder="100,000,000"
                                        startContent={
                                            <span className="text-slate-400">
                                                ₫
                                            </span>
                                        }
                                    />
                                    <Input
                                        label="Min Profit Margin Warning"
                                        placeholder="20"
                                        endContent="%"
                                        description="Alert when job profit falls below this %"
                                    />
                                </div>
                            </CardBody>
                        </Card>
                    </Tab>
                </Tabs>
            </div>
        </div>
    )
}
