import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator'

export enum PermissionAction {
    GRANT = 'GRANT', // Explicitly Allow (isDenied = false)
    DENY = 'DENY', // Explicitly Forbid (isDenied = true)
    INHERIT = 'INHERIT', // Remove override (Follow Role)
}

export class AssignUserPermissionDto {
    @IsUUID()
    @IsNotEmpty()
    permissionId: string

    @IsEnum(PermissionAction)
    @IsNotEmpty()
    action: PermissionAction
}
