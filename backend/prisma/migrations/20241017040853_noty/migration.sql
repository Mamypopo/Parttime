/*
  Warnings:

  - Made the column `adminId` on table `Notification` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_adminId_fkey";

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "adminId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
