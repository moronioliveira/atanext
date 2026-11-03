"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/components/meeting/meeting.module.css";

type WardSummary = {
  id: string;
  name: string;
  createdAt: string;
  activeMembers: number;
  pendingInvitations: number;
};

export default function WardsAdminPage() {
  const [wards, setWards] = useState<WardSummary[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWards() {
      const response = await fetch("/api/admin/wards");
      if (!response.ok) {
        setError("Não foi possível carregar as alas cadastradas.");
        return;
      }

      const body = await response.json();
      setWards(body.wards ?? []);
    }

    void loadWards();
  }, []);

  return (
    <main className={styles.appShell}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>A</div>
          <div>
            <p className={styles.eyebrow}>Administração</p>
            <h1>
              Atas<span>+</span>
            </h1>
          </div>
        </div>
        <Link className={styles.secondaryButton} href="/">
          Voltar para a aplicação
        </Link>
      </header>
      <section className={styles.workspace}>
        <p className={`${styles.eyebrow} ${styles.accent}`}>Visão geral</p>
        <h2 className={styles.pageTitle}>Alas cadastradas</h2>
        <p className={styles.muted}>
          Consulte o cadastro das alas sem acessar seus planejamentos.
        </p>
        {error && <p className={styles.formError}>{error}</p>}
        {!error && wards.length === 0 && (
          <p className={styles.notice}>Nenhuma ala cadastrada.</p>
        )}
        {wards.length > 0 && (
          <div className={styles.adminTableWrapper}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Ala</th>
                  <th>Criada em</th>
                  <th>Membros ativos</th>
                  <th>Convites pendentes</th>
                </tr>
              </thead>
              <tbody>
                {wards.map((ward) => (
                  <tr key={ward.id}>
                    <td>{ward.name}</td>
                    <td>{new Date(ward.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td>{ward.activeMembers}</td>
                    <td>{ward.pendingInvitations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
