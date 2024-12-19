-- AlterTable
ALTER TABLE "JobParticipation" ADD COLUMN     "paid_at" TIMESTAMPTZ,
ADD COLUMN     "paid_by" INTEGER,
ADD COLUMN     "payment_method" VARCHAR(10),
ADD COLUMN     "payment_note" TEXT,
ADD COLUMN     "payment_slip" VARCHAR(255),
ADD COLUMN     "payment_status" VARCHAR(20) NOT NULL DEFAULT 'pending';
