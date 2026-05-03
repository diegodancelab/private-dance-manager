-- CreateEnum
CREATE TYPE "ProgrammeItemStatus" AS ENUM ('NOT_STARTED', 'INTRODUCED', 'IN_PROGRESS', 'MASTERED');

-- CreateTable
CREATE TABLE "Programme" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "level" TEXT,
    "danceStyle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Programme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgrammeSection" (
    "id" TEXT NOT NULL,
    "programmeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ProgrammeSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgrammeItem" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAlt" TEXT,
    "description" TEXT,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ProgrammeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProgramme" (
    "id" TEXT NOT NULL,
    "programmeId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentProgramme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProgrammeItemStatus" (
    "id" TEXT NOT NULL,
    "studentProgrammeId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "status" "ProgrammeItemStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProgrammeItemStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Programme_teacherId_idx" ON "Programme"("teacherId");

-- CreateIndex
CREATE INDEX "ProgrammeSection_programmeId_order_idx" ON "ProgrammeSection"("programmeId", "order");

-- CreateIndex
CREATE INDEX "ProgrammeItem_sectionId_order_idx" ON "ProgrammeItem"("sectionId", "order");

-- CreateIndex
CREATE INDEX "StudentProgramme_studentId_idx" ON "StudentProgramme"("studentId");

-- CreateIndex
CREATE INDEX "StudentProgramme_teacherId_idx" ON "StudentProgramme"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProgramme_programmeId_studentId_key" ON "StudentProgramme"("programmeId", "studentId");

-- CreateIndex
CREATE INDEX "StudentProgrammeItemStatus_studentProgrammeId_idx" ON "StudentProgrammeItemStatus"("studentProgrammeId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProgrammeItemStatus_studentProgrammeId_itemId_key" ON "StudentProgrammeItemStatus"("studentProgrammeId", "itemId");

-- AddForeignKey
ALTER TABLE "Programme" ADD CONSTRAINT "Programme_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgrammeSection" ADD CONSTRAINT "ProgrammeSection_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgrammeItem" ADD CONSTRAINT "ProgrammeItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ProgrammeSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgramme" ADD CONSTRAINT "StudentProgramme_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgramme" ADD CONSTRAINT "StudentProgramme_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgramme" ADD CONSTRAINT "StudentProgramme_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgrammeItemStatus" ADD CONSTRAINT "StudentProgrammeItemStatus_studentProgrammeId_fkey" FOREIGN KEY ("studentProgrammeId") REFERENCES "StudentProgramme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgrammeItemStatus" ADD CONSTRAINT "StudentProgrammeItemStatus_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ProgrammeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
