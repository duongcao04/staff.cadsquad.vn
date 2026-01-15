import {
    Body,
    Controller,
    Header,
    Post,
    Res,
    StreamableFile,
} from '@nestjs/common'
import { CreateExcelDto } from './dto/create-excel.dto'
import { ExcelService } from './excel.service'
import { BypassTransform } from '../../common/decorators/bypass.decorator'

@Controller('excel')
export class ExcelController {
    constructor(private readonly excelService: ExcelService) {}

    @Post('download')
    @BypassTransform()
    @Header(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    @Header(
        'Content-Disposition',
        'attachment; filename="cadsquad_export.xlsx"'
    )
    async downloadReport(
        @Body() body: CreateExcelDto,
        @Res({ passthrough: true }) res: Response
    ): Promise<StreamableFile> {
        const buffer = await this.excelService.generateExcel(body)

        return new StreamableFile(buffer)
    }

    // Alternative: Using standard Express Response if you need more manual control
    /*
  @Get('download-alt')
  async downloadReportAlt(@Res() res: Response) {
    const buffer = await this.excelService.generateExcel();
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="users_export.xlsx"',
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
  */
}
