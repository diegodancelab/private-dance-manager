import { requireStudentAuth } from "@/lib/auth/require-auth";
import PortalShell from "@/components/portal-shell/PortalShell";

export default async function PortalProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireStudentAuth();

  return (
    <PortalShell studentName={`${user.firstName} ${user.lastName}`}>
      {children}
    </PortalShell>
  );
}
