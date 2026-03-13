import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
} from '@heroui/react'
import { Link } from '@tanstack/react-router'
import {
    BellIcon,
    BriefcaseBusiness,
    CircleDollarSign,
    MonitorCog,
    Palette,
    SquareUserRound,
    Users,
} from 'lucide-react'
import { APP_PERMISSIONS, INTERNAL_URLS } from '@/lib'
import { SettingsGearIcon } from '@/shared/components'
import { usePermission } from '../../../hooks'

export function SettingsDropdown() {
    const { hasPermission } = usePermission()

    // Helper classes for consistent styling
    const iconWrapperClasses = 'size-8 grid place-items-center'
    const iconClasses = 'text-text-default'
    const linkClasses = 'block size-full'
    const titleClasses = 'font-medium text-text-default'
    const descClasses = 'text-xs text-text-subdued'

    return (
        <Dropdown
            placement="bottom-end"
            showArrow
            classNames={{
                content: 'rounded-lg',
            }}
        >
            <DropdownTrigger>
                <Button
                    variant="light"
                    startContent={<SettingsGearIcon size={18} />}
                    size="sm"
                    isIconOnly
                />
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Settings"
                classNames={{
                    base: 'w-[520px] overflow-y-auto left-0',
                }}
            >
                {/* --- Group 1: Personal Settings (Always Visible) --- */}
                <DropdownSection title="Settings">
                    <DropdownItem
                        key="INTERNAL_URLS.settings.profile"
                        startContent={
                            <div className={iconWrapperClasses}>
                                <SquareUserRound
                                    size={24}
                                    className={iconClasses}
                                />
                            </div>
                        }
                    >
                        <Link
                            to={INTERNAL_URLS.settings.profile}
                            className={linkClasses}
                        >
                            <p className={titleClasses}>Account settings</p>
                            <p className={descClasses}>
                                Manage language and other personal preferences.
                            </p>
                        </Link>
                    </DropdownItem>

                    <DropdownItem
                        key="appearance"
                        startContent={
                            <div className={iconWrapperClasses}>
                                <Palette size={24} className={iconClasses} />
                            </div>
                        }
                    >
                        <Link
                            to={INTERNAL_URLS.settings.appearance}
                            className={linkClasses}
                        >
                            <p className={titleClasses}>Appearance</p>
                            <p className={descClasses}>
                                Manage how your public dashboard looks and
                                feels.
                            </p>
                        </Link>
                    </DropdownItem>

                    {/* TODO: Implement Notification Settings */}
                    {false ? (
                        <DropdownItem
                            key="notificationSettings"
                            startContent={
                                <div className={iconWrapperClasses}>
                                    <BellIcon
                                        size={24}
                                        className={iconClasses}
                                    />
                                </div>
                            }
                        >
                            <Link
                                to={INTERNAL_URLS.settings.notifications}
                                className={linkClasses}
                            >
                                <p className={titleClasses}>
                                    Notification settings
                                </p>
                                <p className={descClasses}>
                                    Manage email and in-product notification
                                    from site.
                                </p>
                            </Link>
                        </DropdownItem>
                    ) : null}
                </DropdownSection>

                {/* --- Group 2: Admin Settings (Conditional) --- */}
                <DropdownSection title="Admin settings">
                    {/* TODO: Implement System Dashboard */}
                    {false ? (
                        <DropdownItem
                            key="system"
                            startContent={
                                <div className={iconWrapperClasses}>
                                    <MonitorCog
                                        size={24}
                                        className={iconClasses}
                                    />
                                </div>
                            }
                        >
                            <Link
                                to={INTERNAL_URLS.admin.overview}
                                className={linkClasses}
                            >
                                <p className={titleClasses}>
                                    Performance Insights
                                </p>
                                <p className={descClasses}>
                                    Real-time financial data and system metrics.
                                </p>
                            </Link>
                        </DropdownItem>
                    ) : null}

                    {hasPermission(APP_PERMISSIONS.JOB.MANAGE) ? (
                        <DropdownItem
                            key="job"
                            startContent={
                                <div className={iconWrapperClasses}>
                                    <BriefcaseBusiness
                                        size={24}
                                        className={iconClasses}
                                    />
                                </div>
                            }
                        >
                            <Link
                                to={INTERNAL_URLS.management.jobs}
                                className={linkClasses}
                            >
                                <p className={titleClasses}>Job management</p>
                                <p className={descClasses}>
                                    Manage job type, overview analysis and more.
                                </p>
                            </Link>
                        </DropdownItem>
                    ) : null}

                    {hasPermission(APP_PERMISSIONS.PAYMENT_CHANNEL.UPDATE) ? (
                        <DropdownItem
                            key="payment"
                            startContent={
                                <div className={iconWrapperClasses}>
                                    <CircleDollarSign
                                        size={24}
                                        className={iconClasses}
                                    />
                                </div>
                            }
                        >
                            <Link
                                to={INTERNAL_URLS.management.paymentChannels}
                                className={linkClasses}
                            >
                                <p className={titleClasses}>
                                    Payment management
                                </p>
                                <p className={descClasses}>
                                    Manage income, staff cost, payment method,
                                    overview analysis and more.
                                </p>
                            </Link>
                        </DropdownItem>
                    ) : null}

                    {hasPermission(APP_PERMISSIONS.USER.CREATE) ? (
                        <DropdownItem
                            key="team"
                            startContent={
                                <div className={iconWrapperClasses}>
                                    <Users size={24} className={iconClasses} />
                                </div>
                            }
                        >
                            <Link
                                to={INTERNAL_URLS.management.team}
                                className={linkClasses}
                            >
                                <p className={titleClasses}>Team management</p>
                                <p className={descClasses}>
                                    Manage teams, access request and more.
                                </p>
                            </Link>
                        </DropdownItem>
                    ) : null}
                </DropdownSection>
            </DropdownMenu>
        </Dropdown>
    )
}
