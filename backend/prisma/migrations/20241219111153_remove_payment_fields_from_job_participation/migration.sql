/*
  Warnings:

  - You are about to drop the column `paid_at` on the `JobParticipation` table. All the data in the column will be lost.
  - You are about to drop the column `paid_by` on the `JobParticipation` table. All the data in the column will be lost.
  - You are about to drop the column `payment_method` on the `JobParticipation` table. All the data in the column will be lost.
  - You are about to drop the column `payment_note` on the `JobParticipation` table. All the data in the column will be lost.
  - You are about to drop the column `payment_slip` on the `JobParticipation` table. All the data in the column will be lost.
  - You are about to drop the column `payment_status` on the `JobParticipation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JobParticipation" DROP COLUMN "paid_at",
DROP COLUMN "paid_by",
DROP COLUMN "payment_method",
DROP COLUMN "payment_note",
DROP COLUMN "payment_slip",
DROP COLUMN "payment_status";
