import { IsNotEmpty } from 'class-validator'

export class CopyItemDto {
	@IsNotEmpty()
	itemId!: string

	@IsNotEmpty()
	destinationFolderId!: string

	@IsNotEmpty()
	newName!: string
}
