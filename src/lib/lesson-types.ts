export const LESSON_TYPE_OPTIONS = [
  { value: "PRIVATE", label: "Private" },
  { value: "DUO", label: "Duo" },
  { value: "GROUP", label: "Group" },
  { value: "ONLINE", label: "Online" },
] as const;

export type LessonTypeValue = (typeof LESSON_TYPE_OPTIONS)[number]["value"];