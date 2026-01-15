import { permissionGroupsListOptions, roleOptions } from '@/lib/queries'
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
import { useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ListChecks, RotateCcw, Save, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useBulkUpdatePermissions } from '../../../../../../../lib/queries/useRole'
// Import hook mutation mà chúng ta đã viết ở bước trước

export const Route = createFileRoute(
    '/_administrator/admin/mgmt/access-control/roles/$code/perm-matrix'
)({
    component: EditPermissionsMatrix,
})

export default function EditPermissionsMatrix() {
    const { code } = Route.useParams()
    const router = useRouter()

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

    // 2. Local State cho danh sách Permission IDs đang chọn
    const [selectedIds, setSelectedIds] = useState<string[]>(
        role.permissions.map((p: any) => p.id)
    )

    // Khởi tạo Mutation
    const { mutate: updatePermissions, isPending } = useBulkUpdatePermissions(
        role.id
    )

    // Kiểm tra xem dữ liệu đã thay đổi so với ban đầu chưa
    const isDirty = useMemo(() => {
        const initialIds = [...role.permissions.map((p: any) => p.id)].sort()
        const currentIds = [...selectedIds].sort()
        return JSON.stringify(initialIds) !== JSON.stringify(currentIds)
    }, [selectedIds, role.permissions])

    // 3. Handlers
    const handleReset = () =>
        setSelectedIds(role.permissions.map((p: any) => p.id))

    const handleSave = () => {
        // Gọi mutation để lưu vào DB thông qua API PATCH /v1/roles/:id/permissions/bulk
        updatePermissions(selectedIds, {
            onSuccess: () => {
                // Sau khi lưu thành công, có thể điều hướng hoặc giữ nguyên để edit tiếp
                // router.navigate({ href: '..' })
            },
        })
    }

    return (
        <div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
            {/* Navigation Header */}
            <div className="flex flex-col gap-4">
                <Breadcrumbs variant="light">
                    <BreadcrumbItem
                        onPress={() =>
                            router.navigate({
                                href: '/admin/mgmt/access-control/roles',
                            })
                        }
                    >
                        Roles
                    </BreadcrumbItem>
                    <BreadcrumbItem
                        onPress={() => router.navigate({ href: `..` })}
                    >
                        {role.displayName}
                    </BreadcrumbItem>
                    <BreadcrumbItem>Permissions Matrix</BreadcrumbItem>
                </Breadcrumbs>

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                            style={{ backgroundColor: role.hexColor }}
                        >
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black">
                                Edit Authority Matrix
                            </h1>
                            <p className="text-sm text-default-500 font-medium">
                                Configure granular access for{' '}
                                <span className="text-primary font-bold">
                                    {role.displayName}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {isDirty && (
                            <Button
                                variant="flat"
                                color="warning"
                                startContent={<RotateCcw size={18} />}
                                onPress={handleReset}
                                isDisabled={isPending}
                            >
                                Reset Changes
                            </Button>
                        )}
                        <Button
                            color="primary"
                            size="lg"
                            className="font-bold px-8 shadow-xl shadow-primary/30"
                            startContent={<Save size={18} />}
                            onPress={handleSave}
                            isDisabled={!isDirty}
                            isLoading={isPending} // Hiển thị trạng thái đang lưu
                        >
                            Update Permissions
                        </Button>
                    </div>
                </div>
            </div>

            <Divider />

            {/* Permission Matrix Area */}
            <div className="max-w-5xl mx-auto py-4">
                <Accordion
                    variant="splitted"
                    selectionMode="multiple"
                    defaultExpandedKeys={[permissionGroups[0]?.id]}
                    className="px-0"
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
                                <span className="font-black text-sm uppercase tracking-tight">
                                    {group.name}
                                </span>
                            }
                            subtitle={
                                <span className="text-xs text-default-400">
                                    {group.permissions.length} actions
                                    controlled
                                </span>
                            }
                            classNames={{
                                base: 'border border-divider shadow-none mb-4',
                                content: 'pb-6 px-4',
                            }}
                        >
                            <Divider className="my-4" />
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
                                                    label: 'text-sm font-bold text-default-700',
                                                }}
                                            >
                                                {perm.displayName}
                                            </Checkbox>
                                            {perm.description && (
                                                <p className="text-[10px] text-default-400 ml-7 leading-tight italic">
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

            {/* Warning Footer */}
            <Card className="bg-danger-50 border-none shadow-none mt-10">
                <CardBody className="flex flex-row items-center gap-4 p-4">
                    <div className="p-2 bg-danger-100 rounded-full text-danger">
                        <ShieldCheck size={20} />
                    </div>
                    <p className="text-xs text-danger-700 font-medium">
                        <b>Critical Action:</b> Changes made here will instantly
                        affect all users assigned to the{' '}
                        <b>{role.displayName}</b> role. Please ensure you have
                        verified the internal security policy before saving.
                    </p>
                </CardBody>
            </Card>
        </div>
    )
}
