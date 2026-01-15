import {
    WalletIcon,
    LayoutDashboardIcon,
    UsersIcon,
    BriefcaseIcon,
    HelpCircleIcon,
    PaletteIcon,
    LockIcon,
    BellIcon,
    FileTextIcon,
    TrendingUpIcon,
    SettingsIcon,
} from 'lucide-react'
import { RoleEnum } from '../../shared/enums'

export interface SystemRoute {
    id: string
    title: string
    subtitle: string
    category: 'Jobs' | 'Communities' | 'Clients' | 'System'
    route: string
    icon: React.ReactNode // Required icon field
    allowRoles: RoleEnum[]
}

export const SYSTEM_ROUTES: SystemRoute[] = [
    // --- Workspace (Everyone) ---
    {
        id: 'route-overview',
        title: 'Workbench Overview',
        subtitle: 'Daily summary and active tasks',
        category: 'System',
        route: '/overview',
        icon: <LayoutDashboardIcon size={18} />,
        allowRoles: ['USER', 'ADMIN', 'ACCOUNTING'],
    },
    {
        id: 'route-jobs',
        title: 'Job List',
        subtitle: 'View all your assigned production jobs',
        category: 'Jobs',
        route: '/jobs',
        icon: <BriefcaseIcon size={18} />,
        allowRoles: ['USER', 'ADMIN', 'ACCOUNTING'],
    },
    {
        id: 'route-project-center',
        title: 'Project Center',
        subtitle: 'Manage high-level project milestones',
        category: 'System',
        route: '/project-center',
        icon: <LayoutDashboardIcon size={16} />,
        allowRoles: ['USER', 'ADMIN', 'ACCOUNTING'],
    },

    // --- Administration (Admin only) ---
    {
        id: 'route-admin-staff',
        title: 'Staff Directory',
        subtitle: 'Manage employee accounts',
        category: 'System',
        route: '/admin/mgmt/staff-directory',
        icon: <UsersIcon size={18} />,
        allowRoles: ['ADMIN'],
    },
    {
        id: 'route-admin-revenue',
        title: 'Revenue Tracking',
        subtitle: 'Management financial dashboard',
        category: 'System',
        route: '/admin/mgmt/revenue',
        icon: <TrendingUpIcon size={18} />,
        allowRoles: ['ADMIN'],
    },
    {
        id: 'route-admin-filedocs',
        title: 'Document Manager',
        subtitle: 'System-wide file and document storage',
        category: 'System',
        route: '/admin/mgmt/file-docs',
        icon: <SettingsIcon size={16} />,
        allowRoles: ['ADMIN'],
    },

    // --- Financial (Accounting & Admin) ---
    {
        id: 'route-fin-payroll',
        title: 'Payroll Management',
        subtitle: 'Salaries and distributions',
        category: 'System',
        route: '/financial/payroll',
        icon: <WalletIcon size={18} />,
        allowRoles: ['ACCOUNTING', 'ADMIN'],
    },
    {
        id: 'route-fin-payouts',
        title: 'Pending Payouts',
        subtitle: 'Approve and process outgoing payments',
        category: 'System',
        route: '/financial/pending-payouts',
        icon: <WalletIcon size={16} />,
        allowRoles: ['ACCOUNTING', 'ADMIN'],
    },
    {
        id: 'route-fin-pl',
        title: 'Profit & Loss',
        subtitle: 'Financial statements and reports',
        category: 'System',
        route: '/financial/profit-loss',
        icon: <WalletIcon size={16} />,
        allowRoles: ['ACCOUNTING', 'ADMIN'],
    },
    {
        id: 'route-fin-invoice',
        title: 'Invoice Templates',
        subtitle: 'Billing and document layout',
        category: 'System',
        route: '/financial/invoice-templates',
        icon: <FileTextIcon size={18} />,
        allowRoles: ['ACCOUNTING', 'ADMIN'],
    },

    // --- Settings (Everyone) ---
    {
        id: 'route-settings-profile',
        title: 'My Profile',
        subtitle: 'Edit your personal information and avatar',
        category: 'System',
        route: '/settings/my-profile',
        icon: <SettingsIcon size={16} />,
        allowRoles: ['USER', 'ADMIN', 'ACCOUNTING'],
    },
    {
        id: 'route-settings-appearance',
        title: 'Appearance Settings',
        subtitle: 'Change theme, colors, and dark mode',
        category: 'System',
        route: '/settings/appearance',
        icon: <PaletteIcon size={18} />,
        allowRoles: ['USER', 'ADMIN', 'ACCOUNTING'],
    },
    {
        id: 'route-settings-security',
        title: 'Login & Security',
        subtitle: 'Password and two-factor authentication',
        category: 'System',
        route: '/settings/login-and-security',
        icon: <LockIcon size={18} />,
        allowRoles: ['USER', 'ADMIN', 'ACCOUNTING'],
    },
    {
        id: 'route-settings-notif',
        title: 'Notification Preferences',
        subtitle: 'Manage email and browser alerts',
        category: 'System',
        route: '/settings/notifications',
        icon: <BellIcon size={18} />,
        allowRoles: ['USER', 'ADMIN', 'ACCOUNTING'],
    },
    {
        id: 'route-public-help',
        title: 'Help Center',
        subtitle: 'Guides and support documentation',
        category: 'System',
        route: '/help-center',
        icon: <HelpCircleIcon size={18} />,
        allowRoles: ['USER', 'ADMIN', 'ACCOUNTING'],
    },
]
