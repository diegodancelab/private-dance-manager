# Plan : Page de progression par élève (`/students/[id]/progression`)

## Objectif

Permettre au professeur de créer des bilans de progression librement (pas forcément liés à un cours), avec un historique visuel permettant de comparer l'évolution dans le temps via le diagramme radar.

---

## Route

```
/students/[id]/progression
```

Page dédiée, accessible depuis la fiche élève (`/students/[id]`).

---

## UX cible

```
┌─────────────────────────────────────────────────────────────┐
│ ← Fiche élève          Progression — Marie Dupont           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [+ Nouveau bilan]                                          │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │ Radar : comparaison  │  │ Timeline                 │    │
│  │                      │  │                          │    │
│  │  ◯ Jan 2026 (gris)   │  │ ● 15 fév 2026           │    │
│  │  ● Fév 2026 (indigo) │  │   Score moyen : 7.2      │    │
│  │                      │  │   "Bonne progression..." │    │
│  │   [radar SVG]        │  │                          │    │
│  │                      │  │ ○ 10 jan 2026            │    │
│  └──────────────────────┘  │   Score moyen : 5.4      │    │
│                             │   "Début de suivi"       │    │
│                             └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

- Clic sur une entrée de la timeline → sélectionne ce snapshot comme "référence" (gris)
- Le dernier bilan est toujours affiché en indigo (courant)
- Superposition optionnelle de deux snapshots sur le même radar

---

## Formulaire "Nouveau bilan"

Modal ou section dépliable :

- **Date** : pré-remplie à aujourd'hui, modifiable
- **Scores** : curseurs ou boutons 1–10 pour chaque `SkillAxis` actif
- **Notes** : textarea libre (visible uniquement prof)
- Bouton "Enregistrer le bilan"

---

## Modèles Prisma utilisés

| Modèle | Rôle |
|--------|------|
| `SkillAssessment` | Un snapshot de bilan (date, notes, lien élève/prof) |
| `SkillAxisScore` | Score 1–10 par axe pour ce snapshot |
| `SkillAxis` | Axes définis par le prof (technique, musicalité...) |

`SkillAssessment.lessonId` est nullable → un bilan standalone est déjà supporté par le schéma, aucune migration nécessaire.

---

## Fichiers à créer

| Fichier | Rôle |
|---------|------|
| `src/app/[locale]/(app)/students/[id]/progression/page.tsx` | Page principale |
| `src/app/[locale]/(app)/students/[id]/progression/ProgressionPage.module.css` | Styles |
| `src/features/progression/queries.ts` | `getStudentProgressionHistory(studentId, teacherId)` |
| `src/features/progression/actions.ts` | `createAssessment`, `updateAssessment`, `deleteAssessment` |
| `src/features/progression/components/AssessmentForm.tsx` | Formulaire nouveau bilan (client) |
| `src/features/progression/components/AssessmentTimeline.tsx` | Liste cliquable des snapshots |
| `src/features/progression/components/ComparisonRadar.tsx` | Radar avec superposition 2 snapshots |

## Fichiers à modifier

| Fichier | Changement |
|---------|------------|
| `src/app/[locale]/(app)/students/[id]/page.tsx` | Ajouter un lien "Voir la progression →" |
| `src/features/portal/components/RadarChart.tsx` | Extraire ou réutiliser pour `ComparisonRadar` |

---

## Logique de comparaison radar

- Par défaut : afficher le **dernier bilan** seul
- Si 2+ bilans : afficher le dernier (indigo) + le précédent (gris clair, 40% opacité)
- Clic sur un bilan dans la timeline → le définit comme "référence" à comparer

---

## Côté élève (portail)

La page `/portal/progression` existante affiche déjà le radar du dernier bilan.  
Évolution possible : afficher le bilan de référence en superposition + les notes si le prof les a marquées comme visibles.  
→ À décider plus tard.

---

## Checklist d'implémentation

- [ ] Créer `src/features/progression/queries.ts`
- [ ] Créer `src/features/progression/actions.ts`
- [ ] Créer `ComparisonRadar.tsx` (radar SVG avec double couche)
- [ ] Créer `AssessmentTimeline.tsx`
- [ ] Créer `AssessmentForm.tsx` (useActionState)
- [ ] Créer la page `progression/page.tsx`
- [ ] Ajouter le lien depuis la fiche élève
- [ ] Ajouter les clés i18n nécessaires
