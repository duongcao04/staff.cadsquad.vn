import { useProfile } from '@/lib'
import type { JobColumnKey, TJob } from '@/shared/types'
import { Switch } from '@heroui/react'
import { Column } from '@tanstack/react-table'
import { Drawer } from 'antd'
import { ArrowLeftIcon, Grid2X2Icon } from 'lucide-react'
import { useMemo } from 'react'
import { PrivilegeHelper } from '@/lib/helpers'
import { toggleWorkbenchColumns } from '../../stores/_workbench.store'

type Props = {
    isOpen: boolean
    onClose: () => void
    tableColumns: Column<TJob, unknown>[]
    visibleColumns: Column<TJob, unknown>[]
}

export function WorkbenchViewColumnsDrawer({
    isOpen,
    onClose,
    tableColumns,
    visibleColumns,
}: Props) {
    console.log(tableColumns)

    const { userPermissions } = useProfile()

    // 1. Get ALL allowed columns (not just the visible ones)
    const availableColumns = useMemo(() => {
        const filterdColumns = tableColumns.filter((column) => {
            const meta = column.columnDef.meta as {
                icon: React.ElementType
                requiredPermissions: string[]
                bypassPermission: string
            }
            if (meta.requiredPermissions) {
                return PrivilegeHelper.hasEveryPermission(
                    userPermissions,
                    meta.requiredPermissions,
                    meta.bypassPermission
                )
            } else {
                return true
            }
        })
        return filterdColumns
    }, [userPermissions, tableColumns])

    // 3. Action to update store
    const handleToggle = (key: string, isVisible: boolean) => {
        toggleWorkbenchColumns(key as JobColumnKey, isVisible, userPermissions)
    }

    return (
        <Drawer
            open={isOpen}
            title="Workbench Columns"
            width={400}
            maskClosable
            closeIcon={
                <ArrowLeftIcon size={16} className="text-text-default" />
            }
            onClose={onClose}
            classNames={{
                body: '!py-3 !px-5',
            }}
        >
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-text-subdued text-xs uppercase tracking-wider">
                        Available Columns
                    </p>
                </div>

                <div className="divide-y divide-border/50">
                    {availableColumns.map((column, idx) => {
                        // 1. Calculate State
                        const isSelected = column.getIsVisible()

                        // 2. Resolve Metadata (Icon & Title)
                        const Icon = (
                            column.columnDef.meta as {
                                icon: React.ElementType
                                requiredPermissions: string[]
                                bypassPermission: string
                            }
                        )?.['icon'] || (
                            <Grid2X2Icon
                                size={20}
                                className="text-text-subdued"
                            />
                        )

                        const displayTitle =
                            typeof column.columnDef.header === 'string'
                                ? column.columnDef.header
                                : (
                                      column.columnDef.meta as {
                                          headerName: string
                                      }
                                  )?.headerName

                        // 3. Return JSX
                        return (
                            <div
                                key={idx}
                                className="flex items-center justify-between py-3 hover:bg-content2/50 px-2 -mx-2 rounded-lg transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 flex justify-center">
                                        <div className="size-4!">
                                            <Icon />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-sm font-medium text-text-default">
                                            {displayTitle}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    size="sm"
                                    isSelected={isSelected}
                                    classNames={{
                                        base: 'bg-background',
                                    }}
                                    onChange={column.getToggleVisibilityHandler()}
                                />
                            </div>
                        )
                    })}
                </div>
            </div>
        </Drawer>
    )
}
