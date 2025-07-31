-- AlterTable
ALTER TABLE "public"."contests" ADD COLUMN     "duration_minutes" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "start_time" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'before';
