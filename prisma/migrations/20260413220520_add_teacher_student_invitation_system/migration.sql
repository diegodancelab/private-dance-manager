-- CreateEnum
CREATE TYPE "TeacherStudentInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'CANCELED');

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "activeRole" TEXT;

-- CreateTable
CREATE TABLE "TeacherStudentInvitation" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "TeacherStudentInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherStudentInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherStudentRelation" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherStudentRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeacherStudentInvitation_token_key" ON "TeacherStudentInvitation"("token");

-- CreateIndex
CREATE INDEX "TeacherStudentInvitation_token_idx" ON "TeacherStudentInvitation"("token");

-- CreateIndex
CREATE INDEX "TeacherStudentInvitation_email_idx" ON "TeacherStudentInvitation"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherStudentInvitation_teacherId_email_key" ON "TeacherStudentInvitation"("teacherId", "email");

-- CreateIndex
CREATE INDEX "TeacherStudentRelation_studentId_idx" ON "TeacherStudentRelation"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherStudentRelation_teacherId_studentId_key" ON "TeacherStudentRelation"("teacherId", "studentId");

-- AddForeignKey
ALTER TABLE "TeacherStudentInvitation" ADD CONSTRAINT "TeacherStudentInvitation_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherStudentRelation" ADD CONSTRAINT "TeacherStudentRelation_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherStudentRelation" ADD CONSTRAINT "TeacherStudentRelation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
