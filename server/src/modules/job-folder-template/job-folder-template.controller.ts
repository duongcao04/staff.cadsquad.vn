import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator'
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator'
import { PermissionsGuard } from '../../common/guards/permissions.guard'
import { APP_PERMISSIONS } from '../../utils/_app-permissions'
import { CreateJobFolderTemplateDto } from './dto/create-job-folder-template.dto'
import { JobFolderTemplateResponseDto } from './dto/job-folder-template-response.dto'
import { UpdateJobFolderTemplateDto } from './dto/update-job-folder-template.dto'
import { JobFolderTemplateService } from './job-folder-template.service'
import { JwtGuard } from '../auth/jwt.guard'

@ApiTags('Job Folder Templates')
@Controller('job-folder-templates')
@UseGuards(JwtGuard)
export class JobFolderTemplateController {
    constructor(private readonly jobFolderTemplateService: JobFolderTemplateService) {}

    @Post()
    @HttpCode(201)
    @ResponseMessage('Insert new job folder template successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new job folder template' })
    @ApiResponse({
        status: 201,
        description: 'The job folder template has been successfully created.',
        type: JobFolderTemplateResponseDto,
    })
    @UseGuards(PermissionsGuard)
    // @RequirePermissions(APP_PERMISSIONS.JOB_FOLDER_TEMPLATE.CREATE)
    async create(@Body() createJobFolderTemplateDto: CreateJobFolderTemplateDto) {
        return this.jobFolderTemplateService.create(createJobFolderTemplateDto)
    }

    @Get()
    @HttpCode(200)
    @ResponseMessage('Get list of job folder templates successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all job folder templates' })
    @ApiResponse({
        status: 200,
        description: 'Return a list of job folder templates.',
        type: [JobFolderTemplateResponseDto],
    })
    async findAll() {
        return this.jobFolderTemplateService.findAll()
    }

    @Get(':id')
    @HttpCode(200)
    @ResponseMessage('Get job folder template detail successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a job folder template by its ID' })
    @ApiResponse({
        status: 200,
        description: 'Return a single job folder template.',
        type: JobFolderTemplateResponseDto,
    })
    async findOne(@Param('id') id: string) {
        return this.jobFolderTemplateService.findById(id)
    }

    @Patch(':id')
    @HttpCode(200)
    @ResponseMessage('Update job folder template successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a job folder template' })
    @ApiResponse({
        status: 200,
        description: 'The job folder template has been successfully updated.',
        type: JobFolderTemplateResponseDto,
    })
    @UseGuards(PermissionsGuard)
    // @RequirePermissions(APP_PERMISSIONS.JOB_FOLDER_TEMPLATE.UPDATE)
    async update(
        @Param('id') id: string,
        @Body() updateJobFolderTemplateDto: UpdateJobFolderTemplateDto
    ) {
        return this.jobFolderTemplateService.update(id, updateJobFolderTemplateDto)
    }

    @Delete(':id')
    @HttpCode(200)
    @ResponseMessage('Delete job folder template successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a job folder template' })
    @ApiResponse({
        status: 200,
        description: 'The job folder template has been successfully deleted.',
    })
    @UseGuards(PermissionsGuard)
    @RequirePermissions(APP_PERMISSIONS.JOB_FOLDER_TEMPLATE.DELETE)
    async remove(@Param('id') id: string) {
        return this.jobFolderTemplateService.delete(id)
    }
}