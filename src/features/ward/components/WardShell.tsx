"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { FullPageStatus } from "@/components/layout/FullPageStatus";
import { Button } from "@/components/ui/Button";
import type { WardMembership } from "@/types/ward";
import { useCurrentWard } from "../hooks/useCurrentWard";
import { AccountMenu } from "./AccountMenu";

const WardContext = createContext<WardMembership | null>(null);

/** Ala do usuário logado. Disponível em qualquer tela dentro do `WardShell`. */
export function useWard() {
  const ward = useContext(WardContext);

  if (!ward) {
    throw new Error("useWard precisa ser usado dentro de <WardShell>.");
  }

  return ward;
}

type WardShellProps = {
  children: ReactNode;
};

/**
 * Moldura das telas internas: identifica a ala, redireciona para o login
 * ou para o primeiro acesso quando necessário e mostra o cabeçalho.
 */
export function WardShell({ children }: WardShellProps) {
  const router = useRouter();
  const { state, retry } = useCurrentWard();

  useEffect(() => {
    if (state.status === "signedOut") {
      router.replace("/auth/sign-in");
    }

    if (state.status === "withoutWard") {
      router.replace("/onboarding");
    }
  }, [router, state.status]);

  if (state.status === "error") {
    return (
      <FullPageStatus
        loading={false}
        message={state.message}
        action={
          <Button variant="secondary" onClick={retry}>
            Tentar novamente
          </Button>
        }
      />
    );
  }

  if (state.status !== "ready") {
    return <FullPageStatus message="Carregando sua ala..." />;
  }

  return (
    <WardContext.Provider value={state.ward}>
      <div className="flex min-h-screen flex-col">
        <AppHeader account={<AccountMenu ward={state.ward} />} />
        {children}
        <AppFooter />
      </div>
    </WardContext.Provider>
  );
}
