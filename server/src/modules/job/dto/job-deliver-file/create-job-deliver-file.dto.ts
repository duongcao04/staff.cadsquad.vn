import { IsNotEmpty, IsString, IsUrl } from 'class-validator'

export class CreateJobDeliverFileDto {
	@IsUrl({}, { message: 'webUrl must be a valid URL' })
	@IsNotEmpty({ message: 'webUrl is required' })
	webUrl!: string

	@IsString()
	@IsNotEmpty({ message: 'fileName is required' })
	fileName!: string

	@IsString()
	@IsNotEmpty({ message: 'sharepointId is required' })
	sharepointId!: string
}