-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "paid_payment_amount" DECIMAL(10,2),
ADD COLUMN     "payment_status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "total_payment_amount" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "PaymentHistory" ADD COLUMN     "checklist_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "checklist_items" JSONB,
ALTER COLUMN "payment_status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "PaymentLog" ADD COLUMN     "checklist_status" JSONB;
