import {
    Avatar,
    Button,
    Divider,
    Tab,
    Tabs,
    useDisclosure,
} from '@heroui/react'
import { useRouter } from '@tanstack/react-router'
import {
    ArrowLeftIcon,
    BriefcaseBusinessIcon,
    CalendarDaysIcon,
    ChartAreaIcon,
    GridIcon,
    ListTodoIcon,
    LogOutIcon,
    MoonIcon,
    SearchIcon,
    SunIcon,
    UserCogIcon,
    UserIcon,
    XIcon,
    ZapIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Key, useState } from 'react'
import { INTERNAL_URLS, optimizeCloudinary, useProfile } from '../../../../lib'
import { TUser } from '../../../types'
import CadsquadLogo from '../../CadsquadLogo'
import { FluentColorApprovalsApp20 } from '../../icons/FluentColorApprovalsApp20'
import { FluentColorBriefcase20 } from '../../icons/FluentColorBriefcase20'
import { FluentColorErrorCircle20 } from '../../icons/FluentColorErrorCircle20'
import { IconPeopleColorful } from '../../icons/IconPeopleColorful'
import { CreateJobModal } from '../../../../features/job-manage/components/modals/CreateJobModal'
import CreateUserModal from '../../../../features/staff-directory/components/modals/CreateUserModal'
import { DeliverJobModal } from '../../../../features/job-manage/components/modals/DeliverJobModal'
import { IssueReportModal } from '../../modals/IssueReportModal'
import { HeroButton } from '../../ui/hero-button'
import {
    HeroDrawer,
    HeroDrawerBody,
    HeroDrawerContent,
} from '../../ui/hero-drawer'
import { ScrollArea, ScrollBar } from '../../ui/scroll-area'
import { SearchModal } from '../../search/search-modal'

export default function MobileHeader() {
    const { profile, isAdmin } = useProfile()
    const searchModalDisclosure = useDisclosure({
        id: 'SearchModal',
    })
    const userDrawerDisclosure = useDisclosure({
        id: 'UserDrawer',
    })

    const createJobModalDisclosure = useDisclosure({
        id: 'CreateJobModal',
    })
    const createUserModalDisclosure = useDisclosure({
        id: 'CreateUserModal',
    })
    const deliverJobModalDisclosure = useDisclosure({
        id: 'DeliverJobModal',
    })
    const issueReportModalDisclosure = useDisclosure({
        id: 'IssueReportModal',
    })

    return (
        <>
            {searchModalDisclosure.isOpen && (
                <SearchModal
                    isOpen={searchModalDisclosure.isOpen}
                    onClose={searchModalDisclosure.onClose}
                />
            )}
            {userDrawerDisclosure.isOpen && (
                <UserDrawer
                    isOpen={userDrawerDisclosure.isOpen}
                    onClose={userDrawerDisclosure.onClose}
                    user={profile}
                    onCreateUserModalOpen={createUserModalDisclosure.onOpen}
                    onCreateJobModalOpen={createJobModalDisclosure.onOpen}
                    onDeliverJobModalOpen={deliverJobModalDisclosure.onOpen}
                    onIssueReportModalOpen={issueReportModalDisclosure.onOpen}
                />
            )}
            {isAdmin && createJobModalDisclosure.isOpen && (
                <CreateJobModal
                    isOpen={createJobModalDisclosure.isOpen}
                    onClose={createJobModalDisclosure.onClose}
                />
            )}
            {isAdmin && createUserModalDisclosure.isOpen && (
                <CreateUserModal
                    isOpen={createUserModalDisclosure.isOpen}
                    onClose={createUserModalDisclosure.onClose}
                />
            )}
            {deliverJobModalDisclosure.isOpen && (
                <DeliverJobModal
                    isOpen={deliverJobModalDisclosure.isOpen}
                    onClose={deliverJobModalDisclosure.onClose}
                />
            )}
            {issueReportModalDisclosure.isOpen && (
                <IssueReportModal
                    isOpen={issueReportModalDisclosure.isOpen}
                    onClose={issueReportModalDisclosure.onClose}
                />
            )}
            <div className="w-full h-11 container fixed top-0 border-b border-border-muted z-50 grid grid-cols-[44px_1fr_32px] items-center bg-background">
                <Avatar
                    src={optimizeCloudinary(profile.avatar)}
                    classNames={{
                        base: 'size-6! cursor-pointer',
                    }}
                    isBordered
                    onClick={userDrawerDisclosure.onOpen}
                />
                <div className="w-full flex items-center justify-center">
                    <CadsquadLogo
                        classNames={{
                            logo: 'h-6',
                        }}
                    />
                </div>
                <HeroButton
                    variant="light"
                    size="sm"
                    color="default"
                    isIconOnly
                    onPress={searchModalDisclosure.onOpen}
                >
                    <SearchIcon size={16} className="text-text-subdued" />
                </HeroButton>
            </div>
        </>
    )
}

