/*
  Warnings:

  - You are about to drop the column `adminId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `recipient` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "adminId",
DROP COLUMN "createdAt",
DROP COLUMN "isRead",
DROP COLUMN "type",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recipient" INTEGER NOT NULL,
ADD COLUMN     "sender" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMPTZ NOT NULL;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_recipient_fkey" FOREIGN KEY ("recipient") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_admin_recipient_fkey" FOREIGN KEY ("recipient") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
