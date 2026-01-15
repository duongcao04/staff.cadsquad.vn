import { IsUUID, IsNumber, Min, IsNotEmpty } from 'class-validator'

export class AssignMemberDto {
    @IsNotEmpty()
    @IsUUID()
    memberId: string

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    staffCost: number
}

export class UpdateAssignmentDto {
    @IsNumber()
    @Min(0)
    staffCost: number
}
