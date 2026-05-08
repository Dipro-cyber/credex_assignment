/**
 * Audit engine — orchestrates the full audit run.
 *
 * Takes an AuditFormState, runs each tool through its rule,
 * and returns a complete AuditResult with totals.
 *
 * This is pure TypeScript with no I/O — safe to call from
 * both server (API route) and client (results page).
 * NO AI is used here — all logic is hardcoded rules.
 */

import { randomUUID } from "crypto";
import type { AuditFormState, AuditResult } from "@/types/audit";
import { auditTool } from "./rules";

/**
 * Run the full audit for a given form state.
 * Returns an AuditResult with a fresh UUID and ISO timestamp.
 */
export function runAudit(formState: AuditFormState): AuditResult {
  const ctx = {
    teamSize: formState.teamSize,
    useCase: formState.useCase,
  };

  const toolResults = formState.tools.map((entry) => auditTool(entry, ctx));

  const totalMonthlySavings = toolResults.reduce(
    (sum, r) => sum + r.monthlySavings,
    0
  );

  return {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    formState,
    toolResults,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    // Personalized summary is generated separately (Commit 6) via Anthropic API
    personalizedSummary: null,
  };
}

/**
 * Client-safe version of runAudit that uses a deterministic ID
 * (for cases where crypto.randomUUID isn't available, e.g. older browsers).
 */
export function runAuditClient(formState: AuditFormState): AuditResult {
  const ctx = {
    teamSize: formState.teamSize,
    useCase: formState.useCase,
  };

  const toolResults = formState.tools.map((entry) => auditTool(entry, ctx));

  const totalMonthlySavings = toolResults.reduce(
    (sum, r) => sum + r.monthlySavings,
    0
  );

  // Use crypto.randomUUID if available, otherwise fall back to a timestamp-based ID
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `audit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  return {
    id,
    createdAt: new Date().toISOString(),
    formState,
    toolResults,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    personalizedSummary: null,
  };
}
