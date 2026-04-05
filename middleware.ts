import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Explicitly match the root path for locale redirect
    "/",
    // Match all pathnames except those starting with:
    // - api, _next, _vercel, static files
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
