import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PeopleList } from "@/features/people/components/PeopleList";

const people = [
  { id: "1", name: "Ana Souza" },
  { id: "2", name: "Érica Lima" },
  { id: "3", name: "João Rocha" },
];

function renderList() {
  const onRename = vi.fn().mockResolvedValue({ error: null });
  const onRemove = vi.fn().mockResolvedValue({ error: null });

  render(<PeopleList people={people} onRename={onRename} onRemove={onRemove} />);

  return { onRename, onRemove, user: userEvent.setup() };
}

describe("PeopleList", () => {
  it("começa recolhida e mostra a quantidade de membros", () => {
    renderList();

    const toggle = screen.getByRole("button", { name: /ver membros salvos/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveTextContent("3");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("abre a lista e filtra ignorando acentos", async () => {
    const { user } = renderList();

    await user.click(screen.getByRole("button", { name: /ver membros salvos/i }));
    await user.type(screen.getByRole("searchbox", { name: "Buscar membro na lista" }), "erica");

    const list = screen.getByRole("list", { name: "Membros salvos" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
    expect(within(list).getByText("Érica Lima")).toBeInTheDocument();
  });

  it("renomeia um membro no próprio lugar", async () => {
    const { user, onRename } = renderList();

    await user.click(screen.getByRole("button", { name: /ver membros salvos/i }));
    await user.click(screen.getByRole("button", { name: "Editar Ana Souza" }));

    const input = screen.getByRole("textbox", { name: "Novo nome de Ana Souza" });
    await user.clear(input);
    await user.type(input, "Ana Souza Lima{Enter}");

    expect(onRename).toHaveBeenCalledWith("1", "Ana Souza Lima");
  });

  it("só exclui depois da confirmação", async () => {
    const { user, onRemove } = renderList();

    await user.click(screen.getByRole("button", { name: /ver membros salvos/i }));
    await user.click(screen.getByRole("button", { name: "Excluir João Rocha" }));

    expect(onRemove).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Excluir membro?" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Excluir membro" }));

    expect(onRemove).toHaveBeenCalledWith("3");
  });
});
