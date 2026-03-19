-- AlterEnum
ALTER TYPE "EntityEnum" ADD VALUE 'JOB_FOLDER_TEMPLATE';

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "sharepointFolderId" TEXT;
