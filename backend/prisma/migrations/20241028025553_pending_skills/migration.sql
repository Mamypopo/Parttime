-- CreateTable
CREATE TABLE "PendingSkill" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "skill" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingSkill_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PendingSkill" ADD CONSTRAINT "PendingSkill_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
