import { describe, it, expect, vi, beforeEach } from "vitest";
import { PackageStatus } from "@/generated/prisma/client";

// ----------------------------------------------------------------------------
// createPackage — mock setup
// ----------------------------------------------------------------------------

const {
  mockCreatePkgUserFindFirst,
  mockCreatePkgTransaction,
} = vi.hoisted(() => ({
  mockCreatePkgUserFindFirst: vi.fn(),
  mockCreatePkgTransaction: vi.fn(),
}));

vi.mock("@/lib/auth/require-auth", () => ({
  requireTeacherAuth: vi.fn().mockResolvedValue({
    user: { id: "teacher-id", role: "TEACHER" },
  }),
}));

vi.mock("@/lib/prisma", () => {
  const txMock = {
    lesson: { findFirst: vi.fn() },
    lessonParticipant: { findUnique: vi.fn() },
    package: { findUnique: vi.fn(), updateMany: vi.fn() },
    packageUsage: { create: vi.fn() },
    // For createPackage transaction
    create: vi.fn(),
  };

  return {
    prisma: {
      user: { findFirst: mockCreatePkgUserFindFirst },
      $transaction: mockCreatePkgTransaction,
      // assignPackageToParticipant also uses $transaction
    },
    __txMock: txMock,
  };
});

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { createPackage } from "@/app/(app)/packages/actions";
import { assignPackageToParticipant } from "@/app/(app)/lessons/actions";

// ----------------------------------------------------------------------------
// createPackage tests
// ----------------------------------------------------------------------------

const createPkgBaseState = {
  success: false,
  message: "",
  fields: { id: "", userId: "", name: "", totalHours: "", amount: "", currency: "CHF", expiresAt: "" },
  errors: {},
};

function makeCreatePkgFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("userId", "student-id");
  fd.set("name", "10-Hour Bundle");
  fd.set("totalHours", "10");
  fd.set("amount", "800.00");
  fd.set("currency", "CHF");
  for (const [k, v] of Object.entries(overrides)) fd.set(k, v);
  return fd;
}

describe("createPackage — validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Happy path transaction: package + charge creation succeed.
    mockCreatePkgTransaction.mockImplementation((fn: (tx: any) => Promise<any>) =>
      fn({
        package: { create: vi.fn().mockResolvedValue({ id: "pkg-1" }) },
        charge: { create: vi.fn().mockResolvedValue({ id: "charge-1" }) },
      })
    );
  });

  it("rejects missing student", async () => {
    const result = await createPackage(createPkgBaseState, makeCreatePkgFormData({ userId: "" }));
    expect(result.errors.userId).toBeTruthy();
    expect(mockCreatePkgUserFindFirst).not.toHaveBeenCalled();
  });

  it("rejects missing name", async () => {
    const result = await createPackage(createPkgBaseState, makeCreatePkgFormData({ name: "" }));
    expect(result.errors.name).toBeTruthy();
  });

  it("rejects zero totalHours", async () => {
    const result = await createPackage(createPkgBaseState, makeCreatePkgFormData({ totalHours: "0" }));
    expect(result.errors.totalHours).toBeTruthy();
  });

  it("rejects non-integer totalHours", async () => {
    const result = await createPackage(createPkgBaseState, makeCreatePkgFormData({ totalHours: "5.5" }));
    expect(result.errors.totalHours).toBeTruthy();
  });

  it("rejects invalid amount format", async () => {
    const result = await createPackage(createPkgBaseState, makeCreatePkgFormData({ amount: "800.999" }));
    expect(result.errors.amount).toBeTruthy();
  });

  it("rejects expiry date in the past", async () => {
    const result = await createPackage(createPkgBaseState, makeCreatePkgFormData({ expiresAt: "2020-01-01" }));
    expect(result.errors.expiresAt).toBeTruthy();
  });

  it("rejects student not belonging to this teacher", async () => {
    mockCreatePkgUserFindFirst.mockResolvedValue(null);

    const result = await createPackage(createPkgBaseState, makeCreatePkgFormData());
    expect(result.errors.userId).toBeTruthy();
    expect(mockCreatePkgTransaction).not.toHaveBeenCalled();
  });

  it("queries with createdByTeacherId to enforce ownership", async () => {
    mockCreatePkgUserFindFirst.mockResolvedValue(null);

    await createPackage(createPkgBaseState, makeCreatePkgFormData());

    expect(mockCreatePkgUserFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ createdByTeacherId: "teacher-id" }),
      })
    );
  });

  it("converts totalHours to minutes when creating the package", async () => {
    mockCreatePkgUserFindFirst.mockResolvedValue({ id: "student-id" });

    const pkgCreate = vi.fn().mockResolvedValue({ id: "pkg-1" });
    const chargeCreate = vi.fn().mockResolvedValue({ id: "charge-1" });
    mockCreatePkgTransaction.mockImplementation((fn: (tx: any) => Promise<any>) =>
      fn({ package: { create: pkgCreate }, charge: { create: chargeCreate } })
    );

    await createPackage(createPkgBaseState, makeCreatePkgFormData({ totalHours: "10" }));

    expect(pkgCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          totalMinutes: 600,     // 10h × 60
          remainingMinutes: 600,
        }),
      })
    );
  });
});

// ----------------------------------------------------------------------------
// assignPackageToParticipant — package minute math
// ----------------------------------------------------------------------------

