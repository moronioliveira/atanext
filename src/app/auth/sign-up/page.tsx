import type { Metadata } from "next";
import { Suspense } from "react";
import { SignUpForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default function SignUpPage() {
  // O formulário lê o e-mail do convite na URL (useSearchParams).
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
