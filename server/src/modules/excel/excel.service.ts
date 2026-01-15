import { Injectable } from '@nestjs/common'
import * as ExcelJS from 'exceljs'
import { CreateExcelDto } from './dto/create-excel.dto'

@Injectable()
export class ExcelService {
    // Use the Generic T to enforce type safety if needed
    async generateExcel<T>(dto: CreateExcelDto<T>): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Data')

        // 1. Assign Dynamic Columns
        worksheet.columns = dto.columns

        // 2. Add Dynamic Data
        worksheet.addRows(dto.data)

        // 3. Optional: Style Header Row
        worksheet.getRow(1).font = { bold: true }

        const buffer = await workbook.xlsx.writeBuffer()
        return buffer as unknown as Buffer
    }
}
