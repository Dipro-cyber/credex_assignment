/**
 * Hardcoded pricing data for all supported AI tools.
 *
 * Every number here is sourced from official vendor pricing pages.
 * Full source URLs and verification dates are in PRICING_DATA.md.
 *
 * Units: USD per seat per month (for seat-based plans)
 *        or USD per month flat (for flat/usage plans).
 *
 * "0" means free. "null" means custom/enterprise pricing — we cannot
 * calculate savings for these and will flag them for manual review.
 */

import type { ToolId, PlanId } from "@/types/audit";

export interface PricingEntry {
  /** USD/seat/month for seat-based; USD/month flat for usage-based */
  pricePerSeatPerMonth: number | null;
  /** True if this is a usage-based plan (API) — spend is user-entered */
  usageBased: boolean;
  /** Minimum seats required for this plan */
  minSeats: number;
}

// Key: `${toolId}:${planId}`
const PRICING_TABLE: Record<string, PricingEntry> = {
  // -------------------------------------------------------------------------
  // Cursor — https://cursor.sh/pricing
  // -------------------------------------------------------------------------
  "cursor:hobby":      { pricePerSeatPerMonth: 0,    usageBased: false, minSeats: 1 },
  "cursor:pro":        { pricePerSeatPerMonth: 20,   usageBased: false, minSeats: 1 },
  "cursor:business":   { pricePerSeatPerMonth: 40,   usageBased: false, minSeats: 1 },
  "cursor:enterprise": { pricePerSeatPerMonth: null, usageBased: false, minSeats: 1 },

  // -------------------------------------------------------------------------
  // GitHub Copilot — https://github.com/features/copilot#pricing
  // -------------------------------------------------------------------------
  "github_copilot:individual": { pricePerSeatPerMonth: 10,   usageBased: false, minSeats: 1 },
  "github_copilot:business":   { pricePerSeatPerMonth: 19,   usageBased: false, minSeats: 1 },
  "github_copilot:enterprise": { pricePerSeatPerMonth: 39,   usageBased: false, minSeats: 1 },

  // -------------------------------------------------------------------------
  // Claude — https://claude.ai/upgrade & https://www.anthropic.com/pricing
  // -------------------------------------------------------------------------
  "claude:free":       { pricePerSeatPerMonth: 0,    usageBased: false, minSeats: 1 },
  "claude:pro":        { pricePerSeatPerMonth: 20,   usageBased: false, minSeats: 1 },
  "claude:max":        { pricePerSeatPerMonth: 100,  usageBased: false, minSeats: 1 },
  "claude:team":       { pricePerSeatPerMonth: 30,   usageBased: false, minSeats: 5 },
  "claude:enterprise": { pricePerSeatPerMonth: null, usageBased: false, minSeats: 1 },
  "claude:api":        { pricePerSeatPerMonth: null, usageBased: true,  minSeats: 1 },

  // -------------------------------------------------------------------------
  // ChatGPT — https://openai.com/chatgpt/pricing
  // -------------------------------------------------------------------------
  "chatgpt:plus":       { pricePerSeatPerMonth: 20,   usageBased: false, minSeats: 1 },
  "chatgpt:team":       { pricePerSeatPerMonth: 30,   usageBased: false, minSeats: 2 },
  "chatgpt:enterprise": { pricePerSeatPerMonth: null, usageBased: false, minSeats: 1 },
  "chatgpt:api":        { pricePerSeatPerMonth: null, usageBased: true,  minSeats: 1 },

  // -------------------------------------------------------------------------
  // Anthropic API — https://www.anthropic.com/pricing
  // -------------------------------------------------------------------------
  "anthropic_api:api": { pricePerSeatPerMonth: null, usageBased: true, minSeats: 1 },

  // -------------------------------------------------------------------------
  // OpenAI API — https://openai.com/api/pricing
  // -------------------------------------------------------------------------
  "openai_api:api": { pricePerSeatPerMonth: null, usageBased: true, minSeats: 1 },

  // -------------------------------------------------------------------------
  // Gemini — https://one.google.com/about/ai-premium
  // -------------------------------------------------------------------------
  "gemini:pro":   { pricePerSeatPerMonth: 19.99,  usageBased: false, minSeats: 1 },
  "gemini:ultra": { pricePerSeatPerMonth: 249.99, usageBased: false, minSeats: 1 },
  "gemini:api":   { pricePerSeatPerMonth: null,   usageBased: true,  minSeats: 1 },

  // -------------------------------------------------------------------------
  // Windsurf — https://windsurf.com/pricing
  // -------------------------------------------------------------------------
  "windsurf:free":  { pricePerSeatPerMonth: 0,    usageBased: false, minSeats: 1 },
  "windsurf:pro":   { pricePerSeatPerMonth: 15,   usageBased: false, minSeats: 1 },
  "windsurf:teams": { pricePerSeatPerMonth: 35,   usageBased: false, minSeats: 1 },
};

export function getPricing(toolId: ToolId, planId: PlanId): PricingEntry | null {
  return PRICING_TABLE[`${toolId}:${planId}`] ?? null;
}

/**
 * Calculate the expected monthly cost for a plan given seat count.
 * Returns null if pricing is custom/enterprise.
 */
export function expectedMonthlyCost(
  toolId: ToolId,
  planId: PlanId,
  seats: number
): number | null {
  const entry = getPricing(toolId, planId);
  if (!entry) return null;
  if (entry.usageBased) return null; // user-entered spend is the source of truth
  if (entry.pricePerSeatPerMonth === null) return null;
  return entry.pricePerSeatPerMonth * Math.max(seats, entry.minSeats);
}
