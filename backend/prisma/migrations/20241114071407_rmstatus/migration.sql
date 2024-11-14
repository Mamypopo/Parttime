/*
  Warnings:

  - You are about to drop the `WorkHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "WorkHistory" DROP CONSTRAINT "WorkHistory_jobParticipationId_fkey";

-- DropTable
DROP TABLE "WorkHistory";

-- CreateTable
CREATE TABLE "work_histories" (
    "id" SERIAL NOT NULL,
    "jobParticipationId" INTEGER NOT NULL,
    "comment" TEXT,
    "rating" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "work_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "work_histories_jobParticipationId_key" ON "work_histories"("jobParticipationId");

-- AddForeignKey
ALTER TABLE "work_histories" ADD CONSTRAINT "work_histories_jobParticipationId_fkey" FOREIGN KEY ("jobParticipationId") REFERENCES "JobParticipation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
