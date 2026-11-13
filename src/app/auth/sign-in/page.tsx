import type { Metadata } from "next";
import { SignInForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function SignInPage() {
  return <SignInForm />;
}
