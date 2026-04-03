import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { utcToZurichDatetimeLocal } from "@/lib/dates";
import { UserRole, PackageStatus } from "@/generated/prisma/client";
import { getLabel } from "@/lib/labels";
import LessonEditForm from "./LessonEditForm";
import type { LessonFormState } from "../../form-state";
import {
  addLessonParticipant,
  removeLessonParticipant,
  assignPackageToParticipant,
  removePackageFromParticipant,
} from "../../actions";
import styles from "../LessonPage.module.css";
import { requireAuth } from "@/lib/auth/require-auth";

type Props = {
  params: Promise<{
    id: string;
  }>;
};


function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default async function EditLessonPage({ params }: Props) {
  const { id } = await params;
  const { user } = await requireAuth();

  const lesson = await prisma.lesson.findFirst({
    where: { id, teacherId: user.id },
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

  const participantUserIds = lesson.participants.map((p) => p.userId);

  const availableStudents = await prisma.user.findMany({
    where: {
      role: UserRole.STUDENT,
      id: { notIn: participantUserIds },
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    select: { id: true, firstName: true, lastName: true },
  });

  const packageParticipants = await prisma.packageParticipant.findMany({
    where: {
      userId: { in: participantUserIds },
      package: { status: PackageStatus.ACTIVE, teacherId: user.id },
    },
    select: {
      userId: true,
      package: { select: { id: true, name: true, remainingMinutes: true } },
    },
    orderBy: { package: { createdAt: "desc" } },
  });

  const packagesByStudent: Record<
    string,
    { id: string; name: string; remainingMinutes: number }[]
  > = {};
  for (const pp of packageParticipants) {
    if (!packagesByStudent[pp.userId]) packagesByStudent[pp.userId] = [];
    packagesByStudent[pp.userId].push(pp.package);
  }

  const initialState: LessonFormState = {
    success: false,
    message: "",
    fields: {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description ?? "",
      lessonType: lesson.lessonType,
      scheduledAt: utcToZurichDatetimeLocal(lesson.scheduledAt),
      durationMin: String(lesson.durationMin),
      priceAmount: lesson.priceAmount?.toString() ?? "",
      location: lesson.location ?? "",
      studentId: "",
      bookingStatus: "CONFIRMED",
    },
    errors: {},
  };

  return (
    <div className={styles.page}>
      <LessonEditForm initialState={initialState} />

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
                        {getLabel(participant.status)}
                      </span>

                      {usage ? (
                        <div className={styles.packageRow}>
                          <span className={styles.packageTag}>
                            {usage.package.name} —{" "}
                            {formatMinutes(usage.minutesConsumed)}
                          </span>
                          <form action={removePackageFromParticipant}>
                            <input type="hidden" name="usageId" value={usage.id} />
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
