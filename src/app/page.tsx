import { redirect } from "next/navigation";

// Fallback for the root path — the middleware handles most cases,
// but this ensures / always redirects to the default locale.
export default function RootPage() {
  redirect("/fr");
}
