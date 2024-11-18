-- AlterTable
ALTER TABLE "User" ADD COLUMN     "is_online" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_active" TIMESTAMP(3);
