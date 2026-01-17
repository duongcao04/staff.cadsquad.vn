import { excelApi, jobApi } from '@/lib'
import { getAllowedJobColumns } from '@/lib/utils'
import { TDownloadExcelInput } from '@/lib/validationSchemas'
import { ProjectCenterTabEnum } from '@/shared/enums'
import { TJob } from '@/shared/types'
import dayjs from 'dayjs'
import { TProjectCenterSearch } from '../$tab'

export function useProjectExport(userPermissions: string[]) {
    const handleExport = async (
        search: TProjectCenterSearch,
        tab: ProjectCenterTabEnum
    ) => {
        const exportColumns = getAllowedJobColumns(
            'all',
            userPermissions
        ).filter((c) => c.uid !== 'action')

        try {
            const res = await jobApi.findAll({ ...search, tab, isAll: '1' })
            const jobs = (res.result?.data as TJob[]) || []

            const payload: TDownloadExcelInput = {
                columns: exportColumns.map((col) => ({
                    header: col.displayName,
                    key: col.uid,
                })),
                data: jobs.map((item) => ({
                    ...item,
                    assignments: item.assignments
                        .map((a) => a.user.displayName)
                        .join(', '),
                    isPaid: item.isPaid ? 'Yes' : 'No',
                    paymentChannel: item.paymentChannel?.displayName,
                    type: item.type?.displayName,
                    status: item.status?.displayName,
                })),
            }

            const response = await excelApi.download(payload)
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute(
                'download',
                `ProjectCenter_Export_${dayjs().format('YYYYMMDD')}.xlsx`
            )
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Download failed', error)
        }
    }

    return { handleExport }
}
