import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LessonDetailPage({ params }: Props) {
  const { id } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: {
      id,
    },
    include: {
      teacher: true,
      participants: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!lesson) {
    notFound();
  }

  return (
    <div>
      <h1>Lesson detail</h1>

      <p>
        <strong>Title:</strong> {lesson.title}
      </p>

      <p>
        <strong>Description:</strong> {lesson.description ?? "—"}
      </p>

      <p>
        <strong>Type:</strong> {lesson.lessonType}
      </p>

      <p>
        <strong>Scheduled at:</strong> {lesson.scheduledAt.toString()}
      </p>

      <p>
        <strong>Duration:</strong> {lesson.durationMin} minutes
      </p>

      <p>
        <strong>Price:</strong> {lesson.priceAmount?.toString() ?? "—"} {lesson.priceAmount ? "CHF" : ""}
      </p>

      <p>
        <strong>Location:</strong> {lesson.location ?? "—"}
      </p>

      <p>
        <strong>Teacher:</strong> {lesson.teacher.firstName} {lesson.teacher.lastName}
      </p>

      <h2>Participants</h2>

      <ul>
        {lesson.participants.map((participant) => (
          <li key={participant.id}>
            {participant.user.firstName} {participant.user.lastName} - {participant.status}
          </li>
        ))}
      </ul>
    </div>
  );
}