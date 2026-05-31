import { ModifyDepartmentModal } from '@/presentation/features/department-manage'
import { departmentsListOptions } from '@/presentation/lib/queries'
import { TDepartment } from '@/presentation/types'
import { Button, useDisclosure } from '@heroui/react'
import { AdminPageHeading, AppLoading } from '@presentation/components'
import { DepartmentsManagePage } from '@presentation/features/administrator/management/department'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'

export enum ViewOptions {
    TABLE = 'table',
    GRID = 'grid',
}
export const departmentManageSchema = z.object({
    tab: z.nativeEnum(ViewOptions).default(ViewOptions.TABLE),
})
export type TDepartmentManageSchema = z.infer<typeof departmentManageSchema>
export const Route = createFileRoute('/_administrator/mgmt/departments/')({
    validateSearch: (search) => departmentManageSchema.parse(search),
    loaderDeps: ({ search }) => ({ search }),
    head: () => ({ meta: [{ title: 'Department Management' }] }),
    loader: ({ context }) => {
        return context.queryClient.ensureQueryData(departmentsListOptions())
    },
    pendingComponent: AppLoading,
    component: () => {
        const [selectedDept, setSeletectedDept] = useState<TDepartment | null>(
            null
        )

        const {
            data: { departments },
            refetch,
        } = useSuspenseQuery({ ...departmentsListOptions() })

        const createDepartmentModalState = useDisclosure({
            id: 'CreateDepartmentModal',
        })

        const handleCreate = () => {
            setSeletectedDept(null)
            createDepartmentModalState.onOpen()
        }

        const handleEdit = (dept: TDepartment) => {
            setSeletectedDept(dept)
            createDepartmentModalState.onOpen()
        }

        return (
            <>
                <ModifyDepartmentModal
                    isOpen={createDepartmentModalState.isOpen}
                    onClose={createDepartmentModalState.onClose}
                    deptId={selectedDept?.id}
                    onRefresh={refetch}
                />

                <AdminPageHeading
                    title="Departments"
                    showBadge
                    badgeCount={departments.length}
                    actions={
                        <Button
                            startContent={<PlusIcon size={16} />}
                            color="primary"
                            onPress={handleCreate}
                        >
                            Create new
                        </Button>
                    }
                />
                <DepartmentsManagePage
                    depts={departments}
                    onEdit={handleEdit}
                    onRefresh={refetch}
                />
            </>
        )
    },
})
