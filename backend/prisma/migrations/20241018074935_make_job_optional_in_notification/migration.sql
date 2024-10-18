-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "jobId" INTEGER;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
