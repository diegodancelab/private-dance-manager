-- AlterTable
ALTER TABLE "SkillAssessment" ADD COLUMN     "snapshotLevelColor" TEXT,
ADD COLUMN     "snapshotLevelName" TEXT;

-- CreateTable
CREATE TABLE "TeacherLevel" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#4f46e5',
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentLevelAssignment" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentLevelAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeacherLevel_teacherId_order_idx" ON "TeacherLevel"("teacherId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherLevel_teacherId_name_key" ON "TeacherLevel"("teacherId", "name");

-- CreateIndex
CREATE INDEX "StudentLevelAssignment_studentId_idx" ON "StudentLevelAssignment"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentLevelAssignment_teacherId_studentId_key" ON "StudentLevelAssignment"("teacherId", "studentId");

-- AddForeignKey
ALTER TABLE "TeacherLevel" ADD CONSTRAINT "TeacherLevel_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentLevelAssignment" ADD CONSTRAINT "StudentLevelAssignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentLevelAssignment" ADD CONSTRAINT "StudentLevelAssignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentLevelAssignment" ADD CONSTRAINT "StudentLevelAssignment_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "TeacherLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
