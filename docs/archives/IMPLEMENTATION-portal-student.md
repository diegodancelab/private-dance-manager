# Implementation Spec — Portail étudiant (refonte UI/UX)

> **Audience** : Claude Code (dans VS Code) ou développeur humain.
> **Mockup de référence** : [`docs/mockups/portal-student.html`](./portal-student.html)
> **Branche recommandée** : `feat/portal-student-redesign`

---

## 0. Objectif & périmètre

### Dans le scope

Refondre visuellement les 4 pages existantes du portail étudiant en conservant **le même niveau fonctionnel** que la version actuelle, en introduisant un **design system partagé** (tokens, primitives UI) qui servira aussi au portail teacher plus tard.

- `src/app/[locale]/portal/(protected)/layout.tsx` → nouveau layout sidebar
- `src/app/[locale]/portal/(protected)/(dashboard)/page.tsx` → dashboard redesigné
- `src/app/[locale]/portal/(protected)/lessons/page.tsx` → liste cours redesignée
- `src/app/[locale]/portal/(protected)/progression/page.tsx` → progression redesignée
- `src/app/[locale]/portal/(protected)/profile/page.tsx` → profil éditable

### Hors scope (features à faire dans une PR ultérieure)

- Système de **réservation de cours** (le bouton "Réserver un cours" du mockup est purement visuel → implémenter comme **link disabled** avec badge "Bientôt" ou retirer).
- **Playlists** et **Messages** dans la sidebar → ne pas inclure dans cette PR (supprimer ces sections du mockup lors du portage).
- **Paiement en ligne**, **notifications push**.

### Principes à respecter

- **Pas de changement du schéma Prisma** dans cette PR.
- **Garder toutes les traductions existantes** et en ajouter seulement si nécessaire (noter les ajouts dans une section dédiée du PR).
- **Server Components par défaut** ; passer en Client Component uniquement pour l'interactivité (toggles, tabs, menus).
- **setRequestLocale(locale) obligatoire** en haut de chaque page (voir CLAUDE.md).

---

## 1. Design system — tokens CSS à ajouter

### 1.1. Créer un fichier de tokens

**Nouveau fichier** : `src/styles/tokens.css`

```css
:root {
  /* ─── Couleurs neutres (slate warm) ─── */
  --c-bg: #f7f8fb;
  --c-surface: #ffffff;
  --c-surface-muted: #fafbfc;
  --c-border: #e6e8ef;
  --c-border-strong: #d4d8e2;
  --c-text: #0f172a;
  --c-text-secondary: #475569;
  --c-text-muted: #94a3b8;

  /* ─── Marque (indigo) ─── */
  --c-primary: #5b5bd6;
  --c-primary-hover: #4b4bc4;
  --c-primary-soft: #eef0ff;
  --c-primary-border: #dbdefc;

  /* ─── Accents sémantiques ─── */
  --c-success: #10b981;
  --c-success-soft: #ecfdf5;
  --c-warning: #f59e0b;
  --c-warning-soft: #fffbeb;
  --c-danger: #ef4444;
  --c-danger-soft: #fef2f2;
  --c-info: #0ea5e9;
  --c-info-soft: #f0f9ff;

  /* ─── Typographie ─── */
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* ─── Rayons ─── */
  --r-sm: 6px;
  --r-md: 10px;
  --r-lg: 14px;
  --r-xl: 18px;
  --r-full: 999px;

  /* ─── Ombres ─── */
  --shadow-xs: 0 1px 2px rgba(15, 23, 42, 0.04);
  --shadow-sm: 0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04);
  --shadow-md: 0 4px 12px rgba(15, 23, 42, 0.06), 0 2px 4px rgba(15, 23, 42, 0.04);
  --shadow-lg: 0 12px 28px rgba(15, 23, 42, 0.08), 0 4px 8px rgba(15, 23, 42, 0.04);

  /* ─── Layout ─── */
  --sidebar-w: 248px;
  --content-max: 1100px;

  /* ─── Transitions ─── */
  --t-fast: 120ms ease;
  --t-base: 180ms ease;
}
```

