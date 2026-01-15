import { Module } from '@nestjs/common'
import { PermissionService } from './permission.service'
import { RoleController } from './role.controller'
import { RoleService } from './role.service'

@Module({
    controllers: [RoleController],
    providers: [RoleService, PermissionService],
    exports: [RoleService, PermissionService],
})
export class RoleModule {}
