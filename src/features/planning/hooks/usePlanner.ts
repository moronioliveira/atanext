"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { requestJson } from "@/lib/api/client";
import { createEmptyMonth, createEmptySunday, getSaveNotice, getSundayDates } from "@/lib/meeting";
import type { MonthKey, RoleKey, SundaySchedule } from "@/types/meeting";
import type { Person } from "@/types/people";
import { useInitialSunday } from "./useInitialSunday";

export type PlannerNotice = {
  tone: "success" | "error" | "info";
  text: string;
};

type PlanResponse = {
  plan: { sundays: SundaySchedule[] } | null;
};

type SaveResponse = {
  addedPeople?: Person[];
};

type UsePlannerOptions = {
  /** Chamado com os membros cadastrados automaticamente ao salvar. */
  onPeopleAdded: (people: Person[]) => void;
};

function serialize(sundays: SundaySchedule[]) {
  return JSON.stringify(sundays);
}

/**
 * Estado e regras do planejamento mensal: qual mês e domingo estão
 * abertos, carregamento do que está salvo, edição, alterações pendentes
 * e gravação. Não contém nada de apresentação.
 */
export function usePlanner({ onPeopleAdded }: UsePlannerOptions) {
  // Até o usuário escolher outro mês ou domingo, a tela abre no próximo
  // domingo do calendário. `month` fica nulo até a data do navegador ser lida.
  const initialSunday = useInitialSunday();
  const [chosenMonth, setChosenMonth] = useState<MonthKey | null>(null);
  const [chosenSunday, setChosenSunday] = useState<number | null>(null);
  const month = chosenMonth ?? initialSunday?.month ?? null;
  const selectedSunday = chosenSunday ?? initialSunday?.sundayIndex ?? 0;

  const [sundays, setSundays] = useState<SundaySchedule[]>(createEmptyMonth);
  const [savedSnapshot, setSavedSnapshot] = useState(() => serialize(createEmptyMonth()));
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<PlannerNotice | null>(null);

  useEffect(() => {
    if (!month) {
      return;
    }

    let active = true;

    async function loadPlan(planMonth: MonthKey) {
      // Limpa o mês anterior para que ele não apareça (nem seja salvo) no
      // mês novo enquanto o planejamento carrega.
      const emptyMonth = createEmptyMonth();

      setSundays(emptyMonth);
      setSavedSnapshot(serialize(emptyMonth));
      setLoadFailed(false);
      setLoading(true);

      const result = await requestJson<PlanResponse>(`/api/plans?month=${planMonth}`, {
        fallbackError: "Não foi possível carregar o planejamento salvo.",
      });

      if (!active) {
        return;
      }

      if (!result.ok) {
        setNotice({ tone: "error", text: result.error });
        setLoadFailed(true);
        setLoading(false);
        return;
      }

      const loadedSundays = result.data.plan?.sundays ?? emptyMonth;

      setSundays(loadedSundays);
      setSavedSnapshot(serialize(loadedSundays));
      setLoading(false);
    }

    void loadPlan(month);

    return () => {
      active = false;
    };
  }, [month]);

  const hasUnsavedChanges = serialize(sundays) !== savedSnapshot;

  // Avisa antes de fechar a aba com alterações não salvas.
  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    function warnBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", warnBeforeUnload);

    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [hasUnsavedChanges]);

  const dates = useMemo(() => (month ? getSundayDates(month) : []), [month]);

  const selectMonth = useCallback((nextMonth: MonthKey) => {
    setNotice(null);
    setChosenMonth(nextMonth);
  }, []);

  const selectSunday = useCallback((index: number) => {
    setChosenSunday(index);
  }, []);

  const updateRole = useCallback(
    (roleKey: RoleKey, value: string) => {
      setSundays((current) =>
        current.map((sunday, index) =>
          index === selectedSunday ? { ...sunday, [roleKey]: value } : sunday,
        ),
      );
    },
    [selectedSunday],
  );

  const clearSunday = useCallback(() => {
    setSundays((current) =>
      current.map((sunday, index) => (index === selectedSunday ? createEmptySunday() : sunday)),
    );
  }, [selectedSunday]);

  async function save() {
    if (!month || loading) {
      return;
    }

    // Sem o planejamento carregado, salvar sobrescreveria o mês com campos vazios.
    if (loadFailed) {
      setNotice({
        tone: "error",
        text: "O planejamento deste mês não foi carregado. Recarregue a página antes de salvar.",
      });
      return;
    }

    setSaving(true);
    setNotice(null);

    const result = await requestJson<SaveResponse>("/api/plans", {
      method: "PUT",
      body: { month, sundays },
      fallbackError: "Não foi possível salvar. Seus dados continuam na tela.",
    });

    setSaving(false);

    if (!result.ok) {
      setNotice({ tone: "error", text: result.error });
      return;
    }

    const addedPeople = result.data.addedPeople ?? [];

    setSavedSnapshot(serialize(sundays));
    onPeopleAdded(addedPeople);
    setNotice({ tone: "success", text: getSaveNotice(addedPeople.length) });
  }

  return {
    month,
    selectedSunday,
    sundayNumber: selectedSunday + 1,
    sundays,
    selectedSchedule: sundays[selectedSunday],
    selectedDate: dates[selectedSunday] ?? null,
    dates,
    loading: loading || !month,
    saving,
    notice,
    hasUnsavedChanges,
    selectMonth,
    selectSunday,
    updateRole,
    clearSunday,
    save,
  };
}

export type PlannerState = ReturnType<typeof usePlanner>;
