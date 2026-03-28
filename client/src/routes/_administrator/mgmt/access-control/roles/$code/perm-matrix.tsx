import { INTERNAL_URLS } from '@/lib'
import {
    bulkUpdatePermissionOptions,
    permissionGroupsListOptions,
    roleOptions,
} from '@/lib/queries'
import { AdminPageHeading } from '@/shared/components'
import AdminContentContainer from '@/shared/components/admin/AdminContentContainer'
import { ArrowLeft, ArrowRotateLeft, FloppyDisk } from '@gravity-ui/icons'
import {
    Accordion,
    AccordionItem,
    BreadcrumbItem,
    Breadcrumbs,
    Button,
    Card,
    CardBody,
    Checkbox,
    CheckboxGroup,
    Divider,
} from '@heroui/react'
import { useMutation, useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { ListChecks, ShieldCheck } from 'lucide-react'
import { Dispatch, SetStateAction, useMemo, useState } from 'react'

export const Route = createFileRoute(
    '/_administrator/mgmt/access-control/roles/$code/perm-matrix'
)({
    component: () => {
        const router = useRouter()
        const { code } = Route.useParams()

        const [
            { data: permissionGroups },
            {
                data: { role },
            },
        ] = useSuspenseQueries({
            queries: [
                { ...permissionGroupsListOptions() },
                { ...roleOptions(code) },
            ],
        })

        // 2. Local State cho danh sách Permission IDs đang chọn
        const [selectedIds, setSelectedIds] = useState<string[]>(
            role.permissions.map((p: any) => p.id)
        )

        // Khởi tạo Mutation
        const { mutate: updatePermissions, isPending } = useMutation(
            bulkUpdatePermissionOptions
        )

        // Kiểm tra xem dữ liệu đã thay đổi so với ban đầu chưa
        const isDirty = useMemo(() => {
            const initialIds = [
                ...role.permissions.map((p: any) => p.id),
            ].sort()
            const currentIds = [...selectedIds].sort()
            return JSON.stringify(initialIds) !== JSON.stringify(currentIds)
        }, [selectedIds, role.permissions])

        // 3. Handlers
        const handleReset = () =>
            setSelectedIds(role.permissions.map((p: any) => p.id))

        const handleSave = () => {
            // Gọi mutation để lưu vào DB thông qua API PATCH /v1/roles/:id/permissions/bulk
            updatePermissions(
                { roleId: role.id, permissionIds: selectedIds },
                {
                    onSuccess: () => {
                        // Sau khi lưu thành công, có thể điều hướng hoặc giữ nguyên để edit tiếp
                        // router.navigate({ href: '..' })
                    },
                }
            )
        }
        return (
            <>
                <AdminPageHeading
                    title={
                        <div className="flex items-center gap-4">
                            <Button
                                isIconOnly
                                variant="flat"
                                onPress={() => router.history.back()}
                            >
                                <ArrowLeft fontSize={18} />
                            </Button>
                            <div className="space-y-0.5">
                                <h1 className="text-2xl font-bold">
                                    Edit Authority Matrix
                                </h1>
                                <p className="text-sm text-text-subdued font-medium">
                                    Configure granular access for{' '}
                                    <span
                                        className="font-bold"
                                        style={{ color: role.hexColor }}
                                    >
                                        {role.displayName}
                                    </span>
                                </p>
                            </div>
                        </div>
                    }
                    actions={
                        <div className="flex gap-2">
                            {isDirty && (
                                <Button
                                    variant="flat"
                                    color="warning"
                                    startContent={
                                        <ArrowRotateLeft fontSize={14} />
                                    }
                                    onPress={handleReset}
                                    isDisabled={isPending}
                                >
                                    Reset Changes
                                </Button>
                            )}
                            <Button
                                color="primary"
                                startContent={<FloppyDisk fontSize={14} />}
                                onPress={handleSave}
                                isDisabled={!isDirty}
                                isLoading={isPending}
                            >
                                Update Permissions
                            </Button>
                        </div>
                    }
                />
                <AdminContentContainer className="pt-0 space-y-5">
                    <Breadcrumbs className="text-xs">
                        <BreadcrumbItem>
                            <Link
                                to={INTERNAL_URLS.admin.overview}
                                className="text-text-subdued!"
                            >
                                Management
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link
                                to={INTERNAL_URLS.management.accessControl}
                                className="text-text-subdued!"
                            >
                                Access Control
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>Roles</BreadcrumbItem>
                        <BreadcrumbItem>{role.displayName}</BreadcrumbItem>
                        <BreadcrumbItem>Permissions Matrix</BreadcrumbItem>
                    </Breadcrumbs>

                    <div className="space-y-8">
                        <EditPermissionsMatrix
                            setSelectedIds={setSelectedIds}
                            selectedIds={selectedIds}
                            isPending={isPending}
                        />
                    </div>
                </AdminContentContainer>
            </>
        )
    },
})

interface EditPermissionsMatrixProps {
    selectedIds: string[]
    setSelectedIds: Dispatch<SetStateAction<string[]>>
    isPending: boolean
}
export default function EditPermissionsMatrix({
    selectedIds,
    setSelectedIds,
    isPending,
}: EditPermissionsMatrixProps) {
    const { code } = Route.useParams()

    // 1. Fetch Master Permissions & Current Role Details
    const [
        { data: permissionGroups },
        {
            data: { role },
        },
    ] = useSuspenseQueries({
        queries: [
            { ...permissionGroupsListOptions() },
            { ...roleOptions(code) },
        ],
    })

    return (
        <>
            <Card shadow="none" className="bg-danger-50 border-none">
                <CardBody className="flex flex-row items-center gap-4 p-4">
                    <div className="p-2 bg-danger-100 rounded-full text-danger">
                        <ShieldCheck size={20} />
                    </div>
                    <p className="text-sm text-danger-700">
                        <b>Critical Action:</b> Changes made here will instantly
                        affect all users assigned to the{' '}
                        <b>{role.displayName}</b> role. Please ensure you have
                        verified the internal security policy before saving.
                    </p>
                </CardBody>
            </Card>
            <div className="max-w-7xl mx-auto">
                <Accordion
                    variant="splitted"
                    selectionMode="multiple"
                    defaultExpandedKeys={[permissionGroups[0]?.id]}
                    className="px-0"
                    itemClasses={{
                        trigger: 'cursor-pointer',
                    }}
                >
                    {permissionGroups.map((group) => (
                        <AccordionItem
                            key={group.id}
                            aria-label={group.name}
                            startContent={
                                <ListChecks
                                    size={20}
                                    className="text-primary"
                                />
                            }
                            title={
                                <span className="font-medium tracking-tight">
                                    {group.name}
                                </span>
                            }
                            subtitle={
                                <span className="text-xs text-text-subdued">
                                    {group.permissions.length} actions
                                    controlled
                                </span>
                            }
                            classNames={{
                                base: 'border border-divider shadow-none mb-4',
                                content: 'pb-6 px-4',
                            }}
                        >
                            <Divider className="mb-8" />
                            <CheckboxGroup
                                color="primary"
                                value={selectedIds}
                                onValueChange={setSelectedIds}
                                isDisabled={isPending}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {group.permissions.map((perm) => (
                                        <div
                                            key={perm.id}
                                            className="flex flex-col gap-1"
                                        >
                                            <Checkbox
                                                value={perm.id}
                                                classNames={{
                                                    label: '-mt-1 pl-1 font-medium text-text-default',
                                                }}
                                            >
                                                {perm.displayName}
                                            </Checkbox>
                                            {perm.description && (
                                                <p className="text-sm text-text-subdued font-normal pl-8 leading-tight">
                                                    {perm.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CheckboxGroup>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </>
    )
}
