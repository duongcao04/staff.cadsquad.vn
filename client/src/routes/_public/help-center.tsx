import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Divider,
    Input,
    Link,
    Select,
    SelectItem,
    Textarea,
} from '@heroui/react'
import { createFileRoute } from '@tanstack/react-router'
import {
    Book,
    CreditCard,
    ExternalLink,
    HelpCircle,
    Mail,
    MessageCircle,
    Paperclip,
    Search,
    Send,
    Shield,
    User,
    Zap,
} from 'lucide-react'
import { useState } from 'react'

import { FAQ } from '../../features/help-center'
import { getPageTitle } from '../../lib'

export const Route = createFileRoute('/_public/help-center')({
    head: () => ({
        meta: [
            {
                title: getPageTitle('Help Center'),
            },
        ],
    }),
    component: HelpCenterPage,
})

const CATEGORIES = [
    {
        id: 'account',
        label: 'Account & Login',
        icon: User,
        color: 'text-blue-500',
        bg: 'bg-blue-50',
    },
    {
        id: 'billing',
        label: 'Billing & Invoices',
        icon: CreditCard,
        color: 'text-emerald-500',
        bg: 'bg-emerald-50',
    },
    {
        id: 'tech',
        label: 'Technical Support',
        icon: Zap,
        color: 'text-purple-500',
        bg: 'bg-purple-50',
    },
    {
        id: 'security',
        label: 'Security & Privacy',
        icon: Shield,
        color: 'text-rose-500',
        bg: 'bg-rose-50',
    },
]

function HelpCenterPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [ticketSubject, setTicketSubject] = useState('')

    return (
        <div className="pb-32 size-full">
            {/* --- HERO SEARCH SECTION --- */}
            <div className="relative px-8 pt-16 pb-24 overflow-hidden text-center text-white bg-slate-900">
                {/* Decorative background blobs */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                    <h1 className="text-4xl font-bold text-white">
                        How can we help you?
                    </h1>
                    <p className="text-lg text-white/90">
                        Search our knowledge base or get in touch with support.
                    </p>

                    <div className="relative mt-7">
                        <Input
                            size="lg"
                            placeholder="Search for answers (e.g. 'invoice', 'password')"
                            startContent={
                                <Search className="text-text-subdued" />
                            }
                            className="w-full text-text-default"
                            classNames={{
                                inputWrapper:
                                    'bg-background-hovered backdrop-blur-md shadow-lg h-14',
                            }}
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                        />
                    </div>
                </div>
            </div>

            <div className="relative z-10 w-full px-8 mx-auto -mt-12 space-y-12 max-w-300">
                {/* --- QUICK CATEGORIES --- */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {CATEGORIES.map((cat) => (
                        <Card
                            key={cat.id}
                            isPressable
                            className="transition-transform border shadow-lg border-border-default hover:-translate-y-1"
                        >
                            <CardBody className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center ${cat.bg} ${cat.color}`}
                                >
                                    <cat.icon size={24} />
                                </div>
                                <span className="font-bold text-text-subdued">
                                    {cat.label}
                                </span>
                            </CardBody>
                        </Card>
                    ))}
                </div>

                {/* --- MAIN CONTENT SPLIT --- */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* LEFT: FAQ & Documentation */}
                    <div className="space-y-8 lg:col-span-2">
                        {/* FAQ Accordion */}
                        <div className="space-y-4">
                            <h2 className="flex items-center gap-2 text-2xl font-bold text-text-default">
                                <HelpCircle className="text-primary" />{' '}
                                Frequently Asked Questions
                            </h2>
                            <Divider className="bg-border-default" />
                            <FAQ />
                        </div>

                        {/* Documentation Links */}
                        <Card className="border border-blue-100 shadow-sm bg-linear-to-r from-blue-50 to-indigo-50">
                            <CardBody className="flex flex-row items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 text-blue-600 bg-white shadow-sm rounded-xl">
                                        <Book size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">
                                            Developer Documentation
                                        </h3>
                                        <p className="text-sm text-text-subdued">
                                            API References, SDKs, and
                                            Integration Guides.
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    color="primary"
                                    endContent={<ExternalLink size={16} />}
                                >
                                    Visit Docs
                                </Button>
                            </CardBody>
                        </Card>
                    </div>

                    {/* RIGHT: Contact Form & Status */}
                    <div className='static lg:sticky top-30'>
                        <div className="space-y-6 lg:col-span-1">
                            {/* Contact Form */}
                            <Card className="border shadow-md border-border-default">
                                <CardHeader className="flex-col items-start px-6 pt-6 pb-0">
                                    <h3 className="text-lg font-bold text-text-default">
                                        Still need help?
                                    </h3>
                                    <p className="text-sm text-text-subdued">
                                        Submit a ticket and our team will get back
                                        to you.
                                    </p>
                                </CardHeader>
                                <CardBody className="gap-4 p-6">
                                    <Input
                                        label="Subject"
                                        placeholder="Brief summary of the issue"
                                        labelPlacement="outside"
                                        variant="bordered"
                                        value={ticketSubject}
                                        onValueChange={setTicketSubject}
                                    />
    
                                    <Select
                                        label="Category"
                                        placeholder="Select a topic"
                                        labelPlacement="outside"
                                        variant="bordered"
                                    >
                                        <SelectItem
                                            key="bug"
                                            startContent={<Zap size={16} />}
                                        >
                                            Report a Bug
                                        </SelectItem>
                                        <SelectItem
                                            key="billing"
                                            startContent={<CreditCard size={16} />}
                                        >
                                            Billing Question
                                        </SelectItem>
                                        <SelectItem
                                            key="account"
                                            startContent={<User size={16} />}
                                        >
                                            Account Issue
                                        </SelectItem>
                                        <SelectItem
                                            key="other"
                                            startContent={
                                                <MessageCircle size={16} />
                                            }
                                        >
                                            Other
                                        </SelectItem>
                                    </Select>
    
                                    <Textarea
                                        label="Description"
                                        placeholder="Please describe the issue in detail..."
                                        labelPlacement="outside"
                                        variant="bordered"
                                        minRows={4}
                                    />
    
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            startContent={<Paperclip size={16} />}
                                        >
                                            Attach Files
                                        </Button>
                                        <span className="text-xs text-text-subdued">
                                            Max 5MB (JPG, PNG, PDF)
                                        </span>
                                    </div>
    
                                    <Button
                                        color="primary"
                                        className="w-full mt-2 font-bold"
                                        startContent={<Send size={18} />}
                                    >
                                        Submit Ticket
                                    </Button>
                                </CardBody>
                            </Card>
    
                            {/* Contact Info */}
                            <div className="pt-4 space-y-2 text-center">
                                <p className="text-sm text-text-subdued">
                                    Prefer to email us directly?
                                </p>
                                <Link
                                    href="mailto:ch.duong@cadsquad.vn"
                                    className="flex items-center justify-center gap-2 font-bold text-primary"
                                >
                                    <Mail size={16} /> ch.duong@cadsquad.vn
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
