-- AlterTable
ALTER TABLE "WorkHistory" ADD COLUMN     "rating" INTEGER;

-- CreateIndex
CREATE INDEX "WorkHistory_jobParticipationId_work_status_idx" ON "WorkHistory"("jobParticipationId", "work_status");
