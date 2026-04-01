import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

// vi.hoisted lets us define mock references before vi.mock hoisting.
const {
  mockUserFindUnique,
  mockSessionCreate,
  mockAttemptCount,
  mockAttemptCreate,
  mockAttemptDeleteMany,
} = vi.hoisted(() => ({
  mockUserFindUnique: vi.fn(),
  mockSessionCreate: vi.fn(),
  mockAttemptCount: vi.fn(),
  mockAttemptCreate: vi.fn(),
  mockAttemptDeleteMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: mockUserFindUnique },
    session: { create: mockSessionCreate },
    loginAttempt: {
      count: mockAttemptCount,
      create: mockAttemptCreate,
      deleteMany: mockAttemptDeleteMany,
    },
  },
}));

vi.mock("@/lib/email/sendLoginAlert", () => ({
  sendLoginAlert: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: "test-session-id" }),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

import { login } from "@/lib/auth/actions";
import { redirect } from "next/navigation";

const mockRedirect = vi.mocked(redirect);
const emptyState = { success: false, errors: {} };

// Bcrypt cost 4 in tests — correct hashing, much faster than prod cost 12.
const HASH_ROUNDS = 4;

describe("login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no recent failures (under the rate limit).
    mockAttemptCount.mockResolvedValue(0);
    mockAttemptCreate.mockResolvedValue({});
    mockAttemptDeleteMany.mockResolvedValue({ count: 0 });
  });

  // --- Input validation (before any DB call) ---

  it("rejects empty email without hitting the DB", async () => {
    const fd = new FormData();
    fd.set("email", "");
    fd.set("password", "somepassword");

    const result = await login(emptyState, fd);

    expect(result.errors.email).toBe("Email is required");
    expect(mockUserFindUnique).not.toHaveBeenCalled();
    expect(mockAttemptCount).not.toHaveBeenCalled();
  });

  it("rejects empty password without hitting the DB", async () => {
    const fd = new FormData();
    fd.set("email", "teacher@example.com");
    fd.set("password", "");

    const result = await login(emptyState, fd);

    expect(result.errors.password).toBe("Password is required");
    expect(mockUserFindUnique).not.toHaveBeenCalled();
    expect(mockAttemptCount).not.toHaveBeenCalled();
  });

  it("rejects whitespace-only email", async () => {
    const fd = new FormData();
    fd.set("email", "   ");
    fd.set("password", "password");

    const result = await login(emptyState, fd);

    expect(result.errors.email).toBe("Email is required");
  });

  // --- Rate limiting ---

  it("blocks login when recent failures reach the limit", async () => {
    mockAttemptCount.mockResolvedValue(5); // at the limit

    const fd = new FormData();
    fd.set("email", "teacher@example.com");
    fd.set("password", "anypassword");

    const result = await login(emptyState, fd);

    expect(result.errors.form).toMatch(/Too many failed sign-in attempts/);
    // Must not proceed to user lookup when blocked.
    expect(mockUserFindUnique).not.toHaveBeenCalled();
  });

  it("still allows login with exactly 4 previous failures (one under the limit)", async () => {
    mockAttemptCount.mockResolvedValue(4);
    mockUserFindUnique.mockResolvedValue(null); // user not found

    const fd = new FormData();
    fd.set("email", "teacher@example.com");
    fd.set("password", "anypassword");

    const result = await login(emptyState, fd);

    // Should proceed to auth check (not blocked), then fail on credentials.
    expect(result.errors.form).toBe("Invalid email or password");
    expect(mockUserFindUnique).toHaveBeenCalledOnce();
  });

  it("records a failed attempt when user is not found", async () => {
    mockUserFindUnique.mockResolvedValue(null);

    const fd = new FormData();
    fd.set("email", "nobody@example.com");
    fd.set("password", "password123");

    await login(emptyState, fd);

    expect(mockAttemptCreate).toHaveBeenCalledWith({
      data: { email: "nobody@example.com" },
    });
  });

  it("records a failed attempt when password is wrong", async () => {
    const hash = await bcrypt.hash("correctpassword", HASH_ROUNDS);
    mockUserFindUnique.mockResolvedValue({
      id: "teacher-1",
      passwordHash: hash,
      isActive: true,
    });

    const fd = new FormData();
    fd.set("email", "teacher@example.com");
    fd.set("password", "wrongpassword");

    await login(emptyState, fd);

    expect(mockAttemptCreate).toHaveBeenCalledWith({
      data: { email: "teacher@example.com" },
    });
  });

  it("records a failed attempt when user has no passwordHash", async () => {
    mockUserFindUnique.mockResolvedValue({
      id: "student-1",
      passwordHash: null,
      isActive: true,
    });

    const fd = new FormData();
    fd.set("email", "student@example.com");
    fd.set("password", "password123");

    await login(emptyState, fd);

    expect(mockAttemptCreate).toHaveBeenCalledOnce();
  });

  // --- DB-level credential rejections ---

  it("rejects non-existent user with generic message", async () => {
    mockUserFindUnique.mockResolvedValue(null);

    const fd = new FormData();
    fd.set("email", "nobody@example.com");
    fd.set("password", "password123");

    const result = await login(emptyState, fd);

    expect(result.errors.form).toBe("Invalid email or password");
  });

  it("rejects student account without a passwordHash", async () => {
    mockUserFindUnique.mockResolvedValue({
      id: "student-1",
      passwordHash: null,
      isActive: true,
    });

    const fd = new FormData();
    fd.set("email", "student@example.com");
    fd.set("password", "password123");

    const result = await login(emptyState, fd);

    expect(result.errors.form).toBe("Invalid email or password");
  });

  it("rejects inactive user even with correct credentials", async () => {
    const hash = await bcrypt.hash("correctpassword", HASH_ROUNDS);
    mockUserFindUnique.mockResolvedValue({
      id: "teacher-1",
      passwordHash: hash,
      isActive: false,
    });

    const fd = new FormData();
    fd.set("email", "deactivated@example.com");
    fd.set("password", "correctpassword");

    const result = await login(emptyState, fd);

    expect(result.errors.form).toBe("Invalid email or password");
  });

  it("rejects wrong password", async () => {
    const hash = await bcrypt.hash("correctpassword", HASH_ROUNDS);
    mockUserFindUnique.mockResolvedValue({
      id: "teacher-1",
      passwordHash: hash,
      isActive: true,
    });

    const fd = new FormData();
    fd.set("email", "teacher@example.com");
    fd.set("password", "wrongpassword");

    const result = await login(emptyState, fd);

    expect(result.errors.form).toBe("Invalid email or password");
  });

  // --- Happy path ---

  it("creates a session and redirects on valid credentials", async () => {
    const hash = await bcrypt.hash("correctpassword", HASH_ROUNDS);
    mockUserFindUnique.mockResolvedValue({
      id: "teacher-1",
      passwordHash: hash,
      isActive: true,
    });
    mockSessionCreate.mockResolvedValue({
      id: "session-abc",
      userId: "teacher-1",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const fd = new FormData();
    fd.set("email", "teacher@example.com");
    fd.set("password", "correctpassword");

    await login(emptyState, fd);

    expect(mockSessionCreate).toHaveBeenCalledOnce();
    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("clears failed attempts on successful login", async () => {
    const hash = await bcrypt.hash("correctpassword", HASH_ROUNDS);
    mockUserFindUnique.mockResolvedValue({
      id: "teacher-1",
      passwordHash: hash,
      isActive: true,
    });
    mockSessionCreate.mockResolvedValue({
      id: "session-abc",
      userId: "teacher-1",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const fd = new FormData();
    fd.set("email", "teacher@example.com");
    fd.set("password", "correctpassword");

    await login(emptyState, fd);

    expect(mockAttemptDeleteMany).toHaveBeenCalledWith({
      where: { email: "teacher@example.com" },
    });
    expect(mockAttemptCreate).not.toHaveBeenCalled();
  });

  it("normalises email to lowercase before DB lookup", async () => {
    mockUserFindUnique.mockResolvedValue(null);

    const fd = new FormData();
    fd.set("email", "Teacher@Example.COM");
    fd.set("password", "password");

    await login(emptyState, fd);

    expect(mockUserFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: "teacher@example.com" } })
    );
  });
});
