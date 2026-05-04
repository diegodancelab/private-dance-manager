"use client";

import { useState, useTransition } from "react";
import {
  createLevel,
  updateLevel,
  deleteLevel,
  reorderLevel,
} from "@/features/levels/actions";
import styles from "./LevelsManager.module.css";

export const LEVEL_COLORS = [
  "#4f46e5", "#2563eb", "#0891b2", "#16a34a",
  "#65a30d", "#d97706", "#ea580c", "#db2777",
  "#7c3aed", "#475569",
];

type Level = { id: string; name: string; color: string; order: number };

type T = {
  addLevel: string;
  namePlaceholder: string;
  name: string;
  color: string;
  save: string;
  delete: string;
  edit: string;
  noLevels: string;
  confirmDelete: string;
};

type Props = { levels: Level[]; t: T };

function ColorPalette({ selected, onSelect }: { selected: string; onSelect: (c: string) => void }) {
  return (
    <div className={styles.palette}>
      {LEVEL_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          className={`${styles.swatch} ${selected === c ? styles.swatchSelected : ""}`}
          style={{ background: c }}
          onClick={() => onSelect(c)}
          aria-label={c}
        />
      ))}
    </div>
  );
}

export default function LevelsManager({ levels, t }: Props) {
  const [, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addColor, setAddColor] = useState(LEVEL_COLORS[0]);
  const [editColor, setEditColor] = useState("");

  function startEdit(level: Level) {
    setEditingId(level.id);
    setEditColor(level.color);
  }

  return (
    <div className={styles.root}>
      {levels.length === 0 && !adding && (
        <p className={styles.empty}>{t.noLevels}</p>
      )}

      <div className={styles.list}>
        {levels.map((level, idx) =>
          editingId === level.id ? (
            <form
              key={level.id}
              action={(fd) => {
                fd.append("id", level.id);
                fd.append("color", editColor);
                startTransition(() => updateLevel(fd));
                setEditingId(null);
              }}
              className={styles.form}
            >
              <div className={styles.formPreview}>
                <span className={styles.colorDot} style={{ background: editColor }} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{t.name} *</label>
                <input name="name" required defaultValue={level.name} className={styles.input} autoFocus />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{t.color}</label>
                <ColorPalette selected={editColor} onSelect={setEditColor} />
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.btnPrimary}>{t.save}</button>
                <button type="button" className={styles.btnGhost} onClick={() => setEditingId(null)}>✕</button>
              </div>
            </form>
          ) : (
            <div key={level.id} className={styles.levelRow}>
              <div className={styles.levelLeft}>
                <span className={styles.colorDot} style={{ background: level.color }} />
                <span className={styles.levelName}>{level.name}</span>
              </div>
              <div className={styles.levelActions}>
                <form action={(fd) => { fd.append("id", level.id); fd.append("direction", "up"); startTransition(() => reorderLevel(fd)); }}>
                  <button type="submit" className={styles.btnXS} disabled={idx === 0} title="Monter">↑</button>
                </form>
                <form action={(fd) => { fd.append("id", level.id); fd.append("direction", "down"); startTransition(() => reorderLevel(fd)); }}>
                  <button type="submit" className={styles.btnXS} disabled={idx === levels.length - 1} title="Descendre">↓</button>
                </form>
                <button className={styles.btnXS} onClick={() => startEdit(level)} title={t.edit}>✏️</button>
                <form action={(fd) => { fd.append("id", level.id); startTransition(() => deleteLevel(fd)); }}>
                  <button
                    type="submit"
                    className={styles.btnXSDanger}
                    onClick={(e) => { if (!confirm(t.confirmDelete)) e.preventDefault(); }}
                    title={t.delete}
                  >✕</button>
                </form>
              </div>
            </div>
          )
        )}
      </div>

      {adding ? (
        <form
          action={(fd) => {
            fd.append("color", addColor);
            startTransition(() => createLevel(fd));
            setAdding(false);
            setAddColor(LEVEL_COLORS[0]);
          }}
          className={styles.form}
        >
          <div className={styles.formPreview}>
            <span className={styles.colorDot} style={{ background: addColor }} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t.name} *</label>
            <input name="name" required placeholder={t.namePlaceholder} className={styles.input} autoFocus />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t.color}</label>
            <ColorPalette selected={addColor} onSelect={setAddColor} />
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.btnPrimary}>{t.save}</button>
            <button type="button" className={styles.btnGhost} onClick={() => setAdding(false)}>✕</button>
          </div>
        </form>
      ) : (
        <button className={styles.addBtn} onClick={() => setAdding(true)}>
          + {t.addLevel}
        </button>
      )}
    </div>
  );
}
