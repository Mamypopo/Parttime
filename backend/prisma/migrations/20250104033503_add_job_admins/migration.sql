-- CreateTable
CREATE TABLE "JobAdmins" (
    "id" SERIAL NOT NULL,
    "job_id" INTEGER NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'manager',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobAdmins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobAdmins_job_id_admin_id_key" ON "JobAdmins"("job_id", "admin_id");

-- AddForeignKey
ALTER TABLE "JobAdmins" ADD CONSTRAINT "JobAdmins_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobAdmins" ADD CONSTRAINT "JobAdmins_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
