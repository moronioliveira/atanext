import { NextResponse } from "next/server";
import { requireUser } from "@/lib/ward/membership";
import { listWardSummaries } from "@/lib/ward/ward-repository";

/** Resumo das alas cadastradas, sem acesso aos planejamentos. */
export async function GET() {
  const guard = await requireUser();

  if (!guard.ok) {
    return guard.response;
  }

  const wards = await listWardSummaries();

  return NextResponse.json({ wards });
}
