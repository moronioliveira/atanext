import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { meetingRoles } from "@/data/meeting-roles";
import { RoleField } from "@/features/planning/components/RoleField";
import type { MeetingRole } from "@/types/meeting";

const presidida = meetingRoles.find((role) => role.key === "presidida") as MeetingRole;
const anuncios = meetingRoles.find((role) => role.key === "anuncios") as MeetingRole;
const members = ["Ana Souza", "Mariana Rocha", "João Lima"];

function ControlledField({ role }: { role: MeetingRole }) {
  const [value, setValue] = useState("");

  return <RoleField role={role} value={value} options={members} onChange={setValue} />;
}

describe("RoleField", () => {
  it("sugere membros enquanto o usuário digita", async () => {
    const user = userEvent.setup();
    render(<ControlledField role={presidida} />);

    await user.type(screen.getByRole("combobox", { name: "Presidida" }), "ana");

    const options = screen.getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual(["Ana Souza", "Mariana Rocha"]);
  });

  it("permite escolher a sugestão pelo teclado", async () => {
    const user = userEvent.setup();
    render(<ControlledField role={presidida} />);
    const input = screen.getByRole("combobox", { name: "Presidida" });

    await user.type(input, "ana");
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");

    expect(input).toHaveValue("Mariana Rocha");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("fecha as sugestões com Esc", async () => {
    const user = userEvent.setup();
    render(<ControlledField role={presidida} />);

    await user.type(screen.getByRole("combobox", { name: "Presidida" }), "jo");
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("usa campo de várias linhas para textos livres", () => {
    render(<ControlledField role={anuncios} />);

    expect(screen.getByRole("textbox", { name: "Anúncios" }).tagName).toBe("TEXTAREA");
  });
});
