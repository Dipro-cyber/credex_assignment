/**
 * POST /api/leads — Lead capture endpoint.
 *
 * Flow:
 *   1. Rate limit check (5 req / 10 min per IP)
 *   2. Validate request body
 *   3. Honeypot check (server-side mirror of client check)
 *   4. Deduplicate (same email + auditId → 200 without re-inserting)
 *   5. Insert into Supabase `leads` table
 *   6. Send Resend confirmation email (best-effort — never blocks response)
 *   7. Return 200
 *
 * Abuse protection:
 *   - Rate limiting: Upstash Redis in prod, in-memory Map in dev
 *   - Honeypot field: bots fill `website`, humans don't
 *   - Deduplication: same email+auditId combo is idempotent
 *   - Input validation: email format, field length limits
 *
 * Documented in README.md → Decisions section.
 */

import { NextRequest } from "next/server";
import { insertLead, leadExists } from "@/lib/supabase";
import { sendAuditEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LENGTH = 200;

interface LeadRequestBody {
  auditId?: unknown;
  email?: unknown;
  companyName?: unknown;
  role?: unknown;
  totalMonthlySavings?: unknown;
  topRecommendations?: unknown;
  totalAnnualSavings?: unknown;
  // Honeypot — should always be empty
  website?: unknown;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // 1. Rate limiting — use IP from X-Forwarded-For (set by Vercel)
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const { allowed, remaining } = await checkRateLimit(ip);

  if (!allowed) {
    return Response.json(
      { error: "Too many requests. Please try again in a few minutes." },
      {
        status: 429,
        headers: { "X-RateLimit-Remaining": "0" },
      }
    );
  }

  // 2. Parse body
  let body: LeadRequestBody;
  try {
    body = (await req.json()) as LeadRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // 3. Honeypot check — server-side mirror
  if (body.website) {
    // Silently succeed — don't tell bots they were caught
    return Response.json({ success: true });
  }

  // 4. Validate required fields
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const auditId =
    typeof body.auditId === "string" ? body.auditId.trim() : "";

  if (!email || !EMAIL_REGEX.test(email)) {
    return Response.json(
      { error: "A valid email address is required." },
      { status: 400 }
    );
  }

  if (!auditId) {
    return Response.json({ error: "auditId is required." }, { status: 400 });
  }

  // Sanitise optional fields
  const companyName =
    typeof body.companyName === "string"
      ? body.companyName.trim().slice(0, MAX_FIELD_LENGTH) || null
      : null;

  const role =
    typeof body.role === "string"
      ? body.role.trim().slice(0, MAX_FIELD_LENGTH) || null
      : null;

  const totalMonthlySavings =
    typeof body.totalMonthlySavings === "number" &&
    isFinite(body.totalMonthlySavings)
      ? Math.round(body.totalMonthlySavings)
      : 0;

  const totalAnnualSavings =
    typeof body.totalAnnualSavings === "number" &&
    isFinite(body.totalAnnualSavings)
      ? Math.round(body.totalAnnualSavings)
      : totalMonthlySavings * 12;

  const topRecommendations: string[] = Array.isArray(body.topRecommendations)
    ? (body.topRecommendations as unknown[])
        .filter((r): r is string => typeof r === "string")
        .slice(0, 5)
        .map((r) => r.slice(0, MAX_FIELD_LENGTH))
    : [];

  // 5. Deduplication — idempotent for same email + auditId
  try {
    const exists = await leadExists(auditId, email);
    if (exists) {
      // Already stored — return success without re-inserting or re-emailing
      return Response.json(
        { success: true },
        { headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }
  } catch (err) {
    // Supabase check failed — proceed anyway (better to duplicate than to block)
    console.warn("[leads] dedup check failed:", err);
  }

  // 6. Insert into Supabase
  try {
    await insertLead({
      audit_id: auditId,
      email,
      company_name: companyName,
      role,
      total_monthly_savings: totalMonthlySavings,
    });
  } catch (err) {
    console.error("[leads] Supabase insert failed:", err);
    // Return 503 so the client can show a retry message
    return Response.json(
      { error: "Could not save your details. Please try again." },
      { status: 503 }
    );
  }

  // 7. Send confirmation email — best-effort, never blocks response
  sendAuditEmail({
    to: email,
    auditId,
    totalMonthlySavings,
    totalAnnualSavings,
    topRecommendations,
  }).catch((err) => {
    console.error("[leads] email send failed:", err);
  });

  return Response.json(
    { success: true },
    { headers: { "X-RateLimit-Remaining": String(remaining) } }
  );
}
