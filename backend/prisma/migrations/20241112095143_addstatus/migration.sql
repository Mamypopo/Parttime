-- DropIndex
DROP INDEX "Job_work_date_location_title_idx";

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'published';

-- CreateIndex
CREATE INDEX "Job_work_date_location_title_status_idx" ON "Job"("work_date", "location", "title", "status");
