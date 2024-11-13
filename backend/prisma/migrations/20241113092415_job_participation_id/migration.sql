/*
  Warnings:

  - A unique constraint covering the columns `[jobParticipationId]` on the table `WorkHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WorkHistory_jobParticipationId_key" ON "WorkHistory"("jobParticipationId");
