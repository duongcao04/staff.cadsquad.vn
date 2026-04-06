import { optimizeCloudinary } from '@/lib'
import { logoutOptions, useProfile } from '@/lib/queries'
import { INTERNAL_URLS, THEME_SELECTS } from '@/lib/utils'
import {
    addToast,
    Avatar,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    Select,
    SelectItem,
    User as UserComp,
} from '@heroui/react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import {
    ChartArea,
    ListTodo,
    LogOut,
    SunMoon,
    User,
    UserCircle,
    UserCog,
} from 'lucide-react'
import { useTheme } from 'next-themes'

export function UserDropdown() {
    const { theme, setTheme } = useTheme()

    const router = useRouter()
    const { profile } = useProfile()
    const logout = useMutation(logoutOptions)

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
        <Dropdown
            placement="bottom-end"
            showArrow
            classNames={{
                base: 'top-2',
                content: 'rounded-lg',
            }}
        >
            <DropdownTrigger>
                <Avatar
                    className="cursor-pointer"
                    icon={<User size={18} />}
                    src={profile.avatar}
                    classNames={{
                        base: '!size-6',
                    }}
                    size="sm"
                    suppressHydrationWarning
                />
            </DropdownTrigger>
            <DropdownMenu
                aria-label="User menu"
                classNames={{
                    base: 'min-w-[250px] overflow-y-auto',
                }}
                // disabledKeys={['changeTheme']}
            >
                <DropdownSection showDivider aria-label="Profile">
                    <DropdownItem
                        key="profile"
                        className="h-14 gap-2 opacity-100"
                        onClick={() => {
                            router.navigate({ href: INTERNAL_URLS.profile })
                        }}
                    >
                        <UserComp
                            avatarProps={{
                                size: 'sm',
                                src: optimizeCloudinary(profile?.avatar),
                            }}
                            classNames={{
                                name: 'text-text-default font-medium',
                                description: 'text-text-subdued',
                            }}
                            name={profile.displayName}
                            description={`@${profile?.username}`}
                        />
                    </DropdownItem>

                    {/* TODO: Implement /overview */}
                    {false ? (
                        <DropdownItem
                            key="overview"
                            startContent={<ChartArea size={16} />}
                            onClick={() => {
                                router.navigate({
                                    href: INTERNAL_URLS.overview,
                                })
                            }}
                        >
                            Overview
                        </DropdownItem>
                    ) : null}

                    {/* TODO: Implement /task-summary */}
                    {false ? (
                        <DropdownItem
                            key="taskSummary"
                            startContent={<ListTodo size={16} />}
                            onClick={() => {
                                router.navigate({
                                    href: INTERNAL_URLS.userTaskSummary,
                                })
                            }}
                        >
                            Task Summary
                        </DropdownItem>
                    ) : null}
                    <DropdownItem
                        key="settings"
                        startContent={<UserCog size={16} />}
                        onClick={() => {
                            router.navigate({
                                href: INTERNAL_URLS.settings.overview,
                            })
                        }}
                    >
                        Settings
                    </DropdownItem>
                </DropdownSection>

                <DropdownSection aria-label="Other actions" showDivider>
                    <DropdownItem
                        isReadOnly
                        key="changeTheme"
                        startContent={<SunMoon size={16} />}
                        className="hover:bg-transparent!"
                        endContent={
                            <Select
                                className="max-w-25"
                                size="sm"
                                defaultSelectedKeys={[theme as 'dark']}
                                onSelectionChange={(keys) => {
                                    setTheme(keys.currentKey as 'dark')
                                }}
                            >
                                {THEME_SELECTS.map((theme) => (
                                    <SelectItem key={theme.key}>
                                        {theme.label}
                                    </SelectItem>
                                ))}
                            </Select>
                        }
                    >
                        Theme mode
                    </DropdownItem>
                </DropdownSection>

                <DropdownSection aria-label="Help & Settings">
                    <DropdownItem
                        key="helpCenter"
                        startContent={<UserCircle size={16} />}
                        onClick={() => {
                            router.navigate({ href: INTERNAL_URLS.helpCenter })
                        }}
                    >
                        Help center
                    </DropdownItem>
                    <DropdownItem
                        key="logout"
                        startContent={<LogOut size={16} />}
                        color="danger"
                        onPress={handleLogout}
                    >
                        Logout
                    </DropdownItem>
                </DropdownSection>
            </DropdownMenu>
        </Dropdown>
    )
}
