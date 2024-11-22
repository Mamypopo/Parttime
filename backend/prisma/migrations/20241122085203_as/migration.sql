/*
  Warnings:

  - You are about to drop the column `rating` on the `work_histories` table. All the data in the column will be lost.
  - Added the required column `appearance_score` to the `work_histories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `manner_score` to the `work_histories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `punctuality_score` to the `work_histories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quality_score` to the `work_histories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity_score` to the `work_histories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_score` to the `work_histories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "work_histories" DROP COLUMN "rating",
ADD COLUMN     "appearance_score" INTEGER NOT NULL,
ADD COLUMN     "is_rejected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manner_score" INTEGER NOT NULL,
ADD COLUMN     "punctuality_score" INTEGER NOT NULL,
ADD COLUMN     "quality_score" INTEGER NOT NULL,
ADD COLUMN     "quantity_score" INTEGER NOT NULL,
ADD COLUMN     "total_score" INTEGER NOT NULL;
