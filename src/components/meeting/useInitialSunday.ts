"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getNextSundaySelection,
  type SundaySelection,
} from "@/lib/meeting-utils";

function subscribe() {
  return () => {};
}

function getTodayKey() {
  const today = new Date();

  return [
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  ].join("-");
}

function getServerTodayKey() {
  return null;
}

function parseTodayKey(todayKey: string) {
  const [year, month, day] = todayKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

/**
 * Domingo em que a tela deve abrir: o próximo domingo pela data do
 * navegador. A página é pré-renderizada no build, então a data só é lida
 * no cliente; durante a renderização no servidor o valor é `null`.
 */
export function useInitialSunday(): SundaySelection | null {
  const todayKey = useSyncExternalStore(
    subscribe,
    getTodayKey,
    getServerTodayKey,
  );

  return useMemo(
    () => (todayKey ? getNextSundaySelection(parseTodayKey(todayKey)) : null),
    [todayKey],
  );
}
