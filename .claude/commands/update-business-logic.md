---
description: Analyse tous les processus métier du projet et met à jour docs/business-logic-test-scenarios.md
model: claude-opus-4-6
---

Tu es un expert en architecture logicielle et en tests de logique métier. Tu dois analyser l'intégralité du projet **Private Dance Manager** et mettre à jour `docs/business-logic-test-scenarios.md` avec tous les processus métier existants.

## Étape 1 — Collecte exhaustive du code

Lis les fichiers suivants pour identifier tous les processus métier réels :

**Server Actions (logique métier principale) :**
- Tous les fichiers `**/actions.ts` ou `**/actions/**/*.ts`
- Tous les fichiers `**/action.ts`

**Schéma Prisma :**
- `prisma/schema.prisma` — modèles, relations, enums, contraintes

**Validations :**
- Tous les fichiers dans `src/lib/validations/`

**Pages et formulaires :**
- Tous les fichiers `**/page.tsx` dans `src/app/`
- Tous les composants dans `src/components/forms/`

**Queries / helpers :**
- Tous les fichiers dans `src/lib/`

## Étape 2 — Extraction des processus métier

Pour chaque module (Auth, Students, Lessons, Calendar, Packages, PackageUsage/Assignment, Charges, Payments, PaymentAllocations, Student Summary), identifie :

1. **Toutes les opérations CRUD** avec leurs validations exactes (messages d'erreur, conditions)
2. **Les transitions d'état** (ex: Package ACTIVE → EXHAUSTED → EXPIRED)
3. **Les calculs financiers** (totaux, balances, allocations)
4. **Les règles de cascade** (que se passe-t-il si on supprime X ?)
5. **Les contraintes d'intégrité** (unicité, FK, règles métier)
6. **Les edge cases** détectés dans le code (guards, early returns, conditions spéciales)
7. **Les processus multi-étapes** (ex: créer une leçon → créer participants → créer charge → allouer package)

## Étape 3 — Analyse des lacunes

Compare ce que tu trouves dans le code avec ce qui est documenté dans `docs/business-logic-test-scenarios.md` :

- Quels processus sont **absents** du document ?
- Quels scénarios existants sont **obsolètes** ou **incorrects** par rapport au code actuel ?
- Quels **nouveaux modules** (ex: billing mode PACKAGE, multi-participant) ne sont pas couverts ?
- Quelles **validations critiques** manquent dans les scénarios ?

## Étape 4 — Mise à jour du document

Mets à jour `docs/business-logic-test-scenarios.md` en :

1. **Ajoutant** les scénarios manquants avec le format existant (ID, Title, Priority, Preconditions, Steps, Expected, What could go wrong, Notes)
2. **Modifiant** les scénarios incorrects pour refléter le code réel
3. **Supprimant** les scénarios qui ne correspondent plus au code (ou les marquant `[DEPRECATED]`)
4. **Mettant à jour** le Module Overview et la table des matières si nécessaire
5. **Ajoutant** une section pour tout nouveau module non documenté

### Format d'un scénario (à respecter strictement)

```markdown
**[MODULE]-[TYPE]-[NN]**
- **Title**: Description concise de l'action testée
- **Priority**: Critical | High | Medium | Low
- **Preconditions**: État initial requis
- **Steps**: Actions à effectuer
- **Expected**: Résultat attendu exact (avec valeurs, messages d'erreur, état DB)
- **What could go wrong**: Risque spécifique si la logique est cassée
- **Notes**: Contexte, références au code, décisions produit à clarifier
```

### Conventions d'ID

- `AUTH-H-NN` : Happy path Auth
- `AUTH-V-NN` : Validation Auth
- `AUTH-E-NN` : Edge case Auth
- `STU-H-NN` / `STU-V-NN` / `STU-E-NN` : Students
- `LES-H-NN` / `LES-V-NN` / `LES-E-NN` : Lessons
- `PKG-H-NN` / `PKG-V-NN` / `PKG-E-NN` : Packages
- `PKG-ASS-H-NN` etc. : Package Assignment
- `CHG-H-NN` / `CHG-V-NN` / `CHG-E-NN` : Charges
- `PAY-H-NN` / `PAY-V-NN` / `PAY-E-NN` : Payments
- `SUM-H-NN` / `SUM-V-NN` / `SUM-E-NN` : Student Summary
- `CROSS-NN` : Cross-module

### Priorités

- **Critical** : Perte de données, incohérence financière, bypass de sécurité
- **High** : Mauvais calcul, état incohérent, validation manquante sur entrée utilisateur
- **Medium** : UX dégradée, cas limite non géré proprement
- **Low** : Cosmétique, edge case très improbable

## Contraintes importantes

- Base-toi **uniquement sur le code réel** — pas de suppositions
- Pour chaque scénario ajouté, cite la source dans Notes (ex: `src/app/packages/actions.ts:45`)
- Si un comportement est **ambigu** dans le code, note `unclear / needs product decision`
- Conserve tous les scénarios existants valides — ne supprime que ce qui est clairement obsolète
- Le document final doit être **auto-suffisant** : quelqu'un sans accès au code doit pouvoir comprendre les règles
