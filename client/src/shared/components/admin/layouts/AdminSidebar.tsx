import { APP_PERMISSIONS, INTERNAL_URLS, profileOptions } from '@/lib'
import { jobsPendingPayoutsOptions, logoutOptions } from '@/lib/queries'
import {
    addToast,
    Avatar,
    Divider,
    User as HeroUser,
    Listbox,
    ListboxItem,
    ListboxSection,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Tooltip,
} from '@heroui/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { Link, useRouter, useRouterState } from '@tanstack/react-router'
import {
    BadgeDollarSignIcon,
    BanknoteArrowUpIcon,
    BriefcaseBusiness,
    BriefcaseIcon,
    Building2Icon,
    CalendarRangeIcon,
    ChartCandlestickIcon,
    ChevronLeft,
    ChevronRight,
    CogIcon,
    ComponentIcon,
    FolderGit2Icon,
    HandshakeIcon,
    LandmarkIcon,
    LayoutGridIcon,
    LogOutIcon,
    Settings as SettingsIcon,
    ShieldUser,
    User2Icon,
    UsersRoundIcon,
    WalletIcon,
} from 'lucide-react'
import React from 'react'
import { usePermission } from '../../../hooks'
import { toggleAdminLeftSidebar } from '../../../stores'
import CadsquadLogo from '../../CadsquadLogo'
import { ScrollArea, ScrollBar } from '../../ui/scroll-area'

// --- Sidebar Item Component ---
interface SidebarItemProps {
    icon: React.ElementType
    label: string
    isActive?: boolean
    badge?: number
    isCollapsed: boolean
    url: string
    variant?: 'default' | 'danger'
}

const SidebarItem: React.FC<SidebarItemProps> = ({
    icon: Icon,
    label,
    isActive: defaultActive,
    badge,
    isCollapsed,
    url,
    variant = 'default',
}) => {
    const pathname = useRouterState({ select: (s) => s.location.pathname })
    const isActive = defaultActive || pathname.includes(url)

    return (
        <Tooltip isDisabled={!isCollapsed} content={label} placement="right">
            <Link to={url} className="block group">
                <div
                    className={`
                    flex items-center transition-all duration-200 relative
                    ${isCollapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 h-10 gap-3 mx-2'}
                    rounded-xl mb-0.5
                    ${
                        isActive
                            ? 'bg-primary text-white shadow-sm'
                            : variant === 'danger'
                              ? 'text-red-400 hover:bg-red-500/10'
                              : 'text-text-subdued hover:bg-background-hovered hover:text-text-default'
                    }
                `}
                >
                    <Icon
                        size={18}
                        strokeWidth={isActive ? 2.2 : 1.8}
                        className="shrink-0"
                    />
                    {!isCollapsed && (
                        <span className="flex-1 font-medium text-[13.5px] truncate">
                            {label}
                        </span>
                    )}
                    {badge !== undefined &&
                        badge > 0 &&
                        (!isCollapsed ? (
                            <span className="bg-background-hovered text-text-7 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {badge}
                            </span>
                        ) : (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
                        ))}
                </div>
            </Link>
        </Tooltip>
    )
}

