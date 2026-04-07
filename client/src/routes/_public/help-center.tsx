import {
    Button,
    Card,
    CardBody,
    Link
} from '@heroui/react'
import { createFileRoute } from '@tanstack/react-router'
import {
    Book,
    ExternalLink,
    HelpCircle,
    Mail
} from 'lucide-react'
import { FAQ, SupportForm } from '../../features/help-center'

export const Route = createFileRoute('/_public/help-center')({
    head: () => ({
        meta: [
            {
                title: 'Help Center',
            },
        ],
    }),
    component: HelpCenterPage,
})

function HelpCenterPage() {
    return (
        <div className="pb-32 space-y-10 size-full">
            {/* --- HERO SEARCH SECTION --- */}
            <div className="relative px-8 py-16 overflow-hidden text-center text-white bg-slate-900">
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
                </div>
            </div>

            <div className="w-full px-8 mx-auto space-y-12 max-w-7xl">
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
                    <div className="static lg:sticky top-30">
                        <div className="space-y-6 lg:col-span-1">
                            {/* Contact Form */}
                            <SupportForm />

                            {/* Contact Info */}
                            <div className="pt-2 space-y-2 text-center">
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
