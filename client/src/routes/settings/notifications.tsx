import {
    Button,
    Divider,
    Select,
    SelectItem,
    Switch,
    Tooltip,
} from '@heroui/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
    AlertCircle,
    Bell,
    Briefcase,
    Clock,
    House,
    Mail,
    MessageSquare,
    Moon,
    Save,
    Smartphone,
    Zap,
} from 'lucide-react'
import { useState } from 'react'

import { getPageTitle, INTERNAL_URLS } from '../../lib'
import {
    HeroBreadcrumbItem,
    HeroBreadcrumbs,
    HeroCard,
    HeroCardBody,
    HeroCardHeader,
} from '../../shared/components'

export const Route = createFileRoute('/settings/notifications')({
    head: () => ({
        meta: [
            {
                title: getPageTitle('Notification Settings'),
            },
        ],
    }),
    component: NotificationSettingsPage,
})

// --- Mock Data: User Preferences (Stored in UserConfig JSON) ---
const INITIAL_PREFS = {
    channels: {
        email: true,
        browser: true,
        mobile: false,
    },
    dnd: {
        enabled: true,
        start: '22:00',
        end: '08:00',
        timezone: 'Asia/Ho_Chi_Minh',
    },
    triggers: [
        {
            id: 'job_assign',
            label: 'Job Assigned',
            desc: 'When you are added to a new job',
            email: true,
            push: true,
            inApp: true,
            icon: Briefcase,
        },
        {
            id: 'job_status',
            label: 'Job Status Change',
            desc: 'When a job moves to a new stage',
            email: false,
            push: true,
            inApp: true,
            icon: Zap,
        },
        {
            id: 'comments',
            label: 'New Comments',
            desc: 'When someone comments on your job',
            email: true,
            push: true,
            inApp: true,
            icon: MessageSquare,
        },
        {
            id: 'mentions',
            label: 'Mentions (@)',
            desc: 'When someone tags you directly',
            email: true,
            push: true,
            inApp: true,
            icon: Bell,
        },
        {
            id: 'deadline',
            label: 'Deadline Warning',
            desc: '24h before a job is due',
            email: true,
            push: true,
            inApp: true,
            icon: Clock,
        },
        {
            id: 'system',
            label: 'System Alerts',
            desc: 'Maintenance and security updates',
            email: true,
            push: false,
            inApp: true,
            icon: AlertCircle,
        },
    ],
}

