import type { Metadata } from "next";
import { OnboardingPanel } from "@/features/ward";

export const metadata: Metadata = {
  title: "Primeiro acesso",
};

export default function OnboardingPage() {
  return <OnboardingPanel />;
}