### 1.2. L'importer globalement

Dans `src/app/globals.css`, **en tout premier** :

```css
@import "../styles/tokens.css";
```

Puis **remplacer** la déclaration actuelle de `font-family` globale par `var(--font-sans)` et retirer les couleurs hardcodées au profit des tokens.

### 1.3. Charger Inter

Dans `src/app/layout.tsx` (racine), utiliser le loader de police Next.js :

```tsx
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// appliquer la classe inter.className sur <body>
```

Adapter `--font-sans` pour utiliser `var(--font-inter)` en premier.

---

## 2. Primitives UI à créer

Créer (ou compléter) les composants suivants dans `src/components/ui/`. Chaque composant doit avoir son `.module.css`.

### 2.1. `Avatar/Avatar.tsx`

```tsx
type AvatarProps = {
  initials: string;        // "DP"
  size?: "sm" | "md" | "lg";  // 28 / 34 / 56 px
  gradient?: "warm" | "cool" | "brand"; // pour varier visuellement
};
```

- Rond, gradient de fond (`linear-gradient`), initiales blanches centrées
- `warm` = orange→rose, `cool` = cyan→bleu, `brand` = violet
- Si pas de `gradient`, calculer depuis `initials` (hash simple) pour stabilité

### 2.2. `Badge/Badge.tsx` (étendre l'existant `StatusBadge` ou créer à côté)

```tsx
type BadgeProps = {
  variant?: "neutral" | "primary" | "success" | "warning" | "info";
  dot?: boolean;   // affiche une pastille ronde avant le texte
  children: React.ReactNode;
};
```

Styles depuis les tokens `--c-*-soft` / `--c-*-border`.

**Note** : `StatusBadge` existant (qui consomme `getBadgeVariant()`) doit continuer de fonctionner — on ajoute `Badge` comme primitive plus générique, et on peut faire que `StatusBadge` utilise `Badge` en interne.

### 2.3. `Card/Card.tsx`

```tsx
type CardProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section";
};
```

Wrapper stylé (fond surface, border, radius, shadow-xs au repos → shadow-sm au hover, padding 20px). Accepte `className` pour override ponctuel.

### 2.4. `Input/Input.tsx`

Wrapper autour de `<input>` avec styles tokens. Props standard HTML + `invalid?: boolean`.

### 2.5. `Toggle/Toggle.tsx`

Client Component. Switch on/off stylé (voir mockup). Props :
```tsx
{ checked: boolean; onChange: (v: boolean) => void; label?: string; description?: string; }
```

### 2.6. `IconButton/IconButton.tsx`

Bouton icône 34x34, utilisé dans la topbar (recherche, notifs, aide).

### 2.7. `Button` (existant) — étendre si besoin

Vérifier les variantes `primary` / `secondary` / `ghost` / `danger`. Harmoniser avec les tokens. Ajouter taille `sm` si absente.

### 2.8. Icônes

Utiliser **`lucide-react`** (déjà dans la stack selon CLAUDE.md). Ne pas inliner de SVGs. Exemple :

```tsx
import { LayoutDashboard, Calendar, TrendingUp, User, Bell, Search, HelpCircle, Clock, MapPin } from "lucide-react";
```

---

## 3. Refonte du `PortalShell`

### 3.1. Nouveau layout

**Fichier** : `src/components/portal-shell/PortalShell.tsx` (réécriture complète)

Structure :

```
┌─────────────┬─────────────────────────────────┐
│             │ topbar (breadcrumb + icons)     │
│  sidebar    ├─────────────────────────────────┤
│             │                                 │
│  - brand    │                                 │
│  - nav      │         content (children)      │
│  - section  │         max-width: 1100px       │
│    MENU     │                                 │
│  - (links)  │                                 │
│             │                                 │
│  - avatar   │                                 │
│    + menu   │                                 │
└─────────────┴─────────────────────────────────┘
```

