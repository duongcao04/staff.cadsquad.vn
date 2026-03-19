-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "folderTemplateId" TEXT;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_folderTemplateId_fkey" FOREIGN KEY ("folderTemplateId") REFERENCES "JobFolderTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
