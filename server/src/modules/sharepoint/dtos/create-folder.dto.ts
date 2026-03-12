export class CreateFolerDto {
	parentId!: string
	folderName!: string
	driveId?: string
	childrenToSpawn?: string[]
}