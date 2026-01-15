import { Button, Card, CardBody } from '@heroui/react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Lock, Palette, User } from 'lucide-react'
import { INTERNAL_URLS } from '@/lib'

export const Route = createFileRoute('/settings/')({
    component: SettingsIndexPage,
})

// --- Configuration Data (Matches Sidebar) ---
const SETTINGS_SECTIONS = [
    {
        title: 'Account',
        description: 'Manage your personal details and login security.',
        items: [
            {
                key: 'profile',
                label: 'My Profile',
                desc: 'Update name, avatar & bio',
                icon: User,
                href: INTERNAL_URLS.accountSettings,
                color: 'text-blue-500',
                bg: 'bg-blue-50',
            },
            {
                key: 'security',
                label: 'Login & Security',
                desc: 'Password, 2FA & Sessions',
                icon: Lock,
                href: INTERNAL_URLS.loginAndSecurity,
                color: 'text-rose-500',
                bg: 'bg-rose-50',
            },
            // {
            //     key: 'notifications',
            //     label: 'Notifications',
            //     desc: 'Email & Push preferences',
            //     icon: Bell,
            //     href: INTERNAL_URLS.notificationsSettings,
            //     color: 'text-amber-500',
            //     bg: 'bg-amber-50',
            // },
        ],
    },
    {
        title: 'Workspace',
        description: 'Customize your team environment and branding.',
        items: [
            // {
            //     key: 'general',
            //     label: 'General & Branding',
            //     desc: 'Logo, Name & Timezone',
            //     icon: Building,
            //     href: '/settings/general',
            //     color: 'text-purple-500',
            //     bg: 'bg-purple-50',
            // },
            {
                key: 'appearance',
                label: 'Appearance',
                desc: 'Dark mode, themes & density',
                icon: Palette,
                href: INTERNAL_URLS.appearance,
                color: 'text-pink-500',
                bg: 'bg-pink-50',
            },
            // {
            //     key: 'billing',
            //     label: 'Billing & Plans',
            //     desc: 'Invoices & Payment methods',
            //     icon: CreditCard,
            //     href: '/settings/billing',
            //     color: 'text-emerald-500',
            //     bg: 'bg-emerald-50',
            // },
            // {
            //     key: 'language',
            //     label: 'Language & Region',
            //     desc: 'System language & currency',
            //     icon: Globe,
            //     href: INTERNAL_URLS.languageAndRegionSettings,
            //     color: 'text-indigo-500',
            //     bg: 'bg-indigo-50',
            // },
        ],
    },
    // {
    //     title: 'App & Privacy',
    //     description: 'Control device access and data privacy.',
    //     items: [
    //         {
    //             key: 'devices',
    //             label: 'Device Management',
    //             desc: 'Active sessions & trusted devices',
    //             icon: Smartphone,
    //             href: '/settings/devices',
    //             color: 'text-slate-600',
    //             bg: 'bg-slate-100',
    //         },
    //         {
    //             key: 'privacy',
    //             label: 'Privacy & Data',
    //             desc: 'Data export & deletion',
    //             icon: ShieldAlert,
    //             href: '/settings/privacy',
    //             color: 'text-red-500',
    //             bg: 'bg-red-50',
    //         },
    //     ],
    // },
]

function SettingsIndexPage() {
    const router = useRouter()

    return (
        <div className="space-y-10">
            {/* --- Page Header --- */}
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-text-default mb-2">
                    Settings
                </h1>
                <p className="text-text-subdued">
                    Manage your account settings and set e-mail preferences.
                </p>
            </div>

            {/* --- Sections Loop --- */}
            {SETTINGS_SECTIONS.map((section) => (
                <div key={section.title} className="space-y-4">
                    {/* Section Header */}
                    <div className="border-b border-border-default pb-2 mb-6">
                        <h2 className="text-xl font-bold text-text-default">
                            {section.title}
                        </h2>
                        <p className="mt-0.5 text-xs text-text-subdued hidden sm:block">
                            {section.description}
                        </p>
                    </div>

                    {/* Grid of Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {section.items.map((item) => (
                            <Card
                                key={item.key}
                                isPressable
                                isHoverable
                                className="w-full border border-border-default shadow-sm hover:border-primary/50 transition-all bg-background group"
                                onPress={() =>
                                    router.navigate({
                                        href: item.href,
                                    })
                                }
                            >
                                <CardBody className="w-full p-4 flex items-center gap-4">
                                    {/* Icon Box */}
                                    <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.bg} ${item.color}`}
                                    >
                                        <item.icon size={24} />
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1 text-center">
                                        <h3 className="font-bold text-text-default text-sm group-hover:text-primary transition-colors">
                                            {item.label}
                                        </h3>
                                        <p className="text-xs text-text-subdued mt-0.5">
                                            {item.desc}
                                        </p>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}

            {/* --- Quick Support Footer --- */}
            <div className="mt-12 p-6 bg-primary-50 rounded-2xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h4 className="font-bold text-blue-900 text-lg">
                        Need help?
                    </h4>
                    <p className="text-sm text-blue-700">
                        Can't find the setting you're looking for? Check our
                        documentation.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="solid"
                        color="primary"
                        className="bg-blue-600"
                        onPress={() => {
                            router.navigate({
                                href: INTERNAL_URLS.helpCenter,
                            })
                        }}
                    >
                        Help Center
                    </Button>
                    <a
                        href="mailto:ch.duong@cadsquad.vn"
                        target="_blank"
                        className="block"
                    >
                        <Button variant="light" className="text-blue-700">
                            Contact Support
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    )
}
