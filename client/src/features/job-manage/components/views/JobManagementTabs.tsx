import { APP_PERMISSIONS, RouteUtil } from '@/lib'
import { EJobManagementTableTabs } from '@/routes/_administrator/mgmt/jobs'
import { useDevice, usePermission } from '@/shared/hooks'
import {
    CheckDouble,
    CircleExclamation,
    LayoutCellsLarge,
    OctagonXmark,
    SealCheck,
    SquareListUl,
    Stopwatch,
} from '@gravity-ui/icons'
import { Tab, Tabs } from '@heroui/react'

interface JobManagementTabs {
    activeViewTab: string
}

export function JobManagementTabs({ activeViewTab }: JobManagementTabs) {
    const { hasPermission } = usePermission()
    const { isSmallView } = useDevice()

    const tabsContent = [
        {
            key: EJobManagementTableTabs.ALL,
            permission: APP_PERMISSIONS.JOB.READ_ALL,
            icon: <LayoutCellsLarge fontSize={16} />,
            label: 'All Jobs',
        },
        {
            key: EJobManagementTableTabs.PRIORITY,
            icon: <Stopwatch fontSize={16} />,
            label: 'Priority',
        },
        {
            key: EJobManagementTableTabs.ACTIVE,
            icon: <SquareListUl fontSize={16} />,
            label: 'Active',
        },
        {
            key: EJobManagementTableTabs.LATE,
            icon: <CircleExclamation fontSize={16} />,
            label: 'Late',
        },
        {
            key: EJobManagementTableTabs.COMPLETED,
            icon: <CheckDouble fontSize={16} />,
            label: 'Completed',
        },
        {
            key: EJobManagementTableTabs.FINISHED,
            icon: <SealCheck fontSize={16} />,
            label: 'Finished',
        },
        {
            key: EJobManagementTableTabs.CANCELED,
            permission: APP_PERMISSIONS.JOB.READ_CANCELLED,
            icon: <OctagonXmark fontSize={16} />,
            label: 'Canceled',
        },
    ]

    // Desktop/Default View
    if (!isSmallView) {
        return (
            <div className="flex items-center justify-between pb-2">
                <Tabs
                    aria-label="Job Management Tabs"
                    color="primary"
                    variant="bordered"
                    selectedKey={activeViewTab}
                    onSelectionChange={(value) => {
                        RouteUtil.updateParams({ tab: value })
                    }}
                    classNames={{
                        tabWrapper: 'border-[1px]',
                        tabList: 'border-1',
                    }}
                >
                    {tabsContent.map((tab) => {
                        if (tab.permission && !hasPermission(tab.permission))
                            return null
                        return (
                            <Tab
                                key={tab.key}
                                title={
                                    <div className="flex items-center space-x-2">
                                        {tab.icon}
                                        <span>{tab.label}</span>
                                    </div>
                                }
                            />
                        )
                    })}
                </Tabs>
            </div>
        )
    }

    return (
        <div className="w-full pb-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <Tabs
                aria-label="Job Management Tabs"
                color="primary"
                variant="bordered"
                selectedKey={activeViewTab}
                onSelectionChange={(value) => {
                    RouteUtil.updateParams({ tab: value })
                }}
                classNames={{
                    base: 'w-full max-w-full',
                    tabList: 'border-1 flex-nowrap w-max',
                    tab: 'min-w-max px-3',
                }}
            >
                {tabsContent.map((tab) => {
                    if (tab.permission && !hasPermission(tab.permission))
                        return null
                    return (
                        <Tab
                            key={tab.key}
                            title={
                                <div className="flex items-center space-x-2">
                                    {tab.icon}
                                    {activeViewTab === tab.key && (
                                        <span>{tab.label}</span>
                                    )}
                                </div>
                            }
                        />
                    )
                })}
            </Tabs>
        </div>
    )
}
