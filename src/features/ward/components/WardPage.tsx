"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { PeopleManager } from "@/features/people";
import { InvitationsManager } from "./InvitationsManager";
import { useWard } from "./WardShell";
import styles from "./WardPage.module.css";

/** Tela "Ala e membros": membros reutilizáveis e, para o líder, os administradores. */
export function WardPage() {
  const ward = useWard();
  const isLeader = ward.role === "leader";

  return (
    <PageContainer>
      <PageHeader
        eyebrow={ward.wardName}
        title="Ala e membros"
        description="Mantenha a lista de membros usada nas designações e controle quem pode acessar o planejamento."
      />
      <div className={isLeader ? styles.grid : styles.single}>
        <PeopleManager />
        {isLeader && <InvitationsManager />}
      </div>
    </PageContainer>
  );
}
