import {
    SortDescriptor,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableProps,
    TableRow,
} from '@heroui/react'
import { forwardRef, useMemo, useState } from 'react'

import { ScrollArea, ScrollBar } from './scroll-area' // Adjust import path

// --- Helpers ---
// Convert HeroUI descriptor to your API format: "field:asc"
export const descriptorToQuery = (descriptor: SortDescriptor) => {
    const direction = descriptor.direction === 'ascending' ? 'asc' : 'desc'
    return `${descriptor.column}:${direction}`
}

// Convert API format "field:asc" back to HeroUI descriptor
export const queryToDescriptor = (
    sortString?: string | string[]
): SortDescriptor => {
    // Take the first sort item if it's an array
    const sort = Array.isArray(sortString) ? sortString[0] : sortString

    if (!sort) return { column: 'createdAt', direction: 'descending' } // Default

    const [column, direction] = sort.split(':')
    return {
        column: column,
        direction: direction === 'asc' ? 'ascending' : 'descending',
    }
}

// --- Component ---

export type HeroTableProps = TableProps & {
    sortString?: string
    onSortStringChange?: (sortString: string) => void // Emits array for DTO
}

export const HeroTable = forwardRef<HTMLTableElement, HeroTableProps>(
    (props, ref) => {
        const {
            children,
            sortString: defaultSortString,
            onSortStringChange,
            ...otherProps
        } = props

        // 1. State: This usually comes from your URL/Search Params
        // We initialize sort with your API format string
        const [sortString, setSortString] = useState<string | undefined>(
            defaultSortString
        )

        // 2. Memo: Convert API string -> HeroUI SortDescriptor
        const sortDescriptor = useMemo(() => {
            return queryToDescriptor(sortString)
        }, [sortString])

        // 3. Handler: Convert HeroUI SortDescriptor -> API string
        const handleSortChange = (descriptor: SortDescriptor) => {
            const newSortString = descriptorToQuery(descriptor)
            setSortString(newSortString)
            onSortStringChange?.(newSortString)
        }

        return (
            <Table
                ref={ref}
                isHeaderSticky
                sortDescriptor={sortDescriptor}
                onSortChange={handleSortChange}
                BaseComponent={(found) => {
                    return (
                        <ScrollArea className="size-full h-full! border-1 border-border p-2 rounded-md min-h-[calc(100%-150px)]">
                            <ScrollBar orientation="horizontal" />
                            <ScrollBar orientation="vertical" />
                            {found.children}
                        </ScrollArea>
                    )
                }}
                {...otherProps}
                suppressHydrationWarning
            >
                {children}
            </Table>
        )
    }
)

HeroTable.displayName = 'HeroTable'

export {
    TableBody as HeroTableBody,
    TableCell as HeroTableCell,
    TableColumn as HeroTableColumn,
    TableHeader as HeroTableHeader,
    TableRow as HeroTableRow,
}
