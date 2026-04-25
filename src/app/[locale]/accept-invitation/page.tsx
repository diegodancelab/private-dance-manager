import { setRequestLocale } from "next-intl/server";
import { getSession } from "@/lib/auth/session";
import { getInvitationByToken } from "@/features/cross-enrollment/accept-actions";
import { acceptInvitationAsLoggedInUser } from "@/features/cross-enrollment/accept-actions";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import AcceptInvitationCreateForm from "./AcceptInvitationCreateForm";
import AcceptInvitationSetPasswordForm from "./AcceptInvitationSetPasswordForm";
import styles from "@/app/[locale]/login/LoginForm.module.css";
import cardStyles from "./AcceptInvitationPage.module.css";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string; error?: string }>;
};

export default async function AcceptInvitationPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { token, error } = await searchParams;
  setRequestLocale(locale);

  // ── Handle redirect errors from the accept action ──────────────────────────

  if (error === "expired") {
    return (
      <div className={styles.loginPage}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Private Dance Manager</h1>
            <p className={styles.subtitle}>
              Ce lien d&apos;invitation a expiré ou a déjà été utilisé.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error === "email_mismatch") {
    return (
      <div className={styles.loginPage}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Private Dance Manager</h1>
            <p className={styles.subtitle}>
              Ce lien d&apos;invitation est destiné à une autre adresse email.
              Déconnectez-vous et reconnectez-vous avec le bon compte.
            </p>
          </div>
          <div className={cardStyles.actions}>
            <Link href="/login" className={cardStyles.link}>
              Se connecter avec un autre compte
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Validate token ──────────────────────────────────────────────────────────

  if (!token) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Private Dance Manager</h1>
            <p className={styles.subtitle}>Lien d&apos;invitation invalide.</p>
          </div>
        </div>
      </div>
    );
  }

  const invitation = await getInvitationByToken(token);

  if (!invitation.valid || !invitation.email || !invitation.teacherFirstName) {
    const message =
      invitation.error === "already_used"
        ? "Cette invitation a déjà été acceptée."
        : "Ce lien d'invitation a expiré ou n'est plus valide.";
    return (
      <div className={styles.loginPage}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Private Dance Manager</h1>
            <p className={styles.subtitle}>{message}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Determine user context ──────────────────────────────────────────────────

  const session = await getSession();
  const existingAccount = await prisma.user.findFirst({
    where: { email: invitation.email },
    select: { id: true, firstName: true, passwordHash: true },
  });

  // Case 1: Logged in — email matches → show accept button
  if (session && session.user.email.toLowerCase() === invitation.email.toLowerCase()) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Invitation reçue</h1>
            <p className={styles.subtitle}>
              <strong>{invitation.teacherFirstName}</strong> vous invite à rejoindre
              son espace en tant qu&apos;élève.
            </p>
          </div>
          <form action={acceptInvitationAsLoggedInUser} className={cardStyles.acceptForm}>
            <input type="hidden" name="token" value={token} />
            <button type="submit" className={styles.submit}>
              Accepter l&apos;invitation
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Case 2: Logged in but different email → show mismatch notice
  if (session && session.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Mauvais compte</h1>
            <p className={styles.subtitle}>
              Cette invitation est destinée à <strong>{invitation.email}</strong>.
              Vous êtes connecté(e) avec un autre compte.
            </p>
          </div>
          <div className={cardStyles.actions}>
            <Link href="/login" className={cardStyles.link}>
              Se connecter avec le bon compte
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Not logged in, account exists but no password → set password form
  if (!session && existingAccount && !existingAccount.passwordHash) {
    return (
      <div className={styles.loginPage}>
        <AcceptInvitationSetPasswordForm
          token={token}
          teacherFirstName={invitation.teacherFirstName}
          firstName={existingAccount.firstName}
        />
      </div>
    );
  }

  // Case 4: Not logged in, account exists with password → prompt login
  if (!session && existingAccount) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Invitation reçue</h1>
            <p className={styles.subtitle}>
              <strong>{invitation.teacherFirstName}</strong> vous invite à rejoindre
              son espace en tant qu&apos;élève. Connectez-vous pour accepter.
            </p>
          </div>
          <div className={cardStyles.actions}>
            <Link href="/login" className={styles.submit} style={{ display: "block", textAlign: "center" }}>
              Se connecter pour accepter
            </Link>
            <p className={cardStyles.hint}>
              Après connexion, revenez sur ce lien pour finaliser l&apos;acceptation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Case 5: Not logged in, no account → show registration form
  return (
    <div className={styles.loginPage}>
      <AcceptInvitationCreateForm
        token={token}
        teacherFirstName={invitation.teacherFirstName}
      />
    </div>
  );
}
