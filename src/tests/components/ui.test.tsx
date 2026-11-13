import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TextField } from "@/components/ui/TextField";
import { getSignUpErrorMessage } from "@/features/auth";

describe("Logo", () => {
  it("expõe o nome do produto para leitores de tela", () => {
    render(<Logo />);

    expect(screen.getByText("Atas+")).toBeInTheDocument();
  });
});

describe("Button", () => {
  it("fica desabilitado e ocupado enquanto carrega", () => {
    render(<Button loading>Salvar</Button>);

    const button = screen.getByRole("button", { name: "Salvar" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });
});

describe("TextField", () => {
  it("liga label, dica e erro ao campo", () => {
    render(<TextField label="E-mail" hint="Use o e-mail do convite." error="E-mail inválido." />);

    const input = screen.getByRole("textbox", { name: "E-mail" });
    expect(input).toHaveAccessibleDescription("Use o e-mail do convite. E-mail inválido.");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });
});

describe("ConfirmDialog", () => {
  it("exige digitar o texto de confirmação antes de liberar a ação", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        open
        title="Excluir a ala?"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir definitivamente"
        requiredText="Ala Centro"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );

    const confirm = screen.getByRole("button", { name: "Excluir definitivamente" });
    expect(confirm).toBeDisabled();

    await user.type(
      screen.getByRole("textbox", { name: 'Digite "Ala Centro" para confirmar' }),
      "Ala Centro",
    );
    await user.click(confirm);

    expect(onConfirm).toHaveBeenCalledOnce();
  });
});

describe("getSignUpErrorMessage", () => {
  it("traduz os erros do cadastro", () => {
    expect(getSignUpErrorMessage({ code: "USER_ALREADY_EXISTS" })).toMatch(/já está cadastrado/);
    expect(getSignUpErrorMessage({ status: 400 })).toMatch(/Confira seu nome/);
    expect(getSignUpErrorMessage({})).toMatch(/Não foi possível criar a conta/);
  });
});

describe("DeveloperCredit", () => {
  it("credita a Solid Solutions com link para o site do estúdio", async () => {
    const { DeveloperCredit } = await import("@/components/layout/DeveloperCredit");

    render(<DeveloperCredit />);

    expect(screen.getByRole("link", { name: "Solid Solutions" })).toHaveAttribute(
      "href",
      "https://solidsolutionsdigital.com.br",
    );
  });
});
