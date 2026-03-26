import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { UserRole } from "@/generated/prisma/client";
import LessonEditForm from "./edit/LessonEditForm";
import { LessonFormState } from "../form-state";
import { addLessonParticipant, removeLessonParticipant } from "../actions";
import styles from "./LessonPage.module.css";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function toDateTimeLocalValue(date: Date): string {
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
    where: { id },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    notFound();
  }

  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    orderBy: { firstName: "asc" },
    select: { id: true, firstName: true, lastName: true, email: true },
  });

  const participantUserIds = lesson.participants.map((p) => p.userId);

  const availableStudents = await prisma.user.findMany({
    where: {
      role: UserRole.STUDENT,
      id: { notIn: participantUserIds },
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    select: { id: true, firstName: true, lastName: true },
  });

  const initialState: LessonFormState = {
    success: false,
    message: "",
    fields: {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description ?? "",
      lessonType: lesson.lessonType,
      scheduledAt: toDateTimeLocalValue(lesson.scheduledAt),
      durationMin: String(lesson.durationMin),
      priceAmount: lesson.priceAmount ? String(lesson.priceAmount) : "",
      location: lesson.location ?? "",
      teacherId: lesson.teacherId,
    },
    errors: {},
  };

  return (
    <div className={styles.page}>
      <LessonEditForm initialState={initialState} teachers={teachers} />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            Students ({lesson.participants.length})
          </h2>
        </div>

        <div className={styles.cardBody}>
          {lesson.participants.length === 0 ? (
            <p className={styles.emptyText}>No students assigned yet.</p>
          ) : (
            <div className={styles.participantList}>
              {lesson.participants.map((participant) => (
                <div key={participant.id} className={styles.participantRow}>
                  <div className={styles.participantInfo}>
                    <span className={styles.participantName}>
                      {participant.user.firstName} {participant.user.lastName}
                    </span>
                    <span className={styles.participantStatus}>
                      {participant.status}
                    </span>
                  </div>

                  <form action={removeLessonParticipant}>
                    <input
                      type="hidden"
                      name="participantId"
                      value={participant.id}
                    />
                    <input type="hidden" name="lessonId" value={lesson.id} />
                    <button type="submit" className={styles.removeButton}>
                      Remove
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}

          {availableStudents.length > 0 && (
            <form action={addLessonParticipant} className={styles.addForm}>
              <input type="hidden" name="lessonId" value={lesson.id} />

              <div className={styles.addField}>
                <label htmlFor="userId">Add a student</label>
                <select id="userId" name="userId">
                  <option value="">Select a student</option>
                  {availableStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className={styles.addButton}>
                Add
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
