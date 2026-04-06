import {
    Controller,
    Get,
    UseGuards,
    Param,
    Query,
    Req,
    Body,
    Patch,
    Post,
} from '@nestjs/common'
import { ClientService } from './client.service'
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator'
import { UpdateClientDto } from './dto/update-client.dto'
import { TokenPayload } from '../auth/dto/token-payload.dto'
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator'
import { APP_PERMISSIONS } from '@/utils'
import { PermissionsGuard } from '../../common/guards/permissions.guard'
import { JwtGuard } from '../auth/jwt.guard'
import { isUUID } from 'class-validator'
import { CreateClientDto } from './dto/create-client.dto'
import { AuditLog } from '../../common/decorators/audit-log.decorator'
import { SystemModule } from '../../generated/prisma'

@Controller('clients')
@UseGuards(JwtGuard)
export class ClientController {
    constructor(private readonly clientService: ClientService) { }

    @Get()
    @ResponseMessage('Get all clients successfully')
    @UseGuards(PermissionsGuard)
    @RequirePermissions(APP_PERMISSIONS.CLIENT.READ)
    async getAll() {
        return this.clientService.findAll()
    }

    @Get('search-by-name')
    @ResponseMessage('Search client by name results')
    @UseGuards(PermissionsGuard)
    @RequirePermissions(APP_PERMISSIONS.CLIENT.READ)
    async getByName(@Query('name') name: string) {
        if (!name) return { result: null }

        const client = await this.clientService.findByName(name)
        return client
    }

    @Get(':identifier')
    @ResponseMessage('Get client details successfully')
    @UseGuards(PermissionsGuard)
    @RequirePermissions(APP_PERMISSIONS.CLIENT.READ)
    async getOne(@Param('identifier') identifier: string) {
        
        if (isUUID(identifier)) {
            return this.clientService.findOne(identifier);
        }
        return this.clientService.findByCode(identifier);
    }

    @Post()
    @ResponseMessage('Create new client successfully')
    @UseGuards(PermissionsGuard)
    @RequirePermissions(APP_PERMISSIONS.CLIENT.WRITE)
    @AuditLog('Create new client', SystemModule.CLIENT)
    async create(
        @Req() request: Request,
        @Body() dto: CreateClientDto
    ) {
        const created = await this.clientService.create(dto)
        request['auditTargetId'] = created.id
        request['auditTargetDisplay'] = created.name
        return created
    }

    @Patch(':id')
    @ResponseMessage('Client updated successfully')
    @UseGuards(PermissionsGuard)
    @RequirePermissions(APP_PERMISSIONS.CLIENT.WRITE)
    async updateClient(
        @Req() request: Request,
        @Param('id') id: string,
        @Body() dto: UpdateClientDto
    ) {
        const user: TokenPayload = request['user']
        const updatedClient = await this.clientService.update(user.sub, id, dto)
        return updatedClient
    }
}
