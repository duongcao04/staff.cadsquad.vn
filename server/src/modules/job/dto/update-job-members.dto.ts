import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator'

export class UpdateJobMembersDto {
  @ApiProperty({ description: 'Comma-separated string of previous member IDs' })
  @IsNotEmpty()
  @IsString()
  prevMemberIds?: string

  @ApiProperty({ description: 'Comma-separated string of updated member IDs' })
  @IsNotEmpty()
  @IsString()
  updateMemberIds?: string
}