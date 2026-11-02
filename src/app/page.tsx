"use client";

import { useMemo, useState } from "react";
import { MonthHeader } from "@/components/meeting/MonthHeader";
import { MonthProgress } from "@/components/meeting/MonthProgress";
import { PrintPreview } from "@/components/meeting/PrintPreview";
import { ScheduleEditor } from "@/components/meeting/ScheduleEditor";
import { SundayTabs } from "@/components/meeting/SundayTabs";
import styles from "@/components/meeting/meeting.module.css";
import { demoMembers } from "@/data/demo-members";
import { hymns } from "@/data/hymns";
import { filterSuggestions } from "@/lib/autocomplete";
import {
  createEmptyMonth,
  createEmptySunday,
  getSundayDates,
  hasScheduleContent,
} from "@/lib/meeting-utils";
import {
  isHymnRole,
  type RoleKey,
  type SundaySchedule,
} from "@/types/meeting";

export default function Home() {
  const [month, setMonth] = useState("2026-11");
  const [selectedSunday, setSelectedSunday] = useState(0);
  const [sundays, setSundays] = useState<SundaySchedule[]>(createEmptyMonth);
  const [activeRole, setActiveRole] = useState<RoleKey | null>(null);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(false);
  const [notice, setNotice] = useState("");

  const dates = useMemo(() => getSundayDates(month), [month]);
  const selectedData = sundays[selectedSunday];
  const completedSundays = sundays.filter(hasScheduleContent).length;

  function getSuggestions(roleKey: RoleKey) {
    if (activeRole !== roleKey || search.length < 2) {
      return [];
    }

    const source = isHymnRole(roleKey) ? hymns : demoMembers;

    return filterSuggestions(source, search);
  }

  function updateRole(roleKey: RoleKey, value: string) {
    setSundays((current) =>
      current.map((sunday, index) =>
        index === selectedSunday
          ? { ...sunday, [roleKey]: value }
          : sunday,
      ),
    );
    setActiveRole(roleKey);
    setSearch(value);
  }

  function focusRole(roleKey: RoleKey, value: string) {
    setActiveRole(roleKey);
    setSearch(value);
  }

  function selectSunday(index: number) {
    setSelectedSunday(index);
    setActiveRole(null);
    setSearch("");
  }

  function saveDraft() {
    setNotice("Rascunho atualizado neste protótipo.");
    window.setTimeout(() => setNotice(""), 3000);
  }

  function clearSunday() {
    setSundays((current) =>
      current.map((sunday, index) =>
        index === selectedSunday ? createEmptySunday() : sunday,
      ),
    );
    setActiveRole(null);
    setSearch("");
  }

  return (
    <main className={styles.appShell}>
      <header className={`${styles.topbar} ${styles.noPrint}`}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>A</div>
          <div>
            <p className={styles.eyebrow}>Organização de reuniões</p>
            <h1>
              Atas<span>+</span>
            </h1>
          </div>
        </div>
        <div className={styles.topbarActions}>
          <span className={styles.statusDot}>Protótipo local</span>
          <button className={styles.avatar} aria-label="Perfil">
            MO
          </button>
        </div>
      </header>

      <section className={`${styles.workspace} ${styles.noPrint}`}>
        <MonthHeader month={month} onMonthChange={setMonth} />
        <MonthProgress completedSundays={completedSundays} />
        <SundayTabs
          dates={dates}
          schedules={sundays}
          selectedSunday={selectedSunday}
          onSelect={selectSunday}
        />

        <div className={styles.editorGrid}>
          <ScheduleEditor
            sundayNumber={selectedSunday + 1}
            schedule={selectedData}
            suggestions={getSuggestions}
            onChange={updateRole}
            onFocus={(roleKey, event) =>
              focusRole(roleKey, event.currentTarget.value)
            }
            onSelect={updateRole}
            onClear={clearSunday}
            onPreview={() => setPreview(true)}
            onSave={saveDraft}
            notice={notice}
          />
        </div>
      </section>

      {preview && (
        <PrintPreview
          data={selectedData}
          date={dates[selectedSunday] ?? null}
          sunday={selectedSunday + 1}
          onClose={() => setPreview(false)}
        />
      )}
    </main>
  );
}