interface UserDrawerProps {
    isOpen: boolean
    onClose: () => void
    user: TUser
    onCreateJobModalOpen: () => void
    onDeliverJobModalOpen: () => void
    onCreateUserModalOpen: () => void
    onIssueReportModalOpen: () => void
}
export const UserDrawer = ({
    isOpen,
    onClose,
    user,
    onCreateJobModalOpen,
    onDeliverJobModalOpen,
    onIssueReportModalOpen,
    onCreateUserModalOpen,
}: UserDrawerProps) => {
    const router = useRouter()
    const { resolvedTheme, setTheme } = useTheme()
    const [viewMode, setViewMode] = useState<'menu' | 'quick-actions'>('menu')

    const workspaceItems = [
        {
            icon: <GridIcon size={18} />,
            label: 'Workbench',
            href: INTERNAL_URLS.workbench,
        },
        {
            icon: <BriefcaseBusinessIcon size={18} />,
            label: 'Project center',
            href: INTERNAL_URLS.projectCenter,
        },
        {
            icon: <CalendarDaysIcon size={18} />,
            label: 'Schedule',
            href: INTERNAL_URLS.userSchedule,
        },
    ]

    const menuItems = [
        {
            icon: <UserIcon size={18} />,
            label: 'Profile',
            href: INTERNAL_URLS.profile,
        },
        {
            icon: <ChartAreaIcon size={18} />,
            label: 'Overview',
            href: INTERNAL_URLS.userOverview,
        },
        {
            icon: <ListTodoIcon size={18} />,
            label: 'Task Summary',
            href: INTERNAL_URLS.userTaskSummary,
        },
        {
            icon: <UserCogIcon size={18} />,
            label: 'Settings',
            href: INTERNAL_URLS.settings,
        },
    ]

    const quickActions = [
        {
            label: 'New Job',
            icon: <FluentColorBriefcase20 />,
            color: 'bg-blue-50 text-blue-600',
            action: onCreateJobModalOpen,
        },
        {
            label: 'Deliver Job',
            icon: <FluentColorApprovalsApp20 />,
            color: 'bg-purple-50 text-purple-600',
            action: onDeliverJobModalOpen,
        },
        {
            label: 'Issue Report',
            icon: <FluentColorErrorCircle20 />,
            color: 'bg-green-50 text-green-600',
            action: onIssueReportModalOpen,
        },
        {
            label: 'New Member',
            icon: <IconPeopleColorful />,
            color: 'bg-orange-50 text-orange-600',
            action: onCreateUserModalOpen,
        },
    ]

    return (
        <HeroDrawer
            isOpen={isOpen}
            onOpenChange={onClose}
            placement="left"
            size="sm"
            classNames={{
                base: 'max-w-[calc(100vw-80px)] bg-background',
            }}
            backdrop="blur"
        >
            <HeroDrawerContent>
                {(onClose) => (
                    <ScrollArea className="h-full">
                        <ScrollBar orientation="horizontal" />
                        <ScrollBar orientation="vertical" />
                        <HeroDrawerBody className="p-0 flex flex-col h-full bg-background">
                            {/* Header: User Info & Close */}
                            <div className="flex items-center justify-between p-4 pb-4">
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        src={optimizeCloudinary(user.avatar)}
                                        className="w-10 h-10 border-2 border-primary"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-text-subdued leading-none">
                                            Hello,
                                        </span>
                                        <span className="text-sm font-bold text-text-default tracking-tight">
                                            {user.displayName}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    isIconOnly
                                    variant="light"
                                    radius="full"
                                    onPress={onClose}
                                    className="text-text-subdued"
                                >
                                    <XIcon size={20} />
                                </Button>
                            </div>

                            <Divider className="bg-border-default" />
                            {/* Switch View Button */}
                            <div className="px-4 py-3">
                                <Button
                                    fullWidth
                                    color={
                                        viewMode === 'menu'
                                            ? 'primary'
                                            : 'default'
                                    }
                                    variant={
                                        viewMode === 'menu'
                                            ? 'flat'
                                            : 'bordered'
                                    }
                                    startContent={
                                        viewMode === 'menu' ? (
                                            <ZapIcon size={18} />
                                        ) : (
                                            <ArrowLeftIcon size={18} />
                                        )
                                    }
                                    className="font-medium"
                                    onPress={() =>
                                        setViewMode(
                                            viewMode === 'menu'
                                                ? 'quick-actions'
                                                : 'menu'
                                        )
                                    }
                                >
                                    {viewMode === 'menu'
                                        ? 'Quick Actions'
                                        : 'Back to Menu'}
                                </Button>
                            </div>
                            {viewMode === 'menu' ? (
                                <div className="animate-in fade-in slide-in-from-left-full duration-150">
                                    {/* Theme Switcher Section */}
                                    <div className="px-2 py-4">
                                        <p className="px-2 text-[10px] font-medium tracking-wider text-text-subdued mb-3">
                                            Theme
                                        </p>
                                        <Tabs
                                            aria-label="Theme selection"
                                            variant="bordered"
                                            color="primary"
                                            selectedKey={resolvedTheme}
                                            onSelectionChange={(key: Key) =>
                                                setTheme(key.toString())
                                            }
                                            classNames={{
                                                tabList:
                                                    'bg-default-100/50 p-1 border-none rounded-xl',
                                                cursor: 'shadow-sm rounded-lg',
                                                tab: 'h-8',
                                                tabContent: 'text-xs font-bold',
                                            }}
                                        >
                                            <Tab
                                                key="light"
                                                title={
                                                    <div className="flex items-center gap-2">
                                                        <SunIcon size={14} />
                                                        <span>Light</span>
                                                    </div>
                                                }
                                            />
                                            <Tab
                                                key="dark"
                                                title={
                                                    <div className="flex items-center gap-2">
                                                        <MoonIcon size={14} />
                                                        <span>Dark</span>
                                                    </div>
                                                }
                                            />
                                        </Tabs>
                                    </div>

                                    {/* Navigation Items */}
                                    <div className="flex-1 px-2 space-y-1">
                                        <p className="px-2 text-[10px] font-medium tracking-wider text-text-subdued mb-3">
                                            Workspace
                                        </p>
                                        {workspaceItems.map((item, index) => (
                                            <Button
                                                key={index}
                                                fullWidth
                                                variant="light"
                                                size="md"
                                                className="justify-start gap-3 text-text-subdued hover:text-primary hover:bg-primary-50 transition-all rounded-xl"
                                                startContent={item.icon}
                                                onPress={() => {
                                                    router.navigate({
                                                        href: item.href,
                                                    })
                                                    onClose()
                                                }}
                                            >
                                                <span className="text-xs">
                                                    {item.label}
                                                </span>
                                            </Button>
                                        ))}
                                    </div>

                                    <div className="flex-1 px-2 space-y-1">
                                        <p className="px-2 text-[10px] font-medium tracking-wider text-text-subdued mb-3">
                                            Profile
                                        </p>
                                        {menuItems.map((item, index) => (
                                            <Button
                                                key={index}
                                                fullWidth
                                                variant="light"
                                                size="md"
                                                className="justify-start gap-3 text-text-subdued hover:text-primary hover:bg-primary-50 transition-all rounded-xl"
                                                startContent={item.icon}
                                                onPress={() => {
                                                    router.navigate({
                                                        href: item.href,
                                                    })
                                                    onClose()
                                                }}
                                            >
                                                <span className="text-xs">
                                                    {item.label}
                                                </span>
                                            </Button>
                                        ))}
                                    </div>

                                    {/* Logout Section */}
                                    <div className="p-6 mt-auto">
                                        <Button
                                            fullWidth
                                            variant="light"
                                            color="danger"
                                            className="justify-start gap-4 h-12 font-bold rounded-xl"
                                            startContent={
                                                <LogOutIcon size={20} />
                                            }
                                        >
                                            Logout
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="px-2 py-5 animate-in zoom-in-95 fade-in duration-150">
                                    <p className="text-center text-xs font-bold mb-5 text-text-subdued">
                                        What would you like to do?
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        {quickActions.map((action, i) => (
                                            <button
                                                key={i}
                                                className="flex flex-col items-center justify-center p-6 rounded-2xl border border-divider hover:bg-default-50 active:scale-95 transition-all gap-3"
                                                onClick={() => {
                                                    onClose()
                                                    action.action()
                                                }}
                                            >
                                                <div
                                                    className={`p-3 rounded-full ${action.color}`}
                                                >
                                                    {action.icon}
                                                </div>
                                                <span className="text-xs font-bold">
                                                    {action.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </HeroDrawerBody>
                    </ScrollArea>
                )}
            </HeroDrawerContent>
        </HeroDrawer>
    )
}
