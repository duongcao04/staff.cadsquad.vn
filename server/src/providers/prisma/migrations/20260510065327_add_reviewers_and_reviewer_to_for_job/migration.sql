/*
  Warnings:

  - You are about to drop the `_JobToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_JobToUser" DROP CONSTRAINT "_JobToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_JobToUser" DROP CONSTRAINT "_JobToUser_B_fkey";

-- DropTable
DROP TABLE "_JobToUser";

-- CreateTable
CREATE TABLE "_JobReviewers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_JobReviewers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_JobReviewers_B_index" ON "_JobReviewers"("B");

-- AddForeignKey
ALTER TABLE "_JobReviewers" ADD CONSTRAINT "_JobReviewers_A_fkey" FOREIGN KEY ("A") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobReviewers" ADD CONSTRAINT "_JobReviewers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
