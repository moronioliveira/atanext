import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MinutesDocument } from "@/features/minutes";
import { createEmptySunday } from "@/lib/meeting";

describe("MinutesDocument", () => {
  it("mostra a ala, a data e somente os campos preenchidos", () => {
    const schedule = {
      ...createEmptySunday(),
      presidida: "Ana Souza",
      hinoSacramental: "170 - Deus nos Rege com Amor",
    };

    render(
      <MinutesDocument
        schedule={schedule}
        sundayNumber={2}
        date={new Date(2026, 10, 8)}
        wardName="Ala Exemplo"
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Ala Exemplo" })).toBeInTheDocument();
    expect(screen.getByText(/8 de novembro de 2026/)).toBeInTheDocument();
    expect(screen.getByText("Presidida:")).toBeInTheDocument();
    expect(screen.queryByText("Dirigida:")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sacramento" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Encerramento" })).not.toBeInTheDocument();
    expect(screen.getByText(/sacramento será abençoado/)).toBeInTheDocument();
  });

  it("identifica a reunião de testemunhos no primeiro domingo", () => {
    render(
      <MinutesDocument
        schedule={createEmptySunday()}
        sundayNumber={1}
        date={null}
        wardName="Ala"
      />,
    );

    expect(screen.getByText("REUNIÃO DE TESTEMUNHOS")).toBeInTheDocument();
    expect(screen.getByText("Nenhum campo deste domingo foi preenchido.")).toBeInTheDocument();
  });
});
