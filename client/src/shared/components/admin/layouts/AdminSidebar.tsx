import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, useRouterState } from '@tanstack/react-router'
import {
    BadgeDollarSign,
    Calendar,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    Group,
    LayoutDashboard,
    MonitorCog,
    PieChart,
    Settings,
    ShieldUser,
    Users,
} from 'lucide-react'
import React from 'react'

import { INTERNAL_URLS, useProfile } from '@/lib'

import {
    departmentsListOptions,
    jobsPendingPayoutsOptions,
} from '../../../../lib/queries'
import { toggleAdminLeftSidebar } from '../../../stores'
import { ActionButton } from '../../app/ActionButton'
import { HeroButton } from '../../ui/hero-button'
import { HeroTooltip } from '../../ui/hero-tooltip'
import { ScrollArea, ScrollBar } from '../../ui/scroll-area'

// --- Types ---
interface SidebarItemProps {
    icon: React.ElementType
    label: string
    isActive?: boolean
    badge?: number
    isCollapsed: boolean
    url: string
}

// --- Sub-Component: Sidebar Item ---
const SidebarItem: React.FC<SidebarItemProps> = ({
    icon: Icon,
    label,
    isActive: defaultActive,
    badge,
    isCollapsed,
    url,
}) => {
    const pathname = useRouterState({
        select: (state) => state.location.pathname,
    })

    const isActive = defaultActive || pathname === url

    return (
        <HeroTooltip
            isDisabled={!isCollapsed}
            content={label}
            placement="right"
        >
            <Link to={url} className="block">
                <div
                    title={isCollapsed ? label : undefined} // Tooltip for collapsed state
                    className={`
          flex items-center cursor-pointer transition-all duration-200 group relative
          ${isCollapsed ? 'px-2' : 'justify-between pl-1 pr-4'}
          ${
              isActive
                  ? 'bg-background-hovered text-text-default rounded-lg'
                  : 'text-text-subdued hover:bg-background-hovered hover:text-text-default rounded-lg'
          }
        `}
                >
                    <div
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-1'}`}
                    >
                        <div className="size-10 grid place-items-center">
                            <Icon
                                className={`transition-colors size-4.5! ${
                                    isActive
                                        ? 'text-text-default'
                                        : 'text-text-subdued group-hover:text-text-default'
                                }`}
                            />
                        </div>

                        {/* Label: Hide when collapsed */}
                        {!isCollapsed && (
                            <span className="font-medium text-sm whitespace-nowrap">
                                {label}
                            </span>
                        )}
                    </div>

                    {/* Badge Logic */}
                    {badge && (
                        <>
                            {/* Expanded: Badge on the right */}
                            {!isCollapsed ? (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {badge}
                                </span>
                            ) : (
                                /* Collapsed: Badge as a dot on top-right of icon */
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                            )}
                        </>
                    )}
                </div>
            </Link>
        </HeroTooltip>
    )
}

