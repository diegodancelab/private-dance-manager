-- DropIndex
DROP INDEX "SkillAxis_teacherId_order_idx";

-- AlterTable
ALTER TABLE "SkillAxis" ADD COLUMN     "studentId" TEXT;

-- CreateIndex
CREATE INDEX "SkillAxis_teacherId_studentId_order_idx" ON "SkillAxis"("teacherId", "studentId", "order");

-- AddForeignKey
ALTER TABLE "SkillAxis" ADD CONSTRAINT "SkillAxis_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
