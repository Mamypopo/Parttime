/*
  Warnings:

  - You are about to drop the column `action_type` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `performed_by` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Log` table. All the data in the column will be lost.
  - Added the required column `action` to the `Log` table without a default value. This is not possible if the table is not empty.
  - Made the column `details` on table `Log` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Log" DROP COLUMN "action_type",
DROP COLUMN "performed_by",
DROP COLUMN "status",
ADD COLUMN     "action" TEXT NOT NULL,
ALTER COLUMN "details" SET NOT NULL,
ALTER COLUMN "details" SET DATA TYPE TEXT;
