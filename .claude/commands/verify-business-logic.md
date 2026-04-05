---
description: Vérifie chaque scénario de docs/business-logic-test-scenarios.md contre le code réel et produit un rapport de conformité
model: claude-opus-4-6
---

Tu es un expert en audit de logique métier. Ta mission : vérifier que chaque scénario documenté dans `docs/business-logic-test-scenarios.md` est **réellement implémenté** dans le code, et produire un rapport de conformité structuré.

Tu ne peux pas exécuter du code ni interroger la base de données — tu fais de l'**analyse statique** : tu lis le code et tu le confrontes aux spécifications documentées.

---

## Étape 1 — Chargement des sources

### 1a. Lis le document de scénarios complet
- `docs/business-logic-test-scenarios.md`

### 1b. Lis tous les fichiers de logique métier
- Tous les `**/actions.ts` dans `src/app/`
- `src/lib/auth/actions.ts`, `src/lib/auth/require-auth.ts`, `src/lib/auth/session.ts`
- Tous les fichiers dans `src/lib/validations/`
- `prisma/schema.prisma`
- Tous les fichiers dans `src/lib/` (queries, utils, helpers)

---

## Étape 2 — Analyse par scénario

Pour **chaque scénario** (tous les IDs : AUTH-*, STU-*, LES-*, CL-*, PKG-*, PA-*, CHG-*, PAY-*, SUM-*, DASH-*, XM-*), effectue les vérifications suivantes :

### Vérifications à faire pour chaque scénario

1. **Validations documentées dans "Expected"** : cherche dans le code si la condition est bien présente (ex: `amount > 0`, message d'erreur exact)
2. **Guard / early return** : si le scénario décrit un rejet, trouve la ligne de code qui fait ce rejet
3. **Transitions d'état** : si le scénario décrit un changement de statut (ex: Package → EXHAUSTED), trouve le code qui fait cette mise à jour
4. **Calculs financiers** : si le scénario décrit un calcul, retrouve la formule dans le code
5. **Message d'erreur exact** : si un message est cité dans "Expected", cherche-le littéralement dans le code (grep)
6. **Référence Notes** : si Notes cite `src/app/xxx/actions.ts:NN`, lis cette ligne et vérifie qu'elle implémente bien ce que décrit le scénario

### Règles de verdict

- ✅ **PASS** : La logique documentée est présente dans le code, les messages d'erreur correspondent
- ❌ **FAIL** : La logique est absente, le message diffère, ou la condition est incorrecte
- ⚠️ **WARNING** : La logique existe mais avec une différence mineure (ex: message légèrement différent, condition similaire mais pas identique)
- ⏭️ **SKIP** : Le scénario concerne l'UI, une action manuelle, ou un comportement non vérifiable statiquement (ex: "redirect happens", "cookie is set")
- 🔍 **UNCLEAR** : Le code est ambigu ou la logique est distribuée sur plusieurs fichiers sans lien clair

---

## Étape 3 — Production du rapport

Génère le rapport dans `docs/business-logic-verification-report.md` avec la structure suivante :

```markdown
# Business Logic Verification Report

> Generated: [date]
> Method: Static code analysis vs docs/business-logic-test-scenarios.md
> Tool: Claude Code — /verify-business-logic

---

## Summary

| Status | Count | % |
|--------|-------|---|
| ✅ PASS | N | % |
| ❌ FAIL | N | % |
| ⚠️ WARNING | N | % |
| ⏭️ SKIP | N | % |
| 🔍 UNCLEAR | N | % |
| **Total** | N | 100% |

---

## Critical & High Priority Issues

> Only FAILs and WARNINGs for Critical/High priority scenarios

[liste des problèmes critiques avec détail]

---

## Full Results by Module

### Authentication & Sessions
| ID | Title | Status | Finding |
|----|-------|--------|---------|
| AUTH-H-01 | ... | ✅ PASS | ... |
...

### Students
...

[répéter pour chaque module]

---

## Detailed Findings

> Only for FAIL, WARNING, UNCLEAR — PASS scenarios are listed in the table only

### ❌ FAIL — [SCENARIO-ID]
- **Documented**: [ce que le scénario dit]
- **Found in code**: [ce qui existe réellement, avec référence fichier:ligne]
- **Gap**: [description précise de la divergence]
- **Recommendation**: [correction suggérée]

### ⚠️ WARNING — [SCENARIO-ID]
- **Documented**: ...
- **Found in code**: ...
- **Minor difference**: ...

### 🔍 UNCLEAR — [SCENARIO-ID]
- **Reason**: ...
- **What to check manually**: ...

---

## New Issues Found

> Problèmes trouvés dans le code qui ne sont PAS documentés dans les scénarios existants

### [ISSUE-ID] — [Description]
- **Location**: `src/app/xxx/actions.ts:NN`
- **Risk**: Critical | High | Medium | Low
- **Description**: ...
- **Recommendation**: Ajouter un scénario [MODULE]-[TYPE]-NN

---

## Recommendations

1. ...
2. ...
```

---

## Contraintes importantes

- **Sois précis** : cite toujours le fichier et la ligne pour chaque finding (ex: `src/app/(app)/packages/actions.ts:45`)
- **Ne marque PASS que si tu as trouvé le code** — si tu ne trouves pas, mets UNCLEAR ou FAIL
- **Messages d'erreur** : si le scénario cite `"Amount must be greater than 0."` avec la ponctuation exacte, vérifie que le message dans le code est **identique** (case-sensitive)
- **Les scénarios SKIP** doivent quand même apparaître dans les tables avec leur statut
- **Ne te limite pas aux Notes** : si un scénario n'a pas de référence de code, cherche activement la logique par module/fonctionnalité
- **Sois exhaustif sur les FAIL** : un FAIL sur un scénario Critical doit avoir une recommendation actionnable