describe("assignPackageToParticipant — minute consumption invariants", () => {
  // tx mock objects accessible across tests
  const txLesson = { findFirst: vi.fn() };
  const txParticipant = { findUnique: vi.fn() };
  const txPackage = { findUnique: vi.fn(), updateMany: vi.fn() };
  const txUsage = { create: vi.fn() };

  const txMock = {
    lesson: txLesson,
    lessonParticipant: txParticipant,
    package: txPackage,
    packageUsage: txUsage,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreatePkgTransaction.mockImplementation((fn: (tx: any) => Promise<any>) =>
      fn(txMock)
    );
    txUsage.create.mockResolvedValue({});
    txPackage.updateMany.mockResolvedValue({ count: 1 });
  });

  function makeAssignFormData(overrides: Record<string, string> = {}): FormData {
    const fd = new FormData();
    fd.set("participantId", "participant-id");
    fd.set("packageId", "pkg-id");
    fd.set("lessonId", "lesson-id");
    for (const [k, v] of Object.entries(overrides)) fd.set(k, v);
    return fd;
  }

  it("consumes exact lesson minutes when package has enough", async () => {
    txLesson.findFirst.mockResolvedValue({ durationMin: 60 });
    txParticipant.findUnique.mockResolvedValue({ userId: "student-id" });
    txPackage.findUnique.mockResolvedValue({
      remainingMinutes: 120,
      totalMinutes: 600,
      status: PackageStatus.ACTIVE,
      userId: "student-id",
      expiresAt: null,
    });

    await assignPackageToParticipant(makeAssignFormData());

    expect(txUsage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ minutesConsumed: 60 }),
      })
    );
    expect(txPackage.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          remainingMinutes: { decrement: 60 },
          status: PackageStatus.ACTIVE, // still has 60 min left
        }),
      })
    );
  });

  it("marks package as EXHAUSTED when consumption empties it", async () => {
    txLesson.findFirst.mockResolvedValue({ durationMin: 60 });
    txParticipant.findUnique.mockResolvedValue({ userId: "student-id" });
    txPackage.findUnique.mockResolvedValue({
      remainingMinutes: 60, // exactly one lesson left
      totalMinutes: 600,
      status: PackageStatus.ACTIVE,
      userId: "student-id",
      expiresAt: null,
    });

    await assignPackageToParticipant(makeAssignFormData());

    expect(txPackage.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: PackageStatus.EXHAUSTED }),
      })
    );
  });

  it("caps consumption at remainingMinutes when lesson is longer than what is left", async () => {
    txLesson.findFirst.mockResolvedValue({ durationMin: 90 });
    txParticipant.findUnique.mockResolvedValue({ userId: "student-id" });
    txPackage.findUnique.mockResolvedValue({
      remainingMinutes: 30, // only 30 min left, lesson is 90 min
      totalMinutes: 600,
      status: PackageStatus.ACTIVE,
      userId: "student-id",
      expiresAt: null,
    });

    await assignPackageToParticipant(makeAssignFormData());

    // Should only consume 30 (the min of 90 and 30).
    expect(txUsage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ minutesConsumed: 30 }),
      })
    );
    expect(txPackage.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          remainingMinutes: { decrement: 30 },
          status: PackageStatus.EXHAUSTED,
        }),
      })
    );
  });

  it("rejects an inactive package", async () => {
    txLesson.findFirst.mockResolvedValue({ durationMin: 60 });
    txParticipant.findUnique.mockResolvedValue({ userId: "student-id" });
    txPackage.findUnique.mockResolvedValue({
      remainingMinutes: 120,
      totalMinutes: 600,
      status: PackageStatus.EXHAUSTED, // not ACTIVE
      userId: "student-id",
      expiresAt: null,
    });

    await expect(
      assignPackageToParticipant(makeAssignFormData())
    ).rejects.toThrow("Package is not active.");
  });

  it("rejects an expired package", async () => {
    txLesson.findFirst.mockResolvedValue({ durationMin: 60 });
    txParticipant.findUnique.mockResolvedValue({ userId: "student-id" });
    txPackage.findUnique.mockResolvedValue({
      remainingMinutes: 120,
      totalMinutes: 600,
      status: PackageStatus.ACTIVE,
      userId: "student-id",
      expiresAt: new Date("2020-01-01"), // past date
    });

    await expect(
      assignPackageToParticipant(makeAssignFormData())
    ).rejects.toThrow("Package has expired.");
  });

  it("rejects a package that belongs to a different student", async () => {
    txLesson.findFirst.mockResolvedValue({ durationMin: 60 });
    txParticipant.findUnique.mockResolvedValue({ userId: "student-A" });
    txPackage.findUnique.mockResolvedValue({
      remainingMinutes: 120,
      totalMinutes: 600,
      status: PackageStatus.ACTIVE,
      userId: "student-B", // mismatch
      expiresAt: null,
    });

    await expect(
      assignPackageToParticipant(makeAssignFormData())
    ).rejects.toThrow("Package does not belong to this student.");
  });

  it("uses the atomic conditional update guard against concurrent consumption", async () => {
    txLesson.findFirst.mockResolvedValue({ durationMin: 60 });
    txParticipant.findUnique.mockResolvedValue({ userId: "student-id" });
    txPackage.findUnique.mockResolvedValue({
      remainingMinutes: 60,
      totalMinutes: 600,
      status: PackageStatus.ACTIVE,
      userId: "student-id",
      expiresAt: null,
    });
    // Simulate a concurrent transaction that already consumed the minutes.
    txPackage.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      assignPackageToParticipant(makeAssignFormData())
    ).rejects.toThrow(/no longer has sufficient minutes/);
  });
});
