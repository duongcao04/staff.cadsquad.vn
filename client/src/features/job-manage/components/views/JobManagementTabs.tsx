import { APP_PERMISSIONS, RouteUtil } from '@/lib'
import { EJobManagementTableTabs } from '@/routes/_administrator/mgmt/jobs'
import { usePermission } from '@/shared/hooks'
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

interface JobManagementTabsProps {
    activeViewTab: string
}
export function JobManagementTabs({ activeViewTab }: JobManagementTabsProps) {
    const { hasPermission } = usePermission()
    return (
        <div className="flex items-center justify-between pb-2">
            <Tabs
                aria-label="Job Management Tabs"
                color="primary"
                variant="bordered"
                selectedKey={activeViewTab}
                onSelectionChange={(value) => {
                    RouteUtil.updateParams({
                        tab: value,
                    })
                }}
                classNames={{
                    tabWrapper: 'border-[1px]',
                    tabList: 'border-1',
                }}
            >
                {hasPermission(APP_PERMISSIONS.JOB.READ_ALL) && (
                    <Tab
                        key={EJobManagementTableTabs.ALL}
                        title={
                            <div className="flex items-center space-x-2">
                                <LayoutCellsLarge fontSize={16} />
                                <span>All Jobs</span>
                            </div>
                        }
                    />
                )}
                <Tab
                    key={EJobManagementTableTabs.PRIORITY}
                    title={
                        <div className="flex items-center space-x-2">
                            <Stopwatch fontSize={16} />
                            <span>Priority</span>
                        </div>
                    }
                />
                <Tab
                    key={EJobManagementTableTabs.ACTIVE}
                    title={
                        <div className="flex items-center space-x-2">
                            <SquareListUl fontSize={16} />
                            <span>Active</span>
                        </div>
                    }
                />
                <Tab
                    key={EJobManagementTableTabs.LATE}
                    title={
                        <div className="flex items-center space-x-2">
                            <CircleExclamation fontSize={16} />
                            <span>Late</span>
                        </div>
                    }
                />
                <Tab
                    key={EJobManagementTableTabs.COMPLETED}
                    title={
                        <div className="flex items-center space-x-2">
                            <CheckDouble fontSize={16} />
                            <span>Completed</span>
                        </div>
                    }
                />
                <Tab
                    key={EJobManagementTableTabs.FINISHED}
                    title={
                        <div className="flex items-center space-x-2">
                            <SealCheck fontSize={16} />
                            <span>Finished</span>
                        </div>
                    }
                />
                {hasPermission(APP_PERMISSIONS.JOB.READ_CANCELLED) && (
                    <Tab
                        key={EJobManagementTableTabs.CANCELED}
                        title={
                            <div className="flex items-center space-x-2">
                                <OctagonXmark fontSize={16} />
                                <span>Canceled</span>
                            </div>
                        }
                    />
                )}
            </Tabs>
        </div>
    )
}
