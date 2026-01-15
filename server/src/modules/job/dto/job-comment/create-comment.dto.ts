import { IsString, IsOptional, IsUUID, MinLength } from 'class-validator'

export class CreateJobCommentDto {
    @IsString()
    @MinLength(1, { message: 'Nội dung bình luận không được để trống' })
    content: string

    @IsOptional()
    @IsUUID()
    parentId?: string // ID của comment gốc nếu là reply
}
