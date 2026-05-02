-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notifAssessment" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifLessonReminder" BOOLEAN NOT NULL DEFAULT true;
