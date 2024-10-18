/*
  Warnings:

  - Added the required column `adminId` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "adminId" INTEGER NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
