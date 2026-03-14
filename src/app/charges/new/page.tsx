import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { createCharge } from "../actions";

export default async function NewChargePage() {
  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
    },
    orderBy: {
      firstName: "asc",
    },
  });

  const lessons = await prisma.lesson.findMany({
    include: {
      teacher: true,
    },
    orderBy: {
      scheduledAt: "desc",
    },
  });

  return (
    <div>
      <p>
        <Link href="/charges">← Back to charges</Link>
      </p>

      <h1>Create charge</h1>

      <form action={createCharge}>
        <div>
          <label htmlFor="userId">Student</label>
          <select id="userId" name="userId" required>
            <option value="">Select a student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.firstName} {student.lastName} - {student.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="lessonId">Lesson (optional)</label>
          <select id="lessonId" name="lessonId">
            <option value="">No lesson linked</option>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title} - {lesson.teacher.firstName} {lesson.teacher.lastName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="type">Charge type</label>
          <select id="type" name="type" defaultValue="LESSON">
            <option value="LESSON">Lesson</option>
            <option value="PACKAGE">Package</option>
            <option value="ADJUSTMENT">Adjustment</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="title">Title</label>
          <input id="title" name="title" type="text" required />
        </div>

        <div>
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" />
        </div>

        <div>
          <label htmlFor="amount">Amount</label>
          <input id="amount" name="amount" type="number" step="0.01" min="0" required />
        </div>

        <div>
          <label htmlFor="currency">Currency</label>
          <input id="currency" name="currency" type="text" defaultValue="CHF" required />
        </div>

        <div>
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue="PENDING">
            <option value="PENDING">Pending</option>
            <option value="PARTIALLY_PAID">Partially paid</option>
            <option value="PAID">Paid</option>
            <option value="CANCELED">Canceled</option>
          </select>
        </div>

        <div>
          <label htmlFor="dueAt">Due date</label>
          <input id="dueAt" name="dueAt" type="datetime-local" />
        </div>

        <button type="submit">Create charge</button>
      </form>
    </div>
  );
}