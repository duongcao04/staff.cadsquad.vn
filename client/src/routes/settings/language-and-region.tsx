import {
    addToast,
    Autocomplete,
    AutocompleteItem,
    Button,
    Card,
    CardBody,
    CardHeader,
    Divider,
    Select,
    SelectItem,
    Switch,
} from '@heroui/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
    AlertTriangle,
    Calendar,
    CheckCircle2,
    Clock,
    Globe,
    House,
    Save,
} from 'lucide-react'
import { useState } from 'react'

import { dateFormatter, getPageTitle, INTERNAL_URLS } from '@/lib'
import { HeroBreadcrumbItem, HeroBreadcrumbs } from '@/shared/components'

export const Route = createFileRoute('/settings/language-and-region')({
    head: () => ({
        meta: [
            {
                title: getPageTitle('Language & Region'),
            },
        ],
    }),
    component: SettingsLanguageAndRegionPage,
})

// --- Mock Data ---
const LANGUAGES = [
    { key: 'en-US', label: 'English (United States)', flag: '🇺🇸' },
    { key: 'vi-VN', label: 'Tiếng Việt (Vietnam)', flag: '🇻🇳' },
    { key: 'ja-JP', label: '日本語 (Japan)', flag: '🇯🇵' },
    { key: 'fr-FR', label: 'Français (France)', flag: '🇫🇷' },
]

const TIMEZONES = [
    { key: 'Asia/Ho_Chi_Minh', label: '(GMT+07:00) Ho Chi Minh City' },
    { key: 'Asia/Bangkok', label: '(GMT+07:00) Bangkok' },
    { key: 'Asia/Tokyo', label: '(GMT+09:00) Tokyo' },
    {
        key: 'America/New_York',
        label: '(GMT-05:00) Eastern Time (US & Canada)',
    },
    { key: 'Europe/London', label: '(GMT+00:00) London' },
    { key: 'UTC', label: '(GMT+00:00) UTC' },
]

const DATE_FORMATS = [
    { key: 'DD/MM/YYYY', label: '31/12/2024 (Day/Month/Year)' },
    { key: 'MM/DD/YYYY', label: '12/31/2024 (Month/Day/Year)' },
    { key: 'YYYY-MM-DD', label: '2024-12-31 (Year-Month-Day)' },
]

const TIME_FORMATS = [
    { key: '12h', label: '12-hour (02:30 PM)' },
    { key: '24h', label: '24-hour (14:30)' },
]

