/**
 * Auth proxy for protected route layouts.
 * Call this at the top of any layout that requires authentication.
 * Redirects to /login if the user is not authenticated.
 *
 * This replaces middleware.ts — protection is applied explicitly
 * in the (app) route group layout, without the Edge runtime.
 */
export { requireTeacherAuth as proxyAuth } from "./require-auth";