### 3.2. Comportement

- **Desktop (>900px)** : sidebar fixe 248px, toujours visible
- **Mobile (≤900px)** : sidebar transformée en drawer, ouverte par un bouton burger dans la topbar, fermée en cliquant sur un backdrop semi-transparent
- **Sidebar active state** : item courant avec fond `--c-primary-soft` et texte `--c-primary`
- **Avatar en bas** : ouvre un menu (dropdown) avec "Mon profil" / "Espace professeur" (si dual-role) / "Déconnexion"

### 3.3. Topbar

- Breadcrumb fin ("Espace élève") + titre de page en gras
- Côté droit : `IconButton` Search + `IconButton` Bell (avec dot rouge si non-lues) + `IconButton` HelpCircle
- Backdrop-blur pour effet "sticky translucide"

### 3.4. Props du composant

```tsx
type PortalShellProps = {
  children: React.ReactNode;
  studentName: string;    // déjà passé depuis le layout
  studentEmail: string;   // NOUVEAU — à ajouter
  isDualRole?: boolean;
  // Optionnel : pageTitle, breadcrumb pour piloter la topbar depuis la page
};
```

→ Adapter `PortalProtectedLayout` (`layout.tsx`) pour aussi passer `studentEmail` (disponible dans `user.email`).

### 3.5. Navigation sidebar (sections principales uniquement pour cette PR)

```
MENU
- Tableau de bord    (icon: LayoutDashboard)    → /portal
- Mes cours          (icon: Calendar)           → /portal/lessons
- Ma progression     (icon: TrendingUp)         → /portal/progression
- Mon profil         (icon: User)               → /portal/profile
```

Badge numérique sur "Mes cours" = nombre de cours à venir (nécessite query, voir §5).

> **Ne pas inclure** les sections "Playlists" et "Messages" du mockup — elles sont purement démonstratives pour le futur SaaS.

---

## 4. Refonte des 4 pages

### 4.1. Dashboard — `/portal`

**Fichier** : `src/app/[locale]/portal/(protected)/(dashboard)/page.tsx`

**Structure (voir mockup)** :

1. **Page header** : titre `t("greeting", { name })` + sous-titre `"Voici un résumé de ton parcours cette semaine."` (nouvelle clé i18n) + bouton "Réserver un cours" (désactivé ou caché — voir §0).
2. **Hero card** : carte violette pleine largeur avec gradient — affiche le prochain cours. Si `nextLesson === null`, afficher un **état vide stylé** (illustration + texte + CTA "Contacter mon professeur").
3. **3 tuiles KPI** (grid 3 colonnes desktop, 1 colonne mobile) :
   - ⏱️ Temps total de cours
   - ✓ Cours effectués
   - ⭐ Moyenne du dernier bilan
