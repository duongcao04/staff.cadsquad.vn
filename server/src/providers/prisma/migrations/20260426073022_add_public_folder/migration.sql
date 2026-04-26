-- AlterTable
ALTER TABLE "SharepointItem" ADD COLUMN     "isAnonymous" BOOLEAN DEFAULT false,
ADD COLUMN     "publicWebUrl" TEXT;
