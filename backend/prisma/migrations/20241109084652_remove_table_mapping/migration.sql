/*
  Warnings:

  - You are about to drop the `job_positions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "JobParticipation" DROP CONSTRAINT "JobParticipation_job_position_id_fkey";

-- DropForeignKey
ALTER TABLE "job_positions" DROP CONSTRAINT "job_positions_job_id_fkey";

-- DropTable
DROP TABLE "job_positions";

-- CreateTable
CREATE TABLE "JobPosition" (
    "id" SERIAL NOT NULL,
    "position_name" TEXT NOT NULL,
    "wage" DOUBLE PRECISION NOT NULL,
    "required_people" INTEGER NOT NULL,
    "details" TEXT NOT NULL,
    "required_skills" TEXT,
    "job_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',

    CONSTRAINT "JobPosition_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobPosition" ADD CONSTRAINT "JobPosition_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobParticipation" ADD CONSTRAINT "JobParticipation_job_position_id_fkey" FOREIGN KEY ("job_position_id") REFERENCES "JobPosition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
