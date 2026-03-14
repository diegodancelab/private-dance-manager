import Link from "next/link";
import { prisma } from "@/lib/prisma";


export default async function LessonsPage() {
  const lessons = await prisma.lesson.findMany({
    orderBy: {
      scheduledAt: "desc",
    },
    include: {
      teacher: true,
    },
  });

  return (
    <div>
      <h1>Lessons</h1>

      <p>
        <Link href="/lessons/new">Create lesson</Link>
      </p>

      <ul>
        {lessons.map((lesson) => (
          <li key={lesson.id}>
            <Link href={`/lessons/${lesson.id}`}>
              {lesson.title}
            </Link>{" "}
            - {lesson.lessonType} - {lesson.teacher.firstName}{" "}
            {lesson.teacher.lastName}
          </li>
        ))}
      </ul>
    </div>
  );
}