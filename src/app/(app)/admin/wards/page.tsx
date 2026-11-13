import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { WardSummaryTable } from "@/features/ward";

export const metadata: Metadata = {
  title: "Alas cadastradas",
};

// Depende da ala carregada no navegador pelo layout; veja (app)/layout.tsx.
export const instant = false;

export default function WardsAdminPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Visão geral"
        title="Alas cadastradas"
        description="Consulte o cadastro das alas sem acessar seus planejamentos."
      />
      <WardSummaryTable />
    </PageContainer>
  );
}