function NotificationSettingsPage() {
    const [prefs, setPrefs] = useState(INITIAL_PREFS)
    const [isSaving, setIsSaving] = useState(false)

    // Toggle Helper
    const toggleTrigger = (
        index: number,
        channel: 'email' | 'push' | 'inApp'
    ) => {
        const newTriggers = [...prefs.triggers]
        newTriggers[index][channel] = !newTriggers[index][channel]
        setPrefs({ ...prefs, triggers: newTriggers })
    }

    const handleSave = () => {
        setIsSaving(true)
        // Simulate API Call
        setTimeout(() => setIsSaving(false), 1000)
    }

    return (
        <>
            <HeroBreadcrumbs className="text-xs">
                <HeroBreadcrumbItem>
                    <Link
                        to={INTERNAL_URLS.home}
                        className="text-text-subdued!"
                    >
                        <House size={16} />
                    </Link>
                </HeroBreadcrumbItem>
                <HeroBreadcrumbItem>
                    <Link
                        to={INTERNAL_URLS.settings}
                        className="text-text-subdued!"
                    >
                        Settings
                    </Link>
                </HeroBreadcrumbItem>
                <HeroBreadcrumbItem>Notifications</HeroBreadcrumbItem>
            </HeroBreadcrumbs>

            <div className="mt-5">
                {/* --- Header --- */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-text-default mb-1">
                            Notification Preferences
                        </h1>
                        <p className="text-sm text-text-subdued">
                            Manage how and when you receive alerts.
                        </p>
                    </div>
                    <Button
                        color="primary"
                        startContent={isSaving ? null : <Save size={18} />}
                        isLoading={isSaving}
                        onPress={handleSave}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>

                <div className="mt-7 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- LEFT COLUMN: General Settings --- */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Master Channels */}
                        <HeroCard>
                            <HeroCardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                                <h4 className="font-bold text-base">
                                    Enable Channels
                                </h4>
                                <p className="text-tiny text-default-500">
                                    Global master switches
                                </p>
                            </HeroCardHeader>
                            <HeroCardBody className="py-4 gap-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <Mail size={18} />
                                        </div>
                                        <span className="text-sm font-medium">
                                            Email Notifications
                                        </span>
                                    </div>
                                    <Switch
                                        isSelected={prefs.channels.email}
                                        onValueChange={(v) =>
                                            setPrefs({
                                                ...prefs,
                                                channels: {
                                                    ...prefs.channels,
                                                    email: v,
                                                },
                                            })
                                        }
                                    />
                                </div>
                                <Divider />
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                            <Bell size={18} />
                                        </div>
                                        <span className="text-sm font-medium">
                                            Push / Browser
                                        </span>
                                    </div>
                                    <Switch
                                        isSelected={prefs.channels.browser}
                                        onValueChange={(v) =>
                                            setPrefs({
                                                ...prefs,
                                                channels: {
                                                    ...prefs.channels,
                                                    browser: v,
                                                },
                                            })
                                        }
                                    />
                                </div>
                            </HeroCardBody>
                        </HeroCard>

                        {/* Do Not Disturb */}
                        <HeroCard>
                            <HeroCardHeader className="pb-0 pt-4 px-4 flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-base">
                                        Quiet Hours
                                    </h4>
                                    <p className="text-tiny text-default-500">
                                        Pause notifications automatically
                                    </p>
                                </div>
                                <Switch
                                    size="sm"
                                    isSelected={prefs.dnd.enabled}
                                    onValueChange={(v) =>
                                        setPrefs({
                                            ...prefs,
                                            dnd: { ...prefs.dnd, enabled: v },
                                        })
                                    }
                                />
                            </HeroCardHeader>
                            <HeroCardBody
                                className={`py-4 gap-4 ${!prefs.dnd.enabled ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <Select
                                        label="Start Time"
                                        size="sm"
                                        defaultSelectedKeys={[prefs.dnd.start]}
                                    >
                                        <SelectItem key="21:00">
                                            09:00 PM
                                        </SelectItem>
                                        <SelectItem key="22:00">
                                            10:00 PM
                                        </SelectItem>
                                        <SelectItem key="23:00">
                                            11:00 PM
                                        </SelectItem>
                                    </Select>
                                    <Select
                                        label="End Time"
                                        size="sm"
                                        defaultSelectedKeys={[prefs.dnd.end]}
                                    >
                                        <SelectItem key="07:00">
                                            07:00 AM
                                        </SelectItem>
                                        <SelectItem key="08:00">
                                            08:00 AM
                                        </SelectItem>
                                        <SelectItem key="09:00">
                                            09:00 AM
                                        </SelectItem>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-text-subdued bg-slate-100 p-2 rounded-lg">
                                    <Moon size={14} />
                                    <span>
                                        Based on:{' '}
                                        <strong>{prefs.dnd.timezone}</strong>
                                    </span>
                                </div>
                            </HeroCardBody>
                        </HeroCard>
                    </div>

                    {/* --- RIGHT COLUMN: Granular Matrix --- */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Notification Matrix */}
                        <HeroCard className="px-0">
                            <HeroCardHeader className="px-6 py-4 border-b border-border-default bg-background-muted">
                                <div className="flex-1">
                                    <h4 className="font-bold text-base text-text-default">
                                        Trigger Rules
                                    </h4>
                                    <p className="text-sm text-text-subdued">
                                        Fine-tune what you receive per channel.
                                    </p>
                                </div>

                                {/* Column Headers */}
                                <div className="hidden md:flex gap-8 justify-end">
                                    <div className="w-12 text-center text-xs font-bold text-slate-400 uppercase flex flex-col items-center gap-1">
                                        <Bell size={16} /> In-App
                                    </div>
                                    <div className="w-12 text-center text-xs font-bold text-slate-400 uppercase flex flex-col items-center gap-1">
                                        <Mail size={16} /> Email
                                    </div>
                                    <div className="w-12 text-center text-xs font-bold text-slate-400 uppercase flex flex-col items-center gap-1">
                                        <Smartphone size={16} /> Push
                                    </div>
                                </div>
                            </HeroCardHeader>

                            <HeroCardBody className="p-0">
                                {prefs.triggers.map((trigger, idx) => (
                                    <div
                                        key={trigger.id}
                                        className="flex flex-col md:flex-row items-center justify-between p-4 border-b border-border-default last:border-0 hover:bg-background-hovered transition-colors"
                                    >
                                        <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
                                            <div
                                                className={`p-2.5 rounded-xl ${trigger.inApp ? 'bg-primary-50 text-primary' : 'bg-slate-100 text-slate-400'}`}
                                            >
                                                <trigger.icon size={20} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-text-default text-sm">
                                                    {trigger.label}
                                                </p>
                                                <p className="text-xs text-text-subdued">
                                                    {trigger.desc}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-8 pr-2">
                                            <Tooltip content="Toggle In-App">
                                                <Switch
                                                    size="sm"
                                                    isSelected={trigger.inApp}
                                                    onValueChange={() =>
                                                        toggleTrigger(
                                                            idx,
                                                            'inApp'
                                                        )
                                                    }
                                                />
                                            </Tooltip>
                                            <Tooltip content="Toggle Email">
                                                <Switch
                                                    size="sm"
                                                    isSelected={trigger.email}
                                                    onValueChange={() =>
                                                        toggleTrigger(
                                                            idx,
                                                            'email'
                                                        )
                                                    }
                                                    color="warning"
                                                />
                                            </Tooltip>
                                            <Tooltip content="Toggle Mobile Push">
                                                <Switch
                                                    size="sm"
                                                    isSelected={trigger.push}
                                                    onValueChange={() =>
                                                        toggleTrigger(
                                                            idx,
                                                            'push'
                                                        )
                                                    }
                                                    color="success"
                                                />
                                            </Tooltip>
                                        </div>
                                    </div>
                                ))}
                            </HeroCardBody>
                        </HeroCard>
                    </div>
                </div>
            </div>
        </>
    )
}
