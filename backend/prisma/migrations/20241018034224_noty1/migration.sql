/*
  Warnings:

  - Added the required column `recipient_type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "recipient_type" TEXT NOT NULL;
