import { axiosClient } from '@/lib/axios' // Removed ApiResponse as it's likely not needed for Blob return
import type { TDownloadExcelInput } from '@/lib/validationSchemas'

export const excelApi = {
    /**
     * Downloads an Excel file based on the provided columns and data.
     * Returns a Blob that can be saved by the browser.
     */
    download: async (data: TDownloadExcelInput) => {
        return axiosClient.post<Blob>('/v1/excel/download', data, {
            // IMPORTANT: Required to handle binary file data correctly
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json',
            },
        })
    },
}
