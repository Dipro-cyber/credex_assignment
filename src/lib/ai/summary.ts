/**
 * Personalized audit summary generation via Anthropic API.
 *
 * This is the ONLY place AI is used in the entire app.
 * The audit math (engine.ts / rules.ts) is 100% hardcoded rules.
 *
 * Model: claude-3-5-haiku-20241022
 * Chosen because: fast (~1s), cheap ($0.80/MTok input), sufficient for
 * ~100-word summaries. claude-3-5-sonnet would be overkill here.
 *
 * Failure modes handled:
 *   - ANTHROPIC_API_KEY missing → returns templated fallback immediately
 *   - API returns non-2xx → returns templated fallback
 *   - Network timeout (10s) → returns templated fallback
 *   - Malformed response → returns templated fallback
 *
 * The fallback is a deterministic template that reads naturally —
 * users should not notice a difference in most cases.
 */

import type { AuditResult } from "@/types/audit";
import { TOOL_CONFIG_MAP } from "@/lib/tools-config";

// ---------------------------------------------------------------------------
// Prompt construction
// ---------------------------------------------------------------------------

/**
 * Build the system prompt.
 * Kept concise — haiku doesn't need lengthy instructions.
 */
function buildSystemPrompt(): string {
  return `You are a concise financial advisor specialising in AI tool costs for startups.
Write a single paragraph of exactly 80–110 words.
Tone: direct, specific, no fluff. Address the reader as "your team".
Do not use bullet points, headers, or markdown formatting.
Do not mention Credex by name — refer to it only as "infrastructure credits" if relevant.
Focus on the 1–2 biggest savings opportunities and what action to take.
End with one forward-looking sentence about what the savings could fund instead.`;
}

/**
 * Build the user prompt from the audit result.
 * Includes only the data the model needs — no PII.
 */
function buildUserPrompt(audit: AuditResult): string {
  const toolLines = audit.toolResults
    .map((r) => {
      const label = TOOL_CONFIG_MAP[r.toolId]?.label ?? r.toolId;
      const planLabel =
        TOOL_CONFIG_MAP[r.toolId]?.plans.find((p) => p.id === r.planId)
          ?.label ?? r.planId;
      const savingStr =
        r.monthlySavings > 0
          ? `potential saving: $${r.monthlySavings}/mo — ${r.recommendedAction}`
          : "already optimal";
      return `- ${label} (${planLabel}, ${r.seats} seat${r.seats !== 1 ? "s" : ""}, $${r.currentMonthlySpend}/mo): ${savingStr}`;
    })
    .join("\n");

  return `Team size: ${audit.formState.teamSize} people
Primary use case: ${audit.formState.useCase}
Total monthly savings identified: $${audit.totalMonthlySavings}
Annual savings: $${audit.totalAnnualSavings}

Tool breakdown:
${toolLines}

Write a personalised 80–110 word summary paragraph for this team.`;
}

// ---------------------------------------------------------------------------
// Templated fallback
// ---------------------------------------------------------------------------

/**
 * Returns a deterministic, readable fallback summary when the API is
 * unavailable. Written to sound natural, not like an error message.
 */
export function buildFallbackSummary(audit: AuditResult): string {
  const { totalMonthlySavings, totalAnnualSavings, formState } = audit;

  if (totalMonthlySavings === 0) {
    return `Your team of ${formState.teamSize} is running a tight AI stack for ${formState.useCase} work — no obvious overspend found. The plans you're on match your team size well. Keep an eye on seat counts as you grow, and revisit this audit if you add new tools or your usage patterns shift significantly.`;
  }

  // Find the top saving opportunity
  const topResult = [...audit.toolResults].sort(
    (a, b) => b.monthlySavings - a.monthlySavings
  )[0];
  const topLabel = TOOL_CONFIG_MAP[topResult.toolId]?.label ?? topResult.toolId;

  return `Your team of ${formState.teamSize} is spending more than necessary on AI tools for ${formState.useCase} work. The biggest opportunity is ${topLabel} — ${topResult.reason.toLowerCase()} Acting on the top recommendations would save your team $${totalMonthlySavings}/month ($${totalAnnualSavings}/year). That's enough to fund ${Math.floor(totalAnnualSavings / 500)} months of a junior engineer's tooling budget, or reinvest directly into product development.`;
}

// ---------------------------------------------------------------------------
// API call
// ---------------------------------------------------------------------------

interface AnthropicMessage {
  content: Array<{ type: string; text: string }>;
}

/**
 * Generate a personalised ~100-word summary using the Anthropic API.
 *
 * Returns the summary string on success, or the templated fallback on any
 * failure. Never throws — callers can always expect a string.
 */
export async function generateSummary(audit: AuditResult): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Fast path: no API key configured → return fallback immediately
  if (!apiKey) {
    return buildFallbackSummary(audit);
  }

  const controller = new AbortController();
  // 10-second timeout — results page should not hang waiting for AI
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 256,
        system: buildSystemPrompt(),
        messages: [
          {
            role: "user",
            content: buildUserPrompt(audit),
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Log the status for debugging but don't expose it to the user
      console.error(
        `[summary] Anthropic API error: ${response.status} ${response.statusText}`
      );
      return buildFallbackSummary(audit);
    }

    const data = (await response.json()) as AnthropicMessage;
    const text = data?.content?.[0]?.text?.trim();

    if (!text) {
      console.error("[summary] Anthropic returned empty content");
      return buildFallbackSummary(audit);
    }

    return text;
  } catch (err) {
    clearTimeout(timeoutId);

    // AbortError = timeout; other errors = network failure
    if (err instanceof Error && err.name === "AbortError") {
      console.error("[summary] Anthropic API timed out after 10s");
    } else {
      console.error("[summary] Anthropic API fetch failed:", err);
    }

    return buildFallbackSummary(audit);
  }
}
