import { INTERNAL_URLS, profileOptions } from '@/lib'
import { RoleChip } from '@/shared/components'
import {
    Briefcase,
    Circles4Diamond,
    CloudGear,
    Dots9,
    Factory,
    Folder,
    House,
    LogoYandexTracker,
    Persons,
    PersonsLock,
    Sack,
    SealPercent,
    Shapes4,
} from '@gravity-ui/icons'
import { Avatar, Button, Card, CardBody } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import {
    createFileRoute,
    Link,
    useNavigate,
    useRouter,
} from '@tanstack/react-router'
import { ArrowDownUp, ChevronLeft, ChevronRight } from 'lucide-react'

export const Route = createFileRoute('/_administrator/administrator/more')({
    component: SettingsMorePage,
})

function SettingsMorePage() {
    const navigate = useNavigate()
    const router = useRouter()

    const { data } = useQuery(profileOptions())
    const profile = data?.profile

    return (
        <div className="flex flex-col min-h-screen bg-background-muted pb-24 space-y-2">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10">
                <Button
                    isIconOnly
                    variant="light"
                    className="bg-default-100 rounded-full h-10 w-10 min-w-10"
                    onPress={() => navigate({ to: '..' })}
                >
                    <ChevronLeft size={20} className="text-default-700" />
                </Button>
                <h1 className="text-lg font-bold text-text-default">More</h1>
                <Button
                    isIconOnly
                    variant="light"
                    as={Link}
                    href={INTERNAL_URLS.workbench}
                    className="bg-default-100 rounded-full h-10 w-10 min-w-10"
                >
                    <ArrowDownUp size={18} className="text-default-700" />
                </Button>
            </header>

            <main className="px-4 flex flex-col gap-6 max-w-md mx-auto w-full">
                {/* Profile Card */}
                <Card
                    shadow="sm"
                    className="border border-border-muted bg-linear-to-br from-white via-primary-50 to-secondary-100"
                >
                    <CardBody className="p-5 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar
                                src={profile?.avatar}
                                className="w-14 h-14 border-2 border-white shadow-sm"
                            />
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-text-default">
                                        {profile?.displayName}
                                    </h2>
                                </div>
                                {profile?.role && (
                                    <RoleChip data={profile?.role} />
                                )}
                            </div>
                        </div>
                        <Button
                            radius="full"
                            as={Link}
                            href={INTERNAL_URLS.settings.overview}
                            className="bg-slate-900 text-white! hover:bg-slate-800"
                        >
                            Settings
                        </Button>
                    </CardBody>
                </Card>

                {/* Team Details (Standalone Item) */}
                <Card shadow="sm" className="border-none bg-white" radius="lg">
                    <CardBody className="p-0">
                        <SettingsItem
                            icon={House}
                            title="Go to Workbench"
                            isLast
                            onPress={() =>
                                router.navigate({
                                    to: INTERNAL_URLS.workbench,
                                })
                            }
                        />
                    </CardBody>
                </Card>

                <section>
                    <h3 className="text-xs font-semibold text-text-subdued mb-2 px-1">
                        Overseeing systems
                    </h3>
                    <Card shadow="sm" className="border-none bg-white">
                        <CardBody className="p-0 flex flex-col">
                            <SettingsItem
                                icon={Dots9}
                                title="Admin Control Center"
                                isFirst
                                onPress={() =>
                                    router.navigate({
                                        href: INTERNAL_URLS.admin.overview,
                                    })
                                }
                            />
                            <SettingsItem
                                icon={PersonsLock}
                                title="Roles & Permissions"
                                onPress={() =>
                                    router.navigate({
                                        href: INTERNAL_URLS.management
                                            .accessControl,
                                    })
                                }
                            />
                            <div className="h-px bg-default-100 ml-12" />
                            <SettingsItem
                                icon={CloudGear}
                                title="System Configuration"
                                onPress={() =>
                                    router.navigate({
                                        href: INTERNAL_URLS.admin.settings,
                                    })
                                }
                                isLast
                            />
                        </CardBody>
                    </Card>
                </section>

                <section>
                    <h3 className="text-xs font-semibold text-text-subdued mb-2 px-1">
                        Resource Managements
                    </h3>
                    <Card shadow="sm" className="border-none bg-white">
                        <CardBody className="p-0 flex flex-col">
                            <SettingsItem
                                icon={Persons}
                                title="Team"
                                isFirst
                                onPress={() =>
                                    router.navigate({
                                        href: INTERNAL_URLS.management.team,
                                    })
                                }
                            />
                            <div className="h-px bg-border-default ml-12" />
                            <SettingsItem
                                icon={Briefcase}
                                title="Jobs"
                                onPress={() =>
                                    router.navigate({
                                        href: INTERNAL_URLS.management.jobs,
                                    })
                                }
                            />
                            <div className="h-px bg-border-default ml-12" />
                            <SettingsItem
                                icon={Circles4Diamond}
                                title="Job Types"
                                onPress={() =>
                                    router.navigate({
                                        href: INTERNAL_URLS.management.jobTypes,
                                    })
                                }
                            />
                            <div className="h-px bg-border-default ml-12" />
                            <SettingsItem
                                icon={Folder}
                                title="Folder Templates"
                                onPress={() =>
                                    router.navigate({
                                        href: INTERNAL_URLS.management
                                            .jobFolderTemplates,
                                    })
                                }
                            />
                            <div className="h-px bg-border-default ml-12" />
                            <SettingsItem
                                icon={Factory}
                                title="Department"
                                onPress={() =>
                                    router.navigate({
                                        href: INTERNAL_URLS.management
                                            .departments,
                                    })
                                }
                            />
                            <div className="h-px bg-border-default ml-12" />
                            <SettingsItem
                                icon={LogoYandexTracker}
                                title="Job Titles"
                                onPress={() =>
                                    router.navigate({
                                        href: INTERNAL_URLS.management
                                            .jobTitles,
                                    })
                                }
                                isLast
                            />
                        </CardBody>
                    </Card>
                </section>

                <section>
                    <h3 className="text-xs font-semibold text-text-subdued mb-2 px-1">
                        Financial
                    </h3>
                    <Card shadow="sm" className="border-none bg-white">
                        <CardBody className="p-0 flex flex-col">
                            <SettingsItem
                                icon={Shapes4}
                                title="Financial Hub"
                                isFirst
                                onPress={() =>
                                    router.navigate({
                                        href: INTERNAL_URLS.financial.overview,
                                    })
                                }
                            />
                            <SettingsItem
                                icon={Sack}
                                title="Payouts"
                                onPress={() =>
                                    router.navigate({
                                        href: INTERNAL_URLS.financial.payouts,
                                    })
                                }
                            />
                            <div className="h-px bg-default-100 ml-12" />
                            <SettingsItem
                                icon={SealPercent}
                                title="Payment Channel"
                                onPress={() =>
                                    router.navigate({
                                        href: INTERNAL_URLS.management
                                            .paymentChannels,
                                    })
                                }
                                isLast
                            />
                        </CardBody>
                    </Card>
                </section>
            </main>
        </div>
    )
}

// --- Helper Component for List Items ---
interface SettingsItemProps {
    icon: React.ElementType
    title: string
    isFirst?: boolean
    isLast?: boolean
    onPress?: () => void
}

function SettingsItem({
    icon: Icon,
    title,
    isFirst,
    isLast,
    onPress,
}: SettingsItemProps) {
    return (
        <div
            onClick={onPress}
            className={`flex items-center justify-between px-4 py-4 bg-white hover:bg-default-50 cursor-pointer active:scale-[0.98] transition-all
                ${isFirst ? 'rounded-t-xl' : ''} 
                ${isLast ? 'rounded-b-xl' : ''}
            `}
        >
            <div className="flex items-center gap-3">
                <Icon size={20} className="text-default-700" strokeWidth={2} />
                <span className="text-sm font-semibold text-text-default">
                    {title}
                </span>
            </div>
            <ChevronRight size={16} className="text-text-subdued" />
        </div>
    )
}
