import {
    Spinner,
    SortDescriptor,
    Table as HeroUITable,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableProps as HeroUITableProps,
    TableRow,
} from '@heroui/react'
import {
    flexRender,
    Table as TanStackTableInstance,
} from '@tanstack/react-table'
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area'

interface TanStackHeroTableProps<TData> extends Omit<
    HeroUITableProps,
    'children'
> {
    table: TanStackTableInstance<TData>
    isLoading?: boolean
    emptyContent?: React.ReactNode
}

export function TanStackHeroTable<TData>({
    table,
    isLoading = false,
    emptyContent = 'No rows to display.',
    ...props
}: TanStackHeroTableProps<TData>) {
    // 1. Get Table State
    const state = table.getState()

    // 2. Create a "Refresh Key" based on state that affects the view
    // This ensures the TableBody remounts when Page, Sort, or Row Count changes
    const collectionKey = `${state.pagination?.pageIndex}-${state.sorting?.[0]?.id}-${state.sorting?.[0]?.desc}-${table.getRowModel().rows.length}`

    // 3. Sync TanStack Sorting -> HeroUI SortDescriptor
    const sortDescriptor: SortDescriptor | undefined = state.sorting?.[0]
        ? {
              column: state.sorting[0].id,
              direction: state.sorting[0].desc ? 'descending' : 'ascending',
          }
        : undefined

    // 4. Handle HeroUI Sort Event
    const handleSortChange = (descriptor: SortDescriptor) => {
        const column = table.getColumn(descriptor.column as string)
        if (column) {
            const isDesc = descriptor.direction === 'descending'
            column.toggleSorting(isDesc)
        }
    }

    return (
        <HeroUITable
            aria-label="TanStack Data Table"
            isHeaderSticky
            sortDescriptor={sortDescriptor}
            onSortChange={handleSortChange}
            BaseComponent={(found) => (
                <ScrollArea className="size-full h-full! border-1 border-border-default p-2 rounded-md min-h-[calc(100%-150px)]">
                    <ScrollBar orientation="horizontal" />
                    <ScrollBar orientation="vertical" />
                    {found.children}
                </ScrollArea>
            )}
            classNames={{
                table: !isLoading ? 'relative' : 'relative min-h-[430px]!',
                ...props.classNames,
            }}
            {...props}
        >
            <TableHeader>
                {table.getHeaderGroups()[0].headers.map((header) => {
                    return (
                        <TableColumn
                            key={header.id}
                            allowsSorting={header.column.getCanSort()}
                            align={
                                (header.column.columnDef.meta as any)?.align ||
                                'start'
                            }
                        >
                            {header.isPlaceholder
                                ? null
                                : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                  )}
                        </TableColumn>
                    )
                })}
            </TableHeader>
            <TableBody
                // 👇 THIS IS THE FIX: Forces update when data/page/sort changes
                key={collectionKey}
                emptyContent={emptyContent}
                items={table.getRowModel().rows}
                isLoading={isLoading}
                loadingContent={
                    <div className="flex w-full flex-col items-center justify-center gap-4 rounded-xl bg-content1/50 backdrop-blur-sm z-50">
                        <Spinner
                            size="lg"
                            color="primary"
                            label="Loading data..."
                        />
                    </div>
                }
            >
                {(row) => (
                    <TableRow key={row.id} data-selected={row.getIsSelected()}>
                        {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                            </TableCell>
                        ))}
                    </TableRow>
                )}
            </TableBody>
        </HeroUITable>
    )
}
