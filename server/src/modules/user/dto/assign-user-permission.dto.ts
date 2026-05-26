import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator'
import { PermissionScope } from '../../../generated/prisma'

export enum PermissionAction {
    GRANT = 'GRANT', // Explicitly Allow (isDenied = false)
    DENY = 'DENY', // Explicitly Forbid (isDenied = true)
    INHERIT = 'INHERIT', // Remove override (Follow Role)
}

export { PermissionScope }

export class AssignUserPermissionDto {
    @IsUUID()
    @IsNotEmpty()
    permissionId: string

    @IsEnum(PermissionAction)
    @IsNotEmpty()
    action: PermissionAction

    @IsOptional()
    @IsEnum(PermissionScope)
    scope?: PermissionScope
}
