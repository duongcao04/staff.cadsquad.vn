import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator'
import { JobResponseDto } from '../job/dto/job-response.dto'
import { CreateJobStatusDto } from './dto/create-job-status.dto'
import { JobStatusResponseDto } from './dto/job-status-response.dto'
import { UpdateJobStatusDto } from './dto/update-job-status.dto'
import { JobStatusService } from './job-status.service'
import { PermissionsGuard } from '../../common/guards/permissions.guard'
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator'
import { APP_PERMISSIONS } from '../../utils/_app-permissions'
import { JwtGuard } from '../auth/jwt.guard'

@ApiTags('Job Statuses')
@Controller('job-statuses')
@UseGuards(JwtGuard)
export class JobStatusController {
    constructor(private readonly jobStatusService: JobStatusService) {}

    @Post()
    @HttpCode(201)
    @ResponseMessage('Insert new job status successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new job status' })
    @ApiResponse({
        status: 201,
        description: 'The job status has been successfully created.',
        type: JobStatusResponseDto,
    })
    @UseGuards(PermissionsGuard)
    @RequirePermissions(APP_PERMISSIONS.JOB_STATUS.CREATE)
    async create(@Body() createJobStatusDto: CreateJobStatusDto) {
        return this.jobStatusService.create(createJobStatusDto)
    }

    @Get()
    @HttpCode(200)
    @ResponseMessage('Get list of job status successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all job statuses' })
    @ApiResponse({
        status: 200,
        description: 'Return a list of job statuses.',
        type: [JobStatusResponseDto],
    })
    async findAll() {
        return this.jobStatusService.findAll()
    }

    @Get('/order/:orderNum')
    @HttpCode(200)
    @ResponseMessage('Get job status detail successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a job status by its order number' })
    @ApiResponse({
        status: 200,
        description: 'Return a single job status.',
        type: JobStatusResponseDto,
    })
    async findByOrder(@Param('orderNum') orderNum: string) {
        return this.jobStatusService.findByOrder(parseInt(orderNum))
    }

    @Get(':id')
    @HttpCode(200)
    @ResponseMessage('Get job status detail successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a job status by its ID' })
    @ApiResponse({
        status: 200,
        description: 'Return a single job status.',
        type: JobStatusResponseDto,
    })
    async findOne(@Param('id') id: string) {
        return this.jobStatusService.findById(id)
    }

    @Patch(':id')
    @HttpCode(200)
    @ResponseMessage('Update job status successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a job status' })
    @ApiResponse({
        status: 200,
        description: 'The job status has been successfully updated.',
        type: JobStatusResponseDto,
    })
    @UseGuards(PermissionsGuard)
    @RequirePermissions(APP_PERMISSIONS.JOB_STATUS.UPDATE)
    async update(
        @Param('id') id: string,
        @Body() updateJobStatusDto: UpdateJobStatusDto
    ) {
        return this.jobStatusService.update(id, updateJobStatusDto)
    }

    @Delete(':id')
    @HttpCode(200)
    @ResponseMessage('Update job status successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a job status' })
    @ApiResponse({
        status: 200,
        description: 'The job status has been successfully deleted.',
    })
    @UseGuards(PermissionsGuard)
    @RequirePermissions(APP_PERMISSIONS.JOB_STATUS.DELETE)
    async remove(@Param('id') id: string) {
        return this.jobStatusService.delete(id)
    }
}