function SettingsLanguageAndRegionPage() {
    const [isSaving, setIsSaving] = useState(false)

    const currentDate = new Date()

    // Initial State (Simulating User Preferences)
    const [prefs, setPrefs] = useState({
        language: 'en-US',
        timezone: 'Asia/Ho_Chi_Minh',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h',
        autoTimezone: true,
    })

    const handleSave = () => {
        setIsSaving(true)
        // Simulate API Call
        console.log('Saving Localization Prefs:', prefs)

        setTimeout(() => {
            setIsSaving(false)
            addToast({
                title: 'Preferences updated successfully',
                color: 'success',
            })
            // In a real app, you might need to reload the page or update a global context/provider here
        }, 1000)
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
                <HeroBreadcrumbItem>Language & Region</HeroBreadcrumbItem>
            </HeroBreadcrumbs>

            <div className="mt-5">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold text-text-default mb-1">
                        Language & Region
                    </h1>
                    <p className="text-sm text-text-subdued">
                        Manage your language, date, and time preferences.
                    </p>
                </div>

                <div className="mt-7 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- LEFT: Main Settings Form --- */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 1. Language Section */}
                        <Card className="shadow-sm border border-border-default">
                            <CardHeader className="px-6 pt-6 pb-0">
                                <h3 className="text-lg font-bold text-text-default flex items-center gap-2">
                                    <Globe
                                        className="text-blue-500"
                                        size={20}
                                    />{' '}
                                    Language
                                </h3>
                            </CardHeader>
                            <CardBody className="p-6">
                                <Select
                                    label="Display Language"
                                    placeholder="Select a language"
                                    labelPlacement="outside"
                                    variant="bordered"
                                    selectedKeys={[prefs.language]}
                                    onChange={(e) =>
                                        setPrefs({
                                            ...prefs,
                                            language: e.target.value,
                                        })
                                    }
                                    className="max-w-md"
                                >
                                    {LANGUAGES.map((lang) => (
                                        <SelectItem
                                            key={lang.key}
                                            textValue={lang.label}
                                            startContent={
                                                <span className="text-lg">
                                                    {lang.flag}
                                                </span>
                                            }
                                        >
                                            {lang.label}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <p className="text-xs text-text-subdued mt-3 bg-background-hovered p-3 rounded-lg border border-border-default flex items-start gap-2">
                                    <CheckCircle2
                                        size={16}
                                        className="text-text-subdued shrink-0 mt-0.5"
                                    />
                                    <span>
                                        Changes to the language will be applied
                                        immediately across the entire dashboard.
                                    </span>
                                </p>
                            </CardBody>
                        </Card>

                        {/* 2. Region & Time Section */}
                        <Card className="shadow-sm border border-border-default">
                            <CardHeader className="px-6 pt-6 pb-0">
                                <h3 className="text-lg font-bold text-text-default flex items-center gap-2">
                                    <Clock
                                        className="text-orange-500"
                                        size={20}
                                    />{' '}
                                    Date & Time
                                </h3>
                            </CardHeader>
                            <CardBody className="p-6 gap-6">
                                {/* Timezone */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-text-subdued">
                                            Time Zone
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-text-subdued">
                                                Set Automatically
                                            </span>
                                            <Switch
                                                size="sm"
                                                isSelected={prefs.autoTimezone}
                                                onValueChange={(v) =>
                                                    setPrefs({
                                                        ...prefs,
                                                        autoTimezone: v,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <Autocomplete
                                        labelPlacement="outside"
                                        placeholder="Search timezone..."
                                        variant="bordered"
                                        defaultSelectedKey={prefs.timezone}
                                        onSelectionChange={(key) =>
                                            setPrefs({
                                                ...prefs,
                                                timezone: key as string,
                                            })
                                        }
                                        isDisabled={prefs.autoTimezone}
                                        startContent={
                                            <Globe
                                                size={16}
                                                className="text-text-subdued"
                                            />
                                        }
                                    >
                                        {TIMEZONES.map((tz) => (
                                            <AutocompleteItem
                                                key={tz.key}
                                                textValue={tz.label}
                                            >
                                                {tz.label}
                                            </AutocompleteItem>
                                        ))}
                                    </Autocomplete>
                                    {prefs.autoTimezone && (
                                        <p className="text-xs text-text-subdued mt-1 pl-1">
                                            Currently using:{' '}
                                            <span className="font-mono font-bold text-text-subdued">
                                                {prefs.timezone}
                                            </span>{' '}
                                            (Detected)
                                        </p>
                                    )}
                                </div>

                                <Divider />

                                {/* Formatting */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Select
                                        label="Date Format"
                                        labelPlacement="outside"
                                        variant="bordered"
                                        selectedKeys={[prefs.dateFormat]}
                                        onChange={(e) =>
                                            setPrefs({
                                                ...prefs,
                                                dateFormat: e.target.value,
                                            })
                                        }
                                        startContent={
                                            <Calendar
                                                size={16}
                                                className="text-text-subdued"
                                            />
                                        }
                                    >
                                        {DATE_FORMATS.map((fmt) => (
                                            <SelectItem
                                                key={fmt.key}
                                                textValue={fmt.label}
                                            >
                                                {fmt.label}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <Select
                                        label="Time Format"
                                        labelPlacement="outside"
                                        variant="bordered"
                                        selectedKeys={[prefs.timeFormat]}
                                        onChange={(e) =>
                                            setPrefs({
                                                ...prefs,
                                                timeFormat: e.target.value,
                                            })
                                        }
                                        startContent={
                                            <Clock
                                                size={16}
                                                className="text-text-subdued"
                                            />
                                        }
                                    >
                                        {TIME_FORMATS.map((fmt) => (
                                            <SelectItem
                                                key={fmt.key}
                                                textValue={fmt.key}
                                            >
                                                {fmt.label}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            </CardBody>
                        </Card>

                        <div className="flex justify-end">
                            <Button
                                color="primary"
                                onPress={handleSave}
                                isLoading={isSaving}
                                startContent={!isSaving && <Save size={18} />}
                                className="font-semibold shadow-md shadow-blue-500/20"
                            >
                                {isSaving ? 'Saving...' : 'Save Preferences'}
                            </Button>
                        </div>
                    </div>

                    {/* --- RIGHT: Preview Sidebar --- */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="sticky top-6">
                            <h4 className="text-xs font-bold text-text-subdued uppercase tracking-wider mb-4">
                                Preview
                            </h4>

                            {/* Preview Card */}
                            <Card className="bg-background-muted text-white border border-border-default shadow-xl">
                                <CardBody className="p-6 flex flex-col items-center text-center gap-4">
                                    <div className="p-3 bg-white/10 rounded-full">
                                        <Clock
                                            size={32}
                                            className="text-blue-400"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-subdued mb-1">
                                            Your Dashboard Clock
                                        </p>
                                        <h2 className="text-text-default text-3xl font-bold font-mono tracking-wide">
                                            {prefs.timeFormat === '12h'
                                                ? dateFormatter(currentDate, {
                                                      format: 'time',
                                                  })
                                                : dateFormatter(currentDate, {
                                                      format: 'time24h',
                                                  })}
                                        </h2>
                                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mt-1">
                                            {prefs.dateFormat === 'DD/MM/YYYY'
                                                ? dateFormatter(currentDate, {
                                                      format: 'semiLongDate',
                                                  })
                                                : prefs.dateFormat ===
                                                    'MM/DD/YYYY'
                                                  ? dateFormatter(currentDate, {
                                                        format: 'monthSemiLongData',
                                                    })
                                                  : dateFormatter(currentDate, {
                                                        format: 'reverseSemiLongDateDashed',
                                                    })}
                                        </p>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-lg p-3 text-xs text-text-subdued mt-2">
                                        Timezone: <br />
                                        <span className="text-text-default font-mono">
                                            {prefs.timezone}
                                        </span>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Warning about Job Deadlines */}
                            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                                <AlertTriangle
                                    className="text-amber-600 shrink-0"
                                    size={20}
                                />
                                <div>
                                    <h5 className="text-sm font-bold text-amber-900">
                                        Important Note
                                    </h5>
                                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                                        Changing your timezone will affect how{' '}
                                        <strong>Job Deadlines</strong> are
                                        displayed to you, but the actual due
                                        date stored on the server (UTC) remains
                                        the same.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
