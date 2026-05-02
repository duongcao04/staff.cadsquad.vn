import { INTERNAL_URLS, profileOptions } from '@/lib'
import {
    Bell,
    Briefcase,
    Circles4Diamond,
    CloudGear,
    DisplayPulse,
    Dots9,
    Factory,
    FileDollar,
    Folder,
    Gear,
    LifeRing,
    Lock,
    LogoYandexTracker,
    Paintbrush,
    PersonNutHex,
    Persons,
    PersonsLock,
    Sack,
    SealPercent,
    Shapes4,
    SlidersVertical,
    SquareDashedText,
} from '@gravity-ui/icons'
import {
    Accordion,
    AccordionItem,
    Avatar,
    Badge,
    Button,
    Card,
    CardBody,
    Divider,
} from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { Link, useRouter } from '@tanstack/react-router'

const MAIN_NAV = [
    {
        id: 'overview',
        label: 'Overview',
        href: INTERNAL_URLS.overview,
        icon: SquareDashedText,
    },
    {
        id: 'help-center',
        label: 'Help Center',
        href: INTERNAL_URLS.helpCenter,
        icon: LifeRing,
    },
]

export const MobileLeftSidebar = ({ onHidden }: { onHidden: () => void }) => {
    const { data: profileData } = useQuery(profileOptions())
    const profile = profileData?.profile

    const router = useRouter()

    return (
        <>
            <div className="px-4 pt-4 pb-2">
                <div
                    onClick={() => {
                        router.navigate({ to: INTERNAL_URLS.profile })
                        onHidden()
                    }}
                >
                    <Card
                        shadow="sm"
                        className="rounded-2xl bg-background-muted"
                    >
                        <CardBody className="p-3 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar
                                    src={profile?.avatar}
                                    className="w-10 h-10"
                                />
                                <span className="font-bold text-default-900 text-base leading-none mt-1">
                                    {profile?.displayName}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge
                                    content="9+"
                                    color="danger"
                                    shape="circle"
                                    size="sm"
                                    classNames={{
                                        badge: 'text-[10px] font-semibold',
                                    }}
                                >
                                    <Button
                                        isIconOnly
                                        as={Link}
                                        to={INTERNAL_URLS.notifications}
                                        onPress={onHidden}
                                        variant="flat"
                                        className="rounded-full bg-background text-text-subdued h-9 w-9 min-w-9"
                                    >
                                        <Bell fontSize={18} />
                                    </Button>
                                </Badge>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>

            <div className="py-3 px-2 flex flex-col">
                <div className="px-2">
                    <h3 className="text-sm font-bold text-default-900 mb-3">
                        Quick actions
                    </h3>
                </div>
                <div className="flex flex-col gap-2">
                    {MAIN_NAV.map((nav) => (
                        <Button
                            key={nav.id}
                            className="w-full justify-start h-12 px-4 bg-background-muted rounded-xl"
                            startContent={
                                <nav.icon
                                    strokeWidth={1}
                                    className="text-default-800 mr-2 size-6"
                                />
                            }
                            onPress={() => {
                                router.navigate({
                                    to: nav.href,
                                })
                                onHidden()
                            }}
                        >
                            <span className="font-medium text-base text-default-900">
                                {nav.label}
                            </span>
                        </Button>
                    ))}
                </div>
            </div>

            <Divider className="bg-border-default h-px" />

            <div className="py-2">
                <Accordion
                    showDivider={false}
                    itemClasses={{
                        base: 'px-2 py-1',
                        title: 'font-semibold text-default-900 text-[15px]',
                        trigger:
                            'px-2 py-3 rounded-xl hover:bg-default-100 transition-colors',
                        indicator: 'text-default-900',
                        content: 'text-sm text-default-500 px-2 pb-3',
                    }}
                >
                    <AccordionItem
                        key="settings-and-privacy"
                        title="Settings and privacy"
                        startContent={
                            <Gear
                                strokeWidth={1}
                                className="text-default-800 mr-2 size-6"
                            />
                        }
                    >
                        <div className="flex flex-col gap-2">
                            <Button
                                className="w-full justify-start h-12 px-4 bg-background-muted rounded-xl"
                                startContent={
                                    <PersonNutHex
                                        strokeWidth={1}
                                        className="text-default-800 mr-2 size-6"
                                    />
                                }
                                onPress={() => {
                                    router.navigate({
                                        to: INTERNAL_URLS.settings.overview,
                                    })
                                    onHidden()
                                }}
                            >
                                <span className="font-medium text-base text-default-900">
                                    Settings
                                </span>
                            </Button>
                            <Button
                                className="w-full justify-start h-12 px-4 bg-background-muted rounded-xl"
                                startContent={
                                    <Lock
                                        strokeWidth={1}
                                        className="text-default-800 mr-2 size-6"
                                    />
                                }
                                onPress={() => {
                                    router.navigate({
                                        to: INTERNAL_URLS.settings
                                            .loginAndSecurity,
                                    })
                                    onHidden()
                                }}
                            >
                                <span className="font-medium text-base text-default-900">
                                    Login & Security
                                </span>
                            </Button>
                            <Button
                                className="w-full justify-start h-12 px-4 bg-background-muted rounded-xl"
                                startContent={
                                    <Paintbrush
                                        strokeWidth={1}
                                        className="text-default-800 mr-2 size-6"
                                    />
                                }
                                onPress={() => {
                                    router.navigate({
                                        to: INTERNAL_URLS.settings.appearance,
                                    })
                                    onHidden()
                                }}
                            >
                                <span className="font-medium text-base text-default-900">
                                    Appearance
                                </span>
                            </Button>
                            <Button
                                className="w-full justify-start h-12 px-4 bg-background-muted rounded-xl"
                                startContent={
                                    <Bell
                                        strokeWidth={1}
                                        className="text-default-800 mr-2 size-6"
                                    />
                                }
                                onPress={() => {
                                    router.navigate({
                                        to: INTERNAL_URLS.settings
                                            .notifications,
                                    })
                                    onHidden()
                                }}
                            >
                                <span className="font-medium text-base text-default-900">
                                    Notifications
                                </span>
                            </Button>
                        </div>
                    </AccordionItem>

                    <AccordionItem
                        key="resource-managements"
                        title="Resource Managements"
                        startContent={
                            <SlidersVertical
                                strokeWidth={1}
                                className="text-default-800 mr-2 size-6"
                            />
                        }
                    >
                        <div className="flex flex-col gap-2">
                            <Button
                                className="w-full justify-start h-12 px-4 bg-background-muted rounded-xl"
                                startContent={
                                    <Persons
                                        strokeWidth={1}
                                        className="text-default-800 mr-2 size-6"
                                    />
                                }
                                onPress={() => {
                                    router.navigate({
                                        href: INTERNAL_URLS.management.team,
                                    })
                                    onHidden()
                                }}
                            >
                                <span className="font-medium text-base text-default-900">
                                    Team
                                </span>
                            </Button>
                            <Button
                                className="w-full justify-start h-12 px-4 bg-background-muted rounded-xl"
                                startContent={
                                    <Briefcase
                                        strokeWidth={1}
                                        className="text-default-800 mr-2 size-6"
                                    />
                                }
                                onPress={() => {
                                    router.navigate({
                                        href: INTERNAL_URLS.management.jobs,
                                    })
                                    onHidden()
                                }}
                            >
                                <span className="font-medium text-base text-default-900">
                                    Jobs
                                </span>
                            </Button>
                            <Button
                                className="w-full justify-start h-12 px-4 bg-background-muted rounded-xl"
                                startContent={
                                    <Circles4Diamond
                                        strokeWidth={1}
                                        className="text-default-800 mr-2 size-6"
                                    />
                                }
                                onPress={() => {
                                    router.navigate({
                                        href: INTERNAL_URLS.management.jobTypes,
                                    })
                                    onHidden()
                                }}
                            >
                                <span className="font-medium text-base text-default-900">
                                    Job Types
                                </span>
                            </Button>
                            <Button
                                className="w-full justify-start h-12 px-4 bg-background-muted rounded-xl"
                                startContent={
                                    <Folder
                                        strokeWidth={1}
                                        className="text-default-800 mr-2 size-6"
                                    />
                                }
                                onPress={() => {
                                    router.navigate({
                                        href: INTERNAL_URLS.management
                                            .jobFolderTemplates,
                                    })
                                    onHidden()
                                }}
                            >
                                <span className="font-medium text-base text-default-900">
                                    Folder Templates
                                </span>
                            </Button>
                            <Button
                                className="w-full justify-start h-12 px-4 bg-background-muted rounded-xl"
                                startContent={
                                    <Factory
                                        strokeWidth={1}
                                        className="text-default-800 mr-2 size-6"
                                    />
                                }
                                onPress={() => {
                                    router.navigate({
                                        href: INTERNAL_URLS.management
                                            .departments,
                                    })
                                    onHidden()
                                }}
                            >
                                <span className="font-medium text-base text-default-900">
                                    Department
                                </span>
                            </Button>
                            <Button
                                className="w-full justify-start h-12 px-4 bg-background-muted rounded-xl"
                                startContent={
                                    <LogoYandexTracker
                                        strokeWidth={1}
                                        className="text-default-800 mr-2 size-6"
                                    />
                                }
                                onPress={() => {
                                    router.navigate({
                                        href: INTERNAL_URLS.management
                                            .jobTitles,
                                    })
                                    onHidden()
                                }}
                            >
                                <span className="font-medium text-base text-default-900">
                                    Job Titles
                                </span>
                            </Button>
                        </div>
                    </AccordionItem>

                    <AccordionItem
                        key="overseeing-systems"
                        title="Overseeing systems"
                        startContent={
                            <DisplayPulse
                                strokeWidth={1}
                                className="text-default-800 mr-2 size-6"
                            />
                        }
                    >
                        <div className="flex flex-col gap-2">
                            <Button
                                className="w-full justify-start h-12 px-4 bg-background-muted rounded-xl"
                                startContent={
                                    <Dots9
                                        strokeWidth={1}
                                        className="text-default-800 mr-2 size-6"
                                    />
                                }
                                onPress={() => {
                                    router.navigate({
                                        href: INTERNAL_URLS.admin.overview,
                                    })
                                    onHidden()
                                }}
                            >
                                <span className="font-medium text-base text-default-900">
                                    Admin Control Center
                                </span>
                            </Button>
                            <Button
                                className="w-full justify-start h-12 px-4 bg-background-muted rounded-xl"
                                startContent={
                                    <CloudGear
                                        strokeWidth={1}
                                        className="text-default-800 mr-2 size-6"
                                    />
                                }
                                onPress={() => {
                                    router.navigate({
                                        href: INTERNAL_URLS.admin.settings,
                                    })
                                    onHidden()
                                }}
                            >
                                <span className="font-medium text-base text-default-900">
                                    System Configuration
                                </span>
                            </Button>
                            <Button
                                className="w-full justify-start h-12 px-4 bg-background-muted rounded-xl"
                                startContent={
                                    <PersonsLock
                                        strokeWidth={1}
                                        className="text-default-800 mr-2 size-6"
                                    />
                                }
                                onPress={() => {
                                    router.navigate({
                                        href: INTERNAL_URLS.management
                                            .accessControl,
                                    })
                                    onHidden()
                                }}
                            >
                                <span className="font-medium text-base text-default-900">
                                    Roles & Permissions
                                </span>
                            </Button>
                        </div>
                    </AccordionItem>

                    <AccordionItem
                        key="financial"
                        title="Financial"
                        startContent={
                            <FileDollar
                                strokeWidth={1}
                                className="text-default-800 mr-2 size-6"
                            />
                        }
                    >
                        <div className="flex flex-col gap-2">
                            <Button
                                className="w-full justify-start h-12 px-4 bg-background-muted rounded-xl"
                                startContent={
                                    <Shapes4
                                        strokeWidth={1}
                                        className="text-default-800 mr-2 size-6"
                                    />
                                }
                                onPress={() => {
                                    router.navigate({
                                        href: INTERNAL_URLS.financial.overview,
                                    })
                                    onHidden()
                                }}
                            >
                                <span className="font-medium text-base text-default-900">
                                    Financial Hub
                                </span>
                            </Button>
                            <Button
                                className="w-full justify-start h-12 px-4 bg-background-muted rounded-xl"
                                startContent={
                                    <Sack
                                        strokeWidth={1}
                                        className="text-default-800 mr-2 size-6"
                                    />
                                }
                                onPress={() => {
                                    router.navigate({
                                        href: INTERNAL_URLS.financial.payouts,
                                    })
                                    onHidden()
                                }}
                            >
                                <span className="font-medium text-base text-default-900">
                                    Payouts
                                </span>
                            </Button>
                            <Button
                                className="w-full justify-start h-12 px-4 bg-background-muted rounded-xl"
                                startContent={
                                    <SealPercent
                                        strokeWidth={1}
                                        className="text-default-800 mr-2 size-6"
                                    />
                                }
                                onPress={() => {
                                    router.navigate({
                                        href: INTERNAL_URLS.management
                                            .paymentChannels,
                                    })
                                    onHidden()
                                }}
                            >
                                <span className="font-medium text-base text-default-900">
                                    Payment Channel
                                </span>
                            </Button>
                        </div>
                    </AccordionItem>
                </Accordion>
            </div>
        </>
    )
}
