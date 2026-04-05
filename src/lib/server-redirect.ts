import { getLocale } from "next-intl/server";
import { redirect as nextRedirect } from "next/navigation";

/**
 * Locale-aware redirect for Server Actions and Server Components.
 * Reads the current locale and prepends it to the path before redirecting.
 * Returns `never` so TypeScript treats it as a terminating statement.
 */
export async function redirect(href: string): Promise<never> {
  const locale = await getLocale();
  return nextRedirect(`/${locale}${href}`);
}
