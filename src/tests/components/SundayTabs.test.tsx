import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SundayTabs } from "@/features/planning/components/SundayTabs";
import { createEmptyMonth, getSundayDates } from "@/lib/meeting";

function renderTabs(selectedSunday = 0) {
  const schedules = createEmptyMonth();
  schedules[1] = { ...schedules[1], presidida: "Ana Souza" };
  const onSelect = vi.fn();

  render(
    <SundayTabs
      dates={getSundayDates("2026-11")}
      schedules={schedules}
      selectedSunday={selectedSunday}
      onSelect={onSelect}
    />,
  );

  return { onSelect, user: userEvent.setup() };
}

describe("SundayTabs", () => {
  it("mostra os cinco domingos com data e andamento", () => {
    renderTabs();

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(5);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveTextContent("01 de nov");
    expect(tabs[0]).toHaveTextContent("Não iniciado");
    expect(tabs[1]).toHaveTextContent("1 de 16");
  });

  it("navega entre os domingos com as setas do teclado", async () => {
    const { user, onSelect } = renderTabs(4);

    await user.click(screen.getAllByRole("tab")[4]);
    await user.keyboard("{ArrowRight}");

    expect(onSelect).toHaveBeenLastCalledWith(0);
  });
});
