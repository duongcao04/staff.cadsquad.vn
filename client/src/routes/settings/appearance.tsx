import {
    addToast,
    Avatar,
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Divider,
    Slider,
    Switch,
} from '@heroui/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
    Check,
    House,
    Monitor,
    Moon,
    Palette,
    RefreshCwIcon,
    RotateCcw,
    Save,
    Sun,
    Type,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useMemo, useState } from 'react'
import { getPageTitle, INTERNAL_URLS } from '../../lib'
import {
    HeroBreadcrumbItem,
    HeroBreadcrumbs,
    HeroTooltip,
} from '../../shared/components'
import SettingTitle from '../../features/settings/components/SettingTitle'
import {
    TextScalingKey,
    useAppTheme,
} from '../../shared/contexts/AppThemeContext'
import { useDevice } from '../../shared/hooks'

const THEME_COLORS = [
    { key: 'blue', hex: '#1f1d80', label: 'Ocean Blue' },
    { key: 'violet', hex: '#8B5CF6', label: 'Royal Violet' },
    { key: 'emerald', hex: '#10B981', label: 'Emerald Green' },
    { key: 'orange', hex: '#F97316', label: 'Sunset Orange' },
    { key: 'rose', hex: '#F43F5E', label: 'Rose Red' },
    { key: 'slate', hex: '#64748B', label: 'Slate Grey' },
]

export const Route = createFileRoute('/settings/appearance')({
    head: () => ({
        meta: [
            {
                title: getPageTitle('Appearance'),
            },
        ],
    }),
    component: AppearanceSettingsPage,
})

