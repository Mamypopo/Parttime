-- AlterTable
ALTER TABLE "User" ALTER COLUMN "approved" SET DEFAULT 'pending',
ALTER COLUMN "approved" SET DATA TYPE TEXT;