// --- Main Sidebar Component ---
export const AdminSidebar = ({
    isCollapsed = false,
}: {
    isCollapsed?: boolean
}) => {
    const router = useRouter()
    const logout = useMutation(logoutOptions)
    const {
        data: { pendingPayouts },
    } = useSuspenseQuery({
        ...jobsPendingPayoutsOptions(),
    })

    const {
        data: { profile },
    } = useSuspenseQuery(profileOptions())

    const { hasPermission, hasSomePermissions } = usePermission()

    const handleLogout = async () => {
        logout.mutateAsync().then(() => {
            addToast({
                title: 'Logout successfully!',
                color: 'success',
            })
            router.navigate({
                href: INTERNAL_URLS.login,
            })
        })
    }

    return (
        <aside
            className={`flex flex-col h-screen transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}
        >
            {/* 1. BRAND SECTION */}
            <div className="px-6 py-4">
                <Link to="/admin" className="flex items-center gap-3 group">
                    <CadsquadLogo
                        classNames={{
                            logo: 'h-8',
                        }}
                        canRedirect={false}
                    />
                    {!isCollapsed && (
                        <p className="text-xl font-quicksand text-text-default group-hover:underline">
                            Admin
                        </p>
                    )}
                </Link>
            </div>

            <Divider className="bg-border-muted" />

            {/* 2. USER PROFILE POPOVER SECTION */}
            <div
                className={`px-4 py-4 ${isCollapsed ? 'flex justify-center' : ''}`}
            >
                <Popover
                    placement="right-start"
                    offset={10}
                    classNames={{
                        content: 'p-1 w-64',
                    }}
                >
                    <PopoverTrigger>
                        <div
                            className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-background-hovered transition-colors group ${isCollapsed ? 'w-10 h-10 justify-center' : ''}`}
                        >
                            <Avatar src={profile?.avatar} />
                            {!isCollapsed && (
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-medium leading-tight truncate text-text-default">
                                        {profile?.displayName}
                                    </p>
                                    <p className="text-xs tracking-wide truncate text-text-subdued">
                                        {profile?.department?.displayName}
                                    </p>
                                </div>
                            )}
                        </div>
                    </PopoverTrigger>
                    <PopoverContent>
                        <div className="w-full">
                            <div className="p-3">
                                <HeroUser
                                    name={profile?.displayName}
                                    description={
                                        profile?.department?.displayName
                                    }
                                    avatarProps={{
                                        src: profile?.avatar,
                                        className:
                                            'bg-gradient-to-tr from-indigo-500 to-purple-500',
                                    }}
                                    classNames={{
                                        name: 'text-text-default font-medium',
                                        description: 'text-text-subdued',
                                    }}
                                />
                            </div>
                            <Divider className="my-1 bg-border-muted" />

                            <Listbox>
                                <ListboxSection showDivider>
                                    <ListboxItem
                                        startContent={<User2Icon size={16} />}
                                        as={Link}
                                        href={INTERNAL_URLS.profile}
                                    >
                                        My profile
                                    </ListboxItem>
                                    <ListboxItem
                                        startContent={
                                            <SettingsIcon size={16} />
                                        }
                                        as={Link}
                                        href={INTERNAL_URLS.settings.overview}
                                    >
                                        Settings
                                    </ListboxItem>
                                </ListboxSection>
                                <ListboxSection>
                                    <ListboxItem
                                        color="danger"
                                        startContent={<LogOutIcon size={16} />}
                                        onPress={handleLogout}
                                    >
                                        Logout
                                    </ListboxItem>
                                </ListboxSection>
                            </Listbox>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* 4. NAVIGATION SECTION */}
            <ScrollArea className="flex-1 h-50">
                <ScrollBar orientation="horizontal" />
                <ScrollBar orientation="vertical" />
                <div className="px-2 space-y-5">
                    {hasSomePermissions([
                        APP_PERMISSIONS.SYSTEM.MANAGE,
                        APP_PERMISSIONS.ROLE.MANAGE,
                    ]) && (
                        <div>
                            {!isCollapsed && (
                                <p className="px-4 mb-2 text-[8px] font-medium text-text-subdued uppercase tracking-widest">
                                    Menu
                                </p>
                            )}
                            <div className="space-y-1">
                                {APP_PERMISSIONS.SYSTEM.MANAGE && (
                                    <SidebarItem
                                        icon={LayoutGridIcon}
                                        label="Home"
                                        url={INTERNAL_URLS.admin.overview}
                                        isCollapsed={isCollapsed}
                                    />
                                )}
                                <SidebarItem
                                    icon={CalendarRangeIcon}
                                    label="Schedule"
                                    url={INTERNAL_URLS.admin.schedule}
                                    isCollapsed={isCollapsed}
                                />
                                {hasPermission(APP_PERMISSIONS.ROLE.MANAGE) && (
                                    <SidebarItem
                                        icon={ShieldUser}
                                        label="Permissions"
                                        url={
                                            INTERNAL_URLS.management
                                                .accessControl
                                        }
                                        isCollapsed={isCollapsed}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {hasSomePermissions([
                        APP_PERMISSIONS.JOB.MANAGE,
                        APP_PERMISSIONS.FOLDER_TEMPLATE.MANAGE,
                    ]) && (
                        <div>
                            {!isCollapsed && (
                                <p className="px-4 mb-2 text-[8px] font-medium text-text-subdued uppercase tracking-widest">
                                    Job
                                </p>
                            )}
                            <div className="space-y-1">
                                {hasPermission(APP_PERMISSIONS.JOB.MANAGE) && (
                                    <SidebarItem
                                        icon={BriefcaseIcon}
                                        label="All Job"
                                        url={INTERNAL_URLS.management.jobs}
                                        isCollapsed={isCollapsed}
                                    />
                                )}
                                {hasPermission(
                                    APP_PERMISSIONS.JOB_TYPE.MANAGE
                                ) && (
                                    <SidebarItem
                                        icon={ComponentIcon}
                                        label="Job Types"
                                        url={INTERNAL_URLS.management.jobTypes}
                                        isCollapsed={isCollapsed}
                                    />
                                )}
                                {hasPermission(
                                    APP_PERMISSIONS.FOLDER_TEMPLATE.MANAGE
                                ) && (
                                    <SidebarItem
                                        icon={FolderGit2Icon}
                                        label="Folder Templates"
                                        url={
                                            INTERNAL_URLS.management
                                                .jobFolderTemplates
                                        }
                                        isCollapsed={isCollapsed}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {hasSomePermissions([
                        APP_PERMISSIONS.JOB.PAID,
                        APP_PERMISSIONS.PAYMENT_CHANNEL.MANAGE,
                    ]) && (
                        <div>
                            {!isCollapsed && (
                                <p className="px-4 mb-2 text-[8px] font-medium text-text-subdued uppercase tracking-widest">
                                    Financial
                                </p>
                            )}
                            <div className="space-y-1">
                                <SidebarItem
                                    icon={ChartCandlestickIcon}
                                    label="Overview"
                                    url={INTERNAL_URLS.financial.overview}
                                    isCollapsed={isCollapsed}
                                />
                                {hasSomePermissions(
                                    APP_PERMISSIONS.JOB.PAID
                                ) && (
                                    <SidebarItem
                                        icon={BadgeDollarSignIcon}
                                        label="Payouts"
                                        url={INTERNAL_URLS.financial.payouts}
                                        isCollapsed={isCollapsed}
                                        badge={pendingPayouts.length}
                                    />
                                )}
                                <SidebarItem
                                    icon={BanknoteArrowUpIcon}
                                    label="Receivable"
                                    url={INTERNAL_URLS.financial.receivables}
                                    isCollapsed={isCollapsed}
                                />
                                {hasPermission(
                                    APP_PERMISSIONS.PAYMENT_CHANNEL.MANAGE
                                ) && (
                                    <SidebarItem
                                        icon={LandmarkIcon}
                                        label="Payment Channels"
                                        url={
                                            INTERNAL_URLS.financial
                                                .paymentChannels
                                        }
                                        isCollapsed={isCollapsed}
                                    />
                                )}
                                <SidebarItem
                                    icon={WalletIcon}
                                    label="Master Ledger"
                                    url={INTERNAL_URLS.financial.ledger}
                                    isCollapsed={isCollapsed}
                                />
                            </div>
                        </div>
                    )}

                    {hasSomePermissions([
                        APP_PERMISSIONS.USER.MANAGE,
                        APP_PERMISSIONS.CLIENT.MANAGE,
                        APP_PERMISSIONS.DEPARTMENT.MANAGE,
                    ]) && (
                        <div>
                            {!isCollapsed && (
                                <p className="px-4 mb-2 text-[8px] font-medium text-text-subdued uppercase tracking-widest">
                                    Organization
                                </p>
                            )}
                            <div className="space-y-1">
                                {hasPermission(APP_PERMISSIONS.USER.MANAGE) && (
                                    <SidebarItem
                                        icon={UsersRoundIcon}
                                        label="Team"
                                        url={INTERNAL_URLS.management.team}
                                        isCollapsed={isCollapsed}
                                    />
                                )}
                                {hasPermission(
                                    APP_PERMISSIONS.CLIENT.MANAGE
                                ) && (
                                    <SidebarItem
                                        icon={HandshakeIcon}
                                        label="Client"
                                        url={INTERNAL_URLS.management.clients}
                                        isCollapsed={isCollapsed}
                                    />
                                )}
                                {hasPermission(
                                    APP_PERMISSIONS.DEPARTMENT.MANAGE
                                ) && (
                                    <SidebarItem
                                        icon={Building2Icon}
                                        label="Department"
                                        url={
                                            INTERNAL_URLS.management.departments
                                        }
                                        isCollapsed={isCollapsed}
                                    />
                                )}
                                {hasPermission(
                                    APP_PERMISSIONS.JOB_TITLE.MANAGE
                                ) && (
                                    <SidebarItem
                                        icon={BriefcaseBusiness}
                                        label="Job Title"
                                        url={INTERNAL_URLS.management.jobTitles}
                                        isCollapsed={isCollapsed}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {hasPermission(APP_PERMISSIONS.SYSTEM.MANAGE) && (
                        <div>
                            {!isCollapsed && (
                                <p className="px-4 mb-2 text-[8px] font-medium text-text-subdued uppercase tracking-widest">
                                    System
                                </p>
                            )}
                            <div className="space-y-0.5">
                                <SidebarItem
                                    icon={CogIcon}
                                    label="Settings"
                                    url={INTERNAL_URLS.admin.settings}
                                    isCollapsed={isCollapsed}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* 5. FOOTER SECTION */}
            <div className="p-4 space-y-3">
                <div className="space-y-1">
                    <button
                        onClick={toggleAdminLeftSidebar}
                        className={`flex items-center gap-3 w-full transition-all rounded-xl h-10 text-[#62626c] hover:bg-[#1a1a1e] hover:text-white ${isCollapsed ? 'justify-center' : 'px-3 mx-2 w-[calc(100%-16px)]'}`}
                    >
                        {isCollapsed ? (
                            <ChevronRight size={18} />
                        ) : (
                            <ChevronLeft size={18} />
                        )}
                        {!isCollapsed && (
                            <span className="text-[13px] font-medium">
                                Collapse Sidebar
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </aside>
    )
}
