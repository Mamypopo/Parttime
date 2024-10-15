/*
  Warnings:

  - You are about to drop the column `position` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `required_people` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `wage` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `job_id` on the `JobParticipation` table. All the data in the column will be lost.
  - Added the required column `job_position_id` to the `JobParticipation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "JobParticipation" DROP CONSTRAINT "JobParticipation_job_id_fkey";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "position",
DROP COLUMN "required_people",
DROP COLUMN "wage";

-- AlterTable
ALTER TABLE "JobParticipation" DROP COLUMN "job_id",
ADD COLUMN     "jobId" INTEGER,
ADD COLUMN     "job_position_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "JobPosition" (
    "id" SERIAL NOT NULL,
    "position_name" TEXT NOT NULL,
    "wage" DOUBLE PRECISION NOT NULL,
    "required_people" INTEGER NOT NULL,
    "details" TEXT NOT NULL,
    "job_id" INTEGER NOT NULL,

    CONSTRAINT "JobPosition_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobPosition" ADD CONSTRAINT "JobPosition_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobParticipation" ADD CONSTRAINT "JobParticipation_job_position_id_fkey" FOREIGN KEY ("job_position_id") REFERENCES "JobPosition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobParticipation" ADD CONSTRAINT "JobParticipation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
