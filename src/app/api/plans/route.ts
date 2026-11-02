import { NextResponse } from "next/server";
import { assertAuthConfiguration, auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { getCurrentMembership } from "@/lib/ward";
import type { SundaySchedule } from "@/types/meeting";
import { meetingRoles } from "@/types/meeting";

function isValidSchedule(value: unknown): value is SundaySchedule {
  if (!value || typeof value !== "object") {
    return false;
  }

  const schedule = value as Record<string, unknown>;
  return meetingRoles.every(
    ({ key }) =>
      typeof schedule[key] === "string" && schedule[key].length <= 500,
  );
}

export async function GET(request: Request) {
  assertAuthConfiguration();
  const membership = await getCurrentMembership();

  if (!membership) {
    return NextResponse.json({ error: "Ala não encontrada." }, { status: 403 });
  }

  const month = new URL(request.url).searchParams.get("month");
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Mês inválido." }, { status: 400 });
  }

  const rows = await sql`
    SELECT id, sundays, updated_at AS "updatedAt"
    FROM meeting_plans
    WHERE ward_id = ${membership.wardId} AND month = ${`${month}-01`}
  `;

  return NextResponse.json({ plan: rows[0] ?? null });
}

export async function PUT(request: Request) {
  assertAuthConfiguration();
  const { data: session } = await auth.getSession();
  const membership = await getCurrentMembership();

  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!membership) {
    return NextResponse.json({ error: "Ala não encontrada." }, { status: 403 });
  }

  const body = await request.json();
  const month = typeof body.month === "string" ? body.month : "";
  const sundays = body.sundays as unknown;

  if (
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(month) ||
    !Array.isArray(sundays) ||
    sundays.length !== 5 ||
    !sundays.every(isValidSchedule)
  ) {
    return NextResponse.json({ error: "Dados do planejamento inválidos." }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO meeting_plans (ward_id, month, sundays, created_by)
    VALUES (${membership.wardId}, ${`${month}-01`}, ${JSON.stringify(sundays)}, ${session.user.id})
    ON CONFLICT (ward_id, month)
    DO UPDATE SET sundays = EXCLUDED.sundays, updated_at = now()
    RETURNING id, updated_at AS "updatedAt"
  `;

  return NextResponse.json({ plan: rows[0] });
}
