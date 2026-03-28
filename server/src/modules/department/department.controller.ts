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
import { isUUID } from 'class-validator'
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator'
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator'
import { PermissionsGuard } from '../../common/guards/permissions.guard'
import { APP_PERMISSIONS } from '@staff-cadsquad/shared'
import { JwtGuard } from '../auth/jwt.guard'
import { DepartmentService } from './department.service'
import { CreateDepartmentDto } from './dto/create-department.dto'
import { DepartmentResponseDto } from './dto/department-response.dto'
import { UpdateDepartmentDto } from './dto/update-department.dto'

@ApiTags('Departments')
@Controller('departments')
@UseGuards(JwtGuard)
export class DepartmentController {
    constructor(private readonly departmentService: DepartmentService) {}

    @Post()
    @HttpCode(201)
    @ResponseMessage('Insert new department successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new department' })
    @ApiResponse({
        status: 201,
        description: 'The department has been successfully created.',
        type: DepartmentResponseDto,
    })
    @UseGuards(PermissionsGuard)
    @RequirePermissions(APP_PERMISSIONS.DEPARTMENT.CREATE)
    async create(@Body() createDepartmentDto: CreateDepartmentDto) {
        return this.departmentService.create(createDepartmentDto)
    }

    @Get()
    @HttpCode(200)
    @ResponseMessage('Get list of departments successfully')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all departments' })
    @ApiResponse({
        status: 200,
        description: 'Return a list of departments.',
        type: [DepartmentResponseDto],
    })
    async findAll() {
        return this.departmentService.findAll()
    }

    @Get(':identifier')
    @HttpCode(200)
    @ResponseMessage('Get department detail successfully')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a department by its ID or code' })
    @ApiResponse({
        status: 200,
        description: 'Return a single department.',
        type: DepartmentResponseDto,
    })
    // TODO:
    // @UseGuards(PermissionsGuard)
    // @RequirePermissions(APP_PERMISSIONS.DEPARTMENT.READ_SENSITIVE)
    async findOne(@Param('identifier') identifier: string) {
        // Check if the parameter looks like a UUID
        if (isUUID(identifier)) {
            return this.departmentService.findById(identifier)
        }
        // Otherwise treat it as a username
        return this.departmentService.findByCode(identifier)
    }

    @Patch(':id')
    @HttpCode(200)
    @ResponseMessage('Update department successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a department' })
    @ApiResponse({
        status: 200,
        description: 'The department has been successfully updated.',
        type: DepartmentResponseDto,
    })
    @UseGuards(PermissionsGuard)
    @RequirePermissions(APP_PERMISSIONS.DEPARTMENT.UPDATE)
    async update(
        @Param('id') id: string,
        @Body() updateDepartmentDto: UpdateDepartmentDto
    ) {
        return this.departmentService.update(id, updateDepartmentDto)
    }

    @Delete(':id')
    @HttpCode(200)
    @ResponseMessage('Delete department successfully')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a department' })
    @ApiResponse({
        status: 200,
        description: 'The department has been successfully deleted.',
    })
    @UseGuards(PermissionsGuard)
    @RequirePermissions(APP_PERMISSIONS.DEPARTMENT.DELETE)
    async remove(@Param('id') id: string) {
        return this.departmentService.delete(id)
    }
}
