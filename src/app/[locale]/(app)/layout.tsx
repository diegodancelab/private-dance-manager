import { proxyAuth } from "@/lib/auth/proxy";
import { isDualRoleUser } from "@/features/cross-enrollment/queries";
import AppShell from "@/components/app-shell/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await proxyAuth();
  const dualRole = await isDualRoleUser(user.id);

  return (
    <AppShell
      isDualRole={dualRole}
      userName={`${user.firstName} ${user.lastName}`}
      userEmail={user.email}
    >
      {children}
    </AppShell>
  );
}
