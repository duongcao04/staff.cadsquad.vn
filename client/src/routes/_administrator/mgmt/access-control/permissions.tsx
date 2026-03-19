import { permissionsListOptions } from '@/lib/queries'
import {
    BreadcrumbItem,
    Breadcrumbs,
    Button,
    Chip,
    Input,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tooltip,
} from '@heroui/react'
import { useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { PlusIcon, SearchIcon, TrashIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

export const Route = createFileRoute(
    '/_administrator/mgmt/access-control/permissions'
)({
    component: AllPermissionsPage,
})

export default function AllPermissionsPage() {
    const router = useRouter()
    const [
        {
            data: { permissions },
        },
    ] = useSuspenseQueries({
        queries: [{ ...permissionsListOptions() }],
    })
    const [filterValue, setFilterValue] = useState('')

    const filteredItems = useMemo(() => {
        return permissions.filter((p) =>
            `${p.entity}:${p.action}`
                .toLowerCase()
                .includes(filterValue.toLowerCase())
        )
    }, [filterValue])

    return (
        <div className="p-6 space-y-6">
            <Breadcrumbs variant="light">
                <BreadcrumbItem
                    onPress={() =>
                        router.navigate({
                            href: '..',
                        })
                    }
                >
                    Access Control
                </BreadcrumbItem>
                <BreadcrumbItem>System Permissions</BreadcrumbItem>
            </Breadcrumbs>
            {/* Header Section */}
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        System Permissions
                    </h1>
                    <p className="text-small text-default-500">
                        Manage granular access controls
                    </p>
                </div>
            </div>

            {/* Search Toolbar */}
            <Input
                isClearable
                className="w-full sm:max-w-87.5"
                placeholder="Search key (e.g. post:create)..."
                startContent={
                    <SearchIcon size={18} className="text-default-300" />
                }
                value={filterValue}
                onValueChange={setFilterValue}
                variant="bordered"
            />

            {/* Table */}
            <Table
                aria-label="Permissions table"
                classNames={{
                    wrapper: 'border border-divider shadow-none rounded-2xl',
                    th: 'bg-default-50 text-default-600 font-bold uppercase text-[10px]',
                }}
            >
                <TableHeader>
                    <TableColumn>PERMISSION KEY</TableColumn>
                    <TableColumn>ENTITY</TableColumn>
                    <TableColumn>ACTION</TableColumn>
                    <TableColumn>DESCRIPTION</TableColumn>
                    <TableColumn align="center">ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent={'No permissions found'}>
                    {filteredItems.map((p) => (
                        <TableRow
                            key={p.id}
                            className="border-b border-divider last:border-none"
                        >
                            <TableCell>
                                <code className="text-primary font-mono font-bold px-2 py-1 bg-primary-50 rounded text-xs">
                                    {p.entity}:{p.action}
                                </code>
                            </TableCell>
                            <TableCell>
                                <span className="capitalize text-sm font-medium">
                                    {p.entity}
                                </span>
                            </TableCell>
                            <TableCell>
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    color="secondary"
                                    className="capitalize font-bold text-[10px]"
                                >
                                    {p.action}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                <span className="text-xs text-default-500">
                                    {p.description}
                                </span>
                            </TableCell>
                            <TableCell>
                                <Tooltip color="danger" content="Delete">
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        color="danger"
                                    >
                                        <TrashIcon size={16} />
                                    </Button>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
