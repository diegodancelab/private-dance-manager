"use client";

import { useState, useTransition } from "react";
import {
  updateProgramme,
  deleteProgramme,
  createSection,
  updateSection,
  deleteSection,
  createItem,
  updateItem,
  deleteItem,
} from "@/features/programmes/actions";
import type { ProgrammeDetail } from "@/features/programmes/queries";
import styles from "./ProgrammeEditor.module.css";

type T = {
  name: string; level: string; danceStyle: string; description: string;
  namePlaceholder: string; levelPlaceholder: string; danceStylePlaceholder: string; descriptionPlaceholder: string;
  save: string; editProgramme: string; deleteProgramme: string;
  addSection: string; sectionTitle: string; sectionTitlePlaceholder: string;
  sectionSubtitle: string; sectionSubtitlePlaceholder: string;
  sectionDescription: string; sectionDescriptionPlaceholder: string;
  deleteSection: string;
  addItem: string; itemName: string; itemNameAlt: string;
  itemNamePlaceholder: string; itemNameAltPlaceholder: string;
  itemDescription: string; optional: string; mandatory: string; deleteItem: string;
  noSections: string;
};

type Props = { programme: ProgrammeDetail; t: T };

export default function ProgrammeEditor({ programme, t }: Props) {
  const [, startTransition] = useTransition();
  const [editingMeta, setEditingMeta] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(programme.sections.map((s) => s.id)));
  const [addingSection, setAddingSection] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [addingItemInSection, setAddingItemInSection] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  function toggleSection(id: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className={styles.root}>
      {/* ── Programme metadata ─────────────────────────────────────── */}
      <div className={styles.metaCard}>
        {editingMeta ? (
          <form
            action={(fd) => {
              fd.append("id", programme.id);
              startTransition(() => updateProgramme(fd));
              setEditingMeta(false);
            }}
            className={styles.metaForm}
          >
            <div className={styles.field}>
              <label className={styles.label}>{t.name} *</label>
              <input name="name" required defaultValue={programme.name} placeholder={t.namePlaceholder} className={styles.input} />
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>{t.danceStyle}</label>
                <input name="danceStyle" defaultValue={programme.danceStyle ?? ""} placeholder={t.danceStylePlaceholder} className={styles.input} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{t.level}</label>
                <input name="level" defaultValue={programme.level ?? ""} placeholder={t.levelPlaceholder} className={styles.input} />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t.description}</label>
              <textarea name="description" defaultValue={programme.description ?? ""} placeholder={t.descriptionPlaceholder} rows={2} className={styles.textarea} />
            </div>
            <div className={styles.metaActions}>
              <button type="submit" className={styles.btnPrimary}>{t.save}</button>
              <button type="button" className={styles.btnGhost} onClick={() => setEditingMeta(false)}>✕</button>
            </div>
          </form>
        ) : (
          <div className={styles.metaView}>
            <div className={styles.metaText}>
              {programme.description && <p className={styles.metaDesc}>{programme.description}</p>}
            </div>
            <div className={styles.metaActions}>
              <button className={styles.btnGhost} onClick={() => setEditingMeta(true)}>{t.editProgramme}</button>
              <form action={(fd) => { fd.append("id", programme.id); startTransition(() => deleteProgramme(fd)); }}>
                <button type="submit" className={styles.btnDanger}
                  onClick={(e) => { if (!confirm(`Supprimer "${programme.name}" ?`)) e.preventDefault(); }}>
                  {t.deleteProgramme}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ── Sections ────────────────────────────────────────────────── */}
      <div className={styles.sectionsBlock}>
        {programme.sections.length === 0 && (
          <p className={styles.empty}>{t.noSections}</p>
        )}

        {programme.sections.map((section) => {
          const expanded = expandedSections.has(section.id);
          const isEditingSection = editingSection === section.id;

          return (
            <div key={section.id} className={styles.sectionCard}>
              {/* Section header */}
              <div className={styles.sectionHeader}>
                <button className={styles.sectionToggle} onClick={() => toggleSection(section.id)}>
                  <span className={styles.chevron}>{expanded ? "▼" : "▶"}</span>
                  <span className={styles.sectionTitle}>{section.title}</span>
                  {section.subtitle && <span className={styles.sectionSub}>{section.subtitle}</span>}
                  <span className={styles.itemCount}>{section.items.length}</span>
                </button>
                <div className={styles.sectionActions}>
                  <button className={styles.btnXS} onClick={() => setEditingSection(isEditingSection ? null : section.id)}>
                    ✏️
                  </button>
                  <form action={(fd) => { fd.append("id", section.id); fd.append("programmeId", programme.id); startTransition(() => deleteSection(fd)); }}>
                    <button type="submit" className={styles.btnXSDanger}
                      onClick={(e) => { if (!confirm(`Supprimer "${section.title}" ?`)) e.preventDefault(); }}>
                      ✕
                    </button>
                  </form>
                </div>
              </div>

              {/* Section edit form */}
              {isEditingSection && (
                <form
                  action={(fd) => { fd.append("id", section.id); fd.append("programmeId", programme.id); startTransition(() => updateSection(fd)); setEditingSection(null); }}
                  className={styles.sectionEditForm}
                >
                  <div className={styles.field}>
                    <label className={styles.label}>{t.sectionTitle} *</label>
                    <input name="title" required defaultValue={section.title} placeholder={t.sectionTitlePlaceholder} className={styles.input} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>{t.sectionDescription}</label>
                    <textarea name="description" defaultValue={section.description ?? ""} placeholder={t.sectionDescriptionPlaceholder} rows={2} className={styles.textarea} />
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button type="submit" className={styles.btnPrimary}>{t.save}</button>
                    <button type="button" className={styles.btnGhost} onClick={() => setEditingSection(null)}>✕</button>
                  </div>
                </form>
              )}

              {/* Items */}
              {expanded && (
                <div className={styles.itemsList}>
                  {section.items.map((item) => {
                    const isEditingItem = editingItem === item.id;
                    return (
                      <div key={item.id} className={styles.itemRow}>
                        {isEditingItem ? (
                          <form
                            action={(fd) => { fd.append("id", item.id); fd.append("sectionId", section.id); fd.append("programmeId", programme.id); startTransition(() => updateItem(fd)); setEditingItem(null); }}
                            className={styles.itemEditForm}
                          >
                            <div className={styles.row}>
                              <div className={styles.field} style={{ flex: 1 }}>
                                <label className={styles.label}>{t.itemName} *</label>
                                <input name="name" required defaultValue={item.name} placeholder={t.itemNamePlaceholder} className={styles.input} />
                              </div>
                              <div className={styles.field} style={{ flex: 1 }}>
                                <label className={styles.label}>{t.itemNameAlt}</label>
                                <input name="nameAlt" defaultValue={item.nameAlt ?? ""} placeholder={t.itemNameAltPlaceholder} className={styles.input} />
                              </div>
                            </div>
                            <div className={styles.field}>
                              <label className={styles.label}>{t.itemDescription}</label>
                              <input name="description" defaultValue={item.description ?? ""} placeholder={t.itemDescription} className={styles.input} />
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                              <label className={styles.checkLabel}>
                                <input type="checkbox" name="isMandatory" defaultChecked={item.isMandatory} onChange={(e) => { const fd = e.target.form!; const hidden = fd.querySelector('input[name="isMandatory"]') as HTMLInputElement | null; if (hidden) hidden.value = e.target.checked ? "true" : "false"; }} />
                                {t.mandatory}
                              </label>
                              <button type="submit" className={styles.btnPrimary}>{t.save}</button>
                              <button type="button" className={styles.btnGhost} onClick={() => setEditingItem(null)}>✕</button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className={styles.itemContent}>
                              <span className={styles.itemName}>{item.name}</span>
                              {item.nameAlt && <span className={styles.itemNameAlt}>{item.nameAlt}</span>}
                              {!item.isMandatory && <span className={styles.optionalBadge}>{t.optional}</span>}
                            </div>
                            <div className={styles.itemActions}>
                              <button className={styles.btnXS} onClick={() => setEditingItem(item.id)}>✏️</button>
                              <form action={(fd) => { fd.append("id", item.id); fd.append("sectionId", section.id); fd.append("programmeId", programme.id); startTransition(() => deleteItem(fd)); }}>
                                <button type="submit" className={styles.btnXSDanger}>✕</button>
                              </form>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}

                  {/* Add item form */}
                  {addingItemInSection === section.id ? (
                    <form
                      action={(fd) => { fd.append("sectionId", section.id); fd.append("programmeId", programme.id); startTransition(() => createItem(fd)); setAddingItemInSection(null); }}
                      className={styles.addItemForm}
                    >
                      <div className={styles.row}>
                        <div className={styles.field} style={{ flex: 1 }}>
                          <label className={styles.label}>{t.itemName} *</label>
                          <input name="name" required placeholder={t.itemNamePlaceholder} className={styles.input} autoFocus />
                        </div>
                        <div className={styles.field} style={{ flex: 1 }}>
                          <label className={styles.label}>{t.itemNameAlt}</label>
                          <input name="nameAlt" placeholder={t.itemNameAltPlaceholder} className={styles.input} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button type="submit" className={styles.btnPrimary}>{t.save}</button>
                        <button type="button" className={styles.btnGhost} onClick={() => setAddingItemInSection(null)}>✕</button>
                      </div>
                    </form>
                  ) : (
                    <button className={styles.addItemBtn} onClick={() => { setAddingItemInSection(section.id); if (!expanded) toggleSection(section.id); }}>
                      {t.addItem}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add section form */}
        {addingSection ? (
          <form
            action={(fd) => { fd.append("programmeId", programme.id); startTransition(() => createSection(fd)); setAddingSection(false); }}
            className={styles.addSectionForm}
          >
            <div className={styles.field}>
              <label className={styles.label}>{t.sectionTitle} *</label>
              <input name="title" required placeholder={t.sectionTitlePlaceholder} className={styles.input} autoFocus />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t.sectionDescription}</label>
              <textarea name="description" placeholder={t.sectionDescriptionPlaceholder} rows={2} className={styles.textarea} />
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="submit" className={styles.btnPrimary}>{t.save}</button>
              <button type="button" className={styles.btnGhost} onClick={() => setAddingSection(false)}>✕</button>
            </div>
          </form>
        ) : (
          <button className={styles.addSectionBtn} onClick={() => setAddingSection(true)}>
            + {t.addSection}
          </button>
        )}
      </div>
    </div>
  );
}
