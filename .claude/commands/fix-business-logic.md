Tu es un expert en correction de bugs métier. Ta mission : appliquer les corrections issues de `docs/business-logic-verification-report.md` — **uniquement les FAILs et les nouveaux bugs confirmés dans le code**, pas les gaps de documentation.

---

## Étape 1 — Lis les sources avant de toucher au code

Lis dans cet ordre :
1. `docs/business-logic-verification-report.md` — section "Detailed Findings" (FAILs, WARNINGs actionnables) et "New Issues Found"
2. `docs/business-logic-test-scenarios.md` — sections concernées par les corrections

Puis lis le code **exactement là où le bug est signalé** (ne lis pas tout le fichier si inutile) :
- `src/app/(app)/payments/actions.ts` (updatePayment)
- `src/app/(app)/lessons/[id]/page.tsx`
- `src/lib/auth/session.ts` (getSession)

---

## Étape 2 — Applique les corrections dans cet ordre de priorité

### CORRECTION 1 — Critique : `updatePayment` sans garde `amount > 0`

**Fichier** : `src/app/(app)/payments/actions.ts`

**Problème** : `updatePayment` valide le format décimal mais pas `amount <= 0`. Un teacher peut modifier un paiement à "0", remettant toutes les allocations liées à zéro et les charges à PENDING.

**Fix** : Dans `updatePayment`, après le bloc `!isValidDecimal(amount)`, ajouter :
```typescript
} else if (Number(amount) <= 0) {
  state.errors.amount = "Amount must be greater than 0.";
}
```
Exactement comme dans `createPayment` (lignes 93-95 du même fichier).

---

### CORRECTION 2 — Haute : Lesson detail page sans filtre `teacherId`

**Fichier** : `src/app/(app)/lessons/[id]/page.tsx`

**Problème** : `prisma.lesson.findUnique({ where: { id } })` sans `teacherId`. N'importe quel teacher authentifié peut lire les détails d'une leçon d'un autre teacher.

**Fix** : 
1. Importer `requireAuth` depuis `@/lib/auth/require-auth` si pas déjà importé
2. Récupérer la session en haut de la fonction : `const { user } = await requireAuth();`
3. Remplacer `findUnique` par `findFirst` avec `where: { id, teacherId: user.id }`
4. Si `!lesson` → appeler `notFound()`

Note : utiliser `requireAuth` (pas `requireTeacherAuth`) car le layout garantit déjà le rôle TEACHER via `proxyAuth()`.

---

### CORRECTION 3 — Optionnelle : Sessions expirées non supprimées de la DB

**Fichier** : `src/lib/auth/session.ts`

**Problème** : `getSession()` retourne `null` pour les sessions expirées mais ne supprime pas la ligne en base. Les sessions expirées s'accumulent.

**Contexte important** : `getSession()` est appelé pendant le Server Rendering (lecture seule). On ne peut pas modifier les cookies ici. On peut faire un DELETE DB uniquement.

**Fix** : Dans `getSession()`, après avoir détecté `session.expiresAt < new Date()` :
```typescript
if (!session || session.expiresAt < new Date()) {
  // Cleanup expired session row (DB only — cannot modify cookies during rendering)
  if (session) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
  }
  return null;
}
```
Le `.catch(() => {})` évite de crasher si la session a déjà été supprimée par une requête concurrente.

---

## Étape 3 — Mets à jour `docs/business-logic-test-scenarios.md`

Après les corrections de code, mets à jour le document de scénarios :

### 3a. CL-V-03 — Marquer comme FIXED

Remplace le contenu de **CL-V-03** :
- Changer **Expected** : `isValidDatetimeLocal` rejette maintenant "2025-02-30T14:00" via la vérification calendaire round-trip (Date UTC normalisé ≠ jour soumis). Erreur retournée au lieu de normalisation silencieuse.
- Supprimer la référence `See W-04`
- Marquer W-03 comme `[FIXED]` dans la section 12

### 3b. AUTH-P-01 — Corriger les Notes

Dans les Notes de **AUTH-P-01**, remplacer :
> "All write actions use `requireTeacherAuth()`. Read-only pages use `requireAuth()` — a STUDENT user with valid session can still view student detail pages."

Par :
> "All server actions AND the `(app)` layout use `requireTeacherAuth()` (via `proxyAuth()` in `src/lib/auth/proxy.ts`). A STUDENT user with a valid session is blocked at layout level — they cannot access any page under `(app)`, not just write actions."

### 3c. AUTH-E-01 — Corriger le Expected

Dans **AUTH-E-01**, remplacer **Expected** :
> "Session deleted from DB, user redirected to `/login`"

Par :
> "Session row deleted from DB (cleanup on detection), user redirected to `/login`"

Ajouter en Notes : `src/lib/auth/session.ts:60`. Si CORRECTION 3 non appliquée, garder la description du comportement actuel (retourne null sans suppression).

### 3d. Ajouter PAY-V-04 dans la section Payments

Après PAY-V-03, ajouter :

```
**PAY-V-04**
- **Title**: Reject payment update with zero or negative amount
- **Priority**: High
- **Steps**: Edit existing payment, change amount to "0" or "-10"
- **Expected**: `{ errors: { amount: "Amount must be greater than 0." } }` — no allocation update, no charge recalculation
- **Notes**: `src/app/(app)/payments/actions.ts` — updatePayment. Same guard as createPayment.
```

---

## Étape 4 — Mets à jour `docs/business-logic-verification-report.md`

En bas du rapport, ajoute une section :

```markdown
---

## Fixes Applied

> Applied: [date du jour]

| Issue | File | Fix |
|-------|------|-----|
| NEW-01 — amount > 0 missing on updatePayment | `src/app/(app)/payments/actions.ts` | Added `Number(amount) <= 0` guard |
| W-05 / XM-10 — Lesson detail no ownership guard | `src/app/(app)/lessons/[id]/page.tsx` | Added teacherId filter via `requireAuth()` + findFirst |
| NEW-02 — Expired sessions not deleted | `src/lib/auth/session.ts` | Added `prisma.session.delete` on expired session detection |
| CL-V-03 — Outdated scenario (date validation) | `docs/business-logic-test-scenarios.md` | Scenario updated to reflect fixed behavior |
| AUTH-P-01 — Incorrect Notes (proxyAuth) | `docs/business-logic-test-scenarios.md` | Notes corrected |
| AUTH-E-01 — Incorrect Expected (session delete) | `docs/business-logic-test-scenarios.md` | Expected corrected |
| PAY-V-04 — Missing scenario for updatePayment amount | `docs/business-logic-test-scenarios.md` | Scenario added |
```

---

## Contraintes importantes

- **Ne touche qu'aux fichiers listés ci-dessus** — pas de refactoring, pas de nouveaux helpers
- **Chaque correction doit être minimale** : ajoute une ligne ou remplace un bloc, pas de réécriture
- **Respecte les conventions existantes** : même style de validation, mêmes messages d'erreur avec la ponctuation exacte
- **Ne corrige PAS W-06 / CL-V-06** (silent PACKAGE skip) ni W-02 (over-payment) — ce sont des décisions produit, pas des bugs
- **Ne corrige PAS W-01** (multi-currency) — même raison
- Après chaque correction de code, vérifie que le fichier compile logiquement (cohérence des blocs if/else, pas de variables non définies)
