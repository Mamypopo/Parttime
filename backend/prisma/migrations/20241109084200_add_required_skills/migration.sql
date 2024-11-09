/*
  Warnings:

  - You are about to drop the `JobPosition` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "JobParticipation" DROP CONSTRAINT "JobParticipation_job_position_id_fkey";

-- DropForeignKey
ALTER TABLE "JobPosition" DROP CONSTRAINT "JobPosition_job_id_fkey";

-- DropTable
DROP TABLE "JobPosition";

-- CreateTable
CREATE TABLE "job_positions" (
    "id" SERIAL NOT NULL,
    "position_name" TEXT NOT NULL,
    "wage" DOUBLE PRECISION NOT NULL,
    "required_people" INTEGER NOT NULL,
    "details" TEXT NOT NULL,
    "required_skills" TEXT,
    "job_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',

    CONSTRAINT "job_positions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "job_positions" ADD CONSTRAINT "job_positions_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobParticipation" ADD CONSTRAINT "JobParticipation_job_position_id_fkey" FOREIGN KEY ("job_position_id") REFERENCES "job_positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
