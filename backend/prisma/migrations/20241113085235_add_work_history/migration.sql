-- CreateTable
CREATE TABLE "WorkHistory" (
    "id" SERIAL NOT NULL,
    "jobParticipationId" INTEGER NOT NULL,
    "work_status" TEXT NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "WorkHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkHistory" ADD CONSTRAINT "WorkHistory_jobParticipationId_fkey" FOREIGN KEY ("jobParticipationId") REFERENCES "JobParticipation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
