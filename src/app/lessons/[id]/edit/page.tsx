import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { UserRole } from "@/generated/prisma/client";
import LessonEditForm from "./LessonEditForm";
import type { LessonFormState } from "../../form-state";

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
      role: UserRole.TEACHER,
    },
    orderBy: {
      firstName: "asc",
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  const initialState: LessonFormState = {
    success: false,
    message: "",
    fields: {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description ?? "",
      lessonType: lesson.lessonType,
      scheduledAt: formatDateTimeLocal(lesson.scheduledAt),
      durationMin: String(lesson.durationMin),
      priceAmount: lesson.priceAmount?.toString() ?? "",
      location: lesson.location ?? "",
      teacherId: lesson.teacherId,
      studentId: "",
      bookingStatus: "CONFIRMED",
    },
    errors: {},
  };

  return (
    <LessonEditForm
      initialState={initialState}
      teachers={teachers}
    />
  );
}