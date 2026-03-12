import {
    Accordion,
    AccordionItem,
    Button,
    Card,
    CardBody,
    CardHeader,
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

// --- Mock Data: FAQ ---
const FAQS = [
    {
        id: '1',
        question: 'How do I reset my password?',
        answer: "Go to Settings > Security. Click on 'Update Password'. You will need to enter your current password to confirm the change. If you have forgotten your password entirely, use the 'Forgot Password' link on the login screen.",
    },
    {
        id: '2',
        question: 'Where can I find my invoices?',
        answer: "Navigate to the 'Billing' section in Settings, or go to the Accounting page. All past invoices are available for download in PDF format.",
    },
    {
        id: '3',
        question: 'How do I add a new team member?',
        answer: "Admins can invite new users via the 'Staff Directory' page. Click 'Add Member', enter their email, and assign a role. An invitation link will be sent to them.",
    },
    {
        id: '4',
        question: 'The system is running slow, what should I do?',
        answer: "First, check your internet connection. If the issue persists, check the 'System Status' widget on this page to see if there are any known outages. If all systems are operational, please submit a ticket.",
    },
]

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
        <div className="size-full pb-32">
            {/* --- HERO SEARCH SECTION --- */}
            <div className="bg-slate-900 text-white pt-16 pb-24 px-8 text-center relative overflow-hidden">
                {/* Decorative background blobs */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                    <h1 className="text-white text-4xl font-bold">
                        How can we help you?
                    </h1>
                    <p className="text-white/90 text-lg">
                        Search our knowledge base or get in touch with support.
                    </p>

                    <div className="mt-7 relative">
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

            <div className="w-full max-w-300 mx-auto px-8 -mt-12 relative z-10 space-y-12">
                {/* --- QUICK CATEGORIES --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {CATEGORIES.map((cat) => (
                        <Card
                            key={cat.id}
                            isPressable
                            className="shadow-lg border border-border-default hover:-translate-y-1 transition-transform"
                        >
                            <CardBody className="flex flex-col items-center justify-center p-6 text-center gap-3">
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT: FAQ & Documentation */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* FAQ Accordion */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-text-default flex items-center gap-2">
                                <HelpCircle className="text-primary" />{' '}
                                Frequently Asked Questions
                            </h2>
                            <Accordion
                                variant="splitted"
                                className="px-0"
                                itemClasses={{
                                    base: 'group-[.is-splitted]:shadow-sm group-[.is-splitted]:border group-[.is-splitted]:border-border-default',
                                }}
                            >
                                {FAQS.map((faq) => (
                                    <AccordionItem
                                        key={faq.id}
                                        aria-label={faq.question}
                                        classNames={{
                                            title: 'cursor-pointer',
                                        }}
                                        title={
                                            <span className="font-medium text-text-default">
                                                {faq.question}
                                            </span>
                                        }
                                    >
                                        <p className="text-text-subdued text-sm pb-2 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>

                        {/* Documentation Links */}
                        <Card className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm">
                            <CardBody className="flex flex-row items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm">
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
                    <div className="lg:col-span-1 space-y-6">
                        {/* System Status Widget */}
                        <Card className="bg-background-hovered border border-border-default shadow-sm">
                            <CardBody className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-text-default">
                                            System Operational
                                        </p>
                                        <p className="text-xs text-text-subdued">
                                            Last updated: Just now
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="light"
                                    className="text-xs"
                                >
                                    View History
                                </Button>
                            </CardBody>
                        </Card>

                        {/* Contact Form */}
                        <Card className="shadow-md border border-border-default">
                            <CardHeader className="px-6 pt-6 pb-0 flex-col items-start">
                                <h3 className="text-lg font-bold text-text-default">
                                    Still need help?
                                </h3>
                                <p className="text-sm text-text-subdued">
                                    Submit a ticket and our team will get back
                                    to you.
                                </p>
                            </CardHeader>
                            <CardBody className="p-6 gap-4">
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
                                    className="w-full font-bold mt-2"
                                    startContent={<Send size={18} />}
                                >
                                    Submit Ticket
                                </Button>
                            </CardBody>
                        </Card>

                        {/* Contact Info */}
                        <div className="text-center space-y-2 pt-4">
                            <p className="text-sm text-text-subdued">
                                Prefer to email us directly?
                            </p>
                            <Link
                                href="mailto:ch.duong@cadsquad.vn"
                                className="font-bold text-primary flex items-center justify-center gap-2"
                            >
                                <Mail size={16} /> ch.duong@cadsquad.vn
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
