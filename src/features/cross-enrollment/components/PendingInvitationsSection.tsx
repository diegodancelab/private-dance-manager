import { resendInvitation, cancelInvitation } from "@/features/cross-enrollment/invitation-actions";
import type { PendingInvitationItem } from "@/features/cross-enrollment/queries";
import styles from "./PendingInvitationsSection.module.css";

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (diffH >= 24) return `il y a ${Math.floor(diffH / 24)}j`;
  if (diffH >= 1) return `il y a ${diffH}h`;
  if (diffMin >= 1) return `il y a ${diffMin}min`;
  return "à l'instant";
}

export default function PendingInvitationsSection({
  invitations,
}: {
  invitations: PendingInvitationItem[];
}) {
  if (invitations.length === 0) return null;

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>
        Invitations en attente
        <span className={styles.badge}>{invitations.length}</span>
      </h2>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Email</th>
              <th className={styles.th}>Envoyée</th>
              <th className={styles.th}>Expire dans</th>
              <th className={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((inv) => {
              const expiresInH = Math.max(
                0,
                Math.floor((inv.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60))
              );
              return (
                <tr key={inv.id}>
                  <td className={styles.td} data-label="Email">{inv.email}</td>
                  <td className={styles.td} data-label="Envoyée">
                    {formatRelativeTime(inv.createdAt)}
                  </td>
                  <td className={styles.td} data-label="Expire dans">
                    {expiresInH > 0 ? `${expiresInH}h` : "Bientôt"}
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actions}>
                      <form action={resendInvitation}>
                        <input type="hidden" name="invitationId" value={inv.id} />
                        <button type="submit" className={styles.btnResend}>
                          Renvoyer
                        </button>
                      </form>
                      <form action={cancelInvitation}>
                        <input type="hidden" name="invitationId" value={inv.id} />
                        <button type="submit" className={styles.btnCancel}>
                          Annuler
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
