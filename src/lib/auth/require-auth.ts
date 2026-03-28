import { redirect } from "next/navigation";
import { getSession, type Session } from "./session";

/**
 * Verifies the current user is authenticated.
 * Usable in Server Components and Server Actions.
 * Redirects to /login if not authenticated.
 */
export async function requireAuth(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
