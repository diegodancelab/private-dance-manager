import { requireStudentAuth } from "@/lib/auth/require-auth";
import { isDualRoleUser } from "@/features/cross-enrollment/queries";
import PortalShell from "@/components/portal-shell/PortalShell";

export default async function PortalProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireStudentAuth();
  // Only teacher-users can be dual-role; regular students are always single-role.
  const dualRole = user.role === "TEACHER" ? await isDualRoleUser(user.id) : false;

  return (
    <PortalShell
      studentName={`${user.firstName} ${user.lastName}`}
      studentEmail={user.email ?? ""}
      isDualRole={dualRole}
    >
      {children}
    </PortalShell>
  );
}
