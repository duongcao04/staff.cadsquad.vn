import { APP_PERMISSIONS, INTERNAL_URLS } from '@/lib'
import { SettingsGearIcon } from '@/shared/components'
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    ScrollShadow,
} from '@heroui/react'
import { Link } from '@tanstack/react-router'
import {
    BadgeDollarSignIcon,
    BriefcaseBusiness,
    ChartCandlestickIcon,
    CircleDollarSign,
    ComponentIcon,
    FolderGit2Icon,
    Grid2x2Icon,
    HandshakeIcon,
    MonitorCogIcon,
    Palette,
    ShieldUserIcon,
    SquareUserRound,
    Users,
} from 'lucide-react'
import { usePermission } from '../../../hooks'

export function SettingsDropdown() {
    const { hasPermission, hasSomePermissions } = usePermission()

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
            <ScrollShadow
                as={DropdownMenu}
                aria-label="Settings"
                classNames={{
                    base: 'w-[520px] max-h-[500px] left-0',
                }}
                hideScrollBar
            >
                <DropdownSection title="Settings">
                    <DropdownItem
                        key="settings_profile"
                        startContent={
                            <div className={iconWrapperClasses}>
                                <SquareUserRound
                                    size={22}
                                    className={iconClasses}
                                />
                            </div>
                        }
                        as={Link}
                        href={INTERNAL_URLS.settings.profile}
                    >
                        <p className={titleClasses}>Account settings</p>
                        <p className={descClasses}>
                            Manage language and other personal preferences.
                        </p>
                    </DropdownItem>

                    <DropdownItem
                        key="appearance"
                        startContent={
                            <div className={iconWrapperClasses}>
                                <Palette size={22} className={iconClasses} />
                            </div>
                        }
                        as={Link}
                        href={INTERNAL_URLS.settings.appearance}
                    >
                        <p className={titleClasses}>Appearance</p>
                        <p className={descClasses}>
                            Manage how your public dashboard looks and feels.
                        </p>
                    </DropdownItem>
                </DropdownSection>

                {hasSomePermissions([
                    APP_PERMISSIONS.SYSTEM.MANAGE,
                    APP_PERMISSIONS.ROLE.MANAGE,
                ]) ? (
                    <DropdownSection title="System">
                        {hasPermission(APP_PERMISSIONS.SYSTEM.MANAGE) ? (
                            <DropdownItem
                                key="job"
                                startContent={
                                    <div className={iconWrapperClasses}>
                                        <Grid2x2Icon
                                            size={22}
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
                                        Admin Control Center
                                    </p>
                                    <p className={descClasses}>
                                        System overview, business intelligence,
                                        operations, and quick administrative
                                        actions.
                                    </p>
                                </Link>
                            </DropdownItem>
                        ) : null}

                        {hasPermission(APP_PERMISSIONS.SYSTEM.MANAGE) ? (
                            <DropdownItem
                                key="system_settings"
                                startContent={
                                    <div className={iconWrapperClasses}>
                                        <MonitorCogIcon
                                            size={22}
                                            className={iconClasses}
                                        />
                                    </div>
                                }
                            >
                                <Link
                                    to={INTERNAL_URLS.admin.settings}
                                    className={linkClasses}
                                >
                                    <p className={titleClasses}>
                                        System Configuration
                                    </p>
                                    <p className={descClasses}>
                                        Manage global defaults, notifications,
                                        and system health.
                                    </p>
                                </Link>
                            </DropdownItem>
                        ) : null}

                        {hasPermission(APP_PERMISSIONS.ROLE.MANAGE) ? (
                            <DropdownItem
                                key="role"
                                startContent={
                                    <div className={iconWrapperClasses}>
                                        <ShieldUserIcon
                                            size={22}
                                            className={iconClasses}
                                        />
                                    </div>
                                }
                            >
                                <Link
                                    to={INTERNAL_URLS.management.accessControl}
                                    className={linkClasses}
                                >
                                    <p className={titleClasses}>
                                        Roles & Permissions
                                    </p>
                                    <p className={descClasses}>
                                        Review your members roles and allocate
                                        permissions
                                    </p>
                                </Link>
                            </DropdownItem>
                        ) : null}
                    </DropdownSection>
                ) : null}

                {hasSomePermissions([
                    APP_PERMISSIONS.USER.MANAGE,
                    APP_PERMISSIONS.JOB.MANAGE,
                    APP_PERMISSIONS.JOB_TYPE.MANAGE,
                    APP_PERMISSIONS.FOLDER_TEMPLATE.MANAGE,
                    APP_PERMISSIONS.CLIENT.MANAGE,
                    APP_PERMISSIONS.PAYMENT_CHANNEL.MANAGE,
                ]) ? (
                    <DropdownSection title="Management">
                        {hasPermission(APP_PERMISSIONS.USER.MANAGE) ? (
                            <DropdownItem
                                key="team"
                                startContent={
                                    <div className={iconWrapperClasses}>
                                        <Users
                                            size={22}
                                            className={iconClasses}
                                        />
                                    </div>
                                }
                            >
                                <Link
                                    to={INTERNAL_URLS.management.team}
                                    className={linkClasses}
                                >
                                    <p className={titleClasses}>Team</p>
                                    <p className={descClasses}>
                                        Manage teams, access request and more.
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
                                            size={22}
                                            className={iconClasses}
                                        />
                                    </div>
                                }
                            >
                                <Link
                                    to={INTERNAL_URLS.management.jobs}
                                    className={linkClasses}
                                >
                                    <p className={titleClasses}>Jobs</p>
                                    <p className={descClasses}>Manage jobs.</p>
                                </Link>
                            </DropdownItem>
                        ) : null}

                        {hasPermission(APP_PERMISSIONS.JOB_TYPE.MANAGE) ? (
                            <DropdownItem
                                key="job"
                                startContent={
                                    <div className={iconWrapperClasses}>
                                        <ComponentIcon
                                            size={22}
                                            className={iconClasses}
                                        />
                                    </div>
                                }
                            >
                                <Link
                                    to={INTERNAL_URLS.management.jobTypes}
                                    className={linkClasses}
                                >
                                    <p className={titleClasses}>Job Types</p>
                                    <p className={descClasses}>
                                        Manage categories, color codes, and
                                        default folder templates for jobs.
                                    </p>
                                </Link>
                            </DropdownItem>
                        ) : null}

                        {hasPermission(
                            APP_PERMISSIONS.FOLDER_TEMPLATE.MANAGE
                        ) ? (
                            <DropdownItem
                                key="folder-templates"
                                startContent={
                                    <div className={iconWrapperClasses}>
                                        <FolderGit2Icon
                                            size={22}
                                            className={iconClasses}
                                        />
                                    </div>
                                }
                            >
                                <Link
                                    to={
                                        INTERNAL_URLS.management
                                            .jobFolderTemplates
                                    }
                                    className={linkClasses}
                                >
                                    <p className={titleClasses}>
                                        Folder Templates
                                    </p>
                                    <p className={descClasses}>
                                        Manage SharePoint folder structures used
                                        for automatically generating job
                                        workspaces.
                                    </p>
                                </Link>
                            </DropdownItem>
                        ) : null}

                        {hasPermission(APP_PERMISSIONS.CLIENT.MANAGE) ? (
                            <DropdownItem
                                key="clients"
                                startContent={
                                    <div className={iconWrapperClasses}>
                                        <HandshakeIcon
                                            size={22}
                                            className={iconClasses}
                                        />
                                    </div>
                                }
                            >
                                <Link
                                    to={INTERNAL_URLS.management.clients}
                                    className={linkClasses}
                                >
                                    <p className={titleClasses}>Clients</p>
                                    <p className={descClasses}>
                                        Manage corporate and individual clients,
                                        billing details, and regional data.
                                    </p>
                                </Link>
                            </DropdownItem>
                        ) : null}

                        {hasPermission(
                            APP_PERMISSIONS.PAYMENT_CHANNEL.MANAGE
                        ) ? (
                            <DropdownItem
                                key="payments"
                                startContent={
                                    <div className={iconWrapperClasses}>
                                        <CircleDollarSign
                                            size={22}
                                            className={iconClasses}
                                        />
                                    </div>
                                }
                            >
                                <Link
                                    to={
                                        INTERNAL_URLS.management.paymentChannels
                                    }
                                    className={linkClasses}
                                >
                                    <p className={titleClasses}>
                                        Payment Channels
                                    </p>
                                    <p className={descClasses}>
                                        Manage income, staff cost, payment
                                        method, overview analysis and more.
                                    </p>
                                </Link>
                            </DropdownItem>
                        ) : null}
                    </DropdownSection>
                ) : null}

                {hasSomePermissions([APP_PERMISSIONS.JOB.PAID]) ? (
                    <DropdownSection title="Financial">
                        {hasPermission(APP_PERMISSIONS.JOB.PAID) ? (
                            <DropdownItem
                                key="job"
                                startContent={
                                    <div className={iconWrapperClasses}>
                                        <ChartCandlestickIcon
                                            size={22}
                                            className={iconClasses}
                                        />
                                    </div>
                                }
                            >
                                <Link
                                    to={INTERNAL_URLS.financial.payouts}
                                    className={linkClasses}
                                >
                                    <p className={titleClasses}>
                                        Financial Hub
                                    </p>
                                    <p className={descClasses}>
                                        Manage cash flow, staff payouts,
                                        receivables, and company profitability.
                                    </p>
                                </Link>
                            </DropdownItem>
                        ) : null}

                        {hasPermission(APP_PERMISSIONS.JOB.PAID) ? (
                            <DropdownItem
                                key="job"
                                startContent={
                                    <div className={iconWrapperClasses}>
                                        <BadgeDollarSignIcon
                                            size={22}
                                            className={iconClasses}
                                        />
                                    </div>
                                }
                            >
                                <Link
                                    to={INTERNAL_URLS.financial.payouts}
                                    className={linkClasses}
                                >
                                    <p className={titleClasses}>Payouts</p>
                                    <p className={descClasses}>
                                        Manage invoices, staff payouts, and
                                        financial health.
                                    </p>
                                </Link>
                            </DropdownItem>
                        ) : null}
                    </DropdownSection>
                ) : null}
            </ScrollShadow>
        </Dropdown>
    )
}
