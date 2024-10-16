-- DropForeignKey
ALTER TABLE "JobPosition" DROP CONSTRAINT "JobPosition_job_id_fkey";

-- AddForeignKey
ALTER TABLE "JobPosition" ADD CONSTRAINT "JobPosition_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
