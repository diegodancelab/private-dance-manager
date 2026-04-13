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
 * Dual-role teachers who chose "STUDENT" mode are redirected to the portal.
 * Redirects to /login if not authenticated or not a teacher.
 */
export async function requireTeacherAuth(): Promise<Session> {
  const session = await requireAuth();
  if (session.user.role !== "TEACHER") {
    return redirect("/login");
  }
  // Dual-role teacher currently in student mode → send to portal.
  if (session.activeRole === "STUDENT") {
    return redirect("/portal");
  }
  return session;
}

/**
 * Verifies the current user is authenticated AND is in student mode.
 * Accepts both regular STUDENT users and TEACHER users who chose "STUDENT" activeRole.
 * Redirects to /login (or teacher app) if not in student context.
 */
export async function requireStudentAuth(): Promise<Session> {
  const session = await requireAuth();
  if (session.user.role === "STUDENT") return session;
  if (session.user.role === "TEACHER" && session.activeRole === "STUDENT") {
    return session;
  }
  // Teacher in teacher mode trying to access portal → redirect to their app.
  if (session.user.role === "TEACHER" && session.activeRole === "TEACHER") {
    return redirect("/");
  }
  return redirect("/login");
}
