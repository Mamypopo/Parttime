ALTER TABLE "Log"
ALTER COLUMN "timestamp" TYPE timestamp with time zone;

ALTER TABLE "Job"
ALTER COLUMN "created_at" TYPE timestamp with time zone,
ALTER COLUMN "updated_at" TYPE timestamp with time zone;

ALTER TABLE "User"
ALTER COLUMN "created_at" TYPE timestamp with time zone,
ALTER COLUMN "updated_at" TYPE timestamp with time zone;