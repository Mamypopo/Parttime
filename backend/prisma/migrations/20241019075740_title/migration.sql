-- DropIndex
DROP INDEX "Job_work_date_location_idx";

-- CreateIndex
CREATE INDEX "Job_work_date_location_title_idx" ON "Job"("work_date", "location", "title");
