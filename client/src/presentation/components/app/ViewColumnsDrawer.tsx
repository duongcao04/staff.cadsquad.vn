import { Drawer } from 'antd'
import { ArrowLeft, Grid2X2 } from 'lucide-react'
import { ReactNode } from 'react'
import { Spinner, Switch } from '@heroui/react'

// --- Types ---

// Generic definition for a column
export type ColumnDef = {
    uid: string
    displayName: string
}

// Metadata for styling (Icons, custom titles)
export type ColumnMeta = Record<
    string,
    {
        title?: string
        icon?: ReactNode
        description?: string
    }
>

type ViewColumnsDrawerProps = {
    isOpen: boolean
    onClose: () => void
    title?: string
    /** The list of columns the user is ALLOWED to see/toggle */
    availableColumns: ColumnDef[]
    /** The keys of the columns currently visible. 'all' means everything is shown. */
    visibleKeys: string[] | 'all'
    /** Callback when a switch is toggled */
    onToggle: (key: string, isVisible: boolean) => void
    /** Optional icons and extra details for specific columns */
    meta?: ColumnMeta
}

// --- Main Component ---

export function ViewColumnsDrawer({
    isOpen,
    onClose,
    title = 'View columns',
    availableColumns,
    visibleKeys,
    onToggle,
    meta = {},
}: ViewColumnsDrawerProps) {
    return (
        <Drawer
            open={isOpen}
            title={title}
            width={400}
            maskClosable
            closeIcon={<ArrowLeft size={16} />}
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
                    {availableColumns.map((col) => {
                        // 1. Calculate State
                        const isSelected =
                            visibleKeys === 'all'
                                ? true
                                : visibleKeys?.includes(col.uid)

                        // 2. Resolve Metadata (Icon & Title)
                        const icon = meta[col.uid]?.icon || (
                            <Grid2X2 size={20} className="text-text-subdued" />
                        )
                        const displayTitle =
                            meta[col.uid]?.title || col.displayName

                        // 3. Return JSX
                        return (
                            <div
                                key={col.uid}
                                className="flex items-center justify-between py-3 hover:bg-content2/50 px-2 -mx-2 rounded-lg transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 flex justify-center group-hover:scale-110 transition-transform">
                                        {icon}
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-sm font-medium text-text-default">
                                            {displayTitle}
                                        </p>
                                        <p className="text-[10px] text-text-subdued font-mono">
                                            ID: {col.uid}
                                        </p>
                                    </div>
                                </div>
                                <ViewColumnSwitch
                                    colKey={col.uid}
                                    isSelected={isSelected}
                                    onSwitch={onToggle}
                                />
                            </div>
                        )
                    })}
                </div>
            </div>
        </Drawer>
    )
}

// --- Sub Component ---

type ViewColumnSwitchProps = {
    colKey: string
    isSelected: boolean
    onSwitch: (key: string, isSelected: boolean) => void
    isLoading?: boolean
}

export function ViewColumnSwitch({
    colKey,
    isSelected,
    onSwitch,
    isLoading = false,
}: ViewColumnSwitchProps) {
    if (isLoading) {
        return <Spinner size="sm" />
    }
    return (
        <Switch
            size="sm"
            isSelected={isSelected}
            classNames={{
                base: 'bg-background',
            }}
            onValueChange={(val) => {
                onSwitch(colKey, val)
            }}
        />
    )
}
