import { ApiProperty } from '@nestjs/swagger'
import { IsUUID, IsNumber, Min, IsNotEmpty } from 'class-validator'

export class AssignMemberDto {
    @ApiProperty({
        description: 'ID của nhân viên cần assign vào job',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })
    @IsNotEmpty()
    @IsUUID()
    memberId: string

    @ApiProperty({
        description: 'Chi phí nhân công cho nhân viên này trên job (VND)',
        example: 5000000,
        minimum: 0,
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    staffCost: number
}

export class UpdateAssignmentDto {
    @ApiProperty({
        description: 'Chi phí nhân công mới (VND)',
        example: 6000000,
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    staffCost: number
}