function AppearanceSettingsPage() {
    const { isSmallView } = useDevice()
    const {
        themeColor,
        setThemeColor,
        textScaling,
        setTextScaling,
        themeMotion,
        setThemeMotion,
        resetDefault,
    } = useAppTheme()

    const [isLoading, setLoading] = useState(false)
    const [isResetting, setResetting] = useState(false)
    const { theme, setTheme } = useTheme()
    const [color, setColor] = useState(
        THEME_COLORS.find((c) => c.key === themeColor) || THEME_COLORS[0]
    )
    const [fontSize, setFontSize] = useState<TextScalingKey>(textScaling) // sm, md, lg
    const [reducedMotion, setReducedMotion] = useState(themeMotion)

    const handleSaveChanges = async () => {
        setLoading(true)
        setTimeout(() => {
            setThemeColor(color.key as never)
            setTextScaling(fontSize)
            setThemeMotion(reducedMotion)
            addToast({
                title: 'Update theme successfully',
                color: 'success',
            })
            setLoading(false)
            window.location.reload()
        }, 1400)
    }
    const handleResetDefault = async () => {
        setResetting(true)
        setTimeout(() => {
            resetDefault()
            addToast({
                title: 'Reset theme to default successfully',
                color: 'success',
            })
            setResetting(false)
            window.location.reload()
        }, 1400)
    }

    const canSaveChange = useMemo(
        () =>
            color.key !== themeColor ||
            fontSize !== textScaling ||
            reducedMotion !== themeMotion,
        [color.key, fontSize, reducedMotion]
    )

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
                <HeroBreadcrumbItem>Appearance</HeroBreadcrumbItem>
            </HeroBreadcrumbs>
            <div className="mt-5">
                {/* Header */}
                <div
                    className="flex justify-between"
                    style={{
                        flexDirection: isSmallView ? 'column' : 'row',
                        alignItems: isSmallView ? 'start' : 'center',
                        gap: '24px',
                    }}
                >
                    <SettingTitle
                        title="Appearance"
                        description="
                            Customize the look and feel of your workspace."
                    />
                    <div
                        className={`flex ${isSmallView && 'w-full justify-end mt-2'} gap-3`}
                    >
                        <Button
                            variant="flat"
                            color="warning"
                            isDisabled={isResetting}
                            startContent={
                                isResetting ? (
                                    <RefreshCwIcon
                                        size={18}
                                        className="animate-spin-smooth"
                                    />
                                ) : (
                                    <RotateCcw size={18} />
                                )
                            }
                            onPress={handleResetDefault}
                        >
                            Reset Default
                        </Button>
                        <Button
                            color="primary"
                            startContent={
                                isLoading ? (
                                    <RefreshCwIcon
                                        size={18}
                                        className="animate-spin-smooth"
                                    />
                                ) : (
                                    <Save size={18} />
                                )
                            }
                            isDisabled={isLoading || !canSaveChange}
                            onPress={handleSaveChanges}
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>

                <div className="mt-7 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- LEFT COLUMN: Settings Controls --- */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* 1. Theme Mode */}
                        <section>
                            <h3 className="font-bold text-text-default text-base mb-4 flex items-center gap-2">
                                <Sun size={20} /> Interface Theme
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    {
                                        id: 'light',
                                        icon: Sun,
                                        label: 'Light Mode',
                                    },
                                    {
                                        id: 'dark',
                                        icon: Moon,
                                        label: 'Dark Mode',
                                    },
                                    {
                                        id: 'system',
                                        icon: Monitor,
                                        label: 'System Sync',
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => setTheme(item.id)}
                                        className={`
                            cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-3 transition-all
                            ${
                                theme === item.id
                                    ? 'border-primary text-primary dark:border-border-default/90 bg-background-hovered dark:text-text-default'
                                    : 'dark:text-text-subdued border-border-default bg-background hover:bg-background-hovered hover:border-border-default/90'
                            }
                          `}
                                    >
                                        <item.icon size={24} />
                                        <span className="font-semibold text-sm">
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <Divider />

                        {/* 2. Brand Color */}
                        <section>
                            <h3 className="font-bold text-text-default text-base mb-4 flex items-center gap-2">
                                <Palette size={20} /> Accent Color
                            </h3>
                            <div className="flex flex-wrap gap-4">
                                {THEME_COLORS.map((c) => {
                                    return (
                                        <HeroTooltip
                                            key={c.key}
                                            content={c.label}
                                        >
                                            <button
                                                onClick={() => setColor(c)}
                                                className={`cursor-pointer w-12 h-12 rounded-full flex items-center justify-center transition-all border-2 ${color.key === c.key ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent hover:scale-105'}
                            `}
                                                style={{
                                                    backgroundColor: c.hex,
                                                }}
                                            >
                                                {color.key === c.key && (
                                                    <Check
                                                        className="text-white"
                                                        size={20}
                                                    />
                                                )}
                                            </button>
                                        </HeroTooltip>
                                    )
                                })}
                            </div>
                        </section>

                        <Divider />

                        {/* 3. Data Density & Font */}
                        <section>
                            <h3 className="font-bold text-text-default text-base mb-4 flex items-center gap-2">
                                <Type size={20} /> Text Scaling
                            </h3>
                            <div className="bg-background p-6 rounded-xl border border-border-default shadow-sm">
                                <div className="flex justify-between mb-2 px-1">
                                    <span className="text-xs font-bold text-text-subdued">
                                        Small
                                    </span>
                                    <span className="text-xs font-bold text-text-subdued">
                                        Large
                                    </span>
                                </div>
                                <Slider
                                    step={1}
                                    maxValue={3}
                                    minValue={1}
                                    defaultValue={
                                        textScaling === 'small'
                                            ? 1
                                            : textScaling === 'medium'
                                              ? 2
                                              : 3
                                    }
                                    showSteps={true}
                                    size="sm"
                                    color="primary"
                                    className="max-w-md"
                                    onChange={(v) =>
                                        setFontSize(
                                            v === 1
                                                ? 'small'
                                                : v === 3
                                                  ? 'large'
                                                  : 'medium'
                                        )
                                    }
                                />
                                <div className="mt-4 text-center">
                                    <span className="text-sm font-semibold text-primary capitalize">
                                        {fontSize === 'small'
                                            ? 'Compact'
                                            : fontSize === 'large'
                                              ? 'Large'
                                              : 'Standard'}{' '}
                                        Size
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-between items-center bg-background-muted p-4 rounded-xl border border-border-default">
                                <div>
                                    <p className="font-semibold text-text-default text-sm">
                                        Reduced Motion
                                    </p>
                                    <p className="text-xs text-text-subdued">
                                        Disable animations
                                    </p>
                                </div>
                                <Switch
                                    size="sm"
                                    isSelected={!reducedMotion}
                                    onValueChange={(isSelected) => {
                                        setReducedMotion(!isSelected)
                                    }}
                                />
                            </div>
                        </section>
                    </div>

                    {/* --- RIGHT COLUMN: Live Preview --- */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            <h3 className="font-bold text-text-subdued uppercase text-xs tracking-wider">
                                Live Preview
                            </h3>

                            {/* Preview Card */}
                            <Card
                                className="w-full shadow-lg border-t-4 relative"
                                style={{ borderColor: color.hex }}
                            >
                                <div className="absolute top-0 right-0 size-full bg-transparent z-1 cursor-not-allowed" />
                                <CardHeader className="flex gap-3">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                                        style={{
                                            backgroundColor: color.hex,
                                        }}
                                    >
                                        A
                                    </div>
                                    <div className="flex flex-col">
                                        <p
                                            className={`font-bold text-text-default ${fontSize === 'large' ? 'text-lg' : fontSize === 'small' ? 'text-sm' : 'text-base'}`}
                                        >
                                            App Dashboard
                                        </p>
                                        <p className="text-small text-default-500">
                                            Theme Preview
                                        </p>
                                    </div>
                                </CardHeader>
                                <Divider />
                                <CardBody className="gap-4">
                                    <p
                                        className={`text-slate-600 ${fontSize === 'large' ? 'text-base' : fontSize === 'small' ? 'text-xs' : 'text-sm'}`}
                                    >
                                        This is how your content will look.
                                    </p>

                                    {/* Dynamic Table Preview */}
                                    <PreviewTable
                                        fontSize={fontSize}
                                        themeColor={color.hex}
                                    />

                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            style={{
                                                color: color.hex,
                                                backgroundColor: `${color.hex}20`,
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            style={{
                                                backgroundColor: color.hex,
                                                color: 'white',
                                            }}
                                        >
                                            Confirm
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>

                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <p className="text-xs text-blue-800">
                                    <strong>Note:</strong> Some changes (like
                                    Dark Mode) may require a page refresh to
                                    apply fully across all charts and maps.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

// --- Preview Component (Mock Table) ---
const PreviewTable = ({ fontSize, themeColor }: any) => {
    const textSize =
        fontSize === 'sm'
            ? 'text-xs'
            : fontSize === 'lg'
              ? 'text-base'
              : 'text-sm'

    return (
        <div
            className={`border border-border-default rounded-xl overflow-hidden bg-white shadow-sm`}
        >
            <div className="bg-background-hovered px-4 py-2 border-b border-border-default flex justify-between items-center">
                <span className="text-xs font-bold text-text-subdued uppercase">
                    Preview: Data Table
                </span>
            </div>
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border-default bg-background-muted">
                        <th
                            className={`text-left px-4 py-2 font-semibold text-text-subdued ${textSize}`}
                        >
                            Name
                        </th>
                        <th
                            className={`text-left px-4 py-2 font-semibold text-text-subdued ${textSize}`}
                        >
                            Role
                        </th>
                        <th
                            className={`text-left px-4 py-2 font-semibold text-text-subdued ${textSize}`}
                        >
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {[1, 2].map((i) => (
                        <tr
                            key={i}
                            className="border-b bg-background border-border-default last:border-0"
                        >
                            <td className={`px-4 py-4`}>
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        size="sm"
                                        src={`https://i.pravatar.cc/150?u=${i}`}
                                    />
                                    <div>
                                        <p
                                            className={`font-bold text-text-default ${textSize}`}
                                        >
                                            User {i}
                                        </p>
                                        <p className="text-[10px] text-text-subdued">
                                            user{i}@example.com
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td
                                className={`px-4 py-4 text-slate-600 ${textSize}`}
                            >
                                Developer
                            </td>
                            <td className={`px-4 py-4`}>
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    className="capitalize"
                                    style={{
                                        color: themeColor,
                                        backgroundColor: `${themeColor}20`,
                                    }}
                                >
                                    Active
                                </Chip>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
