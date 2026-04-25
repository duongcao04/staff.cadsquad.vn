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
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator'
import { CreateJobTypeDto } from './dto/create-job-type.dto'
import { JobTypeResponseDto } from './dto/job-type-response.dto'
import { UpdateJobTypeDto } from './dto/update-job-type.dto'
import { JobTypeService } from './job-type.service'
import { PermissionsGuard } from '../../common/guards/permissions.guard'
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator'
import { APP_PERMISSIONS } from '@/utils'
import { JwtGuard } from '../auth/jwt.guard'

@ApiTags('Job Types')
@Controller('job-types')
@UseGuards(JwtGuard)
export class JobTypeController {
	constructor(private readonly jobTypeService: JobTypeService) {}

	@Post()
	@HttpCode(201)
	@ResponseMessage('Insert new job type successfully')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create a new job type' })
	@ApiResponse({
		status: 201,
		description: 'The job type has been successfully created.',
		type: JobTypeResponseDto,
	})
	@UseGuards(PermissionsGuard)
	@RequirePermissions([APP_PERMISSIONS.JOB_TYPE.CREATE])
	async create(@Body() createJobTypeDto: CreateJobTypeDto) {
		return this.jobTypeService.create(createJobTypeDto)
	}

	@Get()
	@HttpCode(200)
	@ResponseMessage('Get list of job type successfully')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get all job types' })
	@ApiResponse({
		status: 200,
		description: 'Return a list of job types.',
		type: [JobTypeResponseDto],
	})
	async findAll() {
		return this.jobTypeService.findAll()
	}

	@Get(':id')
	@HttpCode(200)
	@ResponseMessage('Get job type detail successfully')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get a job type by its ID' })
	@ApiResponse({
		status: 200,
		description: 'Return a single job type.',
		type: JobTypeResponseDto,
	})
	async findOne(@Param('id') id: string) {
		return this.jobTypeService.findById(id)
	}

	@Patch(':id')
	@HttpCode(200)
	@ResponseMessage('Update job type successfully')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update a job type' })
	@ApiResponse({
		status: 200,
		description: 'The job type has been successfully updated.',
		type: JobTypeResponseDto,
	})
	@UseGuards(PermissionsGuard)
	@RequirePermissions([APP_PERMISSIONS.JOB_TYPE.UPDATE])
	async update(
		@Param('id') id: string,
		@Body() updateJobTypeDto: UpdateJobTypeDto
	) {
		return this.jobTypeService.update(id, updateJobTypeDto)
	}

	@Delete(':id')
	@HttpCode(200)
	@ResponseMessage('Update job type successfully')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete a job type' })
	@ApiResponse({
		status: 200,
		description: 'The job type has been successfully deleted.',
	})
	@UseGuards(PermissionsGuard)
	@RequirePermissions([APP_PERMISSIONS.JOB_TYPE.DELETE])
	async remove(@Param('id') id: string) {
		return this.jobTypeService.delete(id)
	}
}
