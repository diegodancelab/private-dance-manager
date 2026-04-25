"use client";

import { useState } from "react";
import RadarChart from "./RadarChart";
import Avatar from "@/components/ui/Avatar/Avatar";
import Badge from "@/components/ui/Badge/Badge";
import styles from "@/app/[locale]/portal/(protected)/progression/PortalProgression.module.css";
import viewStyles from "./ProgressionView.module.css";

export type SerializedAssessment = {
  id: string;
  createdAt: string;
  notes: string | null;
  averageScore: number;
  teacher: { firstName: string; lastName: string };
  scores: { axisId: string; axisLabel: string; score: number }[];
};

type Props = {
  assessments: SerializedAssessment[];
  labels: {
    latestAssessment: string;
    averageLabel: string;
    compareWith: string;
    compareNone: string;
    coachLabel: string;
    history: string;
    countBilans: string;
    referenceTag: string;
  };
  dateLocale: string;
};

export default function ProgressionView({ assessments, labels, dateLocale }: Props) {
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" });
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const latest = assessments[0] ?? null;
  const referenceAssessment = referenceId
    ? assessments.find((a) => a.id === referenceId) ?? null
    : null;

  const refDataAligned = referenceAssessment
    ? latest?.scores.map((s) => ({
        label: s.axisLabel,
        score: referenceAssessment.scores.find((r) => r.axisId === s.axisId)?.score ?? 0,
      }))
    : undefined;

  if (assessments.length === 0) return null;

  return (
    <div className={styles.progGrid}>
      {/* ── Left: latest + comparison ── */}
      {latest && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.cardLabel}>{labels.latestAssessment}</div>
              <div className={styles.cardTitle}>{formatDate(latest.createdAt)}</div>
            </div>
            <Badge variant="primary">
              {labels.averageLabel.replace("{score}", String(latest.averageScore))}
            </Badge>
          </div>

          {/* Comparison selector */}
          {assessments.length > 1 && (
            <div className={viewStyles.compareRow}>
              <label className={viewStyles.compareLabel}>{labels.compareWith}</label>
              <select
                className={viewStyles.compareSelect}
                value={referenceId ?? ""}
                onChange={(e) => setReferenceId(e.target.value || null)}
              >
                <option value="">{labels.compareNone}</option>
                {assessments.slice(1).map((a) => (
                  <option key={a.id} value={a.id}>
                    {formatDate(a.createdAt)} — {labels.averageLabel.replace("{score}", String(a.averageScore))}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.radarWrap}>
            <RadarChart
              data={latest.scores.map((s) => ({ label: s.axisLabel, score: s.score }))}
              referenceData={refDataAligned}
              size={280}
            />
            {referenceAssessment && (
              <div className={viewStyles.legend}>
                <span className={viewStyles.legendCurrent} />
                <span className={viewStyles.legendText}>{formatDate(latest.createdAt)}</span>
                <span className={viewStyles.legendRef} />
                <span className={viewStyles.legendText}>
                  {labels.referenceTag} {formatDate(referenceAssessment.createdAt)}
                </span>
              </div>
            )}
          </div>

          <div className={styles.skillList}>
            {latest.scores.map((s) => {
              const refScore = referenceAssessment?.scores.find(
                (r) => r.axisId === s.axisId
              )?.score ?? null;
              const diff = refScore !== null ? s.score - refScore : null;
              return (
                <div key={s.axisId} className={styles.skill}>
                  <div className={styles.skillHead}>
                    <span className={styles.skillName}>{s.axisLabel}</span>
                    <span className={styles.skillValue}>
                      {s.score}/10
                      {refScore !== null && (
                        <span className={`${viewStyles.refScore} ${diff! > 0 ? viewStyles.refUp : diff! < 0 ? viewStyles.refDown : viewStyles.refEqual}`}>
                          {diff! > 0 ? `+${diff}` : diff! < 0 ? `${diff}` : "="} (Réf. {refScore})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    {refScore !== null && (
                      <div
                        className={viewStyles.progressRefMark}
                        style={{ left: `${refScore * 10}%` }}
                      />
                    )}
                    <div className={styles.progressFill} style={{ width: `${s.score * 10}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {latest.notes && (
            <div className={styles.coachQuote}>
              {latest.notes}
              <div className={styles.coachMeta}>
                <Avatar
                  initials={`${latest.teacher.firstName[0]}${latest.teacher.lastName[0]}`}
                  size="sm"
                  gradient="cool"
                />
                <span>{latest.teacher.firstName} {latest.teacher.lastName} · {labels.coachLabel}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Right: history timeline ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>{labels.history}</div>
          <span className={styles.cardLabel}>
            {labels.countBilans}
          </span>
        </div>

        <div className={styles.timeline}>
          {assessments.map((assessment, idx) => (
            <div
              key={assessment.id}
              className={`${styles.timelineItem} ${assessment.id === referenceId ? viewStyles.timelineItemActive : ""}`}
              onClick={() => setReferenceId(assessment.id === referenceId || idx === 0 ? null : assessment.id)}
              style={idx === 0 ? undefined : { cursor: "pointer" }}
            >
              <div
                className={styles.timelineDot}
                style={idx > 0 ? { background: "var(--c-text-muted)", boxShadow: "0 0 0 4px #f1f5f9" } : undefined}
              />
              <div className={styles.timelineContent}>
                <div className={styles.timelineDate}>
                  {formatDate(assessment.createdAt)} · {labels.averageLabel.replace("{score}", String(assessment.averageScore))}
                  {assessment.id === referenceId && (
                    <span className={viewStyles.refTag}>{labels.referenceTag}</span>
                  )}
                </div>
                {assessment.notes && (
                  <div className={styles.timelineDesc}>{assessment.notes}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
