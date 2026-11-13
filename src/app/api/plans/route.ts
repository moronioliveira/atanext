import { NextResponse } from "next/server";
import { jsonError, readJsonBody } from "@/lib/api/responses";
import { isMonthKey, parsePlanPayload } from "@/lib/meeting";
import { findPlan, savePlanWithPeople } from "@/lib/meeting/plan-repository";
import { collectPersonNames } from "@/lib/people";
import { requireMembership } from "@/lib/ward/membership";

export async function GET(request: Request) {
  const guard = await requireMembership();

  if (!guard.ok) {
    return guard.response;
  }

  const month = new URL(request.url).searchParams.get("month");

  if (!isMonthKey(month)) {
    return jsonError("Mês inválido.", 400);
  }

  const plan = await findPlan(guard.membership.wardId, month);

  return NextResponse.json({ plan });
}

export async function PUT(request: Request) {
  const guard = await requireMembership();

  if (!guard.ok) {
    return guard.response;
  }

  const payload = parsePlanPayload(await readJsonBody(request));

  if (!payload) {
    return jsonError("Dados do planejamento inválidos.", 400);
  }

  const { plan, addedPeople } = await savePlanWithPeople({
    wardId: guard.membership.wardId,
    userId: guard.user.id,
    month: payload.month,
    sundays: payload.sundays,
    personNames: collectPersonNames(payload.sundays),
  });

  return NextResponse.json({ plan, addedPeople });
}
