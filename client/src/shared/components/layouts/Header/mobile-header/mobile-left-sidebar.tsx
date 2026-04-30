import { INTERNAL_URLS, profileOptions } from '@/lib'
import {
    Bell,
    DisplayPulse,
    FileDollar,
    Gear,
    LifeRing,
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

            <div className="py-3 px-4 flex flex-col">
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

            <div className="px-2 py-2">
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
                        key="settings"
                        title="Settings and privacy"
                        startContent={
                            <Gear
                                strokeWidth={1}
                                className="text-default-800 mr-2 size-6"
                            />
                        }
                    >
                        Settings, Privacy shortcuts, Time on App.
                    </AccordionItem>

                    <AccordionItem
                        key="help"
                        title="Resource Managements"
                        startContent={
                            <SlidersVertical
                                strokeWidth={1}
                                className="text-default-800 mr-2 size-6"
                            />
                        }
                    >
                        Help Center, Support Inbox, Report a problem.
                    </AccordionItem>

                    <AccordionItem
                        key="help"
                        title="Overseeing systems"
                        startContent={
                            <DisplayPulse
                                strokeWidth={1}
                                className="text-default-800 mr-2 size-6"
                            />
                        }
                    >
                        Help Center, Support Inbox, Report a problem.
                    </AccordionItem>

                    <AccordionItem
                        key="professional"
                        title="Financial"
                        startContent={
                            <FileDollar
                                strokeWidth={1}
                                className="text-default-800 mr-2 size-6"
                            />
                        }
                    >
                        Ad Center, Insights, Page Settings.
                    </AccordionItem>
                </Accordion>
            </div>
        </>
    )
}
