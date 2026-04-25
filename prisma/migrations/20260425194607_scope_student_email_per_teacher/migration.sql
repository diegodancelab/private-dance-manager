-- DropIndex
DROP INDEX "User_email_key";

-- Teachers keep a globally unique email (partial index: role = 'TEACHER')
CREATE UNIQUE INDEX "User_teacher_email_key"
  ON "User" (email)
  WHERE role = 'TEACHER' AND email IS NOT NULL;

-- Students: unique email per teacher (one student record per teacher space)
CREATE UNIQUE INDEX "User_student_email_teacher_key"
  ON "User" (email, "createdByTeacherId")
  WHERE role = 'STUDENT' AND email IS NOT NULL;
