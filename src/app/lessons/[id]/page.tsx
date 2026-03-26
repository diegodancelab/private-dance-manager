import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { UserRole, PackageStatus } from "@/generated/prisma/client";
import LessonEditForm from "./edit/LessonEditForm";
import { LessonFormState } from "../form-state";
import {
  addLessonParticipant,
  removeLessonParticipant,
  assignPackageToParticipant,
  removePackageFromParticipant,
} from "../actions";
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

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
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
          packageUsage: {
            include: {
              package: {
                select: { id: true, name: true },
              },
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

  const studentPackages = await prisma.package.findMany({
    where: {
      userId: { in: participantUserIds },
      status: PackageStatus.ACTIVE,
    },
    select: { id: true, userId: true, name: true, remainingMinutes: true },
    orderBy: { createdAt: "desc" },
  });

  const packagesByStudent: Record<
    string,
    { id: string; name: string; remainingMinutes: number }[]
  > = {};
  for (const pkg of studentPackages) {
    if (!packagesByStudent[pkg.userId]) packagesByStudent[pkg.userId] = [];
    packagesByStudent[pkg.userId].push(pkg);
  }

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
      studentId: "",
      bookingStatus: ""
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
              {lesson.participants.map((participant) => {
                const usage = participant.packageUsage;
                const availablePackages =
                  packagesByStudent[participant.userId] ?? [];

                return (
                  <div key={participant.id} className={styles.participantRow}>
                    <div className={styles.participantInfo}>
                      <span className={styles.participantName}>
                        {participant.user.firstName} {participant.user.lastName}
                      </span>
                      <span className={styles.participantStatus}>
                        {participant.status}
                      </span>

                      {usage ? (
                        <div className={styles.packageRow}>
                          <span className={styles.packageTag}>
                            {usage.package.name} —{" "}
                            {formatMinutes(usage.minutesConsumed)}
                          </span>
                          <form action={removePackageFromParticipant}>
                            <input type="hidden" name="usageId" value={usage.id} />
                            <input
                              type="hidden"
                              name="packageId"
                              value={usage.package.id}
                            />
                            <input
                              type="hidden"
                              name="minutesConsumed"
                              value={usage.minutesConsumed}
                            />
                            <input type="hidden" name="lessonId" value={lesson.id} />
                            <button
                              type="submit"
                              className={styles.unassignButton}
                            >
                              Remove package
                            </button>
                          </form>
                        </div>
                      ) : availablePackages.length > 0 ? (
                        <form
                          action={assignPackageToParticipant}
                          className={styles.packageAssignForm}
                        >
                          <input
                            type="hidden"
                            name="participantId"
                            value={participant.id}
                          />
                          <input type="hidden" name="lessonId" value={lesson.id} />
                          <select name="packageId" className={styles.packageSelect}>
                            {availablePackages.map((pkg) => (
                              <option key={pkg.id} value={pkg.id}>
                                {pkg.name} ({formatMinutes(pkg.remainingMinutes)} left)
                              </option>
                            ))}
                          </select>
                          <button type="submit" className={styles.assignButton}>
                            Assign
                          </button>
                        </form>
                      ) : null}
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
                );
              })}
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
