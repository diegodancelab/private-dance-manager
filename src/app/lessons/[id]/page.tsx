import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import LessonEditForm from "./edit/LessonEditForm";
import { LessonFormState } from "../form-state";


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
    where: {
      id,
    },
    select: {
      id: true,
      title: true,
      description: true,
      lessonType: true,
      scheduledAt: true,
      durationMin: true,
      priceAmount: true,
      location: true,
      teacherId: true,
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
      scheduledAt: toDateTimeLocalValue(lesson.scheduledAt),
      durationMin: String(lesson.durationMin),
      priceAmount: lesson.priceAmount ? String(lesson.priceAmount) : "",
      location: lesson.location ?? "",
      teacherId: lesson.teacherId,
    },
    errors: {},
  };

  return <LessonEditForm initialState={initialState} teachers={teachers} />;
}