// --- Main Component ---
export const AdminSidebar = ({
    isCollapsed = false,
}: {
    isCollapsed?: boolean
}) => {
    const {
        data: { departments },
    } = useSuspenseQuery({
        ...departmentsListOptions(),
    })

    const { data: pendingPayoutJobs } = useSuspenseQuery({
        ...jobsPendingPayoutsOptions(),
    })

    const { isAdmin } = useProfile()
    return (
        <aside
            className={`flex flex-col h-full justify-between transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
        >
            {/* Scrollable Content */}
            <div className={`pt-5 ${isCollapsed ? 'px-6 mb-3' : 'px-4 mb-2'}`}>
                <ActionButton
                    forceStatus={isCollapsed ? 'collapse' : 'expand'}
                />
            </div>
            <ScrollArea className="h-200">
                <ScrollBar orientation="horizontal" />
                <ScrollBar orientation="vertical" />
                <div className="flex-1 px-3 space-y-6">
                    {/* Main Menu */}
                    {isAdmin && (
                        <div>
                            {!isCollapsed && (
                                <p className="p-2 text-sm text-text-subdued font-semibold leading-5 text-nowrap overflow-hidden">
                                    Main Menu
                                </p>
                            )}
                            <div className="space-y-1">
                                {/* TODO: Implement System Dashboard */}
                                {false && (
                                    <SidebarItem
                                        icon={LayoutDashboard}
                                        label="Dashboard"
                                        isCollapsed={isCollapsed}
                                        url={INTERNAL_URLS.admin}
                                    />
                                )}
                                <SidebarItem
                                    icon={CheckSquare}
                                    label="All Jobs"
                                    badge={12}
                                    isCollapsed={isCollapsed}
                                    url={INTERNAL_URLS.jobManage}
                                />
                                {/* <SidebarItem
                                    icon={FileText}
                                    label="Files & Docs"
                                    isCollapsed={isCollapsed}
                                    url={INTERNAL_URLS.fileDocs}
                                /> */}
                                {/* <SidebarItem
                                    icon={Mail}
                                    label="Inbox"
                                    badge={5}
                                    isCollapsed={isCollapsed}
                                    url={INTERNAL_URLS.admin + '/inbox'}
                                /> */}
                                <SidebarItem
                                    icon={Calendar}
                                    label="Schedule"
                                    isCollapsed={isCollapsed}
                                    url={INTERNAL_URLS.schedule}
                                />

                                {/* TODO: Implement System Configuration */}
                                {false && (
                                    <SidebarItem
                                        icon={MonitorCog}
                                        label="System Configuration"
                                        isCollapsed={isCollapsed}
                                        url={INTERNAL_URLS.systemConfiguration}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Management */}
                    <div>
                        {!isCollapsed && (
                            <p className="p-2 text-sm text-text-subdued font-semibold leading-5 text-nowrap overflow-hidden">
                                Management
                            </p>
                        )}
                        <div className="space-y-1">
                            {/* TODO: Implement System Revenue Reports */}
                            {false && (
                                <SidebarItem
                                    icon={PieChart}
                                    label="Revenue Reports"
                                    isCollapsed={isCollapsed}
                                    url={INTERNAL_URLS.revenueReports}
                                />
                            )}

                            {isAdmin && (
                                <SidebarItem
                                    icon={Users}
                                    label="Staff Directory"
                                    isCollapsed={isCollapsed}
                                    url={INTERNAL_URLS.staffDirectory}
                                />
                            )}
                            {isAdmin && (
                                <SidebarItem
                                    icon={ShieldUser}
                                    label="Role & Permission"
                                    isCollapsed={isCollapsed}
                                    url={INTERNAL_URLS.roleAndPermissionManage}
                                />
                            )}
                            {/* {isAdmin && (
                                <SidebarItem
                                    icon={UserPlus}
                                    label="Invite Member"
                                    isCollapsed={isCollapsed}
                                    url={INTERNAL_URLS.inviteMember}
                                />
                            )} */}
                        </div>
                    </div>

                    {/* Financial */}
                    <div>
                        {!isCollapsed && (
                            <p className="p-2 text-sm text-text-subdued font-semibold leading-5 text-nowrap overflow-hidden">
                                Financial
                            </p>
                        )}
                        <div className="space-y-1">
                            {/* <SidebarItem
                                icon={DiamondPercent}
                                label="Overview"
                                isCollapsed={isCollapsed}
                                url={INTERNAL_URLS.profitLoss}
                            /> */}

                            {/* TODO: Implement System Transaction Reports */}
                            {false && (
                                <SidebarItem
                                    icon={BadgeDollarSign}
                                    label="Transaction Reports"
                                    isCollapsed={isCollapsed}
                                    url={INTERNAL_URLS.payment}
                                />
                            )}
                            <SidebarItem
                                icon={BadgeDollarSign}
                                label="Pending payouts"
                                badge={pendingPayoutJobs.length}
                                isCollapsed={isCollapsed}
                                url={INTERNAL_URLS.pendingPayouts}
                            />
                            {/* <SidebarItem
                                icon={Dock}
                                label="Tax Declaration"
                                isCollapsed={isCollapsed}
                                url={INTERNAL_URLS.payroll}
                            /> */}

                            {/* TODO: Implement System Reimbursements */}
                            {false && (
                                <SidebarItem
                                    icon={Group}
                                    label="Reimbursements"
                                    isCollapsed={isCollapsed}
                                    url={INTERNAL_URLS.reimbursements}
                                />
                            )}
                            {/* <SidebarItem
                                icon={Settings2}
                                label="Financial Settings"
                                isCollapsed={isCollapsed}
                                url={INTERNAL_URLS.financialSettings}
                            /> */}
                        </div>
                    </div>

                    {/* TODO: Implement Manage Departments */}
                    {/* Departments */}
                    {false && isAdmin && departments && (
                        <div>
                            {!isCollapsed ? (
                                <div className="flex items-center justify-between px-2 mb-2">
                                    <p className="p-2 text-sm text-text-subdued font-semibold leading-5 text-nowrap overflow-hidden">
                                        Departments
                                    </p>
                                    <Link to={INTERNAL_URLS.departmentsManage}>
                                        <HeroButton
                                            isIconOnly
                                            size="sm"
                                            className="p-1!"
                                            variant="light"
                                            color="default"
                                        >
                                            <Settings size={14} />
                                        </HeroButton>
                                    </Link>
                                </div>
                            ) : (
                                // Centered Settings icon when collapsed
                                <div className="flex justify-center mb-2">
                                    <Settings className="w-4 h-4 text-slate-300" />
                                </div>
                            )}

                            <div className="space-y-1">
                                {departments.map((dept, idx) => (
                                    <Link
                                        key={idx}
                                        title={
                                            isCollapsed
                                                ? dept.displayName
                                                : undefined
                                        }
                                        to={INTERNAL_URLS.departmentItemManage(
                                            dept.code
                                        )}
                                        className={`flex items-center cursor-pointer text-text-subdued hover:text-emerald-700 hover:bg-background-hovered rounded-xl transition-all duration-200
                       ${isCollapsed ? 'justify-center py-3' : 'gap-3 px-4 py-2 text-sm'}
                    `}
                                    >
                                        <span
                                            className={`rounded-full shrink-0 ${
                                                idx === 0
                                                    ? 'bg-purple-500'
                                                    : idx === 1
                                                      ? 'bg-blue-500'
                                                      : 'bg-orange-500'
                                            } ${isCollapsed ? 'w-3 h-3' : 'w-2 h-2'}`}
                                        ></span>
                                        {!isCollapsed && (
                                            <span className="whitespace-nowrap">
                                                {dept.displayName}
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="h-30 px-3 w-full overflow-x-hidden">
                <HeroButton
                    variant="light"
                    startContent={
                        isCollapsed ? (
                            <ChevronRight size={18} />
                        ) : (
                            <ChevronLeft size={18} />
                        )
                    }
                    color="default"
                    className="w-full"
                    isIconOnly={isCollapsed}
                    onPress={toggleAdminLeftSidebar}
                >
                    {!isCollapsed && 'Collapse'}
                </HeroButton>
            </div>
        </aside>
    )
}
