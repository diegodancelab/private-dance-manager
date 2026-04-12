import { redirect } from "@/lib/server-redirect";
import { getSession, type Session } from "./session";

/**
 * Verifies the current user is authenticated.
 * Usable in Server Components and Server Actions.
 * Redirects to /login if not authenticated.
 */
export async function requireAuth(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    return redirect("/login");
  }
  return session;
}

/**
 * Verifies the current user is authenticated AND has the TEACHER role.
 * Use this in all teacher-facing server actions and layouts.
 * Redirects to /login if not authenticated or not a teacher.
 */
export async function requireTeacherAuth(): Promise<Session> {
  const session = await requireAuth();
  if (session.user.role !== "TEACHER") {
    return redirect("/login");
  }
  return session;
}

/**
 * Verifies the current user is authenticated AND has the STUDENT role.
 * Use this in the student portal layout and portal server actions.
 * Redirects to /login if not authenticated or not a student.
 */
export async function requireStudentAuth(): Promise<Session> {
  const session = await requireAuth();
  if (session.user.role !== "STUDENT") {
    return redirect("/login");
  }
  return session;
}
