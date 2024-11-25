/*
  Warnings:

  - You are about to drop the column `is_rejected` on the `work_histories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rejection_source" TEXT;

-- AlterTable
ALTER TABLE "work_histories" DROP COLUMN "is_rejected",
ADD COLUMN     "is_passed_evaluation" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "userId" INTEGER,
ALTER COLUMN "appearance_score" DROP NOT NULL,
ALTER COLUMN "manner_score" DROP NOT NULL,
ALTER COLUMN "punctuality_score" DROP NOT NULL,
ALTER COLUMN "quality_score" DROP NOT NULL,
ALTER COLUMN "quantity_score" DROP NOT NULL,
ALTER COLUMN "total_score" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "work_histories" ADD CONSTRAINT "work_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
