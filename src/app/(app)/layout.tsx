import { WardShell } from "@/features/ward";

/*
 * As telas internas dependem da sessão e da ala do usuário, carregadas no
 * navegador pelo WardShell (que mostra um carregamento até a ala chegar).
 * Por isso a navegação para elas pode aguardar esses dados: `instant = false`
 * informa ao Next.js que isso é esperado. A validação é feita por segmento,
 * então cada página interna também declara `instant = false`; sem isso o
 * Next.js mostra o aviso "segment dropped from rendering".
 */
export const instant = false;

/** Telas internas: exigem login e uma ala; compartilham cabeçalho e rodapé. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return <WardShell>{children}</WardShell>;
}
