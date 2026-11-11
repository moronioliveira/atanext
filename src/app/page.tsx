"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MonthHeader } from "@/components/meeting/MonthHeader";
import { MonthProgress } from "@/components/meeting/MonthProgress";
import { PrintPreview } from "@/components/meeting/PrintPreview";
import { ScheduleEditor } from "@/components/meeting/ScheduleEditor";
import { SundayTabs } from "@/components/meeting/SundayTabs";
import { useInitialSunday } from "@/components/meeting/useInitialSunday";
import styles from "@/components/meeting/meeting.module.css";
import { hymns } from "@/data/hymns";
import { filterSuggestions } from "@/lib/autocomplete";
import { WardAccessPanel } from "@/components/ward/WardAccessPanel";
import { PeoplePanel } from "@/components/ward/PeoplePanel";
import { usePeople } from "@/components/ward/usePeople";
import { WardAccountMenu } from "@/components/ward/WardAccountMenu";
import {
  createEmptyMonth,
  createEmptySunday,
  getSaveNotice,
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
  // Até o usuário escolher outro mês ou domingo, a tela abre no próximo
  // domingo do calendário. `month` fica nulo até a data do navegador ser lida.
  const initialSunday = useInitialSunday();
  const [chosenMonth, setChosenMonth] = useState<string | null>(null);
  const [chosenSunday, setChosenSunday] = useState<number | null>(null);
  const month = chosenMonth ?? initialSunday?.month ?? null;
  const selectedSunday = chosenSunday ?? initialSunday?.sundayIndex ?? 0;
  const [sundays, setSundays] = useState<SundaySchedule[]>(createEmptyMonth);
  const [activeRole, setActiveRole] = useState<RoleKey | null>(null);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const peopleStore = usePeople();
  const [ward, setWard] = useState<{
    wardName: string;
    role: "leader" | "administrator";
  } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadWard() {
      const response = await fetch("/api/wards");

      if (!response.ok) {
        return;
      }

      const body = await response.json();
      if (active && body.ward) {
        setWard(body.ward);
      }
    }

    async function loadPlan(planMonth: string) {
      // Limpa os dados do mês anterior para que eles não apareçam (nem
      // sejam salvos) no mês novo enquanto o planejamento carrega ou
      // quando o mês ainda não tem planejamento salvo.
      setSundays(createEmptyMonth());
      setLoadFailed(false);
      setLoading(true);
      const response = await fetch(`/api/plans?month=${planMonth}`);

      if (response.status === 403) {
        router.push("/onboarding");
        return;
      }

      if (!response.ok) {
        if (active) {
          setNotice("Não foi possível carregar o planejamento salvo.");
          setLoadFailed(true);
          setLoading(false);
        }
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

    void loadWard();

    if (month) {
      void loadPlan(month);
    }

    return () => {
      active = false;
    };
  }, [month, router]);

  const dates = useMemo(() => (month ? getSundayDates(month) : []), [month]);
  const selectedData = sundays[selectedSunday];
  const completedSundays = sundays.filter(hasScheduleContent).length;

  function getSuggestions(roleKey: RoleKey) {
    if (activeRole !== roleKey || search.length < 2) {
      return [];
    }

    const source = isHymnRole(roleKey) ? hymns : peopleStore.names;

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
    setChosenSunday(index);
    setActiveRole(null);
    setSearch("");
  }

  async function saveDraft() {
    if (!month || loading) {
      return;
    }

    // Sem o planejamento carregado, salvar sobrescreveria o mês com campos vazios.
    if (loadFailed) {
      setNotice(
        "O planejamento deste mês não foi carregado. Recarregue a página antes de salvar.",
      );
      return;
    }

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

    const body = await response.json();
    const addedPeople = Array.isArray(body.addedPeople) ? body.addedPeople : [];

    peopleStore.mergePeople(addedPeople);
    setNotice(getSaveNotice(addedPeople.length));
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
          {ward && (
            <WardAccountMenu wardName={ward.wardName} role={ward.role} />
          )}
        </div>
      </header>

      <section className={`${styles.workspace} ${styles.noPrint}`}>
        {loading && <p className={styles.loadingNotice}>Carregando planejamento salvo...</p>}
        <MonthHeader month={month ?? ""} onMonthChange={setChosenMonth} />
        <MonthProgress completedSundays={completedSundays} />
        <PeoplePanel store={peopleStore} />
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
