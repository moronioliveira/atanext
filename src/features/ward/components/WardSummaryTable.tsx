"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Card, CardHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { requestJson } from "@/lib/api/client";
import type { WardSummary } from "@/types/ward";
import styles from "./WardPanels.module.css";

function formatCreatedAt(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

/** Resumo de todas as alas cadastradas, sem acesso aos planejamentos. */
export function WardSummaryTable() {
  const [wards, setWards] = useState<WardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    void requestJson<{ wards: WardSummary[] }>("/api/admin/wards", {
      fallbackError: "Não foi possível carregar as alas cadastradas.",
    }).then((result) => {
      if (!active) {
        return;
      }

      if (result.ok) {
        setWards(result.data.wards ?? []);
      } else {
        setError(result.error);
      }

      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <Card>
      <CardHeader
        title="Alas cadastradas"
        description={loading ? undefined : `${wards.length} ala(s) no sistema.`}
      />
      {loading && <Spinner label="Carregando alas" />}
      {error && <Alert tone="error">{error}</Alert>}
      {!loading && !error && wards.length === 0 && (
        <p className={styles.empty}>Nenhuma ala cadastrada.</p>
      )}
      {wards.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Ala</th>
                <th scope="col">Criada em</th>
                <th scope="col">Membros ativos</th>
                <th scope="col">Convites pendentes</th>
              </tr>
            </thead>
            <tbody>
              {wards.map((ward) => (
                <tr key={ward.id}>
                  <td>{ward.name}</td>
                  <td className={styles.number}>{formatCreatedAt(ward.createdAt)}</td>
                  <td className={styles.number}>{ward.activeMembers}</td>
                  <td className={styles.number}>{ward.pendingInvitations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
