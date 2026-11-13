import type { Metadata } from "next";
import { WardPage } from "@/features/ward";

export const metadata: Metadata = {
  title: "Ala e membros",
};

// Depende da ala carregada no navegador pelo layout; veja (app)/layout.tsx.
export const instant = false;

export default function WardSettingsPage() {
  return <WardPage />;
}
