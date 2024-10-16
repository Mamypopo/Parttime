/*
  Warnings:

  - You are about to drop the column `action` on the `Log` table. All the data in the column will be lost.
  - The `details` column on the `Log` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `action_type` to the `Log` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Log" DROP COLUMN "action",
ADD COLUMN     "action_type" TEXT NOT NULL,
ADD COLUMN     "admin_id" INTEGER,
ADD COLUMN     "performed_by" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'success',
DROP COLUMN "details",
ADD COLUMN     "details" JSONB;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
