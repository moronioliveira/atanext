import { PlannerPage } from "@/features/planning";

// Depende da ala carregada no navegador pelo layout; veja (app)/layout.tsx.
export const instant = false;

export default function HomePage() {
  return <PlannerPage />;
}