4. **2 cards côte à côte** (grid 2 colonnes desktop, 1 colonne mobile) :
   - Forfait actif (nom + badge statut + progress bar + date d'expiration)
   - Dernier bilan (date + top 2 compétences avec mini progress bars + lien "Voir plus")

**Mapping données → queries** :

- `nextLesson`, `activePackage`, `lastAssessmentDate` → déjà retournés par `getStudentDashboard`
- **Nouveaux champs à ajouter à `getStudentDashboard`** (étendre la query) :
  - `stats.totalMinutes: number` — somme de `durationMin` de tous les `Lesson` passés où l'élève est participant confirmé
  - `stats.lessonsCompletedCount: number` — count des cours passés
  - `stats.lastAssessmentAverage: number | null` — moyenne des scores du dernier `ProgressEntry` de l'élève
  - `activePackage.expiresAt: Date | null`
  - `lastAssessmentTopSkills: { label: string; score: number }[]` — top 2 axes par score

### 4.2. Mes cours — `/portal/lessons`

**Fichier** : `src/app/[locale]/portal/(protected)/lessons/page.tsx`

**Structure** :

1. Page header : titre + sous-titre "Consulte tes cours à venir et ton historique." (nouvelle clé) + bouton "Réserver un cours" (désactivé).
2. **Segmented control** (Client Component) : "À venir (N)" / "Passés (M)" / "Annulés". Utiliser `useState` + filtrage côté client sur la liste complète, OU params URL (`?tab=upcoming`).
3. **Liste de cartes cours** :
   - À gauche : date stylée (mois / jour en grand / heure)
   - Au milieu : titre + badge type (`Privé`, `Duo`, `Groupe`, `En ligne`), ligne méta (prof, durée, lieu)
   - À droite : actions contextuelles
     - Cours à venir → "Replanifier" (visuel, désactivé) + menu `⋮`
     - Cours passé avec bilan → "Voir le bilan" (lien vers `/portal/progression#<assessmentId>`)
     - Cours passé sans bilan → bouton `ghost` "Voir le bilan" désactivé

**Mapping données** :

- `getStudentLessons(studentId)` retourne déjà `{ upcoming, past }` ✓
- Ajouter les cours annulés → **étendre la query** pour retourner aussi `canceled: PortalLesson[]` (filtrer par `status === "CANCELED"` ou `BookingStatus === "CANCELED"`)
- Pour le badge "Bilan publié", vérifier si `ProgressEntry` existe créé après la `scheduledAt` du cours → décision simple : afficher le badge si le cours a un `feedback` (champ déjà retourné) OU si un `ProgressEntry` est postérieur.

### 4.3. Ma progression — `/portal/progression`

**Fichier** : `src/app/[locale]/portal/(protected)/progression/page.tsx`

**Structure** :

Grid 2 colonnes (1.2fr / 1fr), passe à 1 colonne sous 980px.

- **Colonne gauche** — Card "Dernier bilan" :
  - Header : label + date + badge moyenne
  - Radar chart (garder le composant `RadarChart` existant, passer la dernière assessment)
  - "Pull quote" du coach (si `notes` existe) avec avatar+nom du coach en bas
- **Colonne droite** — Card "Historique des bilans" :
  - Timeline verticale : date + moyenne + titre (`title` du ProgressEntry) + 1–2 lignes de `notes`

**Mapping données** :

- `getStudentAssessments(studentId)` retourne déjà `PortalAssessment[]` ✓
- Pour chaque entry, calculer la **moyenne des scores** côté serveur (sum/length) et l'ajouter au retour : `averageScore: number`
- Teacher info (prénom/nom du coach) : **étendre** la query pour inclure `teacher: { firstName, lastName }` via la relation `ProgressEntry.teacher`

### 4.4. Mon profil — `/portal/profile`

**Fichier** : `src/app/[locale]/portal/(protected)/profile/page.tsx`

**Structure** : grid 2 colonnes (280px / 1fr), passe à 1 colonne sous 860px.

- **Colonne gauche** — Card identitaire : avatar 88px + nom + email + bouton "Changer la photo" (visuel, désactivé si pas d'upload prévu dans cette PR) + section "Membre depuis".
- **Colonne droite** — trois Cards empilées :
  1. **Informations personnelles** (form éditable) : prénom / nom / email / téléphone + boutons "Enregistrer" / "Annuler"
  2. **Préférences** : 3 Toggles (rappels de cours par email, notifications de bilans, newsletter). Stub dans cette PR : toggles purement UI (pas de persistance).
  3. **Sécurité** : mot de passe actuel / nouveau / confirmer → conserver le composant existant `PortalPasswordForm`.

**Nouvelle server action à créer** : `updateStudentProfile` dans `src/features/portal/actions/updateStudentProfile.ts`

```ts
"use server";
import { z } from "zod";
import { requireStudentAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
});

export async function updateStudentProfile(_prev: unknown, formData: FormData) {
  const { user } = await requireStudentAuth();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten() };

  await prisma.user.update({ where: { id: user.id }, data: parsed.data });
  return { ok: true };
}
```

Utiliser `useActionState` dans un Client Component pour le formulaire.

---

## 5. Nouvelles queries / extensions

Créer/modifier dans `src/features/portal/queries/` :

### 5.1. Étendre `getStudentDashboard.ts`

Ajouter au type de retour :

```ts
stats: {
  totalMinutes: number;
  lessonsCompletedCount: number;
  lastAssessmentAverage: number | null;
};
activePackage: (existing fields) & { expiresAt: Date | null };
lastAssessmentTopSkills: { label: string; score: number }[];
```

Calculs Prisma à ajouter :

- Agrégation `prisma.lesson.aggregate` sur les `Lesson` passés où l'élève est participant confirmé → sum de `durationMin` + count
- Récupérer le dernier `ProgressEntry` → calculer moyenne de ses scores + extraire top 2 par score DESC

### 5.2. Étendre `getStudentLessons.ts`

Ajouter `canceled: PortalLesson[]` au retour.

### 5.3. Étendre `getStudentAssessments.ts`

Ajouter :
- `averageScore: number` (moyenne des `scores`)
- `teacher: { firstName: string; lastName: string }` (via relation)
- `notes: string | null` (déjà en base, mais vérifier qu'il est retourné)

### 5.4. Query pour la navigation : count des cours à venir

Optionnel — si le badge "Mes cours (N)" dans la sidebar est souhaité : query légère `getUpcomingLessonCount(userId)` appelée depuis `PortalProtectedLayout`.

---

## 6. Clés i18n à ajouter

Dans `messages/fr.json` sous `portal` (et répliquer dans `en`, `es`, `lv`) :

```json
"portal": {
  "dashboard": {
    ...existing,
    "subtitle": "Voici un résumé de ton parcours cette semaine.",
    "bookLesson": "Réserver un cours",
    "stats": {
      "totalTime": "Temps total de cours",
      "completedLessons": "Cours effectués",
      "averageScore": "Moyenne du dernier bilan"
    },
    "packageActive": "Actif",
    "packageRemaining": "{time} restantes sur {total}",
    "packageExpiresOn": "Expire le {date}",
    "seeDetails": "Détails",
    "seeMore": "Voir"
  },
  "lessons": {
    ...existing,
    "subtitle": "Consulte tes cours à venir et ton historique.",
    "canceled": "Annulés",
    "reschedule": "Replanifier",
    "seeAssessment": "Voir le bilan",
    "statusAssessmentPublished": "Bilan publié"
  },
  "progression": {
    ...existing,
    "subtitle": "Suivi de tes compétences et bilans réalisés par ton professeur.",
    "averageLabel": "Moyenne {score}/10",
    "history": "Historique des bilans",
    "countBilans": "{count, plural, =1 {# bilan} other {# bilans}}",
    "export": "Exporter"
  },
  "profile": {
    ...existing,
    "subtitle": "Gère tes informations personnelles et tes préférences.",
    "memberSince": "Membre depuis",
    "changePhoto": "Changer la photo",
    "personalInfo": "Informations personnelles",
    "personalInfoDesc": "Ces informations sont partagées avec ton professeur.",
    "preferences": "Préférences",
    "preferencesDesc": "Personnalise l'expérience de ton portail.",
    "prefEmailReminders": "Rappels de cours par email",
    "prefEmailRemindersDesc": "24 h avant chaque séance.",
    "prefAssessmentNotif": "Notifications de bilans",
    "prefAssessmentNotifDesc": "Être notifié dès qu'un bilan est publié.",
    "prefNewsletter": "Newsletter du studio",
    "prefNewsletterDesc": "Événements, workshops, nouveautés.",
    "security": "Sécurité",
    "securityDesc": "Change ton mot de passe régulièrement.",
    "saving": "Enregistrement…",
    "saved": "Enregistré ✓",
    "cancel": "Annuler"
  },
  "topbar": {
    "area": "Espace élève",
    "search": "Rechercher",
    "notifications": "Notifications",
    "help": "Aide"
  }
}
```

→ Traduire chaque clé dans `en.json`, `es.json`, `lv.json`. **Ne rien supprimer** des clés existantes.

---

## 7. Ordre d'implémentation recommandé

À faire en commits séparés pour garder la PR review-friendly :

1. **`feat: add design tokens and Inter font`** — créer `src/styles/tokens.css`, l'importer dans `globals.css`, charger Inter dans `layout.tsx` racine. Aucun changement visuel attendu sauf la police.
2. **`feat: add UI primitives (Avatar, Badge, Card, Input, Toggle, IconButton)`** — créer les composants + .module.css + un petit `README.md` dans `src/components/ui/` qui liste les primitives.
3. **`feat: redesign PortalShell with sidebar layout`** — réécrire `PortalShell.tsx`, `PortalShell.module.css`. Adapter `PortalProtectedLayout` pour passer `studentEmail`. Vérifier les 4 routes continuent de fonctionner (pages pas encore refondues).
4. **`feat: extend portal queries with stats and metadata`** — étendre les 3 queries (§5.1 à §5.3).
5. **`feat: redesign portal dashboard page`** — nouvelle version du dashboard + i18n keys.
6. **`feat: redesign portal lessons page`** — segmented control + cartes cours + i18n keys.
7. **`feat: redesign portal progression page`** — radar + timeline + coach quote + i18n keys.
8. **`feat: redesign portal profile page`** — form editable + preferences + server action `updateStudentProfile` + i18n keys.
9. **`chore: add en/es/lv translations for new portal keys`** — aligner les 3 autres locales.

---

## 8. Checklist de validation avant merge

- [ ] La page `/fr/portal` affiche le nouveau shell et le nouveau dashboard sans erreur console
- [ ] Les 4 pages se naviguent correctement et mettent à jour l'état actif dans la sidebar
- [ ] Le drawer mobile s'ouvre/se ferme correctement (tester en responsive ≤ 900px)
- [ ] Les 4 locales (fr/en/es/lv) fonctionnent — tester `setRequestLocale` avec navigation cross-locale
- [ ] Le radar chart s'affiche avec les bonnes valeurs
- [ ] La server action `updateStudentProfile` sauvegarde puis revalidate la page
- [ ] Le mot de passe fonctionne toujours (composant `PortalPasswordForm` non cassé)
- [ ] Aucune régression sur la logique dual-role (bouton "Espace professeur" visible uniquement si `isDualRole === true`)
- [ ] `npm run build` passe sans erreur TS ni warning ESLint
- [ ] Les tests existants passent (`npm test`)
- [ ] Respect des règles de `CLAUDE.md` : pas de Prisma dans Client Component, `setRequestLocale(locale)` dans chaque page

---

## 9. Références

- **Mockup visuel** : `docs/mockups/portal-student.html` (ouvrir dans un navigateur)
- **Règles codebase** : `CLAUDE.md` à la racine
- **Design system existant** : `docs/design-system.md`
- **Business logic** : `docs/business-logic-test-scenarios.md` (à relire si modification des queries touche packages/lessons/charges)

---

## 10. Notes pour le portail Teacher (future PR)

Lors de la refonte du portail teacher, **réutiliser le même design system** (tokens, primitives) mais avec une densité supérieure :

- Sidebar identique en structure, contenu différent (Élèves, Cours, Forfaits, Paiements, etc.)
- Pages orientées data-tables plutôt que cards
- KPIs en haut des écrans en tuiles compactes
- Typographie plus petite (14px body vs 15px côté élève)

Le doc `IMPLEMENTATION-portal-teacher.md` sera créé en suivant la même structure que ce document.
