import { cn, Listbox, ListboxItem, ListboxSection } from '@heroui/react'
import { useRouter, useRouterState } from '@tanstack/react-router'
import { HelpCircle, Lock, LogOut, Palette, User } from 'lucide-react'
import { envConfig, INTERNAL_URLS } from '@/lib'

// Define the structure of the settings menu
const SETTINGS_MENU = [
    {
        title: 'Account',
        items: [
            {
                key: 'profile',
                label: 'My Profile',
                icon: User,
                href: INTERNAL_URLS.settings.profile,
            },
            {
                key: 'security',
                label: 'Login & Security',
                icon: Lock,
                href: INTERNAL_URLS.settings.loginAndSecurity,
            },
            // {
            //     key: 'notifications',
            //     label: 'Notifications',
            //     icon: Bell,
            //     href: INTERNAL_URLS.notificationsSettings,
            // },
        ],
    },
    {
        title: 'Workspace',
        items: [
            {
                key: 'appearance',
                label: 'Appearance',
                icon: Palette,
                href: INTERNAL_URLS.settings.appearance,
            },
            // {
            //     key: 'language',
            //     label: 'Language & Region',
            //     icon: Globe,
            //     href: INTERNAL_URLS.languageAndRegionSettings,
            // },
        ],
    },
]

export default function SettingsSidebar() {
    const pathname = useRouterState({
        select: (state) => state.location.pathname,
    })
    const router = useRouter()
    // Wrapper class for the centered layout style
    // Often used inside a grid like: grid-cols-[280px_1fr] max-w-5xl mx-auto
    return (
        <aside className="w-full max-w-70 hidden md:flex flex-col gap-6 sticky top-8 h-fit">
            <div className="w-full bg-background rounded-2xl shadow-sm border border-border-default overflow-hidden py-2">
                <Listbox
                    variant="flat"
                    aria-label="Settings Menu"
                    className="p-2"
                    itemClasses={{
                        base: 'px-3 py-2.5 rounded-xl data-[hover=true]:bg-background-hovered mb-1 transition-colors',
                        title: 'text-sm font-medium',
                        selectedIcon: 'hidden', // Hide default checkmark
                    }}
                >
                    {SETTINGS_MENU.map((section, idx) => (
                        <ListboxSection
                            key={section.title}
                            title={section.title}
                            showDivider={idx !== SETTINGS_MENU.length - 1}
                            classNames={{
                                heading:
                                    'text-xs font-bold text-text-default uppercase tracking-wider px-3 mb-4 mt-2',
                                divider: 'my-2 bg-border-default',
                            }}
                        >
                            {section.items.map((item) => {
                                const isSelected = pathname === item.href
                                return (
                                    <ListboxItem
                                        key={item.key}
                                        startContent={
                                            <item.icon
                                                size={18}
                                                className={cn(
                                                    'mr-2 transition-colors',
                                                    isSelected
                                                        ? 'text-text-default'
                                                        : 'text-text-subdued group-hover:text-text-default'
                                                )}
                                            />
                                        }
                                        className={cn(
                                            isSelected
                                                ? 'bg-background-hovered text-text-default font-medium'
                                                : 'text-text-subdued'
                                        )}
                                        onPress={() =>
                                            router.navigate({
                                                href: item.href,
                                            })
                                        }
                                    >
                                        {item.label}
                                    </ListboxItem>
                                )
                            })}
                        </ListboxSection>
                    ))}
                </Listbox>

                {/* Bottom Actions */}
                <div className="mt-2 pt-2 px-4 border-t border-border-default space-y-1 pb-1">
                    <button
                        className="mt-1 flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-text-subdued hover:text-text-default hover:bg-background-hovered rounded-xl transition-colors cursor-pointer"
                        onClick={() =>
                            router.navigate({
                                href: INTERNAL_URLS.helpCenter,
                            })
                        }
                    >
                        <HelpCircle size={18} className="text-text-subdued" />
                        Help & Support
                    </button>
                    <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-danger hover:bg-danger-50 rounded-xl transition-colors cursor-pointer">
                        <LogOut size={18} />
                        Log Out
                    </button>
                </div>
            </div>

            {/* Optional: Version Info */}
            <div className="px-4 text-xs text-text-subdued text-center">
                v{envConfig.APP_VERSION} • Built with Cadsquad
            </div>
        </aside>
    )
}
