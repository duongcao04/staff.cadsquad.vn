/*
  Warnings:

  - You are about to drop the column `files` on the `JobDelivery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JobDelivery" DROP COLUMN "files";

-- CreateTable
CREATE TABLE "JobDeliverFile" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "webUrl" TEXT NOT NULL,
    "sharepointId" TEXT NOT NULL,
    "jobDeliveryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobDeliverFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobDeliverFile_jobDeliveryId_idx" ON "JobDeliverFile"("jobDeliveryId");

-- AddForeignKey
ALTER TABLE "JobDeliverFile" ADD CONSTRAINT "JobDeliverFile_jobDeliveryId_fkey" FOREIGN KEY ("jobDeliveryId") REFERENCES "JobDelivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
