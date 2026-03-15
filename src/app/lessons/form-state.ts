import type { LessonTypeValue } from "@/lib/lesson-types";

export type LessonFormState = {
  success: boolean;
  message?: string;
  fields: {
    id: string;
    title: string;
    description: string;
    lessonType: LessonTypeValue;
    scheduledAt: string;
    durationMin: string;
    priceAmount: string;
    location: string;
    teacherId: string;
  };
  errors: {
    title?: string;
    lessonType?: string;
    scheduledAt?: string;
    durationMin?: string;
    priceAmount?: string;
    teacherId?: string;
    form?: string;
  };
};

export const initialLessonFormState: LessonFormState = {
  success: false,
  message: "",
  fields: {
    id: "",
    title: "Private lesson",
    description: "",
    lessonType: "PRIVATE",
    scheduledAt: "",
    durationMin: "60",
    priceAmount: "",
    location: "",
    teacherId: "",
  },
  errors: {},
};