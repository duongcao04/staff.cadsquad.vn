import { APP_PERMISSIONS } from '@/lib/utils'
import { ProjectCenterTabEnum } from '@/shared/enums'
import { useDevice, usePermission } from '@/shared/hooks'
import { Tab, Tabs } from '@heroui/react'
import {
    BanknoteArrowUp,
    CircleCheckBig,
    ClockAlert,
    LucideIcon,
    PackageCheck,
    PinIcon,
    SquareX,
    Vote,
} from 'lucide-react'

type Props = {
    currentTab: ProjectCenterTabEnum
    onTabChange: (key: ProjectCenterTabEnum) => void
}

export function ProjectCenterTabs({ currentTab, onTabChange }: Props) {
    const { hasPermission } = usePermission()
    const { isSmallView } = useDevice()

    return (
        <Tabs
            aria-label="Project Tabs"
            color="primary"
            size={isSmallView ? 'sm' : 'md'}
            variant="bordered"
            selectedKey={currentTab}
            onSelectionChange={(key) =>
                onTabChange(key as ProjectCenterTabEnum)
            }
            classNames={{ tabWrapper: 'border-[1px]', tabList: 'border-1' }}
        >
            <Tab
                key={ProjectCenterTabEnum.PRIORITY}
                title={
                    <TabTitle
                        icon={PinIcon}
                        label="Priority"
                        value={ProjectCenterTabEnum.PRIORITY}
                        currentTab={currentTab}
                    />
                }
            />
            <Tab
                key={ProjectCenterTabEnum.ACTIVE}
                title={
                    <TabTitle
                        icon={Vote}
                        label="Active"
                        value={ProjectCenterTabEnum.ACTIVE}
                        currentTab={currentTab}
                    />
                }
            />
            <Tab
                key={ProjectCenterTabEnum.LATE}
                title={
                    <TabTitle
                        icon={ClockAlert}
                        label="Late"
                        value={ProjectCenterTabEnum.LATE}
                        currentTab={currentTab}
                    />
                }
            />
            <Tab
                key={ProjectCenterTabEnum.DELIVERED}
                title={
                    <TabTitle
                        icon={PackageCheck}
                        label="Delivered"
                        value={ProjectCenterTabEnum.DELIVERED}
                        currentTab={currentTab}
                    />
                }
            />
            <Tab
                key={ProjectCenterTabEnum.COMPLETED}
                title={
                    <TabTitle
                        icon={CircleCheckBig}
                        label="Completed"
                        value={ProjectCenterTabEnum.COMPLETED}
                        currentTab={currentTab}
                    />
                }
            />
            <Tab
                key={ProjectCenterTabEnum.FINISHED}
                title={
                    <TabTitle
                        icon={BanknoteArrowUp}
                        label="Finished"
                        value={ProjectCenterTabEnum.FINISHED}
                        currentTab={currentTab}
                    />
                }
            />

            {hasPermission(APP_PERMISSIONS.JOB.READ_CANCELLED) && (
                <Tab
                    key={ProjectCenterTabEnum.CANCELLED}
                    title={
                        <TabTitle
                            icon={SquareX}
                            label="Canceled"
                            value={ProjectCenterTabEnum.CANCELLED}
                            currentTab={currentTab}
                        />
                    }
                />
            )}
        </Tabs>
    )
}

const TabTitle = ({
    icon: Icon,
    label,
    rotate,
    value,
    currentTab,
}: {
    icon: LucideIcon
    label: string
    rotate?: boolean
    value: ProjectCenterTabEnum
    currentTab: ProjectCenterTabEnum
}) => {
    const { isSmallView } = useDevice()
    return (
        <div className="flex items-center space-x-2">
            <Icon size={16} className={rotate ? 'rotate-45' : ''} />
            {(!isSmallView || currentTab === value) && <span>{label}</span>}
        </div>
    )
}
