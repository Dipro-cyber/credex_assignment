/**
 * POST /api/audit — Save an audit result to Supabase for shareable URLs.
 *
 * Called from the results page after the audit engine runs client-side.
 * Stores tool results and savings totals — NO PII (email, company, name).
 *
 * Returns the audit ID which is used to construct the /share/[id] URL.
 */
import { NextRequest } from "next/server";
import { insertAudit } from "@/lib/supabase";
import type { AuditResult } from "@/types/audit";

export async function POST(req: NextRequest) {
  let body: Partial<AuditResult>;

  try {
    body = (await req.json()) as Partial<AuditResult>;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { id, formState, toolResults, totalMonthlySavings, totalAnnualSavings } = body;

  if (!id || !formState || !toolResults) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    await insertAudit({
      id,
      form_state: formState,
      tool_results: toolResults,
      total_monthly_savings: totalMonthlySavings ?? 0,
      total_annual_savings: totalAnnualSavings ?? 0,
    });

    return Response.json({ success: true, id });
  } catch (err) {
    console.error("[audit] Supabase insert failed:", err);
    // Non-fatal — share URL just won't work if this fails
    return Response.json(
      { error: "Could not save audit" },
      { status: 503 }
    );
  }
}
