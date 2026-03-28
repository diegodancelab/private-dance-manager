import { proxyAuth } from "@/lib/auth/proxy";
import AppShell from "@/components/app-shell/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await proxyAuth();

  return <AppShell>{children}</AppShell>;
}
