/*
  Warnings:

  - You are about to drop the `PendingSkill` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PendingSkill" DROP CONSTRAINT "PendingSkill_user_id_fkey";

-- DropTable
DROP TABLE "PendingSkill";

-- CreateTable
CREATE TABLE "pending_skills" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "skill" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "pending_skills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pending_skills_userId_idx" ON "pending_skills"("userId");

-- AddForeignKey
ALTER TABLE "pending_skills" ADD CONSTRAINT "pending_skills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
