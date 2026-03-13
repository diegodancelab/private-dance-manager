import { prisma } from "@/lib/prisma";
import { createLesson } from "../actions";

export default async function NewLessonPage() {
  const teachers = await prisma.user.findMany({
    where: {
      role: "TEACHER",
    },
    orderBy: {
      firstName: "asc",
    },
  });

  return (
    <div>
      <h1>Create lesson</h1>

      <form action={createLesson}>
        <div>
          <label htmlFor="title">Title</label>
          <input id="title" name="title" type="text" required />
        </div>

        <div>
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" />
        </div>

        <div>
          <label htmlFor="lessonType">Lesson type</label>
          <select id="lessonType" name="lessonType" defaultValue="PRIVATE">
            <option value="PRIVATE">Private</option>
            <option value="DUO">Duo</option>
            <option value="GROUP">Group</option>
            <option value="ONLINE">Online</option>
          </select>
        </div>

        <div>
          <label htmlFor="scheduledAt">Scheduled at</label>
          <input id="scheduledAt" name="scheduledAt" type="datetime-local" required />
        </div>

        <div>
          <label htmlFor="durationMin">Duration (minutes)</label>
          <input id="durationMin" name="durationMin" type="number" min="1" required />
        </div>

        <div>
          <label htmlFor="priceAmount">Price amount</label>
          <input id="priceAmount" name="priceAmount" type="number" step="0.01" min="0" />
        </div>

        <div>
          <label htmlFor="location">Location</label>
          <input id="location" name="location" type="text" />
        </div>

        <div>
          <label htmlFor="teacherId">Teacher</label>
          <select id="teacherId" name="teacherId" required>
            <option value="">Select a teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.firstName} {teacher.lastName} - {teacher.email}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">Create lesson</button>
      </form>
    </div>
  );
}