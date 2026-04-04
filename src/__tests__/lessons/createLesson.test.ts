import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockUserFindFirst, mockLessonFindMany, mockLessonCreate } = vi.hoisted(
  () => ({
    mockUserFindFirst: vi.fn(),
    mockLessonFindMany: vi.fn(),
    mockLessonCreate: vi.fn(),
  })
);

vi.mock("@/lib/auth/require-auth", () => ({
  requireTeacherAuth: vi.fn().mockResolvedValue({
    user: { id: "teacher-id", role: "TEACHER" },
  }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findFirst: mockUserFindFirst },
    lesson: { findMany: mockLessonFindMany, create: mockLessonCreate },
  },
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

import { createLesson } from "@/app/[locale]/(app)/lessons/actions";

const baseState = {
  success: false,
  message: "",
  fields: {
    id: "",
    title: "",
    description: "",
    lessonType: "PRIVATE" as const,
    scheduledAt: "",
    durationMin: "",
    priceAmount: "",
    location: "",
    studentId: "",
    bookingStatus: "CONFIRMED" as const,
  },
  errors: {},
};

function makeFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("title", "Bachata Fundamentals");
  fd.set("lessonType", "PRIVATE");
  fd.set("scheduledAt", "2026-06-15T10:00");
  fd.set("durationMin", "60");
  fd.set("bookingStatus", "CONFIRMED");
  for (const [key, val] of Object.entries(overrides)) {
    fd.set(key, val);
  }
  return fd;
}

describe("createLesson — validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no conflicts, lesson creation succeeds.
    mockLessonFindMany.mockResolvedValue([]);
    mockLessonCreate.mockResolvedValue({ id: "lesson-1" });
  });

  it("rejects missing title", async () => {
    const result = await createLesson(baseState, makeFormData({ title: "" }));
    expect(result.errors.title).toBeTruthy();
    expect(mockLessonCreate).not.toHaveBeenCalled();
  });

  it("rejects missing scheduledAt", async () => {
    const result = await createLesson(
      baseState,
      makeFormData({ scheduledAt: "" })
    );
    expect(result.errors.scheduledAt).toBeTruthy();
    expect(mockLessonCreate).not.toHaveBeenCalled();
  });

  it("rejects calendrically invalid date (Feb 30)", async () => {
    const result = await createLesson(
      baseState,
      makeFormData({ scheduledAt: "2026-02-30T10:00" })
    );
    expect(result.errors.scheduledAt).toBeTruthy();
  });

  it("rejects zero duration", async () => {
    const result = await createLesson(
      baseState,
      makeFormData({ durationMin: "0" })
    );
    expect(result.errors.durationMin).toBeTruthy();
  });

  it("rejects negative duration", async () => {
    const result = await createLesson(
      baseState,
      makeFormData({ durationMin: "-30" })
    );
    expect(result.errors.durationMin).toBeTruthy();
  });

  it("rejects non-integer duration", async () => {
    const result = await createLesson(
      baseState,
      makeFormData({ durationMin: "60.5" })
    );
    expect(result.errors.durationMin).toBeTruthy();
  });

  it("rejects price with more than 2 decimal places", async () => {
    const result = await createLesson(
      baseState,
      makeFormData({ priceAmount: "80.999" })
    );
    expect(result.errors.priceAmount).toBeTruthy();
  });

  it("accepts price with exactly 2 decimal places", async () => {
    // On success the action redirects (returns undefined) — verify lesson was created.
    await createLesson(baseState, makeFormData({ priceAmount: "80.00" }));
    expect(mockLessonCreate).toHaveBeenCalledOnce();
  });

  it("accepts price with 1 decimal place", async () => {
    await createLesson(baseState, makeFormData({ priceAmount: "80.5" }));
    expect(mockLessonCreate).toHaveBeenCalledOnce();
  });

  it("accepts lesson without a price", async () => {
    await createLesson(baseState, makeFormData());
    expect(mockLessonCreate).toHaveBeenCalledOnce();
  });
});

describe("createLesson — student ownership check (Phase 3 fix)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLessonFindMany.mockResolvedValue([]);
    mockLessonCreate.mockResolvedValue({ id: "lesson-1" });
  });

  it("rejects a studentId that does not belong to this teacher", async () => {
    // DB returns null → student not found for this teacher.
    mockUserFindFirst.mockResolvedValue(null);

    const result = await createLesson(
      baseState,
      makeFormData({ studentId: "other-teachers-student-id" })
    );

    expect(result.errors.studentId).toBeTruthy();
    expect(mockLessonCreate).not.toHaveBeenCalled();
  });

  it("queries with createdByTeacherId to enforce ownership", async () => {
    mockUserFindFirst.mockResolvedValue(null);

    await createLesson(
      baseState,
      makeFormData({ studentId: "some-student-id" })
    );

    expect(mockUserFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          createdByTeacherId: "teacher-id",
        }),
      })
    );
  });

  it("accepts a student that belongs to this teacher", async () => {
    mockUserFindFirst.mockResolvedValue({ id: "student-id" });

    await createLesson(
      baseState,
      makeFormData({ studentId: "student-id" })
    );

    expect(mockLessonCreate).toHaveBeenCalledOnce();
    // Participant should be created inline with the lesson.
    expect(mockLessonCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          participants: expect.objectContaining({ create: expect.any(Object) }),
        }),
      })
    );
  });

  it("skips the student check entirely when no studentId is provided", async () => {
    await createLesson(baseState, makeFormData());

    expect(mockUserFindFirst).not.toHaveBeenCalled();
    expect(mockLessonCreate).toHaveBeenCalledOnce();
  });
});

describe("createLesson — scheduling conflict detection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLessonCreate.mockResolvedValue({ id: "lesson-1" });
  });

  it("rejects a lesson that overlaps with an existing one", async () => {
    // Existing lesson: 10:00 → 11:00 Zurich (CEST = UTC+2, so 08:00 UTC).
    mockLessonFindMany.mockResolvedValue([
      {
        id: "existing-lesson",
        scheduledAt: new Date("2026-06-15T08:00:00.000Z"), // 10:00 Zurich
        durationMin: 60,
      },
    ]);

    // New lesson: 10:30 Zurich — starts inside the existing one.
    const result = await createLesson(
      baseState,
      makeFormData({ scheduledAt: "2026-06-15T10:30" })
    );

    expect(result.errors.scheduledAt).toBeTruthy();
    expect(mockLessonCreate).not.toHaveBeenCalled();
  });

  it("allows a lesson that starts exactly when the previous one ends", async () => {
    // Existing: 08:00–09:00 Zurich.
    mockLessonFindMany.mockResolvedValue([
      {
        id: "existing-lesson",
        scheduledAt: new Date("2026-06-15T06:00:00.000Z"), // 08:00 Zurich (CEST)
        durationMin: 60,
      },
    ]);

    // New: starts at 09:00 Zurich — no overlap, lesson should be created.
    await createLesson(baseState, makeFormData({ scheduledAt: "2026-06-15T09:00" }));

    expect(mockLessonCreate).toHaveBeenCalledOnce();
  });
});
