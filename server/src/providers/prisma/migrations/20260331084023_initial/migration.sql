/*
  Warnings:

  - The `size` column on the `SharepointItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "SharepointItem" DROP COLUMN "size",
ADD COLUMN     "size" INTEGER;
