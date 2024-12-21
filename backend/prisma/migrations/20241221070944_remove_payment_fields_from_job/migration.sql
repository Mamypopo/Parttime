/*
  Warnings:

  - You are about to drop the column `paid_payment_amount` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `payment_status` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `total_payment_amount` on the `Job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "paid_payment_amount",
DROP COLUMN "payment_status",
DROP COLUMN "total_payment_amount";
