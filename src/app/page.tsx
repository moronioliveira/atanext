"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MonthHeader } from "@/components/meeting/MonthHeader";
import { MonthProgress } from "@/components/meeting/MonthProgress";
import { PrintPreview } from "@/components/meeting/PrintPreview";
import { ScheduleEditor } from "@/components/meeting/ScheduleEditor";
import { SundayTabs } from "@/components/meeting/SundayTabs";
import styles from "@/components/meeting/meeting.module.css";
import { hymns } from "@/data/hymns";
import { filterSuggestions } from "@/lib/autocomplete";
import { authClient } from "@/lib/auth/client";
import { WardAccessPanel } from "@/components/ward/WardAccessPanel";
import { PeoplePanel } from "@/components/ward/PeoplePanel";
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
  const router = useRouter();
  const [month, setMonth] = useState("2026-11");
  const [selectedSunday, setSelectedSunday] = useState(0);
  const [sundays, setSundays] = useState<SundaySchedule[]>(createEmptyMonth);
  const [activeRole, setActiveRole] = useState<RoleKey | null>(null);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    async function loadPlan() {
      setLoading(true);
      const response = await fetch(`/api/plans?month=${month}`);

      if (response.status === 403) {
        router.push("/onboarding");
        return;
      }

      if (!response.ok) {
        setNotice("Não foi possível carregar o planejamento salvo.");
        setLoading(false);
        return;
      }

      const body = await response.json();

      if (active && body.plan?.sundays) {
        setSundays(body.plan.sundays);
      }
      if (active) {
        setLoading(false);
      }
    }

    void loadPlan();

    return () => {
      active = false;
    };
  }, [month, router]);

  const updateMembers = useCallback((nextMembers: string[]) => {
    setMembers(nextMembers);
  }, []);

  const dates = useMemo(() => getSundayDates(month), [month]);
  const selectedData = sundays[selectedSunday];
  const completedSundays = sundays.filter(hasScheduleContent).length;

  function getSuggestions(roleKey: RoleKey) {
    if (activeRole !== roleKey || search.length < 2) {
      return [];
    }

    const source = isHymnRole(roleKey) ? hymns : members;

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

  async function saveDraft() {
    setSaving(true);
    setNotice("");

    const response = await fetch("/api/plans", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, sundays }),
    });

    setSaving(false);

    if (!response.ok) {
      setNotice("Não foi possível salvar. Seus dados continuam na tela.");
      return;
    }

    setNotice("Planejamento salvo com sucesso.");
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
          <span className={styles.statusDot}>Dados salvos na ala</span>
          <button
            className={styles.avatar}
            aria-label="Sair"
            onClick={() => void authClient.signOut().then(() => router.push("/auth/sign-in"))}
          >
            Sair
          </button>
        </div>
      </header>

      <section className={`${styles.workspace} ${styles.noPrint}`}>
        {loading && <p className={styles.loadingNotice}>Carregando planejamento salvo...</p>}
        <MonthHeader month={month} onMonthChange={setMonth} />
        <MonthProgress completedSundays={completedSundays} />
        <PeoplePanel onPeopleChange={updateMembers} />
        <WardAccessPanel />
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
            onSave={() => void saveDraft()}
            notice={saving ? "Salvando..." : notice}
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
