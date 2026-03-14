import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateLesson } from "../../actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function formatDateTimeLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default async function EditLessonPage({ params }: Props) {
  const { id } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: {
      id,
    },
  });

  if (!lesson) {
    notFound();
  }

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
      <h1>Edit lesson</h1>

      <form action={updateLesson}>
        <input type="hidden" name="id" value={lesson.id} />

        <div>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            defaultValue={lesson.title}
            required
          />
        </div>

        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            defaultValue={lesson.description ?? ""}
          />
        </div>

        <div>
          <label htmlFor="lessonType">Lesson type</label>
          <select id="lessonType" name="lessonType" defaultValue={lesson.lessonType}>
            <option value="PRIVATE">Private</option>
            <option value="DUO">Duo</option>
            <option value="GROUP">Group</option>
            <option value="ONLINE">Online</option>
          </select>
        </div>

        <div>
          <label htmlFor="scheduledAt">Scheduled at</label>
          <input
            id="scheduledAt"
            name="scheduledAt"
            type="datetime-local"
            defaultValue={formatDateTimeLocal(lesson.scheduledAt)}
            required
          />
        </div>

        <div>
          <label htmlFor="durationMin">Duration (minutes)</label>
          <input
            id="durationMin"
            name="durationMin"
            type="number"
            min="1"
            defaultValue={lesson.durationMin}
            required
          />
        </div>

        <div>
          <label htmlFor="priceAmount">Price amount</label>
          <input
            id="priceAmount"
            name="priceAmount"
            type="number"
            step="0.01"
            min="0"
            defaultValue={lesson.priceAmount?.toString() ?? ""}
          />
        </div>

        <div>
          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            type="text"
            defaultValue={lesson.location ?? ""}
          />
        </div>

        <div>
          <label htmlFor="teacherId">Teacher</label>
          <select id="teacherId" name="teacherId" defaultValue={lesson.teacherId} required>
            <option value="">Select a teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.firstName} {teacher.lastName} - {teacher.email}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">Update lesson</button>
      </form>
    </div>
  );
}