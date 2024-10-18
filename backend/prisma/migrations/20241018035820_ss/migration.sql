/*
  Warnings:

  - You are about to drop the column `recipient` on the `Notification` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_admin_recipient_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_user_recipient_fkey";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "recipient",
ADD COLUMN     "recipient_admin_id" INTEGER,
ADD COLUMN     "recipient_user_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_recipient_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_admin_recipient_fkey" FOREIGN KEY ("recipient_admin_id") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
