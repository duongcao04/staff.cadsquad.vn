-- CreateEnum
CREATE TYPE "SharepointSyncStatus" AS ENUM ('FAILED', 'SUCCESS', 'SYNCING');

-- AlterTable
ALTER TABLE "SharepointItem" ADD COLUMN     "syncStatus" "SharepointSyncStatus" NOT NULL DEFAULT 'FAILED';
