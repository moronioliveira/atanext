"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { hymns } from "@/data/hymns";
import { MinutesPreview } from "@/features/minutes";
import { usePeople } from "@/features/people";
import { useWard } from "@/features/ward";
import { getScheduleProgress } from "@/lib/meeting";
import type { MeetingRole, MonthKey } from "@/types/meeting";
import { usePlanner } from "../hooks/usePlanner";
import { MonthSwitcher } from "./MonthSwitcher";
import styles from "./Planner.module.css";
import { PlannerSidebar } from "./PlannerSidebar";
import { SundayEditor } from "./SundayEditor";
import { SundayTabs } from "./SundayTabs";

/**
 * Tela de planejamento: coordena mês, domingos, edição, gravação e a
 * prévia da ata. As regras ficam em `usePlanner`; aqui só há a montagem.
 */
export function PlannerPage() {
  const ward = useWard();
  const people = usePeople();
  const planner = usePlanner({ onPeopleAdded: people.mergePeople });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pendingMonth, setPendingMonth] = useState<MonthKey | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const progress = getScheduleProgress(planner.selectedSchedule, planner.sundayNumber);

  function getOptions(role: MeetingRole) {
    return role.input === "hymn" ? hymns : people.names;
  }

  function requestMonthChange(month: MonthKey) {
    if (planner.hasUnsavedChanges) {
      setPendingMonth(month);
      return;
    }

    planner.selectMonth(month);
  }

  function confirmMonthChange() {
    if (pendingMonth) {
      planner.selectMonth(pendingMonth);
    }

    setPendingMonth(null);
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Planejamento mensal"
        title="Designações dos domingos"
        description="Escolha o domingo, preencha as designações e salve. A ata fica pronta para imprimir a qualquer momento."
        actions={<MonthSwitcher month={planner.month} onChange={requestMonthChange} />}
      />

      <SundayTabs
        dates={planner.dates}
        schedules={planner.sundays}
        selectedSunday={planner.selectedSunday}
        onSelect={planner.selectSunday}
      />

      <div className={styles.workspace}>
        <SundayEditor
          sundayNumber={planner.sundayNumber}
          schedule={planner.selectedSchedule}
          loading={planner.loading}
          getOptions={getOptions}
          onChange={planner.updateRole}
        />
        <PlannerSidebar
          sundayNumber={planner.sundayNumber}
          date={planner.selectedDate}
          progress={progress}
          saving={planner.saving}
          disabled={planner.loading}
          hasUnsavedChanges={planner.hasUnsavedChanges}
          notice={planner.notice}
          onSave={() => void planner.save()}
          onPreview={() => setPreviewOpen(true)}
          onClear={() => setConfirmClear(true)}
        />
      </div>

      {previewOpen && (
        <MinutesPreview
          schedule={planner.selectedSchedule}
          sundayNumber={planner.sundayNumber}
          date={planner.selectedDate}
          wardName={ward.wardName}
          hasUnsavedChanges={planner.hasUnsavedChanges}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      <ConfirmDialog
        open={pendingMonth !== null}
        title="Trocar de mês sem salvar?"
        description="As alterações feitas neste mês ainda não foram salvas e serão descartadas."
        confirmLabel="Descartar e trocar"
        onConfirm={confirmMonthChange}
        onCancel={() => setPendingMonth(null)}
      />
      <ConfirmDialog
        open={confirmClear}
        title={`Limpar o domingo ${planner.sundayNumber}?`}
        description="Todos os campos deste domingo ficarão vazios. A mudança só é gravada quando você salvar."
        confirmLabel="Limpar campos"
        onConfirm={() => {
          planner.clearSunday();
          setConfirmClear(false);
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </PageContainer>
  );
}
