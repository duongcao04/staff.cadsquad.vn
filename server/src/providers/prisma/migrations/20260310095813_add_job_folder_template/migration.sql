-- CreateTable
CREATE TABLE "JobFolderTemplate" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "folderName" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "webUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobFolderTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobFolderTemplate_folderId_idx" ON "JobFolderTemplate"("folderId");

-- CreateIndex
CREATE INDEX "JobFolderTemplate_id_idx" ON "JobFolderTemplate"("id");

-- CreateIndex
CREATE INDEX "JobFolderTemplate_createdAt_idx" ON "JobFolderTemplate"("createdAt");
