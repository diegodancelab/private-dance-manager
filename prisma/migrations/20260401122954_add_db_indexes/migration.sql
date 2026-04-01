-- CreateIndex
CREATE INDEX "Charge_teacherId_createdAt_idx" ON "Charge"("teacherId", "createdAt");

-- CreateIndex
CREATE INDEX "Lesson_teacherId_scheduledAt_idx" ON "Lesson"("teacherId", "scheduledAt");

-- CreateIndex
CREATE INDEX "Package_teacherId_createdAt_idx" ON "Package"("teacherId", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_teacherId_paidAt_createdAt_idx" ON "Payment"("teacherId", "paidAt", "createdAt");

-- CreateIndex
CREATE INDEX "User_createdByTeacherId_role_idx" ON "User"("createdByTeacherId", "role");
