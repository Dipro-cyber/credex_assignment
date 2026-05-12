/**
 * Supabase client — server-side only (uses service role key).
 *
 * We use the Supabase REST API directly via fetch rather than the
 * @supabase/supabase-js SDK. This avoids adding a large dependency and
 * keeps the server bundle lean. The REST API is stable and well-documented.
 *
 * NEVER import this file from client components — it uses the service role
 * key which must never be exposed to the browser.
 */

export interface LeadRow {
  id?: string;
  audit_id: string;
  email: string;
  company_name?: string | null;
  role?: string | null;
  team_size?: number | null;
  total_monthly_savings: number;
  created_at?: string;
}

export interface AuditRow {
  id: string;
  form_state: object;
  tool_results: object;
  total_monthly_savings: number;
  total_annual_savings: number;
  created_at?: string;
}

/**
 * Insert a full audit result into the `audits` table.
 * Used when saving an audit for a shareable URL.
 */
export async function insertAudit(audit: AuditRow): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/audits`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(audit),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "unknown error");
    throw new Error(`Supabase audit insert failed (${response.status}): ${text}`);
  }
}

/**
 * Fetch a public audit by ID (for share pages).
 * Uses the anon key — RLS allows public read on audits table.
 */
export async function getAuditById(id: string): Promise<AuditRow | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use anon key for public reads — service role not needed here
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) return null;

  const params = new URLSearchParams({
    id: `eq.${id}`,
    select: "id,form_state,tool_results,total_monthly_savings,total_annual_savings,created_at",
    limit: "1",
  });

  const response = await fetch(`${supabaseUrl}/rest/v1/audits?${params}`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    // Cache for 1 hour — share pages are immutable once created
    next: { revalidate: 3600 },
  });

  if (!response.ok) return null;

  const rows = (await response.json()) as AuditRow[];
  return rows[0] ?? null;
}

/**
 * Insert a lead row into the `leads` table.
 * Returns the inserted row on success, throws on failure.
 */
export async function insertLead(lead: LeadRow): Promise<LeadRow> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      // Return the inserted row
      Prefer: "return=representation",
    },
    body: JSON.stringify(lead),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "unknown error");
    throw new Error(`Supabase insert failed (${response.status}): ${text}`);
  }

  const rows = (await response.json()) as LeadRow[];
  return rows[0];
}

/**
 * Check if an email has already submitted for a given audit.
 * Used to prevent duplicate lead entries.
 */
export async function leadExists(
  auditId: string,
  email: string
): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) return false;

  const params = new URLSearchParams({
    audit_id: `eq.${auditId}`,
    email: `eq.${email}`,
    select: "id",
    limit: "1",
  });

  const response = await fetch(`${supabaseUrl}/rest/v1/leads?${params}`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });

  if (!response.ok) return false;

  const rows = (await response.json()) as LeadRow[];
  return rows.length > 0;
}
