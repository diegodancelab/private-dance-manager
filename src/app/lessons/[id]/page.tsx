import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { addLessonParticipant, removeLessonParticipant, deleteLesson } from "../actions";
import Link from "next/link";


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

  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
    },
    orderBy: {
      firstName: "asc",
    },
  });

  const participantUserIds = lesson.participants.map((participant) => participant.userId);

  const availableStudents = students.filter(
    (student) => !participantUserIds.includes(student.id)
  );

  return (
    <div>
      <p>
    <Link href="/lessons">← Back to lessons</Link>
  </p>
  
      <h1>Lesson detail</h1>
      <p>
        <Link href={`/lessons/${lesson.id}/edit`}>Edit lesson</Link>
      </p>
      <form action={deleteLesson}>
        <input type="hidden" name="lessonId" value={lesson.id} />
        <button type="submit">Delete lesson</button>
      </form>
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
      {lesson.participants.length === 0 ? (
        <p>No participants yet.</p>
      ) : (
        <ul>
          {lesson.participants.map((participant) => (
            <li key={participant.id}>
              {participant.user.firstName} {participant.user.lastName} -{" "}
              {participant.status}

              <form action={removeLessonParticipant} style={{ display: "inline", marginLeft: "8px" }}>
                <input type="hidden" name="participantId" value={participant.id} />
                <input type="hidden" name="lessonId" value={lesson.id} />
                <button type="submit">Remove</button>
              </form>
            </li>
          ))}
        </ul>
      )}
      
      <h2>Add participant</h2>

      {availableStudents.length === 0 ? (
        <p>No available students to add.</p>
      ) : (
        <form action={addLessonParticipant}>
          <input type="hidden" name="lessonId" value={lesson.id} />
          <div>
            <label htmlFor="userId">Student</label>
            <select id="userId" name="userId" required>
              <option value="">Select a student</option>
              {availableStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName} - {student.email}
                </option>
              ))}
            </select>
          </div>
          <button type="submit">Add participant</button>
        </form>
      )}
    </div>
  );
}