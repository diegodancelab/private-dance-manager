-- AlterTable: add as nullable first (tables may have existing rows)
ALTER TABLE "Charge" ADD COLUMN     "teacherId" TEXT;

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "teacherId" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "teacherId" TEXT;

-- AlterTable
ALTER TABLE "ProgressEntry" ADD COLUMN     "teacherId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdByTeacherId" TEXT;

-- Backfill existing rows with the first teacher in the system
UPDATE "Charge" SET "teacherId" = (SELECT "id" FROM "User" WHERE "role" = 'TEACHER' LIMIT 1) WHERE "teacherId" IS NULL;
UPDATE "Package" SET "teacherId" = (SELECT "id" FROM "User" WHERE "role" = 'TEACHER' LIMIT 1) WHERE "teacherId" IS NULL;
UPDATE "Payment" SET "teacherId" = (SELECT "id" FROM "User" WHERE "role" = 'TEACHER' LIMIT 1) WHERE "teacherId" IS NULL;
UPDATE "ProgressEntry" SET "teacherId" = (SELECT "id" FROM "User" WHERE "role" = 'TEACHER' LIMIT 1) WHERE "teacherId" IS NULL;

-- Make NOT NULL after backfill
ALTER TABLE "Charge" ALTER COLUMN "teacherId" SET NOT NULL;
ALTER TABLE "Package" ALTER COLUMN "teacherId" SET NOT NULL;
ALTER TABLE "Payment" ALTER COLUMN "teacherId" SET NOT NULL;
ALTER TABLE "ProgressEntry" ALTER COLUMN "teacherId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_createdByTeacherId_fkey" FOREIGN KEY ("createdByTeacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressEntry" ADD CONSTRAINT "ProgressEntry_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
