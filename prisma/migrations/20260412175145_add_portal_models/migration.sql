-- AlterTable
ALTER TABLE "User" ADD COLUMN     "portalActivatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PortalInvitation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortalInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonFeedback" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "videoUrl" TEXT,
    "studentFeedback" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillAxis" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillAxis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillAssessment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "lessonId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillAxisScore" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "axisId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "SkillAxisScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PortalInvitation_token_key" ON "PortalInvitation"("token");

-- CreateIndex
CREATE INDEX "PortalInvitation_token_idx" ON "PortalInvitation"("token");

-- CreateIndex
CREATE INDEX "PortalInvitation_userId_idx" ON "PortalInvitation"("userId");

-- CreateIndex
CREATE INDEX "LessonFeedback_studentId_createdAt_idx" ON "LessonFeedback"("studentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LessonFeedback_lessonId_studentId_key" ON "LessonFeedback"("lessonId", "studentId");

-- CreateIndex
CREATE INDEX "SkillAxis_teacherId_order_idx" ON "SkillAxis"("teacherId", "order");

-- CreateIndex
CREATE INDEX "SkillAssessment_studentId_createdAt_idx" ON "SkillAssessment"("studentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SkillAxisScore_assessmentId_axisId_key" ON "SkillAxisScore"("assessmentId", "axisId");

-- AddForeignKey
ALTER TABLE "PortalInvitation" ADD CONSTRAINT "PortalInvitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonFeedback" ADD CONSTRAINT "LessonFeedback_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonFeedback" ADD CONSTRAINT "LessonFeedback_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonFeedback" ADD CONSTRAINT "LessonFeedback_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillAxis" ADD CONSTRAINT "SkillAxis_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillAssessment" ADD CONSTRAINT "SkillAssessment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillAssessment" ADD CONSTRAINT "SkillAssessment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillAssessment" ADD CONSTRAINT "SkillAssessment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillAxisScore" ADD CONSTRAINT "SkillAxisScore_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "SkillAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillAxisScore" ADD CONSTRAINT "SkillAxisScore_axisId_fkey" FOREIGN KEY ("axisId") REFERENCES "SkillAxis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